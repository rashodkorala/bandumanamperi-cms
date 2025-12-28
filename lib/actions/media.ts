"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/verify-auth"
import { parseSupabaseError, AppError, ErrorType, ErrorMessages, logError } from "@/lib/utils/error-handler"
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
  try {
    // Verify authentication
    const user = await requireAuth()
    
    // Validate required fields
    if (!media.title || !media.title.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Media title is required.",
        "Missing required field: title"
      )
    }

    if (!media.fileUrl || !media.fileUrl.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "File URL is required.",
        "Missing required field: fileUrl"
      )
    }

    if (!media.fileType || !media.fileType.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "File type is required.",
        "Missing required field: fileType"
      )
    }

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
      const appError = parseSupabaseError(error, "create", "Media")
      logError(appError, { operation: "createMedia", additionalInfo: { media } })
      throw appError
    }

    revalidatePath("/protected/media")
    return transformMedia(data)
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "createMedia", additionalInfo: { media } })
    throw new AppError(
      ErrorType.CREATE_FAILED,
      ErrorMessages.MEDIA_CREATE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

export async function updateMedia(media: MediaUpdate): Promise<MediaItem> {
  try {
    // Verify authentication
    const user = await requireAuth()
    
    // Validate media ID
    if (!media.id) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Media ID is required for update.",
        "Missing required field: id"
      )
    }

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
      // Check if media was not found
      if (error.code === "PGRST116") {
        throw new AppError(
          ErrorType.NOT_FOUND,
          ErrorMessages.MEDIA_NOT_FOUND,
          error.message
        )
      }

      const appError = parseSupabaseError(error, "update", "Media")
      logError(appError, { operation: "updateMedia", additionalInfo: { mediaId: media.id, updates: media } })
      throw appError
    }

    revalidatePath("/protected/media")
    return transformMedia(data)
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "updateMedia", additionalInfo: { media } })
    throw new AppError(
      ErrorType.UPDATE_FAILED,
      ErrorMessages.MEDIA_UPDATE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

export async function deleteMedia(id: string): Promise<void> {
  try {
    // Verify authentication
    const user = await requireAuth()
    
    // Validate media ID
    if (!id || !id.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Media ID is required for deletion.",
        "Missing required field: id"
      )
    }

    const supabase = await createClient()

    // Check if media exists and get its file URL for cleanup
    const { data: existingMedia, error: fetchError } = await supabase
      .from("media")
      .select("id, title, file_url")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingMedia) {
      throw new AppError(
        ErrorType.NOT_FOUND,
        ErrorMessages.MEDIA_NOT_FOUND,
        fetchError?.message || "Media not found"
      )
    }

    const { error } = await supabase
      .from("media")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      // Check for foreign key constraint violations
      if (error.code === "23503") {
        throw new AppError(
          ErrorType.CONSTRAINT_VIOLATION,
          ErrorMessages.MEDIA_DELETE_FAILED + " It may be used by other content.",
          error.message
        )
      }

      const appError = parseSupabaseError(error, "delete", "Media")
      logError(appError, { operation: "deleteMedia", additionalInfo: { mediaId: id } })
      throw appError
    }

    // TODO: Optionally delete the file from storage
    // This requires extracting the path from file_url and calling storage.remove()

    revalidatePath("/protected/media")
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "deleteMedia", additionalInfo: { mediaId: id } })
    throw new AppError(
      ErrorType.DELETE_FAILED,
      ErrorMessages.MEDIA_DELETE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

