-- Features of the employee portal (e.g. "Starter form", "NAECI grades")
CREATE TABLE IF NOT EXISTS features (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Issue blocks: each one discusses one issue with a feature.
-- A feature can have many blocks. Deleting a feature deletes its blocks.
CREATE TABLE IF NOT EXISTS issues (
  id              SERIAL PRIMARY KEY,
  feature_id      INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  current_process TEXT,
  issue           TEXT NOT NULL,
  action_taken    TEXT,
  raised_by       TEXT,
  idea_by         TEXT,
  status          TEXT NOT NULL DEFAULT 'New',
  decision_date   DATE,
  decision_reason TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS issues_feature_idx ON issues(feature_id);
