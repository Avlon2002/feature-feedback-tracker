import Link from "next/link";
import { notFound } from "next/navigation";
import SubmitButton from "@/components/SubmitButton";
import { moveTask } from "@/app/actions";
import { getProject, getTasks, type Task } from "@/lib/db";
import { TASK_STATUSES, today } from "@/lib/options";

export const dynamic = "force-dynamic";

// A project's board: one column per status, cards move with the ← / → buttons
export default async function ProjectBoard({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [project, tasks] = await Promise.all([getProject(id), getTasks(id)]);
  if (!project) notFound();

  const done = tasks.filter((t) => t.status === "Done").length;

  return (
    <>
      <p className="small"><Link href="/projects">← All projects</Link></p>
      <div className="page-head">
        <div>
          <h1>{project.name}</h1>
          {project.description && <p className="muted">{project.description}</p>}
          <p className="small muted">
            {done}/{tasks.length} tasks done
            {project.due_date && <> · Due {project.due_date}</>}
          </p>
        </div>
        <div className="row">
          <Link href={`/projects/${id}/edit`} className="btn small">Edit project</Link>
          <Link href={`/tasks/new?project=${id}`} className="btn primary">+ Add task</Link>
        </div>
      </div>

      <div className="board">
        {TASK_STATUSES.map((status, col) => {
          const inColumn = tasks.filter((t) => t.status === status);
          return (
            <section key={status} className="column">
              <h2 className="column-title">
                {status} <span className="muted">{inColumn.length}</span>
              </h2>
              {inColumn.length === 0 && <p className="muted small column-empty">No tasks</p>}
              {inColumn.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  prev={TASK_STATUSES[col - 1]}
                  next={TASK_STATUSES[col + 1]}
                />
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}

function TaskCard({ task: t, prev, next }: { task: Task; prev?: string; next?: string }) {
  const overdue = t.due_date && t.status !== "Done" && t.due_date < today();
  return (
    <div className="task-card">
      <Link href={`/tasks/${t.id}`} className="task-title">{t.title}</Link>
      <div className="task-meta small">
        {t.assignee && <span>{t.assignee}</span>}
        {t.due_date && <span className={overdue ? "overdue" : ""}>{overdue ? "Overdue " : "Due "}{t.due_date}</span>}
        <span className={"prio prio-" + t.priority.toLowerCase()}>{t.priority}</span>
      </div>
      {t.feature_id && (
        <Link href={`/features/${t.feature_id}#issue-${t.issue_id}`} className="small task-from">
          From: {t.feature_name}
        </Link>
      )}
      <div className="task-move">
        {prev && (
          <form action={moveTask.bind(null, t.id, t.project_id, prev)}>
            <SubmitButton className="btn small" pendingText="…">← {prev}</SubmitButton>
          </form>
        )}
        {next && (
          <form action={moveTask.bind(null, t.id, t.project_id, next)} className="push-right">
            <SubmitButton className="btn small" pendingText="…">{next} →</SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}
