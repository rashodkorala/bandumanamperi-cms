"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Page, PageDB, PageInsert, PageUpdate } from "@/lib/types/page"

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export async function getPages(status?: string): Promise<Page[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  let query = supabase
    .from("pages")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch pages: ${error.message}`)
  }

  return (data || []).map(transformPage)
}

export async function getPage(id: string): Promise<Page | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch page: ${error.message}`)
  }

  return data ? transformPage(data) : null
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch page: ${error.message}`)
  }

  return data ? transformPage(data) : null
}

export async function getHomepage(): Promise<Page | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_homepage", true)
    .eq("status", "published")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch homepage: ${error.message}`)
  }

  return data ? transformPage(data) : null
}

async function uploadPageFiles(
  supabase: any,
  slug: string,
  content: string,
  contentType: PageContentType,
  pageData: any
): Promise<{ markdownFileUrl: string | null; jsonFileUrl: string | null }> {
  let markdownFileUrl: string | null = null
  let jsonFileUrl: string | null = null

  // Generate markdown file
  const markdownContent = `---
title: ${pageData.title}
slug: ${slug}
contentType: ${contentType}
template: ${pageData.template || "default"}
metaTitle: ${pageData.metaTitle || pageData.title}
metaDescription: ${pageData.metaDescription || ""}
status: ${pageData.status}
publishedAt: ${pageData.publishedAt || ""}
isHomepage: ${pageData.isHomepage || false}
---

${contentType === "markdown" ? content : `# ${pageData.title}\n\n${content}`}
`

  // Upload markdown file
  const mdFilePath = `${slug}.md`
  const { error: mdError } = await supabase.storage
    .from("pages")
    .upload(mdFilePath, new Blob([markdownContent], { type: "text/markdown" }), {
      upsert: true,
      contentType: "text/markdown",
    })

  if (!mdError) {
    const { data: { publicUrl } } = supabase.storage
      .from("pages")
      .getPublicUrl(mdFilePath)
    markdownFileUrl = publicUrl
  }

  // Generate JSON file
  const jsonData = {
    id: pageData.id || "",
    title: pageData.title,
    slug: slug,
    content: content,
    contentType: contentType,
    template: pageData.template || "default",
    metaTitle: pageData.metaTitle || pageData.title,
    metaDescription: pageData.metaDescription || "",
    metaKeywords: pageData.metaKeywords || [],
    featuredImageUrl: pageData.featuredImageUrl || null,
    status: pageData.status,
    publishedAt: pageData.publishedAt || null,
    parentId: pageData.parentId || null,
    sortOrder: pageData.sortOrder || 0,
    isHomepage: pageData.isHomepage || false,
  }

  // Upload JSON file
  const jsonFilePath = `${slug}.json`
  const { error: jsonError } = await supabase.storage
    .from("pages")
    .upload(jsonFilePath, new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" }), {
      upsert: true,
      contentType: "application/json",
    })

  if (!jsonError) {
    const { data: { publicUrl } } = supabase.storage
      .from("pages")
      .getPublicUrl(jsonFilePath)
    jsonFileUrl = publicUrl
  }

  return { markdownFileUrl, jsonFileUrl }
}

export async function createPage(page: PageInsert): Promise<Page> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const slug = page.slug || slugify(page.title)

  // If this is set as homepage, unset other homepages
  if (page.isHomepage) {
    await supabase
      .from("pages")
      .update({ is_homepage: false })
      .eq("user_id", user.id)
      .eq("is_homepage", true)
  }

  // Upload files to storage
  const { markdownFileUrl, jsonFileUrl } = await uploadPageFiles(
    supabase,
    slug,
    page.content,
    page.contentType || "html",
    {
      title: page.title,
      template: page.template,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      metaKeywords: page.metaKeywords,
      featuredImageUrl: page.featuredImageUrl,
      status: page.status || "draft",
      publishedAt: page.publishedAt || (page.status === "published" ? new Date().toISOString() : null),
      parentId: page.parentId,
      sortOrder: page.sortOrder,
      isHomepage: page.isHomepage,
    }
  )

  const { data, error } = await supabase
    .from("pages")
    .insert({
      user_id: user.id,
      title: page.title,
      slug: slug,
      content: page.content,
      content_type: page.contentType || "html",
      template: page.template || null,
      meta_title: page.metaTitle || null,
      meta_description: page.metaDescription || null,
      meta_keywords: page.metaKeywords || [],
      featured_image_url: page.featuredImageUrl || null,
      status: page.status || "draft",
      published_at: page.publishedAt || (page.status === "published" ? new Date().toISOString() : null),
      parent_id: page.parentId || null,
      sort_order: page.sortOrder || 0,
      is_homepage: page.isHomepage || false,
      markdown_file_url: markdownFileUrl,
      json_file_url: jsonFileUrl,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create page: ${error.message}`)
  }

  revalidatePath("/protected/pages")
  return transformPage(data)
}

