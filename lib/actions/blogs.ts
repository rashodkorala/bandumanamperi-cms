"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/verify-auth"
import { parseSupabaseError, AppError, ErrorType, ErrorMessages, logError } from "@/lib/utils/error-handler"
import type { Blog, BlogDB, BlogInsert, BlogUpdate } from "@/lib/types/blog"

function transformBlog(blog: BlogDB): Blog {
  return {
    id: blog.id,
    userId: blog.user_id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    featuredImageUrl: blog.featured_image_url,
    status: blog.status,
    publishedAt: blog.published_at,
    authorName: blog.author_name,
    category: blog.category,
    tags: blog.tags || [],
    seoTitle: blog.seo_title,
    seoDescription: blog.seo_description,
    featured: blog.featured,
    views: blog.views,
    createdAt: blog.created_at,
    updatedAt: blog.updated_at,
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export async function getBlogs(status?: string): Promise<Blog[]> {
  // Verify authentication
  const user = await requireAuth()
  
  const supabase = await createClient()

  let query = supabase
    .from("blogs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch blogs: ${error.message}`)
  }

  return (data || []).map(transformBlog)
}

export async function getBlog(id: string): Promise<Blog | null> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch blog: ${error.message}`)
  }

  return data ? transformBlog(data) : null
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  // Verify authentication
  const user = await requireAuth()
  
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch blog: ${error.message}`)
  }

  return data ? transformBlog(data) : null
}

export async function createBlog(blog: BlogInsert): Promise<Blog> {
  try {
    // Verify authentication
    const user = await requireAuth()
    
    // Validate required fields
    if (!blog.title || !blog.title.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Blog title is required.",
        "Missing required field: title"
      )
    }

    if (!blog.content || !blog.content.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Blog content is required.",
        "Missing required field: content"
      )
    }

    const supabase = await createClient()

    const slug = blog.slug || slugify(blog.title)

    // Validate slug format
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugPattern.test(slug)) {
      throw new AppError(
        ErrorType.INVALID_FORMAT,
        "Slug must contain only lowercase letters, numbers, and hyphens.",
        `Invalid slug format: ${slug}`
      )
    }

    const { data, error } = await supabase
      .from("blogs")
      .insert({
        user_id: user.id,
        title: blog.title,
        slug: slug,
        excerpt: blog.excerpt || null,
        content: blog.content,
        featured_image_url: blog.featuredImageUrl || null,
        status: blog.status || "draft",
        published_at: blog.publishedAt || (blog.status === "published" ? new Date().toISOString() : null),
        author_name: blog.authorName || null,
        category: blog.category || null,
        tags: blog.tags || [],
        seo_title: blog.seoTitle || null,
        seo_description: blog.seoDescription || null,
        featured: blog.featured || false,
        views: 0,
      })
      .select()
      .single()

    if (error) {
      // Check for duplicate slug error
      if (error.code === "23505" && error.message?.includes("slug")) {
        throw new AppError(
          ErrorType.DUPLICATE_ENTRY,
          ErrorMessages.BLOG_DUPLICATE_SLUG,
          error.message
        )
      }

      const appError = parseSupabaseError(error, "create", "Blog")
      logError(appError, { operation: "createBlog", blog })
      throw appError
    }

    revalidatePath("/protected/content")
    return transformBlog(data)
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "createBlog", blog })
    throw new AppError(
      ErrorType.CREATE_FAILED,
      ErrorMessages.BLOG_CREATE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

export async function updateBlog(blog: BlogUpdate): Promise<Blog> {
  try {
    // Verify authentication
    const user = await requireAuth()
    
    // Validate blog ID
    if (!blog.id) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Blog ID is required for update.",
        "Missing required field: id"
      )
    }

    // Validate slug if provided
    if (blog.slug) {
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      if (!slugPattern.test(blog.slug)) {
        throw new AppError(
          ErrorType.INVALID_FORMAT,
          "Slug must contain only lowercase letters, numbers, and hyphens.",
          `Invalid slug format: ${blog.slug}`
        )
      }
    }

    const supabase = await createClient()

    const updateData: Partial<{
      title: string
      slug: string
      excerpt: string | null
      content: string
      featured_image_url: string | null
      status: string
      published_at: string | null
      author_name: string | null
      category: string | null
      tags: string[] | null
      seo_title: string | null
      seo_description: string | null
      featured: boolean
    }> = {}
    if (blog.title !== undefined) updateData.title = blog.title
    if (blog.slug !== undefined) updateData.slug = blog.slug
    if (blog.excerpt !== undefined) updateData.excerpt = blog.excerpt
    if (blog.content !== undefined) updateData.content = blog.content
    if (blog.featuredImageUrl !== undefined) updateData.featured_image_url = blog.featuredImageUrl
    if (blog.status !== undefined) {
      updateData.status = blog.status
      if (blog.status === "published" && !blog.publishedAt) {
        updateData.published_at = new Date().toISOString()
      }
    }
    if (blog.publishedAt !== undefined) updateData.published_at = blog.publishedAt
    if (blog.authorName !== undefined) updateData.author_name = blog.authorName
    if (blog.category !== undefined) updateData.category = blog.category
    if (blog.tags !== undefined) updateData.tags = blog.tags
    if (blog.seoTitle !== undefined) updateData.seo_title = blog.seoTitle
    if (blog.seoDescription !== undefined) updateData.seo_description = blog.seoDescription
    if (blog.featured !== undefined) updateData.featured = blog.featured

    const { data, error } = await supabase
      .from("blogs")
      .update(updateData)
      .eq("id", blog.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      // Check for duplicate slug error
      if (error.code === "23505" && error.message?.includes("slug")) {
        throw new AppError(
          ErrorType.DUPLICATE_ENTRY,
          ErrorMessages.BLOG_DUPLICATE_SLUG,
          error.message
        )
      }

      // Check if blog was not found
      if (error.code === "PGRST116") {
        throw new AppError(
          ErrorType.NOT_FOUND,
          ErrorMessages.BLOG_NOT_FOUND,
          error.message
        )
      }

      const appError = parseSupabaseError(error, "update", "Blog")
      logError(appError, { operation: "updateBlog", blogId: blog.id, updates: blog })
      throw appError
    }

    revalidatePath("/protected/content")
    return transformBlog(data)
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "updateBlog", blog })
    throw new AppError(
      ErrorType.UPDATE_FAILED,
      ErrorMessages.BLOG_UPDATE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

export async function deleteBlog(id: string): Promise<void> {
  try {
    // Verify authentication
    const user = await requireAuth()
    
    // Validate blog ID
    if (!id || !id.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Blog ID is required for deletion.",
        "Missing required field: id"
      )
    }

    const supabase = await createClient()

    // Check if blog exists
    const { data: existingBlog, error: fetchError } = await supabase
      .from("blogs")
      .select("id, title")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingBlog) {
      throw new AppError(
        ErrorType.NOT_FOUND,
        ErrorMessages.BLOG_NOT_FOUND,
        fetchError?.message || "Blog not found"
      )
    }

    const { error } = await supabase
      .from("blogs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      // Check for foreign key constraint violations
      if (error.code === "23503") {
        throw new AppError(
          ErrorType.CONSTRAINT_VIOLATION,
          "Cannot delete blog because it is referenced by other data.",
          error.message
        )
      }

      const appError = parseSupabaseError(error, "delete", "Blog")
      logError(appError, { operation: "deleteBlog", blogId: id })
      throw appError
    }

    revalidatePath("/protected/content")
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "deleteBlog", blogId: id })
    throw new AppError(
      ErrorType.DELETE_FAILED,
      ErrorMessages.BLOG_DELETE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

