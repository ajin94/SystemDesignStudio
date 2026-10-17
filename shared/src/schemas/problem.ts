import { z } from 'zod';

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const ProblemSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  prompt: z.string(),
  difficulty: DifficultySchema,
  tags: z.array(z.string()),
});
export type ProblemSummary = z.infer<typeof ProblemSummarySchema>;

// GET /api/problems?difficulty= ; "difficulty=" (empty) is a validation error, not "absent".
export const ListProblemsQuerySchema = z
  .object({ difficulty: DifficultySchema.optional() })
  .strict();

export const ListProblemsResponseSchema = z.object({
  problems: z.array(ProblemSummarySchema),
});
export type ListProblemsResponse = z.infer<typeof ListProblemsResponseSchema>;

export interface HealthResponse {
  ok: true;
  version: string;
}
