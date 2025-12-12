export type PageStatus = "draft" | "published" | "archived"
export type PageContentType = "html" | "markdown" | "json"

// Database schema (snake_case)
export interface PageDB {
  id: string
  user_id: string
  title: string
  slug: string
  content: string
  content_type: PageContentType
  template: string | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[] | null
  featured_image_url: string | null
  status: PageStatus
  published_at: string | null
  parent_id: string | null
  sort_order: number
  is_homepage: boolean
  created_at: string
  updated_at: string
}

// Application type (camelCase)
export interface Page {
  id: string
  userId: string
  title: string
  slug: string
  content: string
  contentType: PageContentType
  template: string | null
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string[] | null
  featuredImageUrl: string | null
  status: PageStatus
  publishedAt: string | null
  parentId: string | null
  sortOrder: number
  isHomepage: boolean
  createdAt: string
  updatedAt: string
}

export interface PageInsert {
  title: string
  slug: string
  content: string
  contentType?: PageContentType
  template?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string[] | null
  featuredImageUrl?: string | null
  status?: PageStatus
  publishedAt?: string | null
  parentId?: string | null
  sortOrder?: number
  isHomepage?: boolean
}

export interface PageUpdate extends Partial<PageInsert> {
  id: string
}

