import Link from "next/link";
import type { Project } from "@/lib/db";
import SubmitButton from "./SubmitButton";

type Props = {
  project?: Project; // set when editing
  action: (form: FormData) => Promise<void>;
  cancelHref: string;
};

export default function ProjectForm({ project, action, cancelHref }: Props) {
  return (
    <form action={action} className="card form">
      <label>
        Project name *
        <input name="name" required defaultValue={project?.name ?? ""} placeholder="e.g. Starter form rework" autoFocus />
      </label>
      <label>
        Description
        <textarea name="description" rows={2} defaultValue={project?.description ?? ""} placeholder="What is this project about? (optional)" />
      </label>
      <div className="grid">
        <label>
          Due date
          <input type="date" name="due_date" defaultValue={project?.due_date ?? ""} />
        </label>
      </div>
      <div className="row">
        <SubmitButton className="btn primary">{project ? "Save" : "Create project"}</SubmitButton>
        <Link href={cancelHref} className="btn">Cancel</Link>
      </div>
    </form>
  );
}
