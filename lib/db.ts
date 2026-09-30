import { neon } from "@neondatabase/serverless";
import type { PGlite } from "@electric-sql/pglite";

export type Feature = {
  id: number;
  name: string;
  description: string | null;
  issue_count?: number;
  open_count?: number; // issues not Done / Rejected
};

export type Issue = {
  id: number;
  feature_id: number;
  current_process: string | null;
  issue: string;
  action_taken: string | null;
  raised_by: string | null;
  idea_by: string | null;
  status: string;
  decision_date: string | null; // YYYY-MM-DD
  decision_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: number;
  name: string;
  description: string | null;
  due_date: string | null; // YYYY-MM-DD
  task_count?: number;
  done_count?: number;
};

export type Task = {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  assignee: string | null;
  due_date: string | null; // YYYY-MM-DD
  priority: string;
  status: string;
  issue_id: number | null;
  // filled in by the queries below when the task is linked to an issue
  project_name?: string;
  issue_text?: string | null;
  feature_id?: number | null;
  feature_name?: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

// Two database modes, same SQL:
//  - DATABASE_URL set  -> Neon Postgres (use this on Vercel)
//  - DATABASE_URL empty -> PGlite, a Postgres that runs inside Node and saves to ./.data
export async function query(text: string, params: unknown[] = []): Promise<Row[]> {
  const url = process.env.DATABASE_URL;
  if (url) return (await neon(url).query(text, params)) as Row[];

  const local = await localDb();
  return (await local.query<Row>(text, params)).rows;
}

// Keep one local instance across hot reloads in dev
const globalForDb = globalThis as unknown as { pglite?: Promise<PGlite> };

function localDb(): Promise<PGlite> {
  if (process.env.VERCEL) {
    throw new Error("DATABASE_URL is not set. On Vercel you must connect a Postgres database (see README).");
  }
  globalForDb.pglite ??= (async () => {
    const { PGlite } = await import("@electric-sql/pglite");
    const { mkdirSync, readFileSync } = await import("node:fs");
    const path = await import("node:path");

    const dir = path.join(process.cwd(), ".data", "pglite");
    mkdirSync(dir, { recursive: true });
    const pg = await PGlite.create(dir);

    // Create the tables if they don't exist yet
    await pg.exec(readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8"));
    return pg;
  })().catch((err) => {
    globalForDb.pglite = undefined; // allow a retry on the next request
    throw err;
  });
  return globalForDb.pglite;
}

// search: only features whose name or description contains the text
export async function getFeatures(search?: string): Promise<Feature[]> {
  const rows = await query(
    `SELECT f.id, f.name, f.description,
       COUNT(i.id)::int AS issue_count,
       COUNT(i.id) FILTER (WHERE i.status NOT IN ('Done', 'Rejected'))::int AS open_count
     FROM features f
     LEFT JOIN issues i ON i.feature_id = f.id
     ${search ? "WHERE f.name ILIKE $1 OR f.description ILIKE $1" : ""}
     GROUP BY f.id
     ORDER BY f.name`,
    search ? [`%${search}%`] : [],
  );
  return rows as Feature[];
}

// Issues where any text field contains the search text, with their feature's name
export async function searchIssues(search: string): Promise<(Issue & { feature_name: string })[]> {
  const rows = await query(
    `SELECT i.*, to_char(i.decision_date, 'YYYY-MM-DD') AS decision_date, f.name AS feature_name
     FROM issues i
     JOIN features f ON f.id = i.feature_id
     WHERE concat_ws(' ', i.current_process, i.issue, i.action_taken, i.raised_by,
                     i.idea_by, i.status, i.decision_reason) ILIKE $1
     ORDER BY f.name, i.created_at, i.id`,
    [`%${search}%`],
  );
  return rows as (Issue & { feature_name: string })[];
}

export async function getFeature(id: number): Promise<Feature | null> {
  const rows = await query("SELECT id, name, description FROM features WHERE id = $1", [id]);
  return (rows[0] as Feature) ?? null;
}

// Oldest first, so blocks are numbered 1, 2, 3... in the order they were added
export async function getIssues(featureId: number): Promise<Issue[]> {
  const rows = await query(
    `SELECT *, to_char(decision_date, 'YYYY-MM-DD') AS decision_date
     FROM issues WHERE feature_id = $1
     ORDER BY created_at, id`,
    [featureId],
  );
  return rows as Issue[];
}

export async function getIssue(id: number): Promise<Issue | null> {
  const rows = await query(
    "SELECT *, to_char(decision_date, 'YYYY-MM-DD') AS decision_date FROM issues WHERE id = $1",
    [id],
  );
  return (rows[0] as Issue) ?? null;
}

// ---------- Project management ----------

export async function getProjects(): Promise<Project[]> {
  const rows = await query(`
    SELECT p.id, p.name, p.description, to_char(p.due_date, 'YYYY-MM-DD') AS due_date,
      COUNT(t.id)::int AS task_count,
      COUNT(t.id) FILTER (WHERE t.status = 'Done')::int AS done_count
    FROM projects p
    LEFT JOIN tasks t ON t.project_id = p.id
    GROUP BY p.id
    ORDER BY p.due_date NULLS LAST, p.name`);
  return rows as Project[];
}

export async function getProject(id: number): Promise<Project | null> {
  const rows = await query(
    "SELECT id, name, description, to_char(due_date, 'YYYY-MM-DD') AS due_date FROM projects WHERE id = $1",
    [id],
  );
  return (rows[0] as Project) ?? null;
}

// Shared SELECT for tasks, including where they came from (feature + issue) if linked
const TASK_SELECT = `
  SELECT t.id, t.project_id, t.title, t.description, t.assignee, t.priority, t.status, t.issue_id,
    to_char(t.due_date, 'YYYY-MM-DD') AS due_date,
    p.name AS project_name, i.issue AS issue_text, f.id AS feature_id, f.name AS feature_name
  FROM tasks t
  JOIN projects p ON p.id = t.project_id
  LEFT JOIN issues i ON i.id = t.issue_id
  LEFT JOIN features f ON f.id = i.feature_id`;

export async function getTasks(projectId: number): Promise<Task[]> {
  const rows = await query(
    `${TASK_SELECT} WHERE t.project_id = $1 ORDER BY t.due_date NULLS LAST, t.created_at, t.id`,
    [projectId],
  );
  return rows as Task[];
}

export async function getTask(id: number): Promise<Task | null> {
  const rows = await query(`${TASK_SELECT} WHERE t.id = $1`, [id]);
  return (rows[0] as Task) ?? null;
}

// All tasks created from any issue of a feature (shown under each issue block)
export async function getTasksForFeature(featureId: number): Promise<Task[]> {
  const rows = await query(`${TASK_SELECT} WHERE i.feature_id = $1 ORDER BY t.created_at, t.id`, [featureId]);
  return rows as Task[];
}
