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
        <div className="flex flex-col gap-6 py-6 md:gap-8">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                  Real-time insights powered by PostHog
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://app.posthog.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Open PostHog →
                </a>
              </div>
            </div>
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

