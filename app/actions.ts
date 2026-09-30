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
  await query("DELETE FROM issues WHERE id=$1", [id]); // linked tasks are kept, just unlinked
  revalidatePath("/");
  revalidatePath(`/features/${featureId}`);
}

// ---------- Projects ----------

function projectValues(form: FormData) {
  const name = text(form, "name");
  if (!name) throw new Error("Project name is required.");
  return [name, text(form, "description"), text(form, "due_date")];
}

export async function createProject(form: FormData) {
  const rows = await query(
    "INSERT INTO projects (name, description, due_date) VALUES ($1, $2, $3) RETURNING id",
    projectValues(form),
  );
  revalidatePath("/projects");
  redirect(`/projects/${rows[0].id}`);
}

export async function updateProject(id: number, form: FormData) {
  await query("UPDATE projects SET name=$1, description=$2, due_date=$3 WHERE id=$4", [...projectValues(form), id]);
  revalidatePath("/projects");
  redirect(`/projects/${id}`);
}

export async function deleteProject(id: number) {
  await query("DELETE FROM projects WHERE id=$1", [id]); // its tasks are deleted too (CASCADE)
  revalidatePath("/projects");
  redirect("/projects");
}

// ---------- Tasks ----------

function taskValues(form: FormData) {
  const projectId = text(form, "project_id");
  const title = text(form, "title");
  if (!projectId) throw new Error("Choose a project.");
  if (!title) throw new Error("Task title is required.");
  const issueId = text(form, "issue_id");
  return [
    Number(projectId),
    title,
    text(form, "description"),
    text(form, "assignee"),
    text(form, "due_date"),
    text(form, "priority") ?? "Medium",
    text(form, "status") ?? "To do",
    issueId ? Number(issueId) : null,
  ];
}

// The project board, the projects list and the linked feature page all show tasks
function refreshTasks(projectId: unknown) {
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/features/[id]", "page");
}

export async function createTask(form: FormData) {
  const values = taskValues(form);
  await query(
    `INSERT INTO tasks (project_id, title, description, assignee, due_date, priority, status, issue_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    values,
  );
  refreshTasks(values[0]);
  redirect(`/projects/${values[0]}`);
}

export async function updateTask(id: number, form: FormData) {
  const values = taskValues(form);
  await query(
    `UPDATE tasks SET project_id=$1, title=$2, description=$3, assignee=$4, due_date=$5,
       priority=$6, status=$7, issue_id=$8, updated_at=now()
     WHERE id=$9`,
    [...values, id],
  );
  refreshTasks(values[0]);
  redirect(`/projects/${values[0]}`);
}

export async function deleteTask(id: number, projectId: number) {
  await query("DELETE FROM tasks WHERE id=$1", [id]);
  refreshTasks(projectId);
  redirect(`/projects/${projectId}`);
}

// The ← / → buttons on the board
export async function moveTask(id: number, projectId: number, status: string) {
  await query("UPDATE tasks SET status=$1, updated_at=now() WHERE id=$2", [status, id]);
  refreshTasks(projectId);
}
