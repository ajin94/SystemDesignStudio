import type { Difficulty, ProblemSummary } from '@sds/shared';
import type { ProblemRepository } from '../db/repositories/ProblemRepository';
import type { ProblemRow } from '../db/rows';

export function toProblemSummary(row: ProblemRow): ProblemSummary {
  return {
    id: row.id,
    title: row.title,
    prompt: row.prompt,
    difficulty: row.difficulty,
    tags: JSON.parse(row.tags) as string[],
  };
}

export class ProblemService {
  constructor(private readonly problems: ProblemRepository) {}

  list(difficulty?: Difficulty): ProblemSummary[] {
    return this.problems.list(difficulty).map(toProblemSummary);
  }
}
