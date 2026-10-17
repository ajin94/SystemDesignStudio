import { ERROR_TABLE, type ErrorCode } from '@sds/shared';

export class AppError extends Error {
  readonly status: number;
  readonly retryable: boolean;

  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    this.status = ERROR_TABLE[code].status;
    this.retryable = ERROR_TABLE[code].retryable;
  }
}

export const Errors = {
  validation: (details: unknown) => new AppError('validation_error', 'Request validation failed', details),
  notFound: (what = 'Resource') => new AppError('not_found', `${what} not found`),
  forbiddenOrigin: () => new AppError('forbidden_origin', 'Request origin is not allowed'),
};
