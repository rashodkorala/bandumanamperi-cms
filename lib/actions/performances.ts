"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth/verify-auth"
import { parseSupabaseError, parseStorageError, AppError, ErrorType, ErrorMessages, logError } from "@/lib/utils/error-handler"
import type {
  Performance,
  PerformanceDB,
  PerformanceInsert,
  PerformanceUpdate,
  performanceDBToApp,
  performanceAppToDB,
} from "@/lib/types/performance"

// Import the helper functions
import { performanceDBToApp as dbToApp, performanceAppToDB as appToDB } from "@/lib/types/performance"

// Get all performances
export async function getPerformances(): Promise<Performance[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("performances")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching performances:", error)
    throw new Error("Failed to fetch performances")
  }

  return (data as PerformanceDB[]).map(dbToApp)
}

// Get a single performance by ID
export async function getPerformance(id: string): Promise<Performance> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("performances")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching performance:", error)
    throw new Error("Failed to fetch performance")
  }

  return dbToApp(data as PerformanceDB)
}

// Get a single performance by slug
export async function getPerformanceBySlug(slug: string): Promise<Performance> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("performances")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    console.error("Error fetching performance:", error)
    throw new Error("Failed to fetch performance")
  }

  return dbToApp(data as PerformanceDB)
}

// Get featured performances
export async function getFeaturedPerformances(): Promise<Performance[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("performances")
    .select("*")
    .eq("featured", true)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching featured performances:", error)
    throw new Error("Failed to fetch featured performances")
  }

  return (data as PerformanceDB[]).map(dbToApp)
}

// Get published performances (for public display)
export async function getPublishedPerformances(): Promise<Performance[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("performances")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching published performances:", error)
    throw new Error("Failed to fetch published performances")
  }

  return (data as PerformanceDB[]).map(dbToApp)
}

