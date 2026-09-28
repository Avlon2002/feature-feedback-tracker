import { neon } from "@neondatabase/serverless";
import type { PGlite } from "@electric-sql/pglite";

export type Feature = {
  id: number;
  name: string;
  description: string | null;
  feedback_count?: number;
};

export type Feedback = {
  id: number;
  feature_id: number | null;
  feature_name: string | null;
  submitted_by: string;
  department: string | null;
  feedback: string;
  type: string;
  priority: string;
  status: string;
  action_taken: string | null;
  decision_date: string | null; // YYYY-MM-DD
  decision_reason: string | null;
  decided_by: string | null;
  created_at: string;
  updated_at: string;
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
    const { existsSync, mkdirSync, readFileSync } = await import("node:fs");
    const path = await import("node:path");

    const dir = path.join(process.cwd(), ".data", "pglite");
    const isNew = !existsSync(dir);
    mkdirSync(dir, { recursive: true });
    const pg = await PGlite.create(dir);

    // First run: create the tables and a few example features automatically
    await pg.exec(readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8"));
    if (isNew) {
      await pg.exec(`INSERT INTO features (name, description) VALUES
        ('Leave Requests', 'Apply for and approve annual/sick leave'),
        ('Payslips', 'View and download monthly payslips'),
        ('Timesheets', 'Log hours against projects'),
        ('Profile', 'Personal details, emergency contacts')
        ON CONFLICT (name) DO NOTHING`);
    }
    return pg;
  })().catch((err) => {
    globalForDb.pglite = undefined; // allow a retry on the next request
    throw err;
  });
  return globalForDb.pglite;
}

export async function getFeatures(): Promise<Feature[]> {
  const rows = await query(`
    SELECT f.id, f.name, f.description, COUNT(fb.id)::int AS feedback_count
    FROM features f
    LEFT JOIN feedback fb ON fb.feature_id = f.id
    GROUP BY f.id
    ORDER BY f.name`);
  return rows as Feature[];
}

export type FeedbackFilters = {
  q?: string;
  status?: string;
  feature?: string;
  priority?: string;
};

export async function getFeedbackList(filters: FeedbackFilters = {}): Promise<Feedback[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  const add = (clause: string, value: unknown) => {
    params.push(value);
    where.push(clause.replace("?", `$${params.length}`));
  };

  if (filters.status) add("fb.status = ?", filters.status);
  if (filters.priority) add("fb.priority = ?", filters.priority);
  if (filters.feature) add("fb.feature_id = ?", Number(filters.feature));
  if (filters.q) {
    params.push(`%${filters.q}%`);
    const p = `$${params.length}`;
    where.push(
      `(fb.feedback ILIKE ${p} OR fb.submitted_by ILIKE ${p} OR fb.action_taken ILIKE ${p} OR fb.decision_reason ILIKE ${p})`,
    );
  }

  const rows = await query(
    `SELECT fb.*, to_char(fb.decision_date, 'YYYY-MM-DD') AS decision_date, f.name AS feature_name
     FROM feedback fb
     LEFT JOIN features f ON f.id = fb.feature_id
     ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY fb.updated_at DESC`,
    params,
  );
  return rows as Feedback[];
}

export async function getFeedback(id: number): Promise<Feedback | null> {
  const rows = await query(
    `SELECT fb.*, to_char(fb.decision_date, 'YYYY-MM-DD') AS decision_date, f.name AS feature_name
     FROM feedback fb
     LEFT JOIN features f ON f.id = fb.feature_id
     WHERE fb.id = $1`,
    [id],
  );
  return (rows[0] as Feedback) ?? null;
}

export async function getStatusCounts(): Promise<Record<string, number>> {
  const rows = await query(
    "SELECT status, COUNT(*)::int AS n FROM feedback GROUP BY status",
  );
  return Object.fromEntries(rows.map((r) => [r.status, r.n]));
}
