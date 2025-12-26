import Dashboard from "@/components/dashboard";
import { getArtworks } from "@/lib/actions/artworks";
import { getPostHogSummary } from "@/lib/actions/posthog-analytics";

export default async function Page() {
  const [artworks, analytics] = await Promise.all([
    getArtworks({ includeDrafts: true }),
    getPostHogSummary(),
  ]);

  return (
    <Dashboard
      artworksCount={artworks.length}
      analytics={analytics}
    />
  );
}