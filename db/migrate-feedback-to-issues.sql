-- ONE-TIME upgrade for databases created with the old "feedback" design.
-- Run this ONCE in the Neon SQL Editor, AFTER running schema.sql.
-- It copies each old feedback item into an issue block under its feature.
-- The old tables (feedback, decisions) are left untouched; drop them later if you like:
--   DROP TABLE decisions; DROP TABLE feedback;

-- Old feedback that had no feature goes under a "General" feature
INSERT INTO features (name, description)
SELECT 'General', 'Items that were not linked to a feature'
WHERE EXISTS (SELECT 1 FROM feedback WHERE feature_id IS NULL)
ON CONFLICT (name) DO NOTHING;

INSERT INTO issues (feature_id, issue, raised_by, action_taken, status,
                    decision_date, decision_reason, created_at, updated_at)
SELECT COALESCE(fb.feature_id, (SELECT id FROM features WHERE name = 'General')),
       fb.feedback, fb.submitted_by, fb.action_taken, fb.status,
       fb.decision_date, fb.decision_reason, fb.created_at, fb.updated_at
FROM feedback fb
ORDER BY fb.id;
