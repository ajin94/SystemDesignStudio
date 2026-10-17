import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { Errors } from '../../domain/errors';

/**
 * Validates request parts with Zod. Express 5 makes req.query read-only, so parsed
 * values are exposed on res.locals.{params,query,body}.
 */
export function validate(schemas: { params?: ZodTypeAny; query?: ZodTypeAny; body?: ZodTypeAny }): RequestHandler {
  return (req, res, next) => {
    for (const part of ['params', 'query', 'body'] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part] ?? {});
      if (!result.success) {
        return next(
          Errors.validation(result.error.issues.map((i) => ({ path: [part, ...i.path], message: i.message }))),
        );
      }
      res.locals[part] = result.data;
    }
    next();
  };
}
