import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { ProjectDB } from "@/lib/types/project"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    // Get query parameters
    const featured = searchParams.get("featured")
    const category = searchParams.get("category")

    // Build query - only published projects
    let query = supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false })

    if (featured === "true") {
      query = query.eq("featured", true)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching projects:", error)
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      )
    }

    // Transform to camelCase for API response
    const projects = (data || []).map((project: ProjectDB) => ({
      id: project.id,
      userId: project.user_id,
      slug: project.slug,
      title: project.title,
      subtitle: project.subtitle,
      problem: project.problem,
      solution: project.solution,
      roles: project.roles,
      features: project.features,
      tech: project.tech,
      liveUrl: project.live_url,
      githubUrl: project.github_url,
      caseStudyUrl: project.case_study_url,
      coverImageUrl: project.cover_image_url,
      galleryImageUrls: project.gallery_image_urls,
      category: project.category,
      status: project.status,
      featured: project.featured,
      sortOrder: project.sort_order,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }))

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error in GET /api/projects:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}




