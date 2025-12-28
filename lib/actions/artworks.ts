"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/verify-auth"
import { parseSupabaseError, AppError, ErrorType, ErrorMessages, logError } from "@/lib/utils/error-handler"
import type {
  Artwork,
  ArtworkDB,
  ArtworkInsert,
  ArtworkUpdate,
  ArtworkStatus,
  ArtworkAvailability,
} from "@/lib/types/artwork"

function transformArtwork(artwork: ArtworkDB): Artwork {
  return {
    id: artwork.id,
    title: artwork.title,
    year: artwork.year,
    description: artwork.description,
    link: artwork.link,
    featured: artwork.featured,
    category: artwork.category,
    medium: artwork.medium,
    width: artwork.width,
    height: artwork.height,
    depth: artwork.depth,
    unit: artwork.unit,
    slug: artwork.slug,
    status: artwork.status,
    tags: artwork.tags,
    series: artwork.series,
    materials: artwork.materials,
    technique: artwork.technique,
    location: artwork.location,
    availability: artwork.availability,
    price: artwork.price,
    currency: artwork.currency,
    priceUponRequest: artwork.price_upon_request,
    collectorName: artwork.collector_name,
    sortOrder: artwork.sort_order,
    thumbnailPath: artwork.thumbnail_path,
    artistNotes: artwork.artist_notes,
    dateCreated: artwork.date_created,
    exhibitionHistory: artwork.exhibition_history,
    viewsCount: artwork.views_count,
    media: artwork.media,
    createdAt: artwork.created_at,
    updatedAt: artwork.updated_at,
  }
}

interface GetArtworksOptions {
  status?: ArtworkStatus
  category?: string
  featured?: boolean
  availability?: ArtworkAvailability
  series?: string
  limit?: number
  includeDrafts?: boolean
}

