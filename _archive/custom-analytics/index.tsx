"use client"

import * as React from "react"
import { Cell, Pie, PieChart } from "recharts"
import { IconDeviceDesktop, IconDeviceMobile, IconDeviceTablet, IconTrendingUp, IconUsers, IconEye } from "@tabler/icons-react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { AnalyticsSummary } from "@/lib/types/analytics"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"

interface AnalyticsProps {
  initialAnalytics: AnalyticsSummary | null
}

const deviceChartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
  tablet: {
    label: "Tablet",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function Analytics({ initialAnalytics }: AnalyticsProps) {
  const [analytics, setAnalytics] = React.useState<AnalyticsSummary | null>(initialAnalytics)

  // Transform device breakdown for chart
  const deviceData = React.useMemo(() => {
    if (!analytics?.deviceBreakdown || Object.keys(analytics.deviceBreakdown).length === 0) {
      return []
    }

    return Object.entries(analytics.deviceBreakdown)
      .map(([device, count]) => ({
        device: device.charAt(0).toUpperCase() + device.slice(1),
        count: Number(count) || 0,
      }))
      .sort((a, b) => b.count - a.count)
  }, [analytics])

  const totalDeviceViews = deviceData.reduce((sum, item) => sum + item.count, 0)

  // Pie chart data
  const pieData = deviceData.map((item) => ({
    name: item.device,
    value: item.count,
    percentage: totalDeviceViews > 0 ? ((item.count / totalDeviceViews) * 100).toFixed(1) : "0",
  }))

  return (
    <div className="flex flex-grow flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-semibold">Analytics</h1>
            <p className="text-muted-foreground text-sm">
              Track your website performance and visitor insights
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-6 @xl/main:grid-cols-4">
            <Card>
              <CardHeader>
                <CardDescription>Total Pageviews</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {(analytics?.totalPageviews || 0).toLocaleString()}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <IconTrendingUp className="size-4" />
                    Last 30 days
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Artwork Views</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {(analytics?.totalArtworkViews || 0).toLocaleString()}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <IconEye className="size-4" />
                    Last 30 days
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Unique Visitors</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {(analytics?.uniqueVisitors || 0).toLocaleString()}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <IconUsers className="size-4" />
                    Last 30 days
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Unique Sessions</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {(analytics?.uniqueSessions || 0).toLocaleString()}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <IconUsers className="size-4" />
                    Last 30 days
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
          </div>

          {/* Pageviews Chart */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive analytics={analytics} />
          </div>

          {/* Device Breakdown and Top Content */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>
                  Distribution of visitors by device type
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deviceData.length === 0 ? (
                  <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                    No device data available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ChartContainer config={deviceChartConfig} className="h-[250px]">
                      <PieChart>
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload as typeof pieData[0]
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid gap-2">
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-muted-foreground text-sm">
                                        {data.name}
                                      </span>
                                      <span className="font-medium">{data.value}</span>
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                      {data.percentage}% of total
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ percentage }) => `${percentage}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                    <div className="flex flex-col justify-center gap-3">
                      {deviceData.map((item, index) => (
                        <div key={item.device} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.device === "Desktop" && <IconDeviceDesktop className="size-4" />}
                            {item.device === "Mobile" && <IconDeviceMobile className="size-4" />}
                            {item.device === "Tablet" && <IconDeviceTablet className="size-4" />}
                            <span className="text-sm font-medium">{item.device}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold tabular-nums">
                              {item.count.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              ({totalDeviceViews > 0 ? ((item.count / totalDeviceViews) * 100).toFixed(1) : "0"}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Artworks */}
            <Card>
              <CardHeader>
                <CardTitle>Top Artworks</CardTitle>
                <CardDescription>
                  Most viewed artworks in the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!analytics?.topArtworks || analytics.topArtworks.length === 0 ? (
                  <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                    No artwork views yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analytics.topArtworks.slice(0, 5).map((artwork, index) => (
                      <div
                        key={artwork.artworkId}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-muted font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{artwork.title}</span>
                            <span className="text-muted-foreground text-xs">
                              {artwork.views} {artwork.views === 1 ? "view" : "views"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Pages Table */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>
                  Most visited pages in the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!analytics?.topPages || analytics.topPages.length === 0 ? (
                  <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                    No pageview data available
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.topPages.map((page, index) => (
                        <TableRow key={page.path}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">#{index + 1}</span>
                              <span className="font-medium">{page.path}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {page.views.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

