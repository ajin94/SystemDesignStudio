import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { ListProblemsResponseSchema } from '@sds/shared';
import { ProblemRepository } from '../src/db/repositories/ProblemRepository';
import { ProblemSeeder } from '../src/db/seeds/ProblemSeeder';
import { PROBLEM_SEEDS } from '../src/db/seeds/problems';
import { HOST, makeApp } from './helpers';

describe('GET /api/health', () => {
  it('returns ok and the version', async () => {
    const { app } = makeApp();
    const res = await request(app).get('/api/health').set('Host', HOST);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, version: '0.0.0-test' });
  });
});

describe('GET /api/problems', () => {
  it('returns all seeded problems in seed order, matching the contract', async () => {
    const { app } = makeApp();
    const res = await request(app).get('/api/problems').set('Host', HOST);
    expect(res.status).toBe(200);
    const body = ListProblemsResponseSchema.parse(res.body);
    expect(body.problems.map((p) => p.id)).toEqual(PROBLEM_SEEDS.map((s) => s.id));
    expect(body.problems[0]?.tags).toEqual(PROBLEM_SEEDS[0]?.tags);
  });

  it.each(['easy', 'medium', 'hard'] as const)('filters by difficulty=%s', async (difficulty) => {
    const { app } = makeApp();
    const res = await request(app).get(`/api/problems?difficulty=${difficulty}`).set('Host', HOST);
    expect(res.status).toBe(200);
    const expected = PROBLEM_SEEDS.filter((s) => s.difficulty === difficulty).map((s) => s.id);
    expect(res.body.problems.map((p: { id: string }) => p.id)).toEqual(expected);
  });

  it.each(['difficulty=', 'difficulty=extreme', 'foo=bar'])('rejects ?%s with validation_error', async (qs) => {
    const { app } = makeApp();
    const res = await request(app).get(`/api/problems?${qs}`).set('Host', HOST);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });
});

describe('ProblemSeeder', () => {
  it('is idempotent and restores seed values without duplicating rows', () => {
    const { container } = makeApp();
    const count = () => (container.db.prepare('SELECT COUNT(*) AS n FROM problems').get() as { n: number }).n;
    const before = count();
    container.db.exec("UPDATE problems SET title = 'stale' WHERE id = 'url-shortener'");

    new ProblemSeeder(new ProblemRepository(container.db)).run();

    expect(count()).toBe(before);
    const row = container.db.prepare("SELECT title FROM problems WHERE id = 'url-shortener'").get() as {
      title: string;
    };
    expect(row.title).toBe('URL Shortener');
  });
});

describe('errors', () => {
  it('unknown /api route returns not_found in the error format', async () => {
    const { app } = makeApp();
    const res = await request(app).get('/api/nope').set('Host', HOST);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: 'not_found', message: 'Route not found' } });
  });

  it('never sets cookies or a CORS wildcard', async () => {
    const { app } = makeApp();
    const res = await request(app).get('/api/problems').set('Host', HOST).set('Origin', 'http://localhost:5173');
    expect(res.headers['set-cookie']).toBeUndefined();
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
