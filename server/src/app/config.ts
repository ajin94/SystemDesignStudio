import path from 'node:path';

export interface Config {
  port: number;
  host: string;
  dataDir: string;
  isProduction: boolean;
  /** Vite dev server origin, allowed by the host/origin guard in dev only. */
  devOrigin: string;
  /** Built client served by Express in production; null disables static serving. */
  clientDistDir: string | null;
  version: string;
}

// npm workspace scripts run with the server package as cwd; defaults are relative to it.
// Docker sets DATA_DIR and CLIENT_DIST_DIR explicitly.
const serverRoot = process.cwd();

function parsePort(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 65535) throw new Error(`Invalid port: ${raw}`);
  return n;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const isProduction = env.NODE_ENV === 'production';
  const devPort = parsePort(env.VITE_PORT, 5173);
  return {
    port: parsePort(env.PORT, 3001),
    // Binds to loopback by default. The Docker image sets HOST=0.0.0.0 and compose
    // publishes the port on 127.0.0.1 only, so it is still reachable from this machine only.
    host: env.HOST || '127.0.0.1',
    dataDir: path.resolve(env.DATA_DIR || path.join(serverRoot, '..', 'data')),
    isProduction,
    devOrigin: `http://localhost:${devPort}`,
    clientDistDir: isProduction
      ? path.resolve(env.CLIENT_DIST_DIR || path.join(serverRoot, '..', 'client', 'dist'))
      : null,
    version: env.APP_VERSION || '0.1.0',
  };
}
