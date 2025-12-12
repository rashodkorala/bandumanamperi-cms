import { Analytics } from "@/components/analytics"
import { getAnalyticsSummary } from "@/lib/actions/analytics"

export default async function AnalyticsPage() {
  const initialAnalytics = await getAnalyticsSummary()

  return <Analytics initialAnalytics={initialAnalytics} />
}