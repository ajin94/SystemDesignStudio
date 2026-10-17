/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiPort = Number(process.env.PORT ?? 3001);

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_PORT ?? 5173),
    strictPort: true,
    // changeOrigin rewrites Host to the API port so the server's host allowlist accepts it.
    proxy: { '/api': { target: `http://localhost:${apiPort}`, changeOrigin: true } },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
});
