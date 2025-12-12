"use client"

import * as React from "react"
import {
    IconChartBar,
    IconDashboard,
    IconPhoto,
} from "@tabler/icons-react"
import { NavMain } from "@/components/nav-main"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb"
import { Alert, AlertDescription, AlertTitle } from "@/components/docs/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const demoNavItems = [
    {
        title: "Dashboard",
        url: "/demo",
        icon: IconDashboard,
    },
    {
        title: "Photos",
        url: "/demo/photos",
        icon: IconPhoto,
    },
]

export default function DemoLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                className="data-[slot=sidebar-menu-button]:!p-1.5"
                            >
                                <Link href="/demo">
                                    <span className="text-base font-semibold">CMS Demo</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <NavMain items={demoNavItems} />
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink asChild>
                                    <Link href="/demo">Demo</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="ml-auto flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            Demo Mode
                        </Badge>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="mx-auto w-full max-w-7xl">
                        <Alert variant="info" className="mb-4">
                            <AlertTitle>Demo Mode</AlertTitle>
                            <AlertDescription>
                                This is a fully functional demo. All data is stored locally in your browser.{" "}
                                <Link href="/auth/sign-up" className="underline font-medium">
                                    Sign up
                                </Link>{" "}
                                to use the full CMS with cloud storage.
                            </AlertDescription>
                        </Alert>
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

