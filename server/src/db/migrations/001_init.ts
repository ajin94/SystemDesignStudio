// Migration 001_init: full v1 schema from LLD 1.2.
export const migration001 = {
  version: 1,
  name: 'init',
  sql: `
CREATE TABLE problems (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 120),
  prompt      TEXT NOT NULL CHECK (length(prompt) BETWEEN 1 AND 4000),
  difficulty  TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  tags        TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(tags)),
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_problems_difficulty ON problems(difficulty, sort_order);

CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,
  problem_id  TEXT NOT NULL REFERENCES problems(id) ON DELETE RESTRICT,
  title       TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 120),
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX idx_sessions_updated ON sessions(updated_at DESC);
CREATE INDEX idx_sessions_problem ON sessions(problem_id, updated_at DESC);

CREATE TABLE session_content (
  session_id   TEXT PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  content_json TEXT NOT NULL CHECK (json_valid(content_json)),
  version      INTEGER NOT NULL CHECK (version >= 1),
  updated_at   TEXT NOT NULL
);

CREATE TABLE reviews (
  id              TEXT PRIMARY KEY,
  session_id      TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  status          TEXT NOT NULL CHECK (status IN ('pending','ok','failed')),
  snapshot_json   TEXT NOT NULL CHECK (json_valid(snapshot_json)),
  result_json     TEXT NULL CHECK (result_json IS NULL OR json_valid(result_json)),
  raw_output      TEXT NULL,
  error_code      TEXT NULL,
  error_message   TEXT NULL,
  provider        TEXT NOT NULL,
  model           TEXT NOT NULL,
  prompt_version  TEXT NOT NULL,
  content_version INTEGER NOT NULL,
  duration_ms     INTEGER NULL,
  input_tokens    INTEGER NULL,
  output_tokens   INTEGER NULL,
  created_at      TEXT NOT NULL,
  finished_at     TEXT NULL,
  CHECK ((status = 'ok')      = (result_json IS NOT NULL)),
  CHECK ((status = 'failed')  = (error_code IS NOT NULL)),
  CHECK ((status = 'pending') = (finished_at IS NULL))
);
CREATE INDEX idx_reviews_session_created ON reviews(session_id, created_at DESC);
CREATE UNIQUE INDEX uq_reviews_one_pending ON reviews(session_id) WHERE status = 'pending';
CREATE INDEX idx_reviews_session_ok ON reviews(session_id) WHERE status = 'ok';

CREATE TABLE settings (
  id             INTEGER PRIMARY KEY CHECK (id = 1),
  provider       TEXT NOT NULL CHECK (provider IN ('claude')),
  model          TEXT NOT NULL CHECK (length(model) BETWEEN 1 AND 100),
  key_ciphertext BLOB NULL,
  key_iv         BLOB NULL,
  key_tag        BLOB NULL,
  key_hint       TEXT NULL,
  updated_at     TEXT NOT NULL,
  CHECK ((key_ciphertext IS NULL) = (key_iv IS NULL)
     AND (key_iv IS NULL) = (key_tag IS NULL)
     AND (key_tag IS NULL) = (key_hint IS NULL))
);
INSERT INTO settings (id, provider, model, updated_at)
VALUES (1, 'claude', 'claude-sonnet-5-5', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
`,
};
