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

-- ---------- Project management ----------

CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  due_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks on a project's board. issue_id links a task back to the feature issue it came from.
-- Deleting a project deletes its tasks; deleting an issue just unlinks its tasks.
CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  assignee    TEXT,
  due_date    DATE,
  priority    TEXT NOT NULL DEFAULT 'Medium',
  status      TEXT NOT NULL DEFAULT 'To do',
  issue_id    INTEGER REFERENCES issues(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_project_idx ON tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_issue_idx   ON tasks(issue_id);
