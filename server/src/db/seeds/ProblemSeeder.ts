import type { ProblemRepository } from '../repositories/ProblemRepository';
import { PROBLEM_SEEDS, type ProblemSeed } from './problems';

/** Idempotent upsert of the seeded problems at every startup. Never deletes. */
export class ProblemSeeder {
  constructor(
    private readonly problems: ProblemRepository,
    private readonly seeds: ProblemSeed[] = PROBLEM_SEEDS,
  ) {}

  run(): void {
    this.problems.upsertMany(
      this.seeds.map((s, i) => ({
        id: s.id,
        title: s.title,
        prompt: s.prompt,
        difficulty: s.difficulty,
        tags: JSON.stringify(s.tags),
        sort_order: i + 1,
      })),
    );
  }
}
