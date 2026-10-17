import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ErrorBody } from '@sds/shared';
import { AppError, Errors } from '../../domain/errors';
import type { Logger } from '../logger';

/** Unknown routes under /api return the standard not_found error body. */
export const apiNotFound: RequestHandler = (_req, _res, next) => next(Errors.notFound('Route'));

export function errorHandler(logger: Logger): ErrorRequestHandler {
  return (err, _req, res, _next) => {
    if (err instanceof AppError) {
      const body: ErrorBody = { error: { code: err.code, message: err.message } };
      if (err.details !== undefined) body.error.details = err.details;
      res.status(err.status).json(body);
      return;
    }
    logger.error('unhandled_error', { message: err instanceof Error ? err.message : String(err) });
    const body: ErrorBody = { error: { code: 'internal_error', message: 'Something went wrong' } };
    res.status(500).json(body);
  };
}
