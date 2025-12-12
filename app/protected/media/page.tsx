import { MediaLibrary } from "@/components/media"
import { getMedia } from "@/lib/actions/media"

export default async function MediaPage() {
  const initialMedia = await getMedia()

  return <MediaLibrary initialMedia={initialMedia} />
}

