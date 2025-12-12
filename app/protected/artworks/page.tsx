import Artworks from "@/components/artworks";
import { getArtworks } from "@/lib/actions/artworks";

export default async function ArtworksPage() {
    // Include drafts so users can see all their artworks
    const artworks = await getArtworks({ includeDrafts: true });
    return <Artworks initialArtworks={artworks} />;
}

