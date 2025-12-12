import Projects from "@/components/projects";
import { getProjects } from "@/lib/actions/projects";

export default async function ProjectsPage() {
  // Include drafts so users can see all their projects
  const projects = await getProjects({ includeDrafts: true });
  return <Projects initialProjects={projects} />;
}

