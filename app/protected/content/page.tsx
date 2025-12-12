import { Blogs } from "@/components/blogs"
import { getBlogs } from "@/lib/actions/blogs"

export default async function ContentPage() {
  const initialBlogs = await getBlogs()

  return <Blogs initialBlogs={initialBlogs} />
}

