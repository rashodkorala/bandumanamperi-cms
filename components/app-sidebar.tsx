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
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
// import Image from "next/image"
// import logo from "@/public/images/logo.jpg"
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/protected/dashboard",
      icon: IconDashboard,
    },
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
      title: "Photos",
      url: "/protected/photos",
      icon: IconPhoto,
    },
    {
      title: "Blog",
      url: "/protected/content",
      icon: IconFileDescription,
    },
    {
      title: "Pages",
      url: "/protected/pages",
      icon: IconListDetails,
      comingSoon: true,
    },
    {
      title: "Analytics",
      url: "/protected/analytics",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: "Documentation",
      url: "/docs",
      icon: IconBook,
    },
    {
      title: "Settings",
      url: "/protected/settings",
      icon: IconSettings,
    }
  ],
}

export function AppSidebar({
  collapsible = "offcanvas",
  variant = "inset",
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible={collapsible} variant={variant} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              {/* <Image src={logo} alt="logo" width={32} height={32} /> */}
              <span className="text-base font-semibold">Rashod korala</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
