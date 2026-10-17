import type { RequestHandler } from 'express';

export interface Logger {
  info(event: string, fields?: Record<string, unknown>): void;
  error(event: string, fields?: Record<string, unknown>): void;
}

/** Structured single-line JSON logs. Never logs request bodies. */
export const consoleLogger: Logger = {
  info: (event, fields) => console.log(JSON.stringify({ level: 'info', event, ...fields })),
  error: (event, fields) => console.error(JSON.stringify({ level: 'error', event, ...fields })),
};

export const silentLogger: Logger = { info: () => {}, error: () => {} };

export function requestLogger(logger: Logger): RequestHandler {
  return (req, res, next) => {
    const start = performance.now();
    // Capture now: mounted routers rewrite req.path/req.url while handling.
    const path = req.originalUrl.split('?')[0];
    res.on('finish', () => {
      logger.info('request', {
        method: req.method,
        path,
        status: res.statusCode,
        ms: Math.round(performance.now() - start),
      });
    });
    next();
  };
}
