import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { buildAllowlist } from '../src/http/middleware/hostOriginGuard';
import { HOST, PORT, makeApp, testConfig } from './helpers';

const forbidden = { error: { code: 'forbidden_origin', message: 'Request origin is not allowed' } };

describe('buildAllowlist', () => {
  it('derives hosts and origins from the configured port; Vite origin only in dev', () => {
    const dev = buildAllowlist(testConfig({ port: 4000 }));
    expect([...dev.hosts]).toEqual(['localhost:4000', '127.0.0.1:4000']);
    expect(dev.origins.has('http://localhost:5173')).toBe(true);

    const prod = buildAllowlist(testConfig({ port: 4000, isProduction: true }));
    expect(prod.origins.has('http://localhost:5173')).toBe(false);
    expect(prod.origins.has('http://127.0.0.1:4000')).toBe(true);
  });
});

describe('hostOriginGuard', () => {
  const { app } = makeApp();

  it.each([HOST, `127.0.0.1:${PORT}`])('allows Host %s', async (host) => {
    const res = await request(app).get('/api/health').set('Host', host);
    expect(res.status).toBe(200);
  });

  it.each(['evil.com', 'localhost.evil.com', `127.0.0.1:${PORT + 1}`, 'localhost'])(
    'rejects DNS-rebinding style Host %s',
    async (host) => {
      const res = await request(app).get('/api/health').set('Host', host);
      expect(res.status).toBe(403);
      expect(res.body).toEqual(forbidden);
    },
  );

  it.each(['http://evil.com', 'null', `http://localhost:${PORT + 1}`])('rejects GET with Origin %s', async (origin) => {
    const res = await request(app).get('/api/problems').set('Host', HOST).set('Origin', origin);
    expect(res.status).toBe(403);
  });

  it('allows GET without Origin and with an allowed Origin', async () => {
    expect((await request(app).get('/api/problems').set('Host', HOST)).status).toBe(200);
    const res = await request(app).get('/api/problems').set('Host', HOST).set('Origin', `http://localhost:${PORT}`);
    expect(res.status).toBe(200);
  });

  it('rejects a cross-site mutating request without Origin', async () => {
    const res = await request(app).post('/api/problems').set('Host', HOST).set('Sec-Fetch-Site', 'cross-site');
    expect(res.status).toBe(403);
  });

  it('applies to unknown routes, so a rejected request leaks nothing', async () => {
    const res = await request(app).get('/api/nope').set('Host', 'evil.com');
    expect(res.status).toBe(403);
    expect(res.body).toEqual(forbidden);
  });
});

describe('static client (production)', () => {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'sds-dist-'));
  fs.writeFileSync(path.join(dist, 'index.html'), '<!doctype html><title>SysDesign Studio</title>');
  fs.writeFileSync(path.join(dist, 'app.js'), 'console.log(1)');
  afterAll(() => fs.rmSync(dist, { recursive: true, force: true }));

  const { app } = makeApp({ isProduction: true, clientDistDir: dist });

  it('serves assets and falls back to index.html for client routes', async () => {
    expect((await request(app).get('/app.js').set('Host', HOST)).status).toBe(200);
    const res = await request(app).get('/sessions/abc').set('Host', HOST);
    expect(res.status).toBe(200);
    expect(res.text).toContain('SysDesign Studio');
  });

  it('keeps /api 404s as JSON rather than the SPA fallback', async () => {
    const res = await request(app).get('/api/nope').set('Host', HOST);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('not_found');
  });

  it('guards static files: a foreign Host gets 403 and no content', async () => {
    const res = await request(app).get('/').set('Host', 'evil.com');
    expect(res.status).toBe(403);
    expect(res.text).not.toContain('SysDesign Studio');
  });
});
