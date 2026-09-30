import Link from "next/link";
import type { Project, Task } from "@/lib/db";
import { PRIORITIES, TASK_STATUSES } from "@/lib/options";
import SubmitButton from "./SubmitButton";

type Props = {
  projects: Project[];
  task?: Partial<Task>;  // existing task, or pre-filled values for a new one
  linkedIssue?: { id: number; text: string; featureId: number; featureName: string };
  action: (form: FormData) => Promise<void>;
  submitLabel: string;
  cancelHref: string;
};

export default function TaskForm({ projects, task, linkedIssue, action, submitLabel, cancelHref }: Props) {
  return (
    <form action={action} className="card form">
      {linkedIssue && (
        <>
          <input type="hidden" name="issue_id" value={linkedIssue.id} />
          <p className="from-issue small">
            From feature issue:{" "}
            <Link href={`/features/${linkedIssue.featureId}#issue-${linkedIssue.id}`}>
              {linkedIssue.featureName} › {linkedIssue.text}
            </Link>
          </p>
        </>
      )}

      <div className="grid">
        <label>
          Project *
          <select name="project_id" required defaultValue={task?.project_id ?? ""}>
            <option value="" disabled>Choose a project…</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label>
          Status
          <select name="status" defaultValue={task?.status ?? "To do"}>
            {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <label>
        Task *
        <input name="title" required defaultValue={task?.title ?? ""} placeholder="What needs doing?" autoFocus />
      </label>
      <label>
        Details
        <textarea name="description" rows={3} defaultValue={task?.description ?? ""} placeholder="Optional notes" />
      </label>

      <div className="grid">
        <label>
          Assigned to
          <input name="assignee" defaultValue={task?.assignee ?? ""} placeholder="Who is doing it" />
        </label>
        <label>
          Due date
          <input type="date" name="due_date" defaultValue={task?.due_date ?? ""} />
        </label>
        <label>
          Priority
          <select name="priority" defaultValue={task?.priority ?? "Medium"}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
      </div>

      <div className="row">
        <SubmitButton className="btn primary">{submitLabel}</SubmitButton>
        <Link href={cancelHref} className="btn">Cancel</Link>
      </div>
    </form>
  );
}
