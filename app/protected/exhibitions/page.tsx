import Exhibitions from "@/components/artworks/exhibitions"
import { getExhibitions } from "@/lib/actions/exhibitions"

export default async function ExhibitionsPage() {
  const exhibitions = await getExhibitions()
  return <Exhibitions initialExhibitions={exhibitions} />
}


