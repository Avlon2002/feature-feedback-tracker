"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";

// Turn empty form fields into NULL so the database stays clean
function text(form: FormData, key: string): string | null {
  const v = String(form.get(key) ?? "").trim();
  return v === "" ? null : v;
}

// The "what the user said" part of the form
function detailsValues(form: FormData) {
  const featureId = text(form, "feature_id");
  const submittedBy = text(form, "submitted_by");
  const feedback = text(form, "feedback");
  if (!submittedBy || !feedback) {
    throw new Error("'Submitted by' and 'Feedback' are required.");
  }
  return [
    featureId ? Number(featureId) : null,
    submittedBy,
    text(form, "department"),
    feedback,
    text(form, "type") ?? "Suggestion",
    text(form, "priority") ?? "Medium",
  ];
}

// The "decision" part of the form: [status, action, date, reason, decided_by]
function decisionValues(form: FormData) {
  return [
    text(form, "status") ?? "New",
    text(form, "action_taken"),
    text(form, "decision_date"),
    text(form, "decision_reason"),
    text(form, "decided_by"),
  ] as const;
}

async function insertDecision(feedbackId: number, form: FormData) {
  await query(
    `INSERT INTO decisions (feedback_id, status, action_taken, decision_date, decision_reason, decided_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [feedbackId, ...decisionValues(form)],
  );
  await syncLatestDecision(feedbackId);
}

// Copy the most recent decision onto the feedback row (or reset it if none are left),
// so the main list can show the current status without extra queries
async function syncLatestDecision(feedbackId: number) {
  await query(
    `UPDATE feedback fb SET
       status          = COALESCE(d.status, 'New'),
       action_taken    = d.action_taken,
       decision_date   = d.decision_date,
       decision_reason = d.decision_reason,
       decided_by      = d.decided_by,
       updated_at      = now()
     FROM (SELECT 1) AS one
     LEFT JOIN LATERAL (
       SELECT * FROM decisions WHERE feedback_id = $1
       ORDER BY decision_date DESC NULLS FIRST, created_at DESC, id DESC
       LIMIT 1
     ) d ON true
     WHERE fb.id = $1`,
    [feedbackId],
  );
}

function refresh(featureId?: unknown) {
  revalidatePath("/");
  revalidatePath("/features");
  if (featureId) revalidatePath(`/features/${featureId}`);
}

export async function createFeedback(form: FormData) {
  const rows = await query(
    `INSERT INTO feedback (feature_id, submitted_by, department, feedback, type, priority)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, feature_id`,
    detailsValues(form),
  );
  const { id, feature_id } = rows[0];

  // Only record a first decision if something other than the defaults was filled in
  const [status, ...rest] = decisionValues(form);
  if (status !== "New" || rest.some((v) => v !== null)) {
    await insertDecision(id, form);
  }

  refresh(feature_id);
  // Go back where we came from: the feature page if we started there
  redirect(text(form, "return_to") ?? "/");
}

export async function updateFeedback(id: number, form: FormData) {
  await query(
    `UPDATE feedback SET
       feature_id=$1, submitted_by=$2, department=$3, feedback=$4, type=$5,
       priority=$6, updated_at=now()
     WHERE id=$7`,
    [...detailsValues(form), id],
  );
  refresh(text(form, "feature_id"));
  redirect(`/feedback/${id}`);
}

export async function deleteFeedback(id: number, goHome: boolean) {
  await query("DELETE FROM feedback WHERE id=$1", [id]); // its decisions are deleted too (CASCADE)
  refresh();
  if (goHome) redirect("/");
}

export async function addDecision(feedbackId: number, form: FormData) {
  await insertDecision(feedbackId, form);
  refresh(text(form, "feature_id"));
  revalidatePath(`/feedback/${feedbackId}`);
}

export async function deleteDecision(decisionId: number, feedbackId: number) {
  await query("DELETE FROM decisions WHERE id=$1", [decisionId]);
  await syncLatestDecision(feedbackId);
  refresh();
  revalidatePath(`/feedback/${feedbackId}`);
}

export async function createFeature(form: FormData) {
  const name = text(form, "name");
  if (!name) return;
  await query(
    "INSERT INTO features (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING",
    [name, text(form, "description")],
  );
  refresh();
}

export async function deleteFeature(id: number) {
  // Existing feedback is kept; its feature is set to NULL (see schema)
  await query("DELETE FROM features WHERE id=$1", [id]);
  refresh();
}
