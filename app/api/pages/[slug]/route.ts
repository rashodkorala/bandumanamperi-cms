import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Page, PageDB } from "@/lib/types/page"

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published") // Only return published pages for public API
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Page not found" },
          { status: 404 }
        )
      }
      console.error("Error fetching page:", error)
      return NextResponse.json(
        { error: "Failed to fetch page" },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      )
    }

    const page = transformPage(data)

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error in page API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


