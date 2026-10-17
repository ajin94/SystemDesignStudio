import type { Config } from '../src/app/config';
import { buildContainer } from '../src/app/container';
import { createApp } from '../src/app/createApp';
import { silentLogger } from '../src/http/logger';

export const PORT = 3001;
export const HOST = `localhost:${PORT}`;

export function testConfig(overrides: Partial<Config> = {}): Config {
  return {
    port: PORT,
    host: '127.0.0.1',
    dataDir: '/nonexistent',
    isProduction: false,
    devOrigin: 'http://localhost:5173',
    clientDistDir: null,
    version: '0.0.0-test',
    ...overrides,
  };
}

export function makeApp(overrides: Partial<Config> = {}) {
  const container = buildContainer(testConfig(overrides), { dbFile: ':memory:', logger: silentLogger });
  return { app: createApp(container), container };
}
