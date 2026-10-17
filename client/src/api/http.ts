import type { ErrorBody, ErrorCode } from '@sds/shared';
import { ERROR_TABLE } from '@sds/shared';

export class ApiError extends Error {
  constructor(
    readonly code: ErrorCode | 'network_error',
    message: string,
    readonly status: number,
    readonly retryable: boolean,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** All calls go to relative /api (same origin in prod, Vite proxy in dev). */
export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, { ...init, headers: { Accept: 'application/json', ...init?.headers } });
  } catch {
    throw new ApiError('network_error', 'Could not reach the local server', 0, true);
  }
  if (res.ok) return (await res.json()) as T;

  const body = (await res.json().catch(() => null)) as ErrorBody | null;
  if (body?.error && body.error.code in ERROR_TABLE) {
    const { code, message, details } = body.error;
    throw new ApiError(code, message, res.status, ERROR_TABLE[code].retryable, details);
  }
  throw new ApiError('internal_error', `Unexpected response (${res.status})`, res.status, res.status >= 500);
}
