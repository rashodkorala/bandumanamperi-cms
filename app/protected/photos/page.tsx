import Photos from "@/components/photos";
import { getPhotos } from "@/lib/actions/photos";

export default async function PhotosPage() {
  const photos = await getPhotos();
  return <Photos initialPhotos={photos} />;
}

