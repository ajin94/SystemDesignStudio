import { Router } from 'express';
import { ListProblemsQuerySchema, type Difficulty, type ListProblemsResponse } from '@sds/shared';
import type { ProblemService } from '../../services/ProblemService';
import { validate } from '../middleware/validate';

export function problemRoutes(problems: ProblemService): Router {
  const router = Router();
  router.get('/problems', validate({ query: ListProblemsQuerySchema }), (_req, res) => {
    const { difficulty } = res.locals.query as { difficulty?: Difficulty };
    const body: ListProblemsResponse = { problems: problems.list(difficulty) };
    res.json(body);
  });
  return router;
}
