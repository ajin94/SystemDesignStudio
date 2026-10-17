import type { Difficulty, ListProblemsResponse, ProblemSummary } from '@sds/shared';
import { getJson } from './http';

export async function listProblems(difficulty?: Difficulty, signal?: AbortSignal): Promise<ProblemSummary[]> {
  const qs = difficulty ? `?difficulty=${difficulty}` : '';
  const body = await getJson<ListProblemsResponse>(`/problems${qs}`, { signal });
  return body.problems;
}
