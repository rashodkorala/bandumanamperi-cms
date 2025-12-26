"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconFolder,
  IconListDetails,
  IconPhoto,
  IconSettings,
  IconBook,
  IconFolders,
  IconCalendar,
  IconMicrophone,
  IconFileText,
  IconPlus,
  IconSearch,
  IconLifebuoy,
} from "@tabler/icons-react"

import { NavGroup } from "@/components/nav-group"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
// import Image from "next/image"
// import logo from "@/public/images/logo.jpg"

const data = {
  main: [
    {
      title: "Dashboard",
      url: "/protected/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Analytics",
      url: "/protected/analytics",
      icon: IconChartBar,
    },
  ],
  portfolio: [
    {
      title: "Artworks",
      url: "/protected/artworks",
      icon: IconFolder,
    },
    {
      title: "Collections",
      url: "/protected/collections",
      icon: IconFolders,
    },
    {
      title: "Exhibitions",
      url: "/protected/exhibitions",
      icon: IconCalendar,
    },
    {
      title: "Performances",
      url: "/protected/performances",
      icon: IconMicrophone,
    },
  ],
  content: [
    {
      title: "Blog",
      url: "/protected/content",
      icon: IconFileDescription,
    },
    {
      title: "Pages",
      url: "/protected/pages",
      icon: IconListDetails,
    },
    {
      title: "Photos",
      url: "/protected/photos",
      icon: IconPhoto,
    },
    {
      title: "Media Library",
      url: "/protected/media",
      icon: IconFileText,
    },
  ],
  utilities: [
    {
      title: "Settings",
      url: "/protected/settings",
      icon: IconSettings,
    },
    {
      title: "Documentation",
      url: "/docs",
      icon: IconBook,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({
  collapsible = "icon",
  variant = "floating",
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible={collapsible} variant={variant} {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="mb-2">
              <Link href="/protected/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-lg font-bold">B</span>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Bandu Manamperi</span>
                  <span className="text-xs text-sidebar-foreground/70">
                    Portfolio CMS
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="w-full bg-sidebar-accent hover:bg-sidebar-accent/80">
              <Link href="/protected/artworks?action=create">
                <IconPlus className="h-4 w-4" />
                <span>Quick Create</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <div className="flex flex-col gap-1 py-2">
          <NavGroup items={data.main} showLabel={false} />
        </div>

        <div className="flex flex-col gap-1 py-2">
          <NavGroup title="Portfolio" items={data.portfolio} />
        </div>

        <div className="flex flex-col gap-1 py-2">
          <NavGroup title="Content" items={data.content} />
        </div>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t">
        <SidebarMenu>
          {data.utilities.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
