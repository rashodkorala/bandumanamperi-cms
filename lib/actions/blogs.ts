"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/verify-auth"
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
  // Verify authentication
  const user = await requireAuth()
  
  const supabase = await createClient()

  const slug = blog.slug || slugify(blog.title)

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
    throw new Error(`Failed to create blog: ${error.message}`)
  }

  revalidatePath("/protected/content")
  return transformBlog(data)
}

export async function updateBlog(blog: BlogUpdate): Promise<Blog> {
  // Verify authentication
  const user = await requireAuth()
  
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
    throw new Error(`Failed to update blog: ${error.message}`)
  }

  revalidatePath("/protected/content")
  return transformBlog(data)
}

export async function deleteBlog(id: string): Promise<void> {
  // Verify authentication
  const user = await requireAuth()
  
  const supabase = await createClient()

  const { error } = await supabase
    .from("blogs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(`Failed to delete blog: ${error.message}`)
  }

  revalidatePath("/protected/content")
}

