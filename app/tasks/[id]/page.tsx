import Link from "next/link";
import { notFound } from "next/navigation";
import SubmitButton from "@/components/SubmitButton";
import TaskForm from "@/components/TaskForm";
import { deleteTask, updateTask } from "@/app/actions";
import { getProjects, getTask } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditTask({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [task, projects] = await Promise.all([getTask(id), getProjects()]);
  if (!task) notFound();

  return (
    <>
      <p className="small"><Link href={`/projects/${task.project_id}`}>← {task.project_name}</Link></p>
      <h1>Edit task</h1>
      <TaskForm
        projects={projects}
        task={task}
        linkedIssue={
          task.issue_id && task.feature_id
            ? { id: task.issue_id, text: task.issue_text ?? "", featureId: task.feature_id, featureName: task.feature_name ?? "" }
            : undefined
        }
        action={updateTask.bind(null, id)}
        submitLabel="Save"
        cancelHref={`/projects/${task.project_id}`}
      />
      <form action={deleteTask.bind(null, id, task.project_id)} className="danger-zone">
        <SubmitButton className="btn danger" pendingText="Deleting…" confirmMessage="Delete this task? This cannot be undone.">
          Delete task
        </SubmitButton>
      </form>
    </>
  );
}
