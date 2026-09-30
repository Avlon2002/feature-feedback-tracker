import { notFound } from "next/navigation";
import ProjectForm from "@/components/ProjectForm";
import SubmitButton from "@/components/SubmitButton";
import { deleteProject, updateProject } from "@/app/actions";
import { getProject } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <>
      <h1>Edit project</h1>
      <ProjectForm project={project} action={updateProject.bind(null, id)} cancelHref={`/projects/${id}`} />
      <form action={deleteProject.bind(null, id)} className="danger-zone">
        <SubmitButton
          className="btn danger"
          pendingText="Deleting…"
          confirmMessage={`Delete "${project.name}" and ALL its tasks? This cannot be undone.`}
        >
          Delete project
        </SubmitButton>
      </form>
    </>
  );
}
