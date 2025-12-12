import Dashboard from "@/components/dashboard";
import { getProjects } from "@/lib/actions/projects";
import { getPhotos } from "@/lib/actions/photos";
import { getAnalyticsSummary } from "@/lib/actions/analytics";

export default async function Page() {
  const [projects, photos, analytics] = await Promise.all([
    getProjects().catch(() => []),
    getPhotos().catch(() => []),
    getAnalyticsSummary().catch(() => null),
  ]);

  return (
    <Dashboard
      projectsCount={projects.length}
      photosCount={photos.length}
      analytics={analytics}
    />
  );
}