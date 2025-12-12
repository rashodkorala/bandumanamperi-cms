export type ProjectCategory = "startup" | "client" | "personal" | "school"
export type ProjectStatus = "draft" | "published" | "archived"

// Database schema (snake_case)
export interface ProjectDB {
  id: string
  user_id: string
  slug: string
  title: string
  subtitle: string | null
  problem: string | null
  solution: string | null
  roles: string[] | null
  features: string[] | null
  tech: string[] | null
  live_url: string | null
  github_url: string | null
  case_study_url: string | null
  cover_image_url: string | null
  gallery_image_urls: string[] | null
  category: ProjectCategory | null
  status: ProjectStatus
  featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// Application type (camelCase)
export interface Project {
  id: string
  userId: string
  slug: string
  title: string
  subtitle: string | null
  problem: string | null
  solution: string | null
  roles: string[] | null
  features: string[] | null
  tech: string[] | null
  liveUrl: string | null
  githubUrl: string | null
  caseStudyUrl: string | null
  coverImageUrl: string | null
  galleryImageUrls: string[] | null
  category: ProjectCategory | null
  status: ProjectStatus
  featured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ProjectInsert {
  slug: string
  title: string
  subtitle?: string | null
  problem?: string | null
  solution?: string | null
  roles?: string[] | null
  features?: string[] | null
  tech?: string[] | null
  liveUrl?: string | null
  githubUrl?: string | null
  caseStudyUrl?: string | null
  coverImageUrl?: string | null
  galleryImageUrls?: string[] | null
  category?: ProjectCategory | null
  status?: ProjectStatus
  featured?: boolean
  sortOrder?: number
}

export interface ProjectUpdate extends Partial<ProjectInsert> {
  id: string
}
