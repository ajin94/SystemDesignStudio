import type { Difficulty } from '@sds/shared';

export interface ProblemRow {
  id: string;
  title: string;
  prompt: string;
  difficulty: Difficulty;
  tags: string; // JSON array
  sort_order: number;
}
