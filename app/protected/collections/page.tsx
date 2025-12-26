import Collections from "@/components/artworks/collections"
import { getArtworksByCollection } from "@/lib/actions/artworks"

export default async function CollectionsPage() {
  const collections = await getArtworksByCollection()
  return <Collections initialCollections={collections} />
}




