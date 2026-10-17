import express, { type Express } from 'express';
import { apiNotFound, errorHandler } from '../http/middleware/errorHandler';
import { buildAllowlist, hostOriginGuard } from '../http/middleware/hostOriginGuard';
import { requestLogger } from '../http/logger';
import { healthRoutes } from '../http/routes/healthRoutes';
import { problemRoutes } from '../http/routes/problemRoutes';
import { staticClient } from '../http/staticClient';
import type { Container } from './container';

/** Builds the Express app without listening, so tests can drive it directly. */
export function createApp(c: Container): Express {
  const app = express();
  app.disable('x-powered-by');

  app.use(hostOriginGuard(buildAllowlist(c.config)));
  app.use(requestLogger(c.logger));

  const api = express.Router();
  api.use(healthRoutes(c.config.version));
  api.use(problemRoutes(c.problemService));
  api.use(apiNotFound);
  app.use('/api', api);

  if (c.config.clientDistDir) app.use(staticClient(c.config.clientDistDir));

  app.use(errorHandler(c.logger));
  return app;
}
