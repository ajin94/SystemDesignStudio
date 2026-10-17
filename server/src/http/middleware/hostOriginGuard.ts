import type { RequestHandler } from 'express';
import type { Config } from '../../app/config';
import { Errors } from '../../domain/errors';

export interface Allowlist {
  hosts: Set<string>;
  origins: Set<string>;
}

/** Derived once from the configured port (HLD 5.3). The Vite origin is allowed in dev only. */
export function buildAllowlist(config: Pick<Config, 'port' | 'isProduction' | 'devOrigin'>): Allowlist {
  const hosts = new Set([`localhost:${config.port}`, `127.0.0.1:${config.port}`]);
  const origins = new Set([`http://localhost:${config.port}`, `http://127.0.0.1:${config.port}`]);
  if (!config.isProduction) origins.add(config.devOrigin);
  return { hosts, origins };
}

const SAFE_METHODS = new Set(['GET', 'HEAD']);

/**
 * First middleware in the chain: defeats DNS rebinding (Host) and cross-site calls (Origin).
 * Runs before static files and the error handler so a rejected request never sees content.
 */
export function hostOriginGuard(allowed: Allowlist): RequestHandler {
  return (req, _res, next) => {
    const host = req.headers.host;
    if (!host || !allowed.hosts.has(host.toLowerCase())) return next(Errors.forbiddenOrigin());

    const origin = req.headers.origin;
    if (origin !== undefined) {
      if (!allowed.origins.has(origin)) return next(Errors.forbiddenOrigin());
      return next();
    }

    if (!SAFE_METHODS.has(req.method)) {
      // No Origin on a mutating request: allow only non-browser or same-origin callers.
      const site = req.headers['sec-fetch-site'];
      if (site !== undefined && site !== 'same-origin' && site !== 'none') {
        return next(Errors.forbiddenOrigin());
      }
    }
    next();
  };
}
