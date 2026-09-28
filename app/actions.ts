"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";

// Turn empty form fields into NULL so the database stays clean
function text(form: FormData, key: string): string | null {
  const v = String(form.get(key) ?? "").trim();
  return v === "" ? null : v;
}

function feedbackValues(form: FormData) {
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
    text(form, "status") ?? "New",
    text(form, "action_taken"),
    text(form, "decision_date"),
    text(form, "decision_reason"),
    text(form, "decided_by"),
  ];
}

export async function createFeedback(form: FormData) {
  await query(
    `INSERT INTO feedback
       (feature_id, submitted_by, department, feedback, type, priority, status,
        action_taken, decision_date, decision_reason, decided_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    feedbackValues(form),
  );
  revalidatePath("/");
  redirect("/");
}

export async function updateFeedback(id: number, form: FormData) {
  await query(
    `UPDATE feedback SET
       feature_id=$1, submitted_by=$2, department=$3, feedback=$4, type=$5,
       priority=$6, status=$7, action_taken=$8, decision_date=$9,
       decision_reason=$10, decided_by=$11, updated_at=now()
     WHERE id=$12`,
    [...feedbackValues(form), id],
  );
  revalidatePath("/");
  redirect("/");
}

export async function deleteFeedback(id: number) {
  await query("DELETE FROM feedback WHERE id=$1", [id]);
  revalidatePath("/");
  redirect("/");
}

export async function createFeature(form: FormData) {
  const name = text(form, "name");
  if (!name) return;
  await query(
    "INSERT INTO features (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING",
    [name, text(form, "description")],
  );
  revalidatePath("/features");
}

export async function deleteFeature(id: number) {
  // Existing feedback is kept; its feature is set to NULL (see schema)
  await query("DELETE FROM features WHERE id=$1", [id]);
  revalidatePath("/features");
}
