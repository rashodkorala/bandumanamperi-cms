"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconUsers, IconClick, IconTrendingUp, IconActivity } from "@tabler/icons-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface PostHogAnalyticsProps {
  summary: {
    totalEvents: number
    uniqueUsers: number
    topEvents: Array<{ event: string; count: number }>
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
  } | null
  insights?: any[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function PostHogAnalytics({ summary, insights = [] }: PostHogAnalyticsProps) {
  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
        <div className="text-center">
          <IconActivity className="mx-auto size-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">PostHog Not Configured</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Add your PostHog credentials to .env.local to see analytics data
          </p>
          <div className="mt-4 rounded-lg bg-muted p-4 text-left text-xs font-mono">
            <div>POSTHOG_PROJECT_ID=your_project_id</div>
            <div>POSTHOG_PERSONAL_API_KEY=your_api_key</div>
          </div>
        </div>
      </div>
    )
  }

  // Prepare data for charts
  const topEventsChartData = summary.topEvents.slice(0, 10).map((event) => ({
    name: event.event.length > 20 ? event.event.substring(0, 20) + '...' : event.event,
    fullName: event.event,
    count: event.count,
  }))

  const userActivityData = [
    { name: "Daily", users: summary.dailyActiveUsers, fill: "hsl(var(--chart-1))" },
    { name: "Weekly", users: summary.weeklyActiveUsers, fill: "hsl(var(--chart-2))" },
    { name: "Monthly", users: summary.monthlyActiveUsers, fill: "hsl(var(--chart-3))" },
  ]

  // Pie chart data for user distribution
  const totalUsers = summary.totalEvents
  const uniqueUsers = summary.uniqueUsers
  const returningUsers = totalUsers > uniqueUsers ? totalUsers - uniqueUsers : 0

  const userDistributionData = [
    { name: "Unique Users", value: uniqueUsers, fill: "hsl(var(--chart-1))" },
    { name: "Returning", value: returningUsers, fill: "hsl(var(--chart-2))" },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Events</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {summary.totalEvents.toLocaleString()}
            </CardTitle>
            <div className="pt-1">
              <Badge variant="outline">
                <IconActivity className="size-4" />
                Last 30 days
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Unique Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {summary.uniqueUsers.toLocaleString()}
            </CardTitle>
            <div className="pt-1">
              <Badge variant="outline">
                <IconUsers className="size-4" />
                Last 30 days
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Daily Active Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {summary.dailyActiveUsers.toLocaleString()}
            </CardTitle>
            <div className="pt-1">
              <Badge variant="outline">
                <IconTrendingUp className="size-4" />
                Today
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Monthly Active Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {summary.monthlyActiveUsers.toLocaleString()}
            </CardTitle>
            <div className="pt-1">
              <Badge variant="outline">
                <IconUsers className="size-4" />
                Last 30 days
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Events Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Events</CardTitle>
            <CardDescription>Most tracked events from PostHog</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.topEvents.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No events tracked yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topEventsChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100}
                    className="text-xs"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {payload[0].payload.fullName}
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[0].value?.toLocaleString()} events
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* User Activity Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Active users breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {payload[0].payload.name} Active Users
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].value?.toLocaleString()} users
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="users" radius={[8, 8, 0, 0]}>
                  {userActivityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution & Event Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Unique vs total interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {payload[0].name}
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[0].value?.toLocaleString()} 
                                  <span className="text-xs ml-1">
                                    ({((payload[0].value as number / totalUsers) * 100).toFixed(1)}%)
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Event Stats Table */}
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Top tracked events with counts</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.topEvents.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No events tracked yet
              </div>
            ) : (
              <div className="h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.topEvents.map((event, index) => (
                      <TableRow key={event.event}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="size-2 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-muted-foreground text-xs">#{index + 1}</span>
                            <span className="font-medium">{event.event}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {event.count.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Saved Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Insights</CardTitle>
            <CardDescription>Your PostHog insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">{insight.name}</div>
                    {insight.description && (
                      <div className="text-muted-foreground text-sm">
                        {insight.description}
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary">View</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

