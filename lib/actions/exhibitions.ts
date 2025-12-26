"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/verify-auth"
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
    const supabase = await createClient()

    // Verify user is authenticated
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error("Unauthorized: You must be logged in to view exhibitions")
    }

    // Get all artworks with exhibition history
    const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .not("exhibition_history", "is", null)
        .order("updated_at", { ascending: false })

    if (error) {
        throw new Error(`Failed to fetch exhibitions: ${error.message}`)
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
}

/**
 * Add an exhibition to selected artworks
 */
export async function addExhibitionToArtworks(
    artworkIds: string[],
    exhibition: Omit<ExhibitionHistory, "id">
): Promise<void> {
    // Verify authentication
    await requireAuth()
    
    const supabase = await createClient()

    if (artworkIds.length === 0) {
        throw new Error("No artworks selected")
    }

    if (!exhibition.name.trim() || !exhibition.venue.trim() || !exhibition.dates) {
        throw new Error("Exhibition name, venue, and dates are required")
    }

    // For each artwork, fetch current exhibition history and append new exhibition
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
                console.error(`Failed to update artwork ${artworkId}:`, updateError)
            }
        }
    }

    revalidatePath("/protected/artworks")
    revalidatePath("/protected/exhibitions")
    revalidatePath("/api/artworks")
}

/**
 * Update an exhibition across all artworks
 */
export async function updateExhibition(
    oldExhibition: ExhibitionHistory,
    newExhibition: ExhibitionHistory
): Promise<void> {
    // Verify authentication
    await requireAuth()
    
    const supabase = await createClient()

    if (!newExhibition.name.trim() || !newExhibition.venue.trim() || !newExhibition.dates) {
        throw new Error("Exhibition name, venue, and dates are required")
    }

    // Get all artworks with this exhibition
    const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .not("exhibition_history", "is", null)

    if (error) {
        throw new Error(`Failed to fetch artworks: ${error.message}`)
    }

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
            console.error(`Failed to update artwork ${artworkDB.id}:`, updateError)
        }
    }

    revalidatePath("/protected/artworks")
    revalidatePath("/protected/exhibitions")
    revalidatePath("/api/artworks")
}

/**
 * Delete an exhibition from all artworks
 */
export async function deleteExhibition(exhibition: ExhibitionHistory): Promise<void> {
    // Verify authentication
    await requireAuth()
    
    const supabase = await createClient()

    // Get all artworks with this exhibition
    const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .not("exhibition_history", "is", null)

    if (error) {
        throw new Error(`Failed to fetch artworks: ${error.message}`)
    }

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

        const { error: updateError } = await supabase
            .from("artworks")
            .update({ exhibition_history: updatedHistory })
            .eq("id", artworkDB.id)

        if (updateError) {
            console.error(`Failed to update artwork ${artworkDB.id}:`, updateError)
        }
    }

    revalidatePath("/protected/artworks")
    revalidatePath("/protected/exhibitions")
    revalidatePath("/api/artworks")
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

