import Link from "next/link";
import { getProjects } from "@/lib/db";
import { today } from "@/lib/options";

export const dynamic = "force-dynamic";

// List of projects with progress
export default async function ProjectsPage() {
  const projects = await getProjects();
  const now = today();

  return (
    <>
      <div className="page-head">
        <h1>Projects</h1>
        <Link href="/projects/new" className="btn primary">+ New project</Link>
      </div>

      {projects.length === 0 ? (
        <div className="card empty">
          No projects yet. Click <strong>+ New project</strong> to add the first one.
        </div>
      ) : (
        <div className="feature-list">
          {projects.map((p) => {
            const total = p.task_count ?? 0;
            const done = p.done_count ?? 0;
            const pct = total ? Math.round((done / total) * 100) : 0;
            const late = p.due_date && p.due_date < now && done < total;
            return (
              <Link key={p.id} href={`/projects/${p.id}`} className="card feature-card">
                <div className="row">
                  <div className="feature-name">{p.name}</div>
                  {p.due_date && (
                    <span className={"small push-right" + (late ? " overdue" : " muted")}>Due {p.due_date}</span>
                  )}
                </div>
                {p.description && <div className="muted">{p.description}</div>}
                <div className="progress" aria-label={`${pct}% done`}>
                  <div style={{ width: `${pct}%` }} />
                </div>
                <div className="small muted">
                  {total === 0 ? "No tasks yet" : `${done}/${total} tasks done`}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
