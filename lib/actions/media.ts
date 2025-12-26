"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/verify-auth"
import type { MediaItem, MediaDB, MediaInsert, MediaUpdate } from "@/lib/types/media"

function transformMedia(media: MediaDB): MediaItem {
  return {
    id: media.id,
    userId: media.user_id,
    title: media.title,
    description: media.description,
    fileUrl: media.file_url,
    fileType: media.file_type,
    fileSize: media.file_size,
    mimeType: media.mime_type,
    altText: media.alt_text,
    tags: media.tags || [],
    folder: media.folder,
    featured: media.featured,
    createdAt: media.created_at,
    updatedAt: media.updated_at,
  }
}

export async function getMedia(folder?: string): Promise<MediaItem[]> {
  // Verify authentication
  const user = await requireAuth()
  
  const supabase = await createClient()

  let query = supabase
    .from("media")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (folder) {
    query = query.eq("folder", folder)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch media: ${error.message}`)
  }

  return (data || []).map(transformMedia)
}

export async function getMediaByType(fileType: string): Promise<MediaItem[]> {
  // Verify authentication
  const user = await requireAuth()
  
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("user_id", user.id)
    .eq("file_type", fileType)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch media: ${error.message}`)
  }

  return (data || []).map(transformMedia)
}

export async function getMediaItem(id: string): Promise<MediaItem | null> {
  // Verify authentication
  const user = await requireAuth()
  
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch media: ${error.message}`)
  }

  return data ? transformMedia(data) : null
}

export async function createMedia(media: MediaInsert): Promise<MediaItem> {
  // Verify authentication
  const user = await requireAuth()
  
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("media")
    .insert({
      user_id: user.id,
      title: media.title,
      description: media.description || null,
      file_url: media.fileUrl,
      file_type: media.fileType,
      file_size: media.fileSize || null,
      mime_type: media.mimeType || null,
      alt_text: media.altText || null,
      tags: media.tags || [],
      folder: media.folder || null,
      featured: media.featured || false,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create media: ${error.message}`)
  }

  revalidatePath("/protected/media")
  return transformMedia(data)
}

export async function updateMedia(media: MediaUpdate): Promise<MediaItem> {
  // Verify authentication
  const user = await requireAuth()
  
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("media")
    .update({
      title: media.title,
      description: media.description,
      file_url: media.fileUrl,
      file_type: media.fileType,
      file_size: media.fileSize,
      mime_type: media.mimeType,
      alt_text: media.altText,
      tags: media.tags,
      folder: media.folder,
      featured: media.featured,
    })
    .eq("id", media.id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update media: ${error.message}`)
  }

  revalidatePath("/protected/media")
  return transformMedia(data)
}

export async function deleteMedia(id: string): Promise<void> {
  // Verify authentication
  const user = await requireAuth()
  
  const supabase = await createClient()

  const { error } = await supabase
    .from("media")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(`Failed to delete media: ${error.message}`)
  }

  revalidatePath("/protected/media")
}

