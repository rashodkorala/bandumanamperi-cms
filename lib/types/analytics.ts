export type EventType = "pageview" | "click" | "custom"

export interface AnalyticsEvent {
  eventType: EventType
  domain: string
  path: string
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

export interface AnalyticsSummary {
  totalPageviews: number
  uniqueVisitors: number
  uniqueSessions: number
  topPages: Array<{ path: string; views: number }>
  topDomains: Array<{ domain: string; views: number }>
  deviceBreakdown: Array<{ device: string; count: number }>
  dailyViews: Array<{ date: string; views: number }>
}

