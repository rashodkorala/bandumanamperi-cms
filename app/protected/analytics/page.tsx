import { PostHogAnalytics } from "@/components/analytics/posthog-analytics"
import { getPostHogSummary, listPostHogInsights } from "@/lib/actions/posthog-analytics"

export default async function PostHogAnalyticsPage() {
  const [summary, insights] = await Promise.all([
    getPostHogSummary(),
    listPostHogInsights(),
  ])

  return (
    <div className="flex flex-grow flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-semibold">PostHog Analytics</h1>
            <p className="text-muted-foreground text-sm">
              View analytics data from PostHog
            </p>
          </div>

          {/* Analytics Content */}
          <div className="px-4 lg:px-6">
            <PostHogAnalytics summary={summary} insights={insights} />
          </div>
        </div>
      </div>
    </div>
  )
}

