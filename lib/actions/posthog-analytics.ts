"use server"

/**
 * PostHog Analytics Actions
 * 
 * These server actions fetch analytics data from PostHog using the PostHog API.
 * Make sure to set POSTHOG_PROJECT_ID and POSTHOG_PERSONAL_API_KEY in your .env.local
 */

interface PostHogEvent {
  event: string
  distinct_id: string
  properties: Record<string, any>
  timestamp: string
}

interface PostHogInsight {
  id: string
  name: string
  description?: string
  filters: Record<string, any>
  result?: any
}

interface PostHogAnalyticsSummary {
  totalEvents: number
  uniqueUsers: number
  topEvents: Array<{ event: string; count: number }>
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
}

/**
 * Get analytics summary from PostHog
 */
export async function getPostHogSummary(
  dateFrom: string = "-30d",
  dateTo: string = "now"
): Promise<PostHogAnalyticsSummary | null> {
  try {
    const projectId = process.env.POSTHOG_PROJECT_ID
    const apiKey = process.env.POSTHOG_PERSONAL_API_KEY

    if (!projectId || !apiKey) {
      console.error("PostHog credentials not configured")
      return null
    }

    const baseUrl = process.env.POSTHOG_HOST || "https://app.posthog.com"

    // Fetch total events
    const eventsResponse = await fetch(
      `${baseUrl}/api/projects/${projectId}/events?limit=1000`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!eventsResponse.ok) {
      console.error(`PostHog API error: ${eventsResponse.status} ${eventsResponse.statusText}`)
      if (eventsResponse.status === 403 || eventsResponse.status === 401) {
        console.error("Check your POSTHOG_PERSONAL_API_KEY has the correct permissions")
      }
      return null
    }

    const eventsData = await eventsResponse.json()

    // Count events by type
    const eventCounts: Record<string, number> = {}
    const uniqueUsers = new Set<string>()

    eventsData.results?.forEach((event: PostHogEvent) => {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1
      uniqueUsers.add(event.distinct_id)
    })

    const topEvents = Object.entries(eventCounts)
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalEvents: eventsData.results?.length || 0,
      uniqueUsers: uniqueUsers.size,
      topEvents,
      dailyActiveUsers: 0, // Implement DAU query if needed
      weeklyActiveUsers: 0, // Implement WAU query if needed
      monthlyActiveUsers: uniqueUsers.size, // Approximation for now
    }
  } catch (error) {
    console.error("Error fetching PostHog summary:", error)
    return null
  }
}

/**
 * Get specific insight from PostHog
 */
export async function getPostHogInsight(insightId: string): Promise<PostHogInsight | null> {
  try {
    const projectId = process.env.POSTHOG_PROJECT_ID
    const apiKey = process.env.POSTHOG_PERSONAL_API_KEY

    if (!projectId || !apiKey) {
      console.error("PostHog credentials not configured")
      return null
    }

    const baseUrl = process.env.POSTHOG_HOST || "https://app.posthog.com"

    const response = await fetch(
      `${baseUrl}/api/projects/${projectId}/insights/${insightId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      console.error(`PostHog API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching PostHog insight:", error)
    return null
  }
}

/**
 * List all insights from PostHog
 */
export async function listPostHogInsights(): Promise<PostHogInsight[]> {
  try {
    const projectId = process.env.POSTHOG_PROJECT_ID
    const apiKey = process.env.POSTHOG_PERSONAL_API_KEY

    if (!projectId || !apiKey) {
      console.error("PostHog credentials not configured")
      return []
    }

    const baseUrl = process.env.POSTHOG_HOST || "https://app.posthog.com"

    const response = await fetch(
      `${baseUrl}/api/projects/${projectId}/insights?limit=20`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      console.error(`PostHog API error: ${response.status} ${response.statusText}`)
      if (response.status === 403 || response.status === 401) {
        console.error("Check your POSTHOG_PERSONAL_API_KEY has 'read' permissions for insights")
      }
      return []
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Error fetching PostHog insights:", error)
    return []
  }
}

/**
 * Get events from PostHog with filters
 */
export async function getPostHogEvents(
  limit: number = 100,
  eventName?: string
): Promise<PostHogEvent[]> {
  try {
    const projectId = process.env.POSTHOG_PROJECT_ID
    const apiKey = process.env.POSTHOG_PERSONAL_API_KEY

    if (!projectId || !apiKey) {
      console.error("PostHog credentials not configured")
      return []
    }

    const baseUrl = process.env.POSTHOG_HOST || "https://app.posthog.com"

    let url = `${baseUrl}/api/projects/${projectId}/events?limit=${limit}`
    if (eventName) {
      url += `&event=${encodeURIComponent(eventName)}`
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    })

    if (!response.ok) {
      console.error(`PostHog API error: ${response.status} ${response.statusText}`)
      return []
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Error fetching PostHog events:", error)
    return []
  }
}

