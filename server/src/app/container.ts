import path from 'node:path';
import { openDatabase, type Database } from '../db/Database';
import { migrate } from '../db/migrate';
import { ProblemRepository } from '../db/repositories/ProblemRepository';
import { ProblemSeeder } from '../db/seeds/ProblemSeeder';
import { consoleLogger, type Logger } from '../http/logger';
import { ProblemService } from '../services/ProblemService';
import type { Config } from './config';

export interface Container {
  config: Config;
  db: Database;
  logger: Logger;
  problemService: ProblemService;
}

/** Composition root. Tests pass dbFile ':memory:' and their own logger. */
export function buildContainer(
  config: Config,
  opts: { dbFile?: string; logger?: Logger } = {},
): Container {
  const db = openDatabase(opts.dbFile ?? path.join(config.dataDir, 'app.db'));
  migrate(db);
  const problemRepository = new ProblemRepository(db);
  new ProblemSeeder(problemRepository).run();
  return {
    config,
    db,
    logger: opts.logger ?? consoleLogger,
    problemService: new ProblemService(problemRepository),
  };
}
