export type PerformanceStatus = "published" | "draft" | "archived"
export type PerformanceType = "solo" | "group" | "collaboration" | "online" | "hybrid"

// Database schema (snake_case)
export interface PerformanceDB {
  id: string
  title: string
  description: string | null
  venue: string | null
  location: string | null
  date: string | null
  time: string | null
  duration: string | null
  type: PerformanceType
  category: string | null
  director: string | null
  choreographer: string | null
  composer: string | null
  collaborators: string | null
  cover_image: string | null
  media: string[] | null
  video_url: string | null
  about: string | null
  program_notes: string | null
  reviews: string | null
  tickets_url: string | null
  website_url: string | null
  slug: string | null
  status: PerformanceStatus
  featured: boolean
  tags: string[] | null
  awards: string | null
  audience_size: number | null
  sort_order: number
  views_count: number
  created_at: string
  updated_at: string
}

// Application type (camelCase)
export interface Performance {
  id: string
  title: string
  description: string | null
  venue: string | null
  location: string | null
  date: string | null
  time: string | null
  duration: string | null
  type: PerformanceType
  category: string | null
  director: string | null
  choreographer: string | null
  composer: string | null
  collaborators: string | null
  coverImage: string | null
  media: string[] | null
  videoUrl: string | null
  about: string | null
  programNotes: string | null
  reviews: string | null
  ticketsUrl: string | null
  websiteUrl: string | null
  slug: string | null
  status: PerformanceStatus
  featured: boolean
  tags: string[] | null
  awards: string | null
  audienceSize: number | null
  sortOrder: number
  viewsCount: number
  createdAt: string
  updatedAt: string
}

export interface PerformanceInsert {
  title: string
  description?: string | null
  venue?: string | null
  location?: string | null
  date?: string | null
  time?: string | null
  duration?: string | null
  type?: PerformanceType
  category?: string | null
  director?: string | null
  choreographer?: string | null
  composer?: string | null
  collaborators?: string | null
  coverImage?: string | null
  media?: string[] | null
  videoUrl?: string | null
  about?: string | null
  programNotes?: string | null
  reviews?: string | null
  ticketsUrl?: string | null
  websiteUrl?: string | null
  slug?: string | null
  status?: PerformanceStatus
  featured?: boolean
  tags?: string[] | null
  awards?: string | null
  audienceSize?: number | null
  sortOrder?: number
}

export interface PerformanceUpdate extends Partial<PerformanceInsert> {
  id: string
}

// Helper function to convert DB record to app format
export function performanceDBToApp(db: PerformanceDB): Performance {
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    venue: db.venue,
    location: db.location,
    date: db.date,
    time: db.time,
    duration: db.duration,
    type: db.type,
    category: db.category,
    director: db.director,
    choreographer: db.choreographer,
    composer: db.composer,
    collaborators: db.collaborators,
    coverImage: db.cover_image,
    media: db.media,
    videoUrl: db.video_url,
    about: db.about,
    programNotes: db.program_notes,
    reviews: db.reviews,
    ticketsUrl: db.tickets_url,
    websiteUrl: db.website_url,
    slug: db.slug,
    status: db.status,
    featured: db.featured,
    tags: db.tags,
    awards: db.awards,
    audienceSize: db.audience_size,
    sortOrder: db.sort_order,
    viewsCount: db.views_count,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

// Helper function to convert app format to DB format
export function performanceAppToDB(
  app: PerformanceInsert | PerformanceUpdate
): Record<string, unknown> {
  const db: Record<string, unknown> = {}

  if ("id" in app) db.id = app.id
  if (app.title !== undefined) db.title = app.title
  if (app.description !== undefined) db.description = app.description
  if (app.venue !== undefined) db.venue = app.venue
  if (app.location !== undefined) db.location = app.location
  if (app.date !== undefined) db.date = app.date
  if (app.time !== undefined) db.time = app.time
  if (app.duration !== undefined) db.duration = app.duration
  if (app.type !== undefined) db.type = app.type
  if (app.category !== undefined) db.category = app.category
  if (app.director !== undefined) db.director = app.director
  if (app.choreographer !== undefined) db.choreographer = app.choreographer
  if (app.composer !== undefined) db.composer = app.composer
  if (app.collaborators !== undefined) db.collaborators = app.collaborators
  if (app.coverImage !== undefined) db.cover_image = app.coverImage
  if (app.media !== undefined) db.media = app.media
  if (app.videoUrl !== undefined) db.video_url = app.videoUrl
  if (app.about !== undefined) db.about = app.about
  if (app.programNotes !== undefined) db.program_notes = app.programNotes
  if (app.reviews !== undefined) db.reviews = app.reviews
  if (app.ticketsUrl !== undefined) db.tickets_url = app.ticketsUrl
  if (app.websiteUrl !== undefined) db.website_url = app.websiteUrl
  if (app.slug !== undefined) db.slug = app.slug
  if (app.status !== undefined) db.status = app.status
  if (app.featured !== undefined) db.featured = app.featured
  if (app.tags !== undefined) db.tags = app.tags
  if (app.awards !== undefined) db.awards = app.awards
  if (app.audienceSize !== undefined) db.audience_size = app.audienceSize
  if (app.sortOrder !== undefined) db.sort_order = app.sortOrder

  return db
}



