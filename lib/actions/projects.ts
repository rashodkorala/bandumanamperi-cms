"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  Project,
  ProjectDB,
  ProjectInsert,
  ProjectUpdate,
  ProjectStatus,
  ProjectCategory,
} from "@/lib/types/project"

function transformProject(project: ProjectDB): Project {
  return {
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
}

interface GetProjectsOptions {
  status?: ProjectStatus
  category?: ProjectCategory
  featured?: boolean
  limit?: number
  includeDrafts?: boolean
}

export async function getProjects(
  options: GetProjectsOptions = {}
): Promise<Project[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  let query = supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)

  if (options.status) {
    query = query.eq("status", options.status)
  } else if (!options.includeDrafts) {
    // By default, exclude drafts unless explicitly requested
    query = query.neq("status", "draft")
  }

  if (options.category) {
    query = query.eq("category", options.category)
  }

  if (options.featured !== undefined) {
    query = query.eq("featured", options.featured)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  // Sort by sort_order first, then updated_at desc
  query = query.order("sort_order", { ascending: true }).order("updated_at", {
    ascending: false,
  })

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`)
  }

  return (data || []).map(transformProject)
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch project: ${error.message}`)
  }

  return data ? transformProject(data) : null
}

/**
 * Get a published project by slug (for public access)
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch project: ${error.message}`)
  }

  return data ? transformProject(data) : null
}

export async function createProject(project: ProjectInsert): Promise<Project> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      slug: project.slug,
      title: project.title,
      subtitle: project.subtitle || null,
      problem: project.problem || null,
      solution: project.solution || null,
      roles: project.roles || [],
      features: project.features || [],
      tech: project.tech || [],
      live_url: project.liveUrl || null,
      github_url: project.githubUrl || null,
      case_study_url: project.caseStudyUrl || null,
      cover_image_url: project.coverImageUrl || null,
      gallery_image_urls: project.galleryImageUrls || [],
      category: project.category || null,
      status: project.status || "draft",
      featured: project.featured || false,
      sort_order: project.sortOrder || 0,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`)
  }

  revalidatePath("/protected/projects")
  revalidatePath("/api/projects")
  return transformProject(data)
}

export async function updateProject(
  project: ProjectUpdate
): Promise<Project> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { id, ...updates } = project

  const updateData: Partial<ProjectDB> = {}
  if (updates.slug !== undefined) updateData.slug = updates.slug
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.subtitle !== undefined) updateData.subtitle = updates.subtitle
  if (updates.problem !== undefined) updateData.problem = updates.problem
  if (updates.solution !== undefined) updateData.solution = updates.solution
  if (updates.roles !== undefined) updateData.roles = updates.roles || []
  if (updates.features !== undefined) updateData.features = updates.features || []
  if (updates.tech !== undefined) updateData.tech = updates.tech || []
  if (updates.liveUrl !== undefined) updateData.live_url = updates.liveUrl
  if (updates.githubUrl !== undefined) updateData.github_url = updates.githubUrl
  if (updates.caseStudyUrl !== undefined)
    updateData.case_study_url = updates.caseStudyUrl
  if (updates.coverImageUrl !== undefined)
    updateData.cover_image_url = updates.coverImageUrl
  if (updates.galleryImageUrls !== undefined)
    updateData.gallery_image_urls = updates.galleryImageUrls || []
  if (updates.category !== undefined) updateData.category = updates.category
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.featured !== undefined) updateData.featured = updates.featured
  if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder

  const { data, error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`)
  }

  revalidatePath("/protected/projects")
  revalidatePath("/api/projects")
  return transformProject(data)
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`)
  }

  revalidatePath("/protected/projects")
  revalidatePath("/api/projects")
}

/**
 * Duplicate a project (creates a copy with "-copy" appended to slug)
 */
export async function duplicateProject(id: string): Promise<Project> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Get the original project
  const original = await getProject(id)
  if (!original) {
    throw new Error("Project not found")
  }

  // Create a new project with copied data
  const newProject: ProjectInsert = {
    slug: `${original.slug}-copy`,
    title: `${original.title} (Copy)`,
    subtitle: original.subtitle,
    problem: original.problem,
    solution: original.solution,
    roles: original.roles,
    features: original.features,
    tech: original.tech,
    liveUrl: original.liveUrl,
    githubUrl: original.githubUrl,
    caseStudyUrl: original.caseStudyUrl,
    coverImageUrl: original.coverImageUrl,
    galleryImageUrls: original.galleryImageUrls,
    category: original.category,
    status: "draft", // Always duplicate as draft
    featured: false, // Don't duplicate featured status
    sortOrder: original.sortOrder,
  }

  return createProject(newProject)
}
