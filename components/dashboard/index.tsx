import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  IconPalette, 
  IconChartBar, 
  IconPlus, 
  IconUsers, 
  IconActivity,
  IconFileText,
  IconPhoto,
  IconCalendar,
  IconMicrophone,
  IconFolders,
  IconTrendingUp,
  IconArrowRight
} from "@tabler/icons-react"
import Link from "next/link"

interface DashboardProps {
    artworksCount: number
  analytics: {
    totalEvents: number
    uniqueUsers: number
    monthlyActiveUsers: number
    topEvents: Array<{ event: string; count: number }>
  } | null
}

const Dashboard = ({ artworksCount, analytics }: DashboardProps) => {
    return (
            <div className="flex flex-grow flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 py-6 md:gap-8">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's an overview of your portfolio.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Artworks</CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums">
                  {artworksCount}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <IconPalette className="size-3.5" />
                  <span>In your collection</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Events</CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums">
                  {analytics?.totalEvents.toLocaleString() || "0"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <IconActivity className="size-3.5" />
                  <span>Tracked by PostHog</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Unique Visitors</CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums">
                  {analytics?.uniqueUsers.toLocaleString() || "0"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <IconUsers className="size-3.5" />
                  <span>Last 30 days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Monthly Active Users</CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums">
                  {analytics?.monthlyActiveUsers.toLocaleString() || "0"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <IconTrendingUp className="size-3.5" />
                  <span>This month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
                        <div className="px-4 lg:px-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link href="/protected/artworks?action=create">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconPlus className="size-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">New Artwork</span>
                      <span className="text-muted-foreground text-xs">Add to collection</span>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link href="/protected/pages?action=create">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconFileText className="size-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">New Page</span>
                      <span className="text-muted-foreground text-xs">Create content</span>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link href="/protected/media">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconPhoto className="size-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Media Library</span>
                      <span className="text-muted-foreground text-xs">Manage files</span>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link href="/protected/analytics">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconChartBar className="size-5 text-primary" />
                        </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Analytics</span>
                      <span className="text-muted-foreground text-xs">View insights</span>
                    </div>
                </div>
                </Link>
              </Button>
            </div>
          </div>

          {/* Recent Activity & Top Events */}
          <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-2 lg:px-6">
            {/* Portfolio Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Overview</CardTitle>
                <CardDescription>Quick access to your content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/protected/artworks" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <IconPalette className="size-4" />
                    </div>
                    <div>
                      <div className="font-medium">Artworks</div>
                      <div className="text-muted-foreground text-sm">{artworksCount} items</div>
                    </div>
                  </div>
                  <IconArrowRight className="size-4 text-muted-foreground" />
                </Link>

                <Link href="/protected/collections" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <IconFolders className="size-4" />
                    </div>
                    <div>
                      <div className="font-medium">Collections</div>
                      <div className="text-muted-foreground text-sm">Organize artworks</div>
                    </div>
                  </div>
                  <IconArrowRight className="size-4 text-muted-foreground" />
                </Link>

                <Link href="/protected/exhibitions" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <IconCalendar className="size-4" />
                    </div>
                    <div>
                      <div className="font-medium">Exhibitions</div>
                      <div className="text-muted-foreground text-sm">Showcase your work</div>
                    </div>
                  </div>
                  <IconArrowRight className="size-4 text-muted-foreground" />
                </Link>

                <Link href="/protected/performances" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <IconMicrophone className="size-4" />
                    </div>
                    <div>
                      <div className="font-medium">Performances</div>
                      <div className="text-muted-foreground text-sm">Manage events</div>
                    </div>
                  </div>
                  <IconArrowRight className="size-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>

            {/* Top Events from PostHog */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Top Events</CardTitle>
                    <CardDescription>Most tracked interactions</CardDescription>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/protected/analytics">
                      View All
                      <IconArrowRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {analytics && analytics.topEvents.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topEvents.slice(0, 5).map((event, index) => (
                      <div key={event.event} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="flex size-7 items-center justify-center rounded-full bg-background font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="font-medium">{event.event}</div>
                        </div>
                        <Badge variant="secondary" className="tabular-nums">
                          {event.count.toLocaleString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <IconActivity className="size-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">
                      No events tracked yet
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Start tracking events on your frontend
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    )
}

export default Dashboard


