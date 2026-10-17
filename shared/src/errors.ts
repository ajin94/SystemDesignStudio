// Single source of truth for error codes (HLD 3.1, plus forbidden_origin from LLD 7).
export type ErrorCode =
  | 'validation_error'
  | 'no_api_key'
  | 'not_found'
  | 'version_conflict'
  | 'review_in_progress'
  | 'content_too_large'
  | 'provider_auth_failed'
  | 'rate_limited'
  | 'provider_unavailable'
  | 'review_malformed'
  | 'timeout'
  | 'internal_error'
  | 'forbidden_origin';

export const ERROR_TABLE: Record<ErrorCode, { status: number; retryable: boolean }> = {
  validation_error: { status: 400, retryable: false },
  no_api_key: { status: 400, retryable: false },
  not_found: { status: 404, retryable: false },
  version_conflict: { status: 409, retryable: false },
  review_in_progress: { status: 409, retryable: true },
  content_too_large: { status: 413, retryable: false },
  provider_auth_failed: { status: 422, retryable: false },
  rate_limited: { status: 429, retryable: true },
  provider_unavailable: { status: 502, retryable: true },
  review_malformed: { status: 502, retryable: true },
  timeout: { status: 504, retryable: true },
  internal_error: { status: 500, retryable: false },
  forbidden_origin: { status: 403, retryable: false },
};

export interface ErrorBody {
  error: { code: ErrorCode; message: string; details?: unknown };
}
