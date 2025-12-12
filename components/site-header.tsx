"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { IconBrandGithub } from "@tabler/icons-react"
import Link from "next/link"

function getPageTitle(pathname: string): string {
  // Remove leading slash and split by '/'
  const segments = pathname.split("/").filter(Boolean)

  // If we're at /protected, show Dashboard
  if (segments.length === 1 && segments[0] === "protected") {
    return "Dashboard"
  }

  // Get the last segment (the page name)
  const pageName = segments[segments.length - 1]

  // Map path segments to readable titles
  const titleMap: Record<string, string> = {
    dashboard: "Dashboard",
    projects: "Projects",
    photos: "Photos",
    content: "Content",
    media: "Media",
    pages: "Pages",
    analytics: "Analytics",
    tags: "Tags",
    settings: "Settings",
  }

  // Return mapped title or capitalize the page name
  return titleMap[pageName] || pageName.charAt(0).toUpperCase() + pageName.slice(1)
}

export function SiteHeader() {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear"
      style={
        {
          height: "var(--header-height, 3.5rem)",
        } as React.CSSProperties
      }
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <Link href="https://github.com/rashodkorala" target="_blank">
              <IconBrandGithub className="size-4" />
              GitHub
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
