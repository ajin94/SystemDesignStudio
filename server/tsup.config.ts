import { defineConfig } from 'tsup';

// Bundle the server and the shared package into dist/main.js; keep npm deps external.
export default defineConfig({
  entry: ['src/main.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  outDir: 'dist',
  clean: true,
  noExternal: ['@sds/shared', 'zod'],
});
