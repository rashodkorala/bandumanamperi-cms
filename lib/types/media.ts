export type MediaFileType = "image" | "video" | "document" | "audio" | "other"

// Database schema (snake_case)
export interface MediaDB {
  id: string
  user_id: string
  title: string
  description: string | null
  file_url: string
  file_type: MediaFileType
  file_size: number | null
  mime_type: string | null
  alt_text: string | null
  tags: string[] | null
  folder: string | null
  featured: boolean
  created_at: string
  updated_at: string
}

// Application type (camelCase)
export interface MediaItem {
  id: string
  userId: string
  title: string
  description: string | null
  fileUrl: string
  fileType: MediaFileType
  fileSize: number | null
  mimeType: string | null
  altText: string | null
  tags: string[] | null
  folder: string | null
  featured: boolean
  createdAt: string
  updatedAt: string
}

// Alias for backward compatibility
export type Media = MediaItem

export interface MediaInsert {
  title: string
  description?: string | null
  fileUrl: string
  fileType: MediaFileType
  fileSize?: number | null
  mimeType?: string | null
  altText?: string | null
  tags?: string[] | null
  folder?: string | null
  featured?: boolean
}

export interface MediaUpdate extends Partial<MediaInsert> {
  id: string
}

