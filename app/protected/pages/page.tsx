import { Pages } from "@/components/pages"
import { getPages } from "@/lib/actions/pages"

export default async function PagesPage() {
  const initialPages = await getPages()

  return <Pages initialPages={initialPages} />
}