export async function updatePage(page: PageUpdate): Promise<Page> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Get existing page data to merge with updates
  const { data: existingPage } = await supabase
    .from("pages")
    .select("*")
    .eq("id", page.id)
    .eq("user_id", user.id)
    .single()

  if (!existingPage) {
    throw new Error("Page not found")
  }

  // If this is set as homepage, unset other homepages
  if (page.isHomepage) {
    await supabase
      .from("pages")
      .update({ is_homepage: false })
      .eq("user_id", user.id)
      .eq("is_homepage", true)
      .neq("id", page.id)
  }

  const updateData: Partial<{
    title: string
    slug: string
    content: string
    content_type: string
    template: string | null
    meta_title: string | null
    meta_description: string | null
    meta_keywords: string[] | null
    featured_image_url: string | null
    status: string
    published_at: string | null
    parent_id: string | null
    sort_order: number
    is_homepage: boolean
    markdown_file_url: string | null
    json_file_url: string | null
  }> = {}
  if (page.title !== undefined) updateData.title = page.title
  if (page.slug !== undefined) updateData.slug = page.slug
  if (page.content !== undefined) updateData.content = page.content
  if (page.contentType !== undefined) updateData.content_type = page.contentType
  if (page.template !== undefined) updateData.template = page.template
  if (page.metaTitle !== undefined) updateData.meta_title = page.metaTitle
  if (page.metaDescription !== undefined) updateData.meta_description = page.metaDescription
  if (page.metaKeywords !== undefined) updateData.meta_keywords = page.metaKeywords
  if (page.featuredImageUrl !== undefined) updateData.featured_image_url = page.featuredImageUrl
  if (page.status !== undefined) {
    updateData.status = page.status
    if (page.status === "published" && !page.publishedAt) {
      updateData.published_at = new Date().toISOString()
    }
  }
  if (page.publishedAt !== undefined) updateData.published_at = page.publishedAt
  if (page.parentId !== undefined) updateData.parent_id = page.parentId
  if (page.sortOrder !== undefined) updateData.sort_order = page.sortOrder
  if (page.isHomepage !== undefined) updateData.is_homepage = page.isHomepage

  // Merge existing data with updates for file generation
  const mergedData = {
    id: page.id,
    title: page.title ?? existingPage.title,
    slug: page.slug ?? existingPage.slug,
    content: page.content ?? existingPage.content,
    contentType: page.contentType ?? existingPage.content_type,
    template: page.template ?? existingPage.template,
    metaTitle: page.metaTitle ?? existingPage.meta_title,
    metaDescription: page.metaDescription ?? existingPage.meta_description,
    metaKeywords: page.metaKeywords ?? existingPage.meta_keywords,
    featuredImageUrl: page.featuredImageUrl ?? existingPage.featured_image_url,
    status: page.status ?? existingPage.status,
    publishedAt: updateData.published_at ?? existingPage.published_at,
    parentId: page.parentId ?? existingPage.parent_id,
    sortOrder: page.sortOrder ?? existingPage.sort_order,
    isHomepage: page.isHomepage ?? existingPage.is_homepage,
  }

  // Upload updated files to storage
  const { markdownFileUrl, jsonFileUrl } = await uploadPageFiles(
    supabase,
    mergedData.slug,
    mergedData.content,
    mergedData.contentType as PageContentType,
    mergedData
  )

  updateData.markdown_file_url = markdownFileUrl
  updateData.json_file_url = jsonFileUrl

  const { data, error } = await supabase
    .from("pages")
    .update(updateData)
    .eq("id", page.id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update page: ${error.message}`)
  }

  revalidatePath("/protected/pages")
  return transformPage(data)
}

export async function deletePage(id: string): Promise<void> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(`Failed to delete page: ${error.message}`)
  }

  revalidatePath("/protected/pages")
}

