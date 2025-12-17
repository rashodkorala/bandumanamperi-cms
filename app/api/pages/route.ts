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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const parentId = searchParams.get("parentId")
    const isHomepage = searchParams.get("isHomepage")

    let query = supabase
      .from("pages")
      .select("*")
      .eq("status", "published") // Only return published pages for public API

    if (status) {
      query = query.eq("status", status)
    }

    if (parentId) {
      query = query.eq("parent_id", parentId)
    } else if (parentId === null) {
      query = query.is("parent_id", null)
    }

    if (isHomepage === "true") {
      query = query.eq("is_homepage", true)
    }

    query = query.order("sort_order", { ascending: true }).order("created_at", {
      ascending: false,
    })

    const { data, error } = await query

    if (error) {
      console.error("Error fetching pages:", error)
      return NextResponse.json(
        { error: "Failed to fetch pages" },
        { status: 500 }
      )
    }

    const pages = (data || []).map(transformPage)

    return NextResponse.json(pages)
  } catch (error) {
    console.error("Error in pages API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


