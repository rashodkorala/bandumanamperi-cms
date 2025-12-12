"use client"

import { useEffect, useState } from "react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { demoStorage } from "@/lib/demo/storage"
import type { Photo } from "@/lib/types/photo"
import type { Project } from "@/lib/types/project"
import type { AnalyticsSummary } from "@/lib/types/analytics"

// Generate sample analytics data
function generateAnalytics(): AnalyticsSummary {
  const now = new Date()
  const dailyViews = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split("T")[0],
      views: Math.floor(Math.random() * 100) + 20,
    }
  })

  const totalPageviews = dailyViews.reduce((sum, day) => sum + day.views, 0)
  const uniqueVisitors = Math.floor(totalPageviews * 0.6) // Estimate 60% unique
  const uniqueSessions = Math.floor(uniqueVisitors * 1.2) // Some visitors have multiple sessions

  const topPages = [
    { path: "/", views: Math.floor(totalPageviews * 0.3) },
    { path: "/projects", views: Math.floor(totalPageviews * 0.25) },
    { path: "/photos", views: Math.floor(totalPageviews * 0.2) },
    { path: "/about", views: Math.floor(totalPageviews * 0.15) },
    { path: "/contact", views: Math.floor(totalPageviews * 0.1) },
  ]

  const topDomains = [
    { domain: "example.com", views: Math.floor(totalPageviews * 0.5) },
    { domain: "portfolio.example.com", views: Math.floor(totalPageviews * 0.3) },
    { domain: "blog.example.com", views: Math.floor(totalPageviews * 0.2) },
  ]

  const deviceBreakdown = [
    { device: "desktop", count: Math.floor(totalPageviews * 0.5) },
    { device: "mobile", count: Math.floor(totalPageviews * 0.4) },
    { device: "tablet", count: Math.floor(totalPageviews * 0.1) },
  ]

  return {
    totalPageviews,
    uniqueVisitors,
    uniqueSessions,
    topPages,
    topDomains,
    deviceBreakdown,
    dailyViews,
  }
}

export function DemoDashboard() {
  const [projectsCount, setProjectsCount] = useState(0)
  const [photosCount, setPhotosCount] = useState(0)
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)

  useEffect(() => {
    // Load counts from localStorage
    const photos = demoStorage.get<Photo[]>("photos", [])
    const projects = demoStorage.get<Project[]>("projects", [])
    
    setPhotosCount(photos.length)
    setProjectsCount(projects.length)
    setAnalytics(generateAnalytics())
  }, [])

  return (
    <div className="flex flex-grow flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards
            projectsCount={projectsCount}
            photosCount={photosCount}
            analytics={analytics}
          />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive analytics={analytics} />
          </div>
        </div>
      </div>
    </div>
  )
}