// Create a new performance
export async function createPerformance(
  performance: PerformanceInsert
): Promise<Performance> {
  try {
    // Verify authentication
    await requireAuth()
    
    // Validate required fields
    if (!performance.title || !performance.title.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Performance title is required.",
        "Missing required field: title"
      )
    }

    const supabase = await createClient()

    const dbData = appToDB(performance)

    const { data, error } = await supabase
      .from("performances")
      .insert(dbData)
      .select()
      .single()

    if (error) {
      const appError = parseSupabaseError(error, "create", "Performance")
      logError(appError, { operation: "createPerformance", additionalInfo: { performance } })
      throw appError
    }

    revalidatePath("/protected/performances")
    revalidatePath("/performances")

    return dbToApp(data as PerformanceDB)
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "createPerformance", additionalInfo: { performance } })
    throw new AppError(
      ErrorType.CREATE_FAILED,
      ErrorMessages.PERFORMANCE_CREATE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

// Update a performance
export async function updatePerformance(
  performance: PerformanceUpdate
): Promise<Performance> {
  try {
    // Verify authentication
    await requireAuth()
    
    // Validate performance ID
    if (!performance.id) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Performance ID is required for update.",
        "Missing required field: id"
      )
    }

    const supabase = await createClient()

    const { id, ...updates } = performance
    const dbData = appToDB(updates as PerformanceInsert)

    const { data, error } = await supabase
      .from("performances")
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      // Check if performance was not found
      if (error.code === "PGRST116") {
        throw new AppError(
          ErrorType.NOT_FOUND,
          ErrorMessages.PERFORMANCE_NOT_FOUND,
          error.message
        )
      }

      const appError = parseSupabaseError(error, "update", "Performance")
      logError(appError, { operation: "updatePerformance", additionalInfo: { performanceId: id, updates } })
      throw appError
    }

    revalidatePath("/protected/performances")
    revalidatePath("/performances")
    if (data.slug) {
      revalidatePath(`/performances/${data.slug}`)
    }

    return dbToApp(data as PerformanceDB)
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "updatePerformance", additionalInfo: { performance } })
    throw new AppError(
      ErrorType.UPDATE_FAILED,
      ErrorMessages.PERFORMANCE_UPDATE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

// Delete a performance
export async function deletePerformance(id: string): Promise<void> {
  try {
    // Verify authentication
    await requireAuth()
    
    // Validate performance ID
    if (!id || !id.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Performance ID is required for deletion.",
        "Missing required field: id"
      )
    }

    const supabase = await createClient()

    // Get the performance first to access media files
    const { data: performance, error: fetchError } = await supabase
      .from("performances")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !performance) {
      throw new AppError(
        ErrorType.NOT_FOUND,
        ErrorMessages.PERFORMANCE_NOT_FOUND,
        fetchError?.message || "Performance not found"
      )
    }

    // Delete associated media files from storage
    if (performance) {
      const filesToDelete: string[] = []

      // Add cover image
      if (performance.cover_image) {
        filesToDelete.push(performance.cover_image)
      }

      // Add media files
      if (performance.media && Array.isArray(performance.media)) {
        filesToDelete.push(...performance.media)
      }

      // Delete files from storage
      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("performances")
          .remove(filesToDelete)

        if (storageError) {
          // Log but don't fail - storage cleanup is not critical
          const storageAppError = parseStorageError(storageError)
          logError(storageAppError, { 
            operation: "deletePerformance:storageCleanup", 
            additionalInfo: { files: filesToDelete }
          })
        }
      }
    }

    // Delete the performance from database
    const { error } = await supabase.from("performances").delete().eq("id", id)

    if (error) {
      // Check for foreign key constraint violations
      if (error.code === "23503") {
        throw new AppError(
          ErrorType.CONSTRAINT_VIOLATION,
          "Cannot delete performance because it is referenced by other data.",
          error.message
        )
      }

      const appError = parseSupabaseError(error, "delete", "Performance")
      logError(appError, { operation: "deletePerformance", additionalInfo: { performanceId: id } })
      throw appError
    }

    revalidatePath("/protected/performances")
    revalidatePath("/performances")
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "deletePerformance", additionalInfo: { performanceId: id } })
    throw new AppError(
      ErrorType.DELETE_FAILED,
      ErrorMessages.PERFORMANCE_DELETE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

// Delete a media file from a performance
export async function deletePerformanceMedia(
  performanceId: string,
  filePath: string
): Promise<Performance> {
  try {
    await requireAuth()

    if (!performanceId || !filePath) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Performance ID and file path are required.",
        "Missing required fields"
      )
    }

    const supabase = await createClient()

    // Get the current performance
    const performance = await getPerformance(performanceId)

    // Remove the file path from media array
    const updatedMedia = (performance.media || []).filter(
      (path) => path !== filePath
    )

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("performances")
      .remove([filePath])

    if (storageError) {
      const appError = parseStorageError(storageError, filePath)
      logError(appError, { operation: "deletePerformanceMedia", additionalInfo: { performanceId, filePath } })
      throw appError
    }

    // Update the performance
    return updatePerformance({
      id: performanceId,
      media: updatedMedia,
    })
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "deletePerformanceMedia", additionalInfo: { performanceId, filePath } })
    throw new AppError(
      ErrorType.DELETE_FAILED,
      ErrorMessages.PERFORMANCE_MEDIA_DELETE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

// Delete cover image from a performance
export async function deletePerformanceCoverImage(
  performanceId: string,
  filePath: string
): Promise<Performance> {
  const supabase = await createClient()

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("performances")
    .remove([filePath])

  if (storageError) {
    console.error("Error deleting cover image from storage:", storageError)
    throw new Error("Failed to delete cover image from storage")
  }

  // Update the performance
  return updatePerformance({
    id: performanceId,
    coverImage: null,
  })
}

// Increment performance views
export async function incrementPerformanceViews(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.rpc("increment_performance_views", {
    performance_id: id,
  })

  if (error) {
    console.error("Error incrementing performance views:", error)
    // Don't throw error, this is not critical
  }
}

// Get performances by category
export async function getPerformancesByCategory(
  category: string
): Promise<Performance[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("performances")
    .select("*")
    .eq("category", category)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching performances by category:", error)
    throw new Error("Failed to fetch performances by category")
  }

  return (data as PerformanceDB[]).map(dbToApp)
}

// Get performances by type
export async function getPerformancesByType(
  type: string
): Promise<Performance[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("performances")
    .select("*")
    .eq("type", type)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching performances by type:", error)
    throw new Error("Failed to fetch performances by type")
  }

  return (data as PerformanceDB[]).map(dbToApp)
}

// Search performances
export async function searchPerformances(query: string): Promise<Performance[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("performances")
    .select("*")
    .or(
      `title.ilike.%${query}%,description.ilike.%${query}%,venue.ilike.%${query}%,location.ilike.%${query}%`
    )
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("date", { ascending: false })

  if (error) {
    console.error("Error searching performances:", error)
    throw new Error("Failed to search performances")
  }

  return (data as PerformanceDB[]).map(dbToApp)
}

