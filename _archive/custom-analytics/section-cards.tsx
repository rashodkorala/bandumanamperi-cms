import { IconPalette, IconTrendingUp, IconUsers, IconEye } from "@tabler/icons-react"

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
  artworksCount: number
  analytics: AnalyticsSummary | null
}

export function SectionCards({
  artworksCount,
  analytics,
}: SectionCardsProps) {
  const totalPageviews = analytics?.totalPageviews || 0
  const totalArtworkViews = analytics?.totalArtworkViews || 0
  const uniqueVisitors = analytics?.uniqueVisitors || 0

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Artworks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {artworksCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPalette className="size-4" />
              Collection
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Your artwork collection <IconPalette className="size-4" />
          </div>
          <div className="text-muted-foreground">Tracked in your portfolio</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Artwork Views</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalArtworkViews.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconEye className="size-4" />
              Last 30 days
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total artwork views <IconEye className="size-4" />
          </div>
          <div className="text-muted-foreground">Across all artworks</div>
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
            Across all pages <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {analytics?.topPages.length || 0} page
            {(analytics?.topPages.length || 0) !== 1 ? "s" : ""} tracked
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
