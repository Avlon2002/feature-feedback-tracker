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

-- History of decisions / updates on a piece of feedback (newest = current).
-- The latest one is also copied onto the feedback row so the main list stays simple.
CREATE TABLE IF NOT EXISTS decisions (
  id              SERIAL PRIMARY KEY,
  feedback_id     INTEGER NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  status          TEXT NOT NULL,
  action_taken    TEXT,
  decision_date   DATE,
  decision_reason TEXT,
  decided_by      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS decisions_feedback_idx ON decisions(feedback_id);

-- Upgrade older data: turn each existing single decision into the first history entry
INSERT INTO decisions (feedback_id, status, action_taken, decision_date, decision_reason, decided_by, created_at)
SELECT id, status, action_taken, decision_date, decision_reason, decided_by, updated_at
FROM feedback fb
WHERE NOT EXISTS (SELECT 1 FROM decisions d WHERE d.feedback_id = fb.id)
  AND (status <> 'New' OR action_taken IS NOT NULL OR decision_date IS NOT NULL
       OR decision_reason IS NOT NULL OR decided_by IS NOT NULL);
