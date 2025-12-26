# PostHog Advanced Integration

This guide covers advanced PostHog features and how to integrate them into your CMS using PostHog's full API capabilities.

## Advanced Features Available

Through PostHog's API, you can access:

1. **Insights** - Pre-built charts and visualizations
2. **Dashboards** - Collections of insights
3. **Funnels** - User journey tracking
4. **Trends** - Event patterns over time
5. **Feature Flags** - A/B testing and gradual rollouts
6. **Experiments** - Run A/B tests
7. **Surveys** - Collect user feedback

## Using PostHog Insights in Your CMS

### 1. Creating Insights Programmatically

You can create insights via the PostHog API. Here's an example of creating a trends insight:

```typescript
// lib/actions/posthog-insights.ts
"use server"

export async function createPostHogInsight(name: string, eventName: string) {
  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY
  const baseUrl = process.env.POSTHOG_HOST || "https://app.posthog.com"

  const response = await fetch(
    `${baseUrl}/api/projects/${projectId}/insights`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        query: {
          kind: "InsightVizNode",
          source: {
            kind: "TrendsQuery",
            series: [
              {
                kind: "EventsNode",
                event: eventName,
                custom_name: name,
                math: "total",
              },
            ],
            interval: "day",
            dateRange: {
              date_from: "-30d",
              date_to: null,
            },
          },
        },
        favorited: false,
      }),
    }
  )

  return await response.json()
}
```

### 2. Querying Insight Data

Once you have insights, you can query their data:

```typescript
export async function getInsightData(insightId: string) {
  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY
  const baseUrl = process.env.POSTHOG_HOST || "https://app.posthog.com"

  const response = await fetch(
    `${baseUrl}/api/projects/${projectId}/insights/${insightId}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  )

  return await response.json()
}
```

### 3. Displaying Insights in Your CMS

Create a component to display PostHog insights:

```typescript
// components/analytics/posthog-insight.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface PostHogInsightProps {
  insightId: string
  title: string
}

export function PostHogInsight({ insightId, title }: PostHogInsightProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`/api/posthog/insights/${insightId}`)
      const result = await response.json()
      setData(result)
      setLoading(false)
    }
    fetchData()
  }, [insightId])

  if (loading) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data?.result && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.result}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
```

## Feature Flags Integration

Feature flags allow you to control feature rollouts directly from PostHog.

### 1. Check Feature Flags in Your Backend

```typescript
// lib/actions/posthog-feature-flags.ts
"use server"

export async function isFeatureEnabled(
  featureFlagKey: string,
  userId: string
): Promise<boolean> {
  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY
  const baseUrl = process.env.POSTHOG_HOST || "https://app.posthog.com"

  const response = await fetch(
    `${baseUrl}/api/projects/${projectId}/feature_flags/${featureFlagKey}/evaluation`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        distinct_id: userId,
      }),
    }
  )

  const data = await response.json()
  return data.value === true
}
```

### 2. Use Feature Flags in Components

```typescript
// Example: Show/hide features based on flags
import { isFeatureEnabled } from "@/lib/actions/posthog-feature-flags"

