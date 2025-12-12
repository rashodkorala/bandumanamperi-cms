import { IconFolder, IconPhoto, IconTrendingUp, IconUsers } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { AnalyticsSummary } from "@/lib/types/analytics"

interface SectionCardsProps {
  projectsCount: number
  photosCount: number
  analytics: AnalyticsSummary | null
}

export function SectionCards({
  projectsCount,
  photosCount,
  analytics,
}: SectionCardsProps) {
  const totalPageviews = analytics?.totalPageviews || 0
  const uniqueVisitors = analytics?.uniqueVisitors || 0

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Projects</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {projectsCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconFolder className="size-4" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            All your projects <IconFolder className="size-4" />
          </div>
          <div className="text-muted-foreground">Tracked in your portfolio</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Photos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {photosCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPhoto className="size-4" />
              Collection
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Your photo collection <IconPhoto className="size-4" />
          </div>
          <div className="text-muted-foreground">Organized and cataloged</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Pageviews</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalPageviews.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="size-4" />
              Last 30 days
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Across all domains <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {analytics?.topDomains.length || 0} domain
            {(analytics?.topDomains.length || 0) !== 1 ? "s" : ""} tracked
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Unique Visitors</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {uniqueVisitors.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="size-4" />
              Last 30 days
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Unique sessions <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">Tracked across your sites</div>
        </CardFooter>
      </Card>
    </div>
  )
}
