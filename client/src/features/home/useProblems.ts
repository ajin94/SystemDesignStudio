import { useCallback, useEffect, useState } from 'react';
import type { Difficulty, ProblemSummary } from '@sds/shared';
import { ApiError } from '../../api/http';
import { listProblems } from '../../api/problemsApi';

type State =
  | { status: 'loading' }
  | { status: 'ok'; problems: ProblemSummary[] }
  | { status: 'error'; error: ApiError };

export function useProblems(difficulty?: Difficulty) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    listProblems(difficulty, controller.signal)
      .then((problems) => setState({ status: 'ok', problems }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const error = err instanceof ApiError ? err : new ApiError('internal_error', 'Unexpected error', 0, false);
        setState({ status: 'error', error });
      });
    return () => controller.abort();
  }, [difficulty, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, retry };
}