export async function getArtworks(
  options: GetArtworksOptions = {}
): Promise<Artwork[]> {
  try {
    const supabase = await createClient()

    let query = supabase.from("artworks").select("*")

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

    if (options.availability) {
      query = query.eq("availability", options.availability)
    }

    if (options.series) {
      query = query.eq("series", options.series)
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
      const appError = parseSupabaseError(error, "fetch", "Artworks")
      logError(appError, { operation: "getArtworks", options })
      throw appError
    }

    return (data || []).map(transformArtwork)
  } catch (error) {
    if (error instanceof AppError) throw error
    
    logError(error, { operation: "getArtworks", options })
    throw new AppError(
      ErrorType.DATABASE_ERROR,
      ErrorMessages.FETCH_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

export async function getArtwork(id: string): Promise<Artwork | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("artworks")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      const appError = parseSupabaseError(error, "fetch", "Artwork")
      logError(appError, { operation: "getArtwork", artworkId: id })
      throw appError
    }

    return data ? transformArtwork(data) : null
  } catch (error) {
    if (error instanceof AppError) throw error
    
    logError(error, { operation: "getArtwork", artworkId: id })
    throw new AppError(
      ErrorType.DATABASE_ERROR,
      ErrorMessages.ARTWORK_NOT_FOUND,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

/**
 * Get a published artwork by slug (for public access)
 */
export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch artwork: ${error.message}`)
  }

  return data ? transformArtwork(data) : null
}

export async function createArtwork(artwork: ArtworkInsert): Promise<Artwork> {
  try {
    // Verify authentication
    await requireAuth()
    
    // Validate required fields
    if (!artwork.title || !artwork.title.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Artwork title is required.",
        "Missing required field: title"
      )
    }

    // Validate slug if provided
    if (artwork.slug) {
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      if (!slugPattern.test(artwork.slug)) {
        throw new AppError(
          ErrorType.INVALID_FORMAT,
          "Slug must contain only lowercase letters, numbers, and hyphens.",
          `Invalid slug format: ${artwork.slug}`
        )
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("artworks")
      .insert({
        title: artwork.title || null,
        year: artwork.year || null,
        description: artwork.description || null,
        link: artwork.link || null,
        featured: artwork.featured || false,
        category: artwork.category || null,
        medium: artwork.medium || null,
        width: artwork.width || null,
        height: artwork.height || null,
        depth: artwork.depth || null,
        unit: artwork.unit || "cm",
        slug: artwork.slug || null,
        status: artwork.status || "draft",
        tags: artwork.tags || [],
        series: artwork.series || null,
        materials: artwork.materials || null,
        technique: artwork.technique || null,
        location: artwork.location || null,
        availability: artwork.availability || "available",
        price: artwork.price || null,
        currency: artwork.currency || "USD",
        price_upon_request: artwork.priceUponRequest || false,
        collector_name: artwork.collectorName || null,
        sort_order: artwork.sortOrder || 0,
        thumbnail_path: artwork.thumbnailPath || null,
        artist_notes: artwork.artistNotes || null,
        date_created: artwork.dateCreated || null,
        exhibition_history: artwork.exhibitionHistory || [],
        media: artwork.media || [],
      })
      .select()
      .single()

    if (error) {
      // Check for duplicate slug error
      if (error.code === "23505" && error.message?.includes("slug")) {
        throw new AppError(
          ErrorType.DUPLICATE_ENTRY,
          ErrorMessages.ARTWORK_DUPLICATE_SLUG,
          error.message
        )
      }

      const appError = parseSupabaseError(error, "create", "Artwork")
      logError(appError, { operation: "createArtwork", artwork })
      throw appError
    }

    revalidatePath("/protected/artworks")
    revalidatePath("/api/artworks")
    return transformArtwork(data)
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "createArtwork", artwork })
    throw new AppError(
      ErrorType.CREATE_FAILED,
      ErrorMessages.ARTWORK_CREATE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

export async function updateArtwork(
  artwork: ArtworkUpdate
): Promise<Artwork> {
  try {
    // Verify authentication
    await requireAuth()
    
    // Validate artwork ID
    if (!artwork.id) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Artwork ID is required for update.",
        "Missing required field: id"
      )
    }

    // Validate slug if provided
    if (artwork.slug) {
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      if (!slugPattern.test(artwork.slug)) {
        throw new AppError(
          ErrorType.INVALID_FORMAT,
          "Slug must contain only lowercase letters, numbers, and hyphens.",
          `Invalid slug format: ${artwork.slug}`
        )
      }
    }

    const supabase = await createClient()

    const { id, ...updates } = artwork

    const updateData: Partial<ArtworkDB> = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.year !== undefined) updateData.year = updates.year
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.link !== undefined) updateData.link = updates.link
    if (updates.featured !== undefined) updateData.featured = updates.featured
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.medium !== undefined) updateData.medium = updates.medium
    if (updates.width !== undefined) updateData.width = updates.width
    if (updates.height !== undefined) updateData.height = updates.height
    if (updates.depth !== undefined) updateData.depth = updates.depth
    if (updates.unit !== undefined) updateData.unit = updates.unit
    if (updates.slug !== undefined) updateData.slug = updates.slug
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.tags !== undefined) updateData.tags = updates.tags || []
    if (updates.series !== undefined) updateData.series = updates.series
    if (updates.materials !== undefined) updateData.materials = updates.materials
    if (updates.technique !== undefined) updateData.technique = updates.technique
    if (updates.location !== undefined) updateData.location = updates.location
    if (updates.availability !== undefined) updateData.availability = updates.availability
    if (updates.price !== undefined) updateData.price = updates.price
    if (updates.currency !== undefined) updateData.currency = updates.currency
    if (updates.priceUponRequest !== undefined) updateData.price_upon_request = updates.priceUponRequest
    if (updates.collectorName !== undefined) updateData.collector_name = updates.collectorName
    if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder
    if (updates.thumbnailPath !== undefined) updateData.thumbnail_path = updates.thumbnailPath
    if (updates.artistNotes !== undefined) updateData.artist_notes = updates.artistNotes
    if (updates.dateCreated !== undefined) updateData.date_created = updates.dateCreated
    if (updates.exhibitionHistory !== undefined) updateData.exhibition_history = updates.exhibitionHistory
    if (updates.media !== undefined) updateData.media = updates.media || []

    const { data, error } = await supabase
      .from("artworks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      // Check for duplicate slug error
      if (error.code === "23505" && error.message?.includes("slug")) {
        throw new AppError(
          ErrorType.DUPLICATE_ENTRY,
          ErrorMessages.ARTWORK_DUPLICATE_SLUG,
          error.message
        )
      }

      // Check if artwork was not found
      if (error.code === "PGRST116") {
        throw new AppError(
          ErrorType.NOT_FOUND,
          ErrorMessages.ARTWORK_NOT_FOUND,
          error.message
        )
      }

      const appError = parseSupabaseError(error, "update", "Artwork")
      logError(appError, { operation: "updateArtwork", artworkId: id, updates })
      throw appError
    }

    revalidatePath("/protected/artworks")
    revalidatePath("/api/artworks")
    return transformArtwork(data)
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "updateArtwork", artwork })
    throw new AppError(
      ErrorType.UPDATE_FAILED,
      ErrorMessages.ARTWORK_UPDATE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

export async function deleteArtwork(id: string): Promise<void> {
  try {
    // Verify authentication
    await requireAuth()
    
    // Validate artwork ID
    if (!id || !id.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Artwork ID is required for deletion.",
        "Missing required field: id"
      )
    }

    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new AppError(
        ErrorType.UNAUTHORIZED,
        ErrorMessages.UNAUTHORIZED,
        authError?.message || "User not authenticated"
      )
    }

    // Check if artwork exists before attempting to delete
    const { data: existingArtwork, error: checkError } = await supabase
      .from("artworks")
      .select("id, title")
      .eq("id", id)
      .single()

    if (checkError || !existingArtwork) {
      throw new AppError(
        ErrorType.NOT_FOUND,
        ErrorMessages.ARTWORK_NOT_FOUND,
        checkError?.message || "Artwork not found"
      )
    }

    const { error } = await supabase
      .from("artworks")
      .delete()
      .eq("id", id)

    if (error) {
      // Check for foreign key constraint violations
      if (error.code === "23503") {
        throw new AppError(
          ErrorType.CONSTRAINT_VIOLATION,
          "Cannot delete artwork because it is referenced by other data. Please remove references first.",
          error.message
        )
      }

      const appError = parseSupabaseError(error, "delete", "Artwork")
      logError(appError, { operation: "deleteArtwork", artworkId: id })
      throw appError
    }

    revalidatePath("/protected/artworks")
    revalidatePath("/api/artworks")
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "deleteArtwork", artworkId: id })
    throw new AppError(
      ErrorType.DELETE_FAILED,
      ErrorMessages.ARTWORK_DELETE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

/**
 * Duplicate an artwork (creates a copy with "-copy" appended to slug)
 */
export async function duplicateArtwork(id: string): Promise<Artwork> {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Unauthorized: You must be logged in to duplicate artworks")
  }

  // Get the original artwork
  const original = await getArtwork(id)
  if (!original) {
    throw new Error("Artwork not found")
  }

  // Create a new artwork with copied data
  const newArtwork: ArtworkInsert = {
    title: original.title ? `${original.title} (Copy)` : null,
    year: original.year,
    description: original.description,
    link: original.link,
    featured: false, // Don't duplicate featured status
    category: original.category,
    medium: original.medium,
    width: original.width,
    height: original.height,
    depth: original.depth,
    unit: original.unit,
    slug: original.slug ? `${original.slug}-copy` : null,
    status: "draft", // Always duplicate as draft
    tags: original.tags,
    series: original.series,
    materials: original.materials,
    technique: original.technique,
    location: original.location,
    availability: original.availability,
    price: original.price,
    currency: original.currency,
    sortOrder: original.sortOrder,
    thumbnailPath: original.thumbnailPath,
    artistNotes: original.artistNotes,
    dateCreated: original.dateCreated,
    exhibitionHistory: original.exhibitionHistory,
    media: original.media,
  }

  return createArtwork(newArtwork)
}

/**
 * Increment views count for an artwork (works for public access)
 */
export async function incrementArtworkViews(id: string): Promise<void> {
  const supabase = await createClient()

  // Use RPC function if available, otherwise increment directly
  // This works for both authenticated and public access
  const { error: rpcError } = await supabase.rpc("increment_artwork_views", {
    artwork_id: id,
  })

  if (rpcError) {
    // Fallback: Get current views and increment (requires read access)
    const { data: artwork, error: fetchError } = await supabase
      .from("artworks")
      .select("views_count")
      .eq("id", id)
      .single()

    if (fetchError || !artwork) {
      // Silently fail - views tracking is not critical
      console.error("Failed to increment views:", fetchError)
      return
    }

    // Update views count (this requires update permission)
    const { error: updateError } = await supabase
      .from("artworks")
      .update({ views_count: (artwork.views_count || 0) + 1 })
      .eq("id", id)

    if (updateError) {
      // Silently fail - views tracking is not critical
      console.error("Failed to increment views:", updateError)
      return
    }
  }

  revalidatePath("/protected/artworks")
  revalidatePath("/api/artworks")
  revalidatePath(`/artworks/${id}`)
}

/**
 * Get all unique series/collection names from artworks
 */
export async function getArtworkSeries(): Promise<string[]> {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Unauthorized: You must be logged in to view series")
  }

  const { data, error } = await supabase
    .from("artworks")
    .select("series")
    .not("series", "is", null)

  if (error) {
    throw new Error(`Failed to fetch series: ${error.message}`)
  }

  // Get unique series names
  const seriesSet = new Set<string>()
  data?.forEach((item) => {
    if (item.series) {
      seriesSet.add(item.series)
    }
  })

  return Array.from(seriesSet).sort()
}

/**
 * Get artworks grouped by collection/series
 */
export async function getArtworksByCollection(): Promise<Record<string, Artwork[]>> {
  const supabase = await createClient()

  // Verify user is authenticated (collections view is protected)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Unauthorized: You must be logged in to view collections")
  }

  // Get all artworks with series
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .not("series", "is", null)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch artworks by collection: ${error.message}`)
  }

  // Group artworks by series
  const grouped: Record<string, Artwork[]> = {}
  data?.forEach((item) => {
    const artwork = transformArtwork(item)
    const series = artwork.series
    if (series) {
      if (!grouped[series]) {
        grouped[series] = []
      }
      grouped[series].push(artwork)
    }
  })

  return grouped
}

