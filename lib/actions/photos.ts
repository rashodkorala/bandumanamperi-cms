"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Photo, PhotoDB, PhotoInsert, PhotoUpdate } from "@/lib/types/photo"

function transformPhoto(photo: PhotoDB): Photo {
  return {
    ...photo,
    imageUrl: photo.image_url,
    altText: photo.alt_text,
    dateTaken: photo.date_taken,
    cameraSettings: photo.camera_settings,
  }
}

export async function getPhotos(): Promise<Photo[]> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("user_id", user.id)
    .order("date_taken", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch photos: ${error.message}`)
  }

  return (data || []).map(transformPhoto)
}

export async function getPhoto(id: string): Promise<Photo | null> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch photo: ${error.message}`)
  }

  return data ? transformPhoto(data) : null
}

export async function getPhotosByCategory(category: string): Promise<Photo[]> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("user_id", user.id)
    .eq("category", category)
    .order("date_taken", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch photos: ${error.message}`)
  }

  return (data || []).map(transformPhoto)
}

export async function getFeaturedPhotos(): Promise<Photo[]> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("user_id", user.id)
    .eq("featured", true)
    .order("date_taken", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch featured photos: ${error.message}`)
  }

  return (data || []).map(transformPhoto)
}

export async function createPhoto(photo: PhotoInsert): Promise<Photo> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("photos")
    .insert({
      title: photo.title,
      description: photo.description || null,
      image_url: photo.imageUrl,
      alt_text: photo.altText || null,
      category: photo.category || null,
      location: photo.location || null,
      date_taken: photo.dateTaken || null,
      camera_settings: photo.cameraSettings || null,
      tags: photo.tags || [],
      featured: photo.featured || false,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create photo: ${error.message}`)
  }

  revalidatePath("/protected/photos")
  return transformPhoto(data)
}

export async function updatePhoto(photo: PhotoUpdate): Promise<Photo> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { id, ...updates } = photo

  const updateData: Partial<{
    title: string
    description: string | null
    image_url: string
    alt_text: string | null
    category: string | null
    location: string | null
    date_taken: string | null
    camera_settings: unknown
    tags: string[] | null
    featured: boolean
  }> = {}
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl
  if (updates.altText !== undefined) updateData.alt_text = updates.altText
  if (updates.category !== undefined) updateData.category = updates.category
  if (updates.location !== undefined) updateData.location = updates.location
  if (updates.dateTaken !== undefined) updateData.date_taken = updates.dateTaken
  if (updates.cameraSettings !== undefined) updateData.camera_settings = updates.cameraSettings
  if (updates.tags !== undefined) updateData.tags = updates.tags || []
  if (updates.featured !== undefined) updateData.featured = updates.featured

  const { data, error } = await supabase
    .from("photos")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update photo: ${error.message}`)
  }

  revalidatePath("/protected/photos")
  return transformPhoto(data)
}

export async function deletePhoto(id: string): Promise<void> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("photos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(`Failed to delete photo: ${error.message}`)
  }

  revalidatePath("/protected/photos")
}

