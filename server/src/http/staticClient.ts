import fs from 'node:fs';
import path from 'node:path';
import express, { Router } from 'express';

/** Serves the built client and falls back to index.html for non-/api GETs (SPA routing). */
export function staticClient(distDir: string): Router {
  const indexFile = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexFile)) {
    throw new Error(`Client build not found at ${indexFile}. Run "npm run build" first.`);
  }
  const router = Router();
  router.use(express.static(distDir, { index: false }));
  router.get(/^(?!\/api(\/|$)).*/, (_req, res) => res.sendFile(indexFile));
  return router;
}
