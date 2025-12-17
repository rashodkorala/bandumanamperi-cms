import { getPages } from "@/lib/actions/pages"
import { Pages } from "@/components/pages"

export default async function PagesPage() {
  const pages = await getPages()

  return <Pages initialPages={pages} />
}

