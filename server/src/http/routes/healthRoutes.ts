import { Router } from 'express';
import type { HealthResponse } from '@sds/shared';

export function healthRoutes(version: string): Router {
  const router = Router();
  router.get('/health', (_req, res) => {
    const body: HealthResponse = { ok: true, version };
    res.json(body);
  });
  return router;
}
