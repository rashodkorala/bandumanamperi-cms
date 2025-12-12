import Dashboard from "@/components/dashboard";
import { getAnalyticsSummary } from "@/lib/actions/analytics";
import { getArtworks } from "@/lib/actions/artworks";

export default async function Page() {
  const analytics = await getAnalyticsSummary();
  const artworks = await getArtworks({ includeDrafts: true });

  return (
    <Dashboard
      artworksCount={artworks.length}
      analytics={analytics}
    />
  );
}