import type { Difficulty } from '@sds/shared';
import type { Database } from '../Database';
import type { ProblemRow } from '../rows';

export class ProblemRepository {
  constructor(private readonly db: Database) {}

  list(difficulty?: Difficulty): ProblemRow[] {
    if (difficulty) {
      return this.db
        .prepare('SELECT * FROM problems WHERE difficulty = ? ORDER BY sort_order, id')
        .all(difficulty) as ProblemRow[];
    }
    return this.db.prepare('SELECT * FROM problems ORDER BY sort_order, id').all() as ProblemRow[];
  }

  get(id: string): ProblemRow | undefined {
    return this.db.prepare('SELECT * FROM problems WHERE id = ?').get(id) as ProblemRow | undefined;
  }

  upsertMany(rows: ProblemRow[]): void {
    const stmt = this.db.prepare(`
      INSERT INTO problems (id, title, prompt, difficulty, tags, sort_order)
      VALUES (@id, @title, @prompt, @difficulty, @tags, @sort_order)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title, prompt = excluded.prompt, difficulty = excluded.difficulty,
        tags = excluded.tags, sort_order = excluded.sort_order`);
    this.db.transaction((items: ProblemRow[]) => items.forEach((r) => stmt.run(r)))(rows);
  }
}
