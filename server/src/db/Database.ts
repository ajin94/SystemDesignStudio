import fs from 'node:fs';
import path from 'node:path';
import BetterSqlite3 from 'better-sqlite3';

export type Database = BetterSqlite3.Database;

/** Opens the SQLite file (or ':memory:') with the pragmas from LLD 1.1. */
export function openDatabase(file: string): Database {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new BetterSqlite3(file);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  return db;
}
