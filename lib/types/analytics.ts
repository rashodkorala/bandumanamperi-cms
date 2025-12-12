export type EventType = "pageview" | "artwork_view" | "artwork_click" | "artwork_share" | "click" | "custom"

export interface AnalyticsEvent {
  eventType: EventType
  domain: string
  path: string
  artworkId?: string | null // Link to artwork if applicable
  referrer?: string | null
  userAgent?: string | null
  ipAddress?: string | null
  country?: string | null
  city?: string | null
  deviceType?: "desktop" | "mobile" | "tablet" | null
  browser?: string | null
  os?: string | null
  screenWidth?: number | null
  screenHeight?: number | null
  sessionId?: string | null
  metadata?: Record<string, unknown> | null
}

export interface ArtworkAnalytics {
  totalViews: number
  totalClicks: number
  totalShares: number
  uniqueVisitors: number
  uniqueSessions: number
  viewsByDevice: Record<string, number>
  viewsByCountry: Record<string, number>
  dailyViews: Record<string, number>
}

export interface AnalyticsSummary {
  totalPageviews: number
  totalArtworkViews: number
  uniqueVisitors: number
  uniqueSessions: number
  topArtworks: Array<{ artworkId: string; title: string; views: number }>
  topPages: Array<{ path: string; views: number }>
  deviceBreakdown: Record<string, number>
  dailyViews: Record<string, number>
}

