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

      {/* Top Events */}
      <Card>
        <CardHeader>
          <CardTitle>Top Events</CardTitle>
          <CardDescription>Most tracked events from PostHog</CardDescription>
        </CardHeader>
        <CardContent>
          {summary.topEvents.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No events tracked yet
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

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

