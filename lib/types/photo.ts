export interface CameraSettings {
  aperture?: string
  shutterSpeed?: string
  iso?: number
  focalLength?: string
  camera?: string
  lens?: string
}

// Database schema (snake_case)
export interface PhotoDB {
  id: string
  title: string
  description: string | null
  image_url: string
  alt_text: string | null
  category: string | null
  location: string | null
  date_taken: string | null
  camera_settings: CameraSettings | null
  tags: string[] | null
  featured: boolean
  created_at: string
  updated_at: string
  user_id: string
}

// Application type (camelCase)
export interface Photo {
  id: string
  title: string
  description: string | null
  imageUrl: string
  altText: string | null
  category: string | null
  location: string | null
  dateTaken: string | null
  cameraSettings: CameraSettings | null
  tags: string[] | null
  featured: boolean
  created_at: string
  updated_at: string
  user_id: string
}

export interface PhotoInsert {
  title: string
  description?: string | null
  imageUrl: string
  altText?: string | null
  category?: string | null
  location?: string | null
  dateTaken?: string | null
  cameraSettings?: CameraSettings | null
  tags?: string[] | null
  featured?: boolean
}

export interface PhotoUpdate extends Partial<PhotoInsert> {
  id: string
}

