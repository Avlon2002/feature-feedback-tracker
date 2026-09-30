import ProjectForm from "@/components/ProjectForm";
import { createProject } from "@/app/actions";

export default function NewProject() {
  return (
    <>
      <h1>New project</h1>
      <ProjectForm action={createProject} cancelHref="/projects" />
    </>
  );
}
