"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";

// Turn empty form fields into NULL so the database stays clean
function text(form: FormData, key: string): string | null {
  const v = String(form.get(key) ?? "").trim();
  return v === "" ? null : v;
}

// ---------- Features ----------

export async function createFeature(form: FormData) {
  const name = text(form, "name");
  if (!name) throw new Error("Feature name is required.");
  const rows = await query(
    `INSERT INTO features (name, description) VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name  -- same name: just open the existing one
     RETURNING id`,
    [name, text(form, "description")],
  );
  revalidatePath("/");
  redirect(`/features/${rows[0].id}`);
}

export async function updateFeature(id: number, form: FormData) {
  const name = text(form, "name");
  if (!name) throw new Error("Feature name is required.");
  await query("UPDATE features SET name=$1, description=$2 WHERE id=$3", [name, text(form, "description"), id]);
  revalidatePath("/");
  redirect(`/features/${id}`);
}

export async function deleteFeature(id: number) {
  await query("DELETE FROM features WHERE id=$1", [id]); // its issues are deleted too (CASCADE)
  revalidatePath("/");
  redirect("/");
}

// ---------- Issue blocks ----------

function issueValues(form: FormData) {
  const issue = text(form, "issue");
  if (!issue) throw new Error("'Issue' is required.");
  return [
    text(form, "current_process"),
    issue,
    text(form, "action_taken"),
    text(form, "raised_by"),
    text(form, "idea_by"),
    text(form, "status") ?? "New",
    text(form, "decision_date"),
    text(form, "decision_reason"),
  ];
}

export async function createIssue(featureId: number, form: FormData) {
  await query(
    `INSERT INTO issues (current_process, issue, action_taken, raised_by, idea_by,
                         status, decision_date, decision_reason, feature_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [...issueValues(form), featureId],
  );
  revalidatePath("/");
  redirect(`/features/${featureId}`);
}

export async function updateIssue(id: number, featureId: number, form: FormData) {
  await query(
    `UPDATE issues SET current_process=$1, issue=$2, action_taken=$3, raised_by=$4, idea_by=$5,
       status=$6, decision_date=$7, decision_reason=$8, updated_at=now()
     WHERE id=$9`,
    [...issueValues(form), id],
  );
  revalidatePath("/");
  redirect(`/features/${featureId}`);
}

export async function deleteIssue(id: number, featureId: number) {
  await query("DELETE FROM issues WHERE id=$1", [id]);
  revalidatePath("/");
  revalidatePath(`/features/${featureId}`);
}
