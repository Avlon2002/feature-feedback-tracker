-- System features that users give feedback on (e.g. "Leave Requests", "Payslips")
CREATE TABLE IF NOT EXISTS features (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per piece of user feedback, plus the decision taken on it
CREATE TABLE IF NOT EXISTS feedback (
  id              SERIAL PRIMARY KEY,
  feature_id      INTEGER REFERENCES features(id) ON DELETE SET NULL,
  submitted_by    TEXT NOT NULL,          -- who said it
  department      TEXT,
  feedback        TEXT NOT NULL,          -- what they said
  type            TEXT NOT NULL DEFAULT 'Suggestion',
  priority        TEXT NOT NULL DEFAULT 'Medium',
  status          TEXT NOT NULL DEFAULT 'New',
  action_taken    TEXT,
  decision_date   DATE,
  decision_reason TEXT,
  decided_by      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_feature_idx ON feedback(feature_id);
CREATE INDEX IF NOT EXISTS feedback_status_idx  ON feedback(status);
