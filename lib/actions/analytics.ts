"use server"

import { createClient } from "@/lib/supabase/server"
import type { AnalyticsSummary } from "@/lib/types/analytics"

export async function getAnalyticsSummary(
  startDate?: Date,
  endDate?: Date
): Promise<AnalyticsSummary | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  const end = endDate || new Date()

  const { data, error } = await supabase.rpc("get_analytics_summary", {
    p_user_id: user.id,
    p_start_date: start.toISOString(),
    p_end_date: end.toISOString(),
  })

  if (error) {
    console.error("Analytics summary error:", error)
    throw new Error(`Failed to fetch analytics: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return {
      totalPageviews: 0,
      uniqueVisitors: 0,
      uniqueSessions: 0,
      topPages: [],
      topDomains: [],
      deviceBreakdown: [],
      dailyViews: [],
    }
  }

  const result = data[0]

  return {
    totalPageviews: Number(result.total_pageviews) || 0,
    uniqueVisitors: Number(result.unique_visitors) || 0,
    uniqueSessions: Number(result.unique_sessions) || 0,
    topPages: (result.top_pages as Array<{ path: string; views: number }>) || [],
    topDomains: (result.top_domains as Array<{ domain: string; views: number }>) || [],
    deviceBreakdown: (result.device_breakdown as Array<{ device: string; count: number }>) || [],
    dailyViews: (result.daily_views as Array<{ date: string; views: number }>) || [],
  }
}

