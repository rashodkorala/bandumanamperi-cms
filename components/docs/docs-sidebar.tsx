"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconBook } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const docsSections = [
  {
    title: "Getting Started",
    items: [
      {
        title: "Overview",
        href: "/protected/docs",
      },
      {
        title: "Installation",
        href: "/protected/docs/installation",
      },
      {
        title: "Environment Setup",
        href: "/protected/docs/environment",
      },
    ],
  },
  {
    title: "Database",
    items: [
      {
        title: "Projects Table",
        href: "/protected/docs/database/projects",
      },
      {
        title: "Photos Table",
        href: "/protected/docs/database/photos",
      },
      {
        title: "Analytics Table",
        href: "/protected/docs/database/analytics",
      },
      {
        title: "Migrations",
        href: "/protected/docs/database/migrations",
      },
    ],
  },
  {
    title: "Storage",
    items: [
      {
        title: "Photos Bucket",
        href: "/protected/docs/storage/photos",
      },
      {
        title: "Projects Bucket",
        href: "/protected/docs/storage/projects",
      },
    ],
  },
  {
    title: "Features",
    items: [
      {
        title: "Projects",
        href: "/protected/docs/features/projects",
      },
      {
        title: "Photography",
        href: "/protected/docs/features/photography",
      },
      {
        title: "Analytics",
        href: "/protected/docs/features/analytics",
      },
      {
        title: "AI Analysis",
        href: "/protected/docs/features/ai-analysis",
      },
    ],
  },
  {
    title: "Integration",
    items: [
      {
        title: "Frontend Tracking",
        href: "/protected/docs/integration/tracking",
      },
      {
        title: "API Reference",
        href: "/protected/docs/integration/api",
      },
    ],
  },
]

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/40 p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <IconBook className="h-5 w-5" />
          Documentation
        </h2>
      </div>
      <nav className="space-y-6">
        {docsSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-3 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {item.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

