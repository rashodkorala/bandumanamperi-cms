import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconPalette, IconChartBar, IconPlus } from "@tabler/icons-react"
import Link from "next/link"

import data from "./data.json"

interface DashboardProps {
    artworksCount: number
    analytics: any
}

const Dashboard = ({ artworksCount }: DashboardProps) => {
    return (
        <>
            <div className="flex flex-grow flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        {/* Header */}
                        <div className="px-4 lg:px-6">
                            <h1 className="text-2xl font-semibold">Dashboard</h1>
                            <p className="text-muted-foreground text-sm">
                                Overview of your portfolio
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-6 @xl/main:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardDescription>Total Artworks</CardDescription>
                                    <CardTitle className="text-2xl font-semibold tabular-nums">
                                        {artworksCount}
                                    </CardTitle>
                                    <div className="pt-1">
                                        <Badge variant="outline">
                                            <IconPalette className="size-4" />
                                            Collection
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild variant="outline" size="sm" className="w-full">
                                        <Link href="/protected/artworks?action=create">
                                            <IconPlus className="size-4" />
                                            Add Artwork
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardDescription>Analytics</CardDescription>
                                    <CardTitle className="text-lg">PostHog Analytics</CardTitle>
                                    <div className="pt-1">
                                        <Badge variant="outline">
                                            <IconChartBar className="size-4" />
                                            Powered by PostHog
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild variant="outline" size="sm" className="w-full">
                                        <Link href="/protected/analytics">
                                            <IconChartBar className="size-4" />
                                            View Analytics
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardDescription>Quick Actions</CardDescription>
                                    <CardTitle className="text-lg">Manage Content</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href="/protected/pages">Pages</Link>
                                    </Button>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href="/protected/media">Media</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Data Table */}
                        <DataTable data={data} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard


