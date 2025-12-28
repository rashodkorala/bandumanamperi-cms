"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/verify-auth"
import { parseSupabaseError, AppError, ErrorType, ErrorMessages, logError } from "@/lib/utils/error-handler"
import type { Artwork, ArtworkDB, ExhibitionHistory } from "@/lib/types/artwork"

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

export interface Exhibition {
    name: string
    venue: string
    about: string
    curator: string
    dates: string
    coverImage: string | null
    exhibitionImages: string[]
    type: string
    otherArtists: string | null
    artworks: Artwork[]
}

/**
 * Get all exhibitions from artworks' exhibition_history
 */
export async function getExhibitions(): Promise<Exhibition[]> {
    try {
        await requireAuth()

        const supabase = await createClient()

        // Get all artworks with exhibition history
        const { data, error } = await supabase
            .from("artworks")
            .select("*")
            .not("exhibition_history", "is", null)
            .order("updated_at", { ascending: false })

        if (error) {
            const appError = parseSupabaseError(error, "fetch", "Exhibitions")
            logError(appError, { operation: "getExhibitions" })
            throw appError
        }

        // Group artworks by exhibition
        const exhibitionsMap = new Map<string, Exhibition>()

        data?.forEach((artworkDB) => {
            const artwork = transformArtwork(artworkDB)
            const exhibitions = artwork.exhibitionHistory || []

            exhibitions.forEach((exhibition) => {
                const key = `${exhibition.name}|${exhibition.venue}|${exhibition.dates}`

                if (exhibitionsMap.has(key)) {
                    exhibitionsMap.get(key)!.artworks.push(artwork)
                } else {
                    exhibitionsMap.set(key, {
                        name: exhibition.name,
                        venue: exhibition.venue,
                        about: exhibition.about,
                        curator: exhibition.curator,
                        dates: exhibition.dates,
                        coverImage: exhibition.coverImage,
                        exhibitionImages: exhibition.exhibitionImages,
                        type: exhibition.type,
                        otherArtists: exhibition.otherArtists,
                        artworks: [artwork],
                    })
                }
            })
        })

        // Convert map to array and sort by dates (most recent first)
        return Array.from(exhibitionsMap.values()).sort((a, b) => {
            return new Date(b.dates).getTime() - new Date(a.dates).getTime()
        })
    } catch (error) {
        if (error instanceof AppError) throw error

        logError(error, { operation: "getExhibitions" })
        throw new AppError(
            ErrorType.DATABASE_ERROR,
            ErrorMessages.FETCH_FAILED,
            error instanceof Error ? error.message : "Unknown error"
        )
    }
}

/**
 * Add an exhibition to selected artworks
 */
export async function addExhibitionToArtworks(
    artworkIds: string[],
    exhibition: Omit<ExhibitionHistory, "id">
): Promise<void> {
    try {
        // Verify authentication
        await requireAuth()
        
        // Validate input
        if (!artworkIds || artworkIds.length === 0) {
            throw new AppError(
                ErrorType.VALIDATION_ERROR,
                "Please select at least one artwork for the exhibition.",
                "No artworks selected"
            )
        }

        if (!exhibition.name || !exhibition.name.trim()) {
            throw new AppError(
                ErrorType.REQUIRED_FIELD,
                "Exhibition name is required.",
                "Missing exhibition name"
            )
        }

        if (!exhibition.venue || !exhibition.venue.trim()) {
            throw new AppError(
                ErrorType.REQUIRED_FIELD,
                "Exhibition venue is required.",
                "Missing exhibition venue"
            )
        }

        if (!exhibition.dates) {
            throw new AppError(
                ErrorType.REQUIRED_FIELD,
                "Exhibition dates are required.",
                "Missing exhibition dates"
            )
        }

        const supabase = await createClient()
        const errors: string[] = []
        let successCount = 0

        // For each artwork, fetch current exhibition history and append new exhibition
        for (const artworkId of artworkIds) {
            const { data: artwork, error: fetchError } = await supabase
                .from("artworks")
                .select("exhibition_history")
                .eq("id", artworkId)
                .single()

            if (fetchError) {
                errors.push(`Artwork ${artworkId}: ${fetchError.message}`)
                logError(fetchError, { operation: "addExhibitionToArtworks", additionalInfo: { artworkId } })
                continue
            }

            const currentHistory = (artwork.exhibition_history as ExhibitionHistory[]) || []

            // Check if exhibition already exists for this artwork
            const existingIndex = currentHistory.findIndex(
                (e) =>
                    e.name === exhibition.name &&
                    e.venue === exhibition.venue &&
                    e.dates === exhibition.dates
            )

            if (existingIndex === -1) {
                // Add new exhibition
                const updatedHistory = [...currentHistory, exhibition]

                const { error: updateError } = await supabase
                    .from("artworks")
                    .update({ exhibition_history: updatedHistory })
                    .eq("id", artworkId)

                if (updateError) {
                    errors.push(`Artwork ${artworkId}: ${updateError.message}`)
                    logError(updateError, { operation: "addExhibitionToArtworks", additionalInfo: { artworkId } })
                } else {
                    successCount++
                }
            } else {
                successCount++ // Already exists, count as success
            }
        }

        if (successCount === 0 && errors.length > 0) {
            throw new AppError(
                ErrorType.UPDATE_FAILED,
                `Failed to add exhibition to artworks. ${errors.length} error(s) occurred.`,
                errors.join("; ")
            )
        }

        revalidatePath("/protected/artworks")
        revalidatePath("/protected/exhibitions")
        revalidatePath("/api/artworks")
    } catch (error) {
        if (error instanceof AppError) throw error

        logError(error, { operation: "addExhibitionToArtworks", additionalInfo: { artworkIds, exhibition } })
        throw new AppError(
            ErrorType.UPDATE_FAILED,
            "Failed to add exhibition to artworks. Please try again.",
            error instanceof Error ? error.message : "Unknown error"
        )
    }
}

/**
 * Update an exhibition across all artworks
 */
export async function updateExhibition(
    oldExhibition: ExhibitionHistory,
    newExhibition: ExhibitionHistory
): Promise<void> {
    try {
        // Verify authentication
        await requireAuth()
        
        // Validate input
        if (!newExhibition.name || !newExhibition.name.trim()) {
            throw new AppError(
                ErrorType.REQUIRED_FIELD,
                "Exhibition name is required.",
                "Missing exhibition name"
            )
        }

        if (!newExhibition.venue || !newExhibition.venue.trim()) {
            throw new AppError(
                ErrorType.REQUIRED_FIELD,
                "Exhibition venue is required.",
                "Missing exhibition venue"
            )
        }

        if (!newExhibition.dates) {
            throw new AppError(
                ErrorType.REQUIRED_FIELD,
                "Exhibition dates are required.",
                "Missing exhibition dates"
            )
        }

        const supabase = await createClient()

        // Get all artworks with this exhibition
        const { data, error } = await supabase
            .from("artworks")
            .select("*")
            .not("exhibition_history", "is", null)

        if (error) {
            const appError = parseSupabaseError(error, "fetch", "Exhibition artworks")
            logError(appError, { operation: "updateExhibition", additionalInfo: { oldExhibition, newExhibition } })
            throw appError
        }

        const errors: string[] = []
        let successCount = 0

        // Update each artwork's exhibition history
        for (const artworkDB of data || []) {
            const currentHistory = (artworkDB.exhibition_history as ExhibitionHistory[]) || []

            const updatedHistory = currentHistory.map((e) => {
                if (
                    e.name === oldExhibition.name &&
                    e.venue === oldExhibition.venue &&
                    e.dates === oldExhibition.dates
                ) {
                    return newExhibition
                }
                return e
            })

            const { error: updateError } = await supabase
                .from("artworks")
                .update({ exhibition_history: updatedHistory })
                .eq("id", artworkDB.id)

            if (updateError) {
                errors.push(`Artwork ${artworkDB.id}: ${updateError.message}`)
                logError(updateError, { operation: "updateExhibition", additionalInfo: { artworkId: artworkDB.id } })
            } else {
                successCount++
            }
        }

        if (successCount === 0 && errors.length > 0) {
            throw new AppError(
                ErrorType.UPDATE_FAILED,
                ErrorMessages.EXHIBITION_UPDATE_FAILED,
                errors.join("; ")
            )
        }

        revalidatePath("/protected/artworks")
        revalidatePath("/protected/exhibitions")
        revalidatePath("/api/artworks")
    } catch (error) {
        if (error instanceof AppError) throw error

        logError(error, { operation: "updateExhibition", additionalInfo: { oldExhibition, newExhibition } })
        throw new AppError(
            ErrorType.UPDATE_FAILED,
            ErrorMessages.EXHIBITION_UPDATE_FAILED,
            error instanceof Error ? error.message : "Unknown error"
        )
    }
}

/**
 * Delete an exhibition from all artworks
 */
export async function deleteExhibition(exhibition: ExhibitionHistory): Promise<void> {
    try {
        // Verify authentication
        await requireAuth()
        
        // Validate input
        if (!exhibition.name || !exhibition.venue || !exhibition.dates) {
            throw new AppError(
                ErrorType.REQUIRED_FIELD,
                "Exhibition identification (name, venue, dates) is required.",
                "Missing exhibition identification"
            )
        }

        const supabase = await createClient()

        // Get all artworks with this exhibition
        const { data, error } = await supabase
            .from("artworks")
            .select("*")
            .not("exhibition_history", "is", null)

        if (error) {
            const appError = parseSupabaseError(error, "fetch", "Exhibition artworks")
            logError(appError, { operation: "deleteExhibition", additionalInfo: { exhibition } })
            throw appError
        }

        if (!data || data.length === 0) {
            throw new AppError(
                ErrorType.NOT_FOUND,
                ErrorMessages.EXHIBITION_NOT_FOUND,
                "No artworks found with this exhibition"
            )
        }

        const errors: string[] = []
        let successCount = 0

        // Remove exhibition from each artwork's history
        for (const artworkDB of data || []) {
            const currentHistory = (artworkDB.exhibition_history as ExhibitionHistory[]) || []

            const updatedHistory = currentHistory.filter(
                (e) =>
                    !(
                        e.name === exhibition.name &&
                        e.venue === exhibition.venue &&
                        e.dates === exhibition.dates
                    )
            )

            // Only update if something changed
            if (updatedHistory.length !== currentHistory.length) {
                const { error: updateError } = await supabase
                    .from("artworks")
                    .update({ exhibition_history: updatedHistory })
                    .eq("id", artworkDB.id)

                if (updateError) {
                    errors.push(`Artwork ${artworkDB.id}: ${updateError.message}`)
                    logError(updateError, { operation: "deleteExhibition", additionalInfo: { artworkId: artworkDB.id } })
                } else {
                    successCount++
                }
            }
        }

        if (successCount === 0 && errors.length > 0) {
            throw new AppError(
                ErrorType.DELETE_FAILED,
                ErrorMessages.EXHIBITION_DELETE_FAILED,
                errors.join("; ")
            )
        }

        revalidatePath("/protected/artworks")
        revalidatePath("/protected/exhibitions")
        revalidatePath("/api/artworks")
    } catch (error) {
        if (error instanceof AppError) throw error

        logError(error, { operation: "deleteExhibition", additionalInfo: { exhibition } })
        throw new AppError(
            ErrorType.DELETE_FAILED,
            ErrorMessages.EXHIBITION_DELETE_FAILED,
            error instanceof Error ? error.message : "Unknown error"
        )
    }
}

/**
 * Remove artworks from an exhibition
 */
export async function removeArtworksFromExhibition(
    artworkIds: string[],
    exhibition: ExhibitionHistory
): Promise<void> {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error("Unauthorized: You must be logged in to update exhibitions")
    }

    if (artworkIds.length === 0) {
        throw new Error("No artworks selected")
    }

    // Remove exhibition from selected artworks
    for (const artworkId of artworkIds) {
        const { data: artwork, error: fetchError } = await supabase
            .from("artworks")
            .select("exhibition_history")
            .eq("id", artworkId)
            .single()

        if (fetchError) {
            console.error(`Failed to fetch artwork ${artworkId}:`, fetchError)
            continue
        }

        const currentHistory = (artwork.exhibition_history as ExhibitionHistory[]) || []

        const updatedHistory = currentHistory.filter(
            (e) =>
                !(
                    e.name === exhibition.name &&
                    e.venue === exhibition.venue &&
                    e.dates === exhibition.dates
                )
        )

        const { error: updateError } = await supabase
            .from("artworks")
            .update({ exhibition_history: updatedHistory })
            .eq("id", artworkId)

        if (updateError) {
            console.error(`Failed to update artwork ${artworkId}:`, updateError)
        }
    }

    revalidatePath("/protected/artworks")
    revalidatePath("/protected/exhibitions")
    revalidatePath("/api/artworks")
}