/**
 * Update multiple artworks to assign them to a collection/series
 */
export async function updateArtworksCollection(
  artworkIds: string[],
  collectionName: string
): Promise<void> {
  try {
    await requireAuth()
    
    const supabase = await createClient()

    // Validate input
    if (!artworkIds || artworkIds.length === 0) {
      throw new AppError(
        ErrorType.VALIDATION_ERROR,
        ErrorMessages.COLLECTION_NO_ARTWORKS,
        "No artworks selected for collection"
      )
    }

    if (!collectionName || !collectionName.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        ErrorMessages.COLLECTION_NAME_REQUIRED,
        "Missing required field: collectionName"
      )
    }

    // Update all selected artworks with the new series name
    const { error } = await supabase
      .from("artworks")
      .update({ series: collectionName.trim() })
      .in("id", artworkIds)

    if (error) {
      const appError = parseSupabaseError(error, "update", "Collection")
      logError(appError, { operation: "updateArtworksCollection", artworkIds, collectionName })
      throw appError
    }

    revalidatePath("/protected/artworks")
    revalidatePath("/protected/collections")
    revalidatePath("/api/artworks")
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "updateArtworksCollection", artworkIds, collectionName })
    throw new AppError(
      ErrorType.UPDATE_FAILED,
      ErrorMessages.COLLECTION_UPDATE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

/**
 * Rename a collection (updates series field for all artworks in the collection)
 */
export async function renameCollection(
  oldName: string,
  newName: string
): Promise<void> {
  try {
    await requireAuth()
    
    const supabase = await createClient()

    // Validate input
    if (!oldName || !oldName.trim() || !newName || !newName.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        "Both old and new collection names are required.",
        "Missing collection names"
      )
    }

    if (oldName.trim() === newName.trim()) {
      throw new AppError(
        ErrorType.VALIDATION_ERROR,
        "New collection name must be different from the old name.",
        "Same collection names provided"
      )
    }

    // Check if old collection exists
    const { data: existingArtworks, error: checkError } = await supabase
      .from("artworks")
      .select("id")
      .eq("series", oldName.trim())
      .limit(1)

    if (checkError) {
      const appError = parseSupabaseError(checkError, "fetch", "Collection")
      logError(appError, { operation: "renameCollection", oldName, newName })
      throw appError
    }

    if (!existingArtworks || existingArtworks.length === 0) {
      throw new AppError(
        ErrorType.NOT_FOUND,
        `Collection "${oldName}" not found.`,
        "Collection does not exist"
      )
    }

    // Update all artworks with the old series name to the new series name
    const { error } = await supabase
      .from("artworks")
      .update({ series: newName.trim() })
      .eq("series", oldName.trim())

    if (error) {
      const appError = parseSupabaseError(error, "update", "Collection")
      logError(appError, { operation: "renameCollection", oldName, newName })
      throw appError
    }

    revalidatePath("/protected/artworks")
    revalidatePath("/protected/collections")
    revalidatePath("/api/artworks")
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "renameCollection", oldName, newName })
    throw new AppError(
      ErrorType.UPDATE_FAILED,
      ErrorMessages.COLLECTION_UPDATE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

/**
 * Delete a collection (removes series field from all artworks in the collection)
 */
export async function deleteCollection(collectionName: string): Promise<void> {
  try {
    await requireAuth()
    
    const supabase = await createClient()

    // Validate input
    if (!collectionName || !collectionName.trim()) {
      throw new AppError(
        ErrorType.REQUIRED_FIELD,
        ErrorMessages.COLLECTION_NAME_REQUIRED,
        "Missing collection name"
      )
    }

    // Check if collection exists
    const { data: existingArtworks, error: checkError } = await supabase
      .from("artworks")
      .select("id")
      .eq("series", collectionName.trim())
      .limit(1)

    if (checkError) {
      const appError = parseSupabaseError(checkError, "fetch", "Collection")
      logError(appError, { operation: "deleteCollection", collectionName })
      throw appError
    }

    if (!existingArtworks || existingArtworks.length === 0) {
      throw new AppError(
        ErrorType.NOT_FOUND,
        `Collection "${collectionName}" not found.`,
        "Collection does not exist"
      )
    }

    // Remove series from all artworks in this collection
    const { error } = await supabase
      .from("artworks")
      .update({ series: null })
      .eq("series", collectionName.trim())

    if (error) {
      const appError = parseSupabaseError(error, "delete", "Collection")
      logError(appError, { operation: "deleteCollection", collectionName })
      throw appError
    }

    revalidatePath("/protected/artworks")
    revalidatePath("/protected/collections")
    revalidatePath("/api/artworks")
  } catch (error) {
    if (error instanceof AppError) throw error

    logError(error, { operation: "deleteCollection", collectionName })
    throw new AppError(
      ErrorType.DELETE_FAILED,
      ErrorMessages.COLLECTION_DELETE_FAILED,
      error instanceof Error ? error.message : "Unknown error"
    )
  }
}

/**
 * Remove artworks from a collection
 */
export async function removeArtworksFromCollection(
  artworkIds: string[]
): Promise<void> {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Unauthorized: You must be logged in to update collections")
  }

  if (artworkIds.length === 0) {
    throw new Error("No artworks selected")
  }

  // Remove series from selected artworks
  const { error } = await supabase
    .from("artworks")
    .update({ series: null })
    .in("id", artworkIds)

  if (error) {
    throw new Error(`Failed to remove artworks from collection: ${error.message}`)
  }

  revalidatePath("/protected/artworks")
  revalidatePath("/protected/collections")
  revalidatePath("/api/artworks")
}

