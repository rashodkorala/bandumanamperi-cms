import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { PageDB, Page } from "@/lib/types/page"
import { Metadata } from "next"

function transformPage(page: PageDB): Page {
  return {
    id: page.id,
    userId: page.user_id,
    title: page.title,
    slug: page.slug,
    content: page.content,
    contentType: page.content_type,
    template: page.template,
    metaTitle: page.meta_title,
    metaDescription: page.meta_description,
    metaKeywords: page.meta_keywords || [],
    featuredImageUrl: page.featured_image_url,
    status: page.status,
    publishedAt: page.published_at,
    parentId: page.parent_id,
    sortOrder: page.sort_order,
    isHomepage: page.is_homepage,
    markdownFileUrl: page.markdown_file_url,
    jsonFileUrl: page.json_file_url,
    createdAt: page.created_at,
    updatedAt: page.updated_at,
  }
}

async function getPageBySlug(slug: string): Promise<Page | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error) {
    console.error("Error fetching page:", error)
    return null
  }

  if (!data) {
    console.log(`No published page found with slug: ${slug}`)
    return null
  }

  return transformPage(data)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    return {
      title: "Page Not Found",
    }
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || "",
    keywords: page.metaKeywords || [],
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || "",
      images: page.featuredImageUrl ? [page.featuredImageUrl] : [],
    },
  }
}

export default async function PageDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    notFound()
  }

  // Render based on content type
  return (
    <div className="container mx-auto py-8 px-4">
      <article className="prose prose-lg dark:prose-invert mx-auto">
        {page.featuredImageUrl && (
          <div className="mb-8">
            <img
              src={page.featuredImageUrl}
              alt={page.title}
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
          {page.publishedAt && (
            <time className="text-sm text-muted-foreground">
              Published on {new Date(page.publishedAt).toLocaleDateString()}
            </time>
          )}
        </header>

        {page.contentType === "html" && (
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        )}

        {page.contentType === "markdown" && (
          <div className="markdown-content">
            {/* Markdown is pre-rendered in the content */}
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          </div>
        )}

        {page.contentType === "json" && (
          <div>
            <pre className="bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(JSON.parse(page.content), null, 2)}
            </pre>
          </div>
        )}

        {/* Display file download links */}
        <footer className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold mb-4">Download Page Content</h3>
          <div className="flex gap-4">
            {page.markdownFileUrl && (
              <a
                href={page.markdownFileUrl}
                download={`${page.slug}.md`}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Download Markdown
              </a>
            )}
            {page.jsonFileUrl && (
              <a
                href={page.jsonFileUrl}
                download={`${page.slug}.json`}
                className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                Download JSON
              </a>
            )}
          </div>
        </footer>
      </article>
    </div>
  )
}