export default async function ArtworksPage() {
  const userId = await getCurrentUserId() // Your auth logic
  const showNewEditor = await isFeatureEnabled("new-editor", userId)

  return (
    <div>
      {showNewEditor ? <NewArtworkEditor /> : <OldArtworkEditor />}
    </div>
  )
}
```

## Dashboards

### 1. List All Dashboards

```typescript
export async function listPostHogDashboards() {
  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY
  const baseUrl = process.env.POSTHOG_HOST || "https://app.posthog.com"

  const response = await fetch(
    `${baseUrl}/api/projects/${projectId}/dashboards`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  )

  return await response.json()
}
```

### 2. Get Dashboard with Insights

```typescript
export async function getPostHogDashboard(dashboardId: string) {
  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY
  const baseUrl = process.env.POSTHOG_HOST || "https://app.posthog.com"

  const response = await fetch(
    `${baseUrl}/api/projects/${projectId}/dashboards/${dashboardId}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  )

  return await response.json()
}
```

## Funnels

Track user journeys through your site:

```typescript
export async function createFunnelInsight(
  name: string,
  steps: string[]
) {
  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY
  const baseUrl = process.env.POSTHOG_HOST || "https://app.posthog.com"

  const response = await fetch(
    `${baseUrl}/api/projects/${projectId}/insights`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        query: {
          kind: "InsightVizNode",
          source: {
            kind: "FunnelsQuery",
            series: steps.map(step => ({
              kind: "EventsNode",
              event: step,
            })),
            dateRange: {
              date_from: "-30d",
              date_to: null,
            },
          },
        },
      }),
    }
  )

  return await response.json()
}
```

## Real-Time Analytics

For real-time updates, you can set up polling or webhooks:

```typescript
// components/analytics/real-time-events.tsx
"use client"

import { useEffect, useState } from "react"

export function RealTimeEvents() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    // Poll every 10 seconds
    const interval = setInterval(async () => {
      const response = await fetch("/api/posthog/events/recent")
      const data = await response.json()
      setEvents(data.results)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <h3>Recent Events</h3>
      <ul>
        {events.map((event, i) => (
          <li key={i}>
            {event.event} - {new Date(event.timestamp).toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Custom Analytics Dashboards

Combine your Supabase analytics with PostHog data:

```typescript
// app/protected/analytics/combined/page.tsx
import { getAnalyticsSummary } from "@/lib/actions/analytics"
import { getPostHogSummary } from "@/lib/actions/posthog-analytics"

export default async function CombinedAnalyticsPage() {
  const [supabaseAnalytics, posthogAnalytics] = await Promise.all([
    getAnalyticsSummary(),
    getPostHogSummary(),
  ])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h2>Database Analytics</h2>
        <p>Pageviews: {supabaseAnalytics?.totalPageviews}</p>
      </div>
      <div>
        <h2>PostHog Analytics</h2>
        <p>Events: {posthogAnalytics?.totalEvents}</p>
      </div>
    </div>
  )
}
```

## Event Definitions

Get all events being tracked:

```typescript
export async function getEventDefinitions() {
  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY
  const baseUrl = process.env.POSTHOG_HOST || "https://app.posthog.com"

  const response = await fetch(
    `${baseUrl}/api/projects/${projectId}/event_definitions`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  )

  return await response.json()
}
```

## Best Practices

1. **Cache API Responses**: Use Next.js caching to reduce API calls
2. **Use Server Actions**: Keep API keys secure by calling PostHog from server-side
3. **Error Handling**: Always handle API errors gracefully
4. **Rate Limiting**: Be aware of PostHog's API rate limits
5. **Data Privacy**: Follow GDPR/privacy regulations when tracking users

## Performance Optimization

### Caching Strategy

```typescript
export async function getPostHogDataCached() {
  return await fetch("/api/posthog/summary", {
    next: {
      revalidate: 300, // Cache for 5 minutes
    },
  })
}
```

### Parallel Data Fetching

```typescript
const [insights, events, summary] = await Promise.all([
  listPostHogInsights(),
  getPostHogEvents(),
  getPostHogSummary(),
])
```

## Example: Custom Analytics Page

Here's a complete example of a custom analytics page:

```typescript
// app/protected/analytics/custom/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPostHogSummary, getPostHogEvents } from "@/lib/actions/posthog-analytics"

export default async function CustomAnalyticsPage() {
  const [summary, recentEvents] = await Promise.all([
    getPostHogSummary("-7d", "now"),
    getPostHogEvents(20),
  ])

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Custom Analytics</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.totalEvents}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.uniqueUsers}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>MAU</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.monthlyActiveUsers}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recentEvents.map((event, i) => (
              <li key={i} className="flex justify-between">
                <span>{event.event}</span>
                <span className="text-muted-foreground text-sm">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
```

## Troubleshooting Advanced Features

### API Rate Limits

If you hit rate limits:
- Increase cache duration
- Reduce polling frequency
- Use webhooks instead of polling
- Contact PostHog for higher limits

### Large Datasets

For projects with lots of data:
- Use date range filters
- Implement pagination
- Use aggregated queries
- Consider data sampling

### Feature Flag Evaluation

If feature flags aren't working:
- Check user identification
- Verify flag conditions
- Check rollout percentage
- Test with specific user IDs

## Resources

- [PostHog API Docs](https://posthog.com/docs/api)
- [PostHog SDKs](https://posthog.com/docs/libraries)
- [Feature Flags Guide](https://posthog.com/docs/feature-flags)
- [Insights Guide](https://posthog.com/docs/user-guides/insights)

---

**Note**: This guide covers advanced features. For basic setup, see `POSTHOG_SETUP.md`.

