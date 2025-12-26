"use server"

import { createClient } from "@/lib/supabase/server"
import type { AnalyticsSummary, ArtworkAnalytics } from "@/lib/types/analytics"

export async function getAnalyticsSummary(
  startDate?: Date,
  endDate?: Date
): Promise<AnalyticsSummary | null> {
  const supabase = await createClient()

  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  const end = endDate || new Date()

  const { data, error } = await supabase.rpc("get_analytics_summary", {
    p_start_date: start.toISOString(),
    p_end_date: end.toISOString(),
  })

  if (error) {
    console.error("Analytics summary error:", error)
    // Return empty summary instead of throwing
    return {
      totalPageviews: 0,
      totalArtworkViews: 0,
      uniqueVisitors: 0,
      uniqueSessions: 0,
      topArtworks: [],
      topPages: [],
      deviceBreakdown: {},
      dailyViews: {},
    }
  }

  if (!data || data.length === 0) {
    return {
      totalPageviews: 0,
      totalArtworkViews: 0,
      uniqueVisitors: 0,
      uniqueSessions: 0,
      topArtworks: [],
      topPages: [],
      deviceBreakdown: {},
      dailyViews: {},
    }
  }

  const result = data[0]

  return {
    totalPageviews: Number(result.total_pageviews) || 0,
    totalArtworkViews: Number(result.total_artwork_views) || 0,
    uniqueVisitors: Number(result.unique_visitors) || 0,
    uniqueSessions: Number(result.unique_sessions) || 0,
    topArtworks: (result.top_artworks as Array<{ artwork_id: string; title: string; views: number }>)?.map(a => ({
      artworkId: a.artwork_id,
      title: a.title,
      views: a.views,
    })) || [],
    topPages: (result.top_pages as Array<{ path: string; views: number }>) || [],
    deviceBreakdown: (result.device_breakdown as Record<string, number>) || {},
    dailyViews: (result.daily_views as Record<string, number>) || {},
  }
}

export async function getArtworkAnalytics(
  artworkId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ArtworkAnalytics | null> {
  const supabase = await createClient()

  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  const end = endDate || new Date()

  const { data, error } = await supabase.rpc("get_artwork_analytics", {
    p_artwork_id: artworkId,
    p_start_date: start.toISOString(),
    p_end_date: end.toISOString(),
  })

  if (error) {
    console.error("Artwork analytics error:", error)
    return {
      totalViews: 0,
      totalClicks: 0,
      totalShares: 0,
      uniqueVisitors: 0,
      uniqueSessions: 0,
      viewsByDevice: {},
      viewsByCountry: {},
      dailyViews: {},
    }
  }

  if (!data || data.length === 0) {
    return {
      totalViews: 0,
      totalClicks: 0,
      totalShares: 0,
      uniqueVisitors: 0,
      uniqueSessions: 0,
      viewsByDevice: {},
      viewsByCountry: {},
      dailyViews: {},
    }
  }

  const result = data[0]

  return {
    totalViews: Number(result.total_views) || 0,
    totalClicks: Number(result.total_clicks) || 0,
    totalShares: Number(result.total_shares) || 0,
    uniqueVisitors: Number(result.unique_visitors) || 0,
    uniqueSessions: Number(result.unique_sessions) || 0,
    viewsByDevice: (result.views_by_device as Record<string, number>) || {},
    viewsByCountry: (result.views_by_country as Record<string, number>) || {},
    dailyViews: (result.daily_views as Record<string, number>) || {},
  }
}
