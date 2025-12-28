export type ArtworkStatus = "published" | "draft" | "archived"
export type ArtworkAvailability = "available" | "sold" | "on_loan" | "private_collection" | "nfs"

export type ExhibitionType = "solo" | "group" | "online"

export interface ExhibitionHistory {
  name: string
  venue: string
  about: string
  curator: string
  dates: string
  coverImage: string | null
  exhibitionImages: string[]
  type: ExhibitionType
  otherArtists: string | null
}

// Database schema (snake_case)
export interface ArtworkDB {
  id: string
  title: string | null
  year: string | null
  description: string | null
  link: string | null
  featured: boolean
  category: string | null
  medium: string | null
  width: number | null
  height: number | null
  depth: number | null
  unit: string
  slug: string | null
  status: ArtworkStatus
  tags: string[] | null
  series: string | null
  materials: string | null
  technique: string | null
  location: string | null
  availability: ArtworkAvailability
  price: number | null
  currency: string
  price_upon_request: boolean
  collector_name: string | null
  sort_order: number
  thumbnail_path: string | null
  artist_notes: string | null
  date_created: string | null
  exhibition_history: ExhibitionHistory[] | null
  views_count: number
  media: string[] | null
  created_at: string
  updated_at: string
}

// Application type (camelCase)
export interface Artwork {
  id: string
  title: string | null
  year: string | null
  description: string | null
  link: string | null
  featured: boolean
  category: string | null
  medium: string | null
  width: number | null
  height: number | null
  depth: number | null
  unit: string
  slug: string | null
  status: ArtworkStatus
  tags: string[] | null
  series: string | null
  materials: string | null
  technique: string | null
  location: string | null
  availability: ArtworkAvailability
  price: number | null
  currency: string
  priceUponRequest: boolean
  collectorName: string | null
  sortOrder: number
  thumbnailPath: string | null
  artistNotes: string | null
  dateCreated: string | null
  exhibitionHistory: ExhibitionHistory[] | null
  viewsCount: number
  media: string[] | null
  createdAt: string
  updatedAt: string
}

export interface ArtworkInsert {
  title?: string | null
  year?: string | null
  description?: string | null
  link?: string | null
  featured?: boolean
  category?: string | null
  medium?: string | null
  width?: number | null
  height?: number | null
  depth?: number | null
  unit?: string
  slug?: string | null
  status?: ArtworkStatus
  tags?: string[] | null
  series?: string | null
  materials?: string | null
  technique?: string | null
  location?: string | null
  availability?: ArtworkAvailability
  price?: number | null
  currency?: string
  priceUponRequest?: boolean
  collectorName?: string | null
  sortOrder?: number
  thumbnailPath?: string | null
  artistNotes?: string | null
  dateCreated?: string | null
  exhibitionHistory?: ExhibitionHistory[] | null
  media?: string[] | null
}

export interface ArtworkUpdate extends Partial<ArtworkInsert> {
  id: string
}



