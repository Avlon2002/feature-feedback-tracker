import Link from "next/link";
import TaskForm from "@/components/TaskForm";
import { createTask } from "@/app/actions";
import { getFeature, getIssue, getProjects } from "@/lib/db";

export const dynamic = "force-dynamic";

// /tasks/new?project=3          -> new task on project 3
// /tasks/new?issue=7            -> new task pre-filled from feature issue 7 (choose the project)
export default async function NewTask({ searchParams }: { searchParams: Promise<{ project?: string; issue?: string }> }) {
  const sp = await searchParams;
  const projects = await getProjects();

  const issue = sp.issue ? await getIssue(Number(sp.issue)) : null;
  const feature = issue ? await getFeature(issue.feature_id) : null;

  const projectId = projects.find((p) => String(p.id) === sp.project)?.id;
  const cancelHref = issue ? `/features/${issue.feature_id}#issue-${issue.id}` : projectId ? `/projects/${projectId}` : "/projects";

  if (projects.length === 0) {
    return (
      <>
        <h1>New task</h1>
        <div className="card empty">
          Tasks belong to a project, and there are no projects yet.{" "}
          <Link href="/projects/new">Create a project first →</Link>
        </div>
      </>
    );
  }

  // When created from an issue, pre-fill the task from it
  const prefill = issue
    ? {
        project_id: projectId,
        title: (issue.action_taken ?? issue.issue).slice(0, 120),
        description: [
          issue.current_process && `Current process: ${issue.current_process}`,
          `Issue: ${issue.issue}`,
          issue.action_taken && `Action: ${issue.action_taken}`,
        ].filter(Boolean).join("\n"),
        assignee: issue.idea_by,
      }
    : { project_id: projectId };

  return (
    <>
      <h1>New task</h1>
      <TaskForm
        projects={projects}
        task={prefill}
        linkedIssue={issue && feature ? { id: issue.id, text: issue.issue, featureId: feature.id, featureName: feature.name } : undefined}
        action={createTask}
        submitLabel="Add task"
        cancelHref={cancelHref}
      />
    </>
  );
}
