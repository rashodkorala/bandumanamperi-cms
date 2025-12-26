import Dashboard from "@/components/dashboard";
import { getArtworks } from "@/lib/actions/artworks";

export default async function Page() {
  const artworks = await getArtworks({ includeDrafts: true });

  return (
    <Dashboard
      artworksCount={artworks.length}
      analytics={null}
    />
  );
}