import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { ProjectDB } from "@/lib/types/project"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient()
    const { slug } = await params

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        )
      }
      console.error("Error fetching project:", error)
      return NextResponse.json(
        { error: "Failed to fetch project" },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Transform to camelCase for API response
    const project: ProjectDB = data
    const response = {
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
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in GET /api/projects/[slug]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


