"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    if (headings.length === 0) return

    const updateActiveHeading = () => {
      const scrollPosition = window.scrollY + 100 // Offset for header

      // Find the heading that's currently in view
      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id)
        if (element) {
          const elementTop = element.offsetTop
          if (elementTop <= scrollPosition) {
            setActiveId(headings[i].id)
            return
          }
        }
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the heading that's currently most visible
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)
        if (visibleEntries.length > 0) {
          // Sort by intersection ratio and position
          const sorted = visibleEntries.sort((a, b) => {
            const ratioDiff = b.intersectionRatio - a.intersectionRatio
            if (ratioDiff !== 0) return ratioDiff
            return a.boundingClientRect.top - b.boundingClientRect.top
          })
          setActiveId(sorted[0].target.id)
        }
      },
      {
        rootMargin: "-100px 0px -80% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    )

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null)

    elements.forEach((element) => observer.observe(element))

    // Also update on scroll for better responsiveness
    window.addEventListener("scroll", updateActiveHeading, { passive: true })
    updateActiveHeading() // Initial update

    return () => {
      elements.forEach((element) => observer.unobserve(element))
      window.removeEventListener("scroll", updateActiveHeading)
    }
  }, [headings])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = 80 // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })

      // Update URL without scrolling
      window.history.pushState(null, "", `#${id}`)
    }
  }

  if (headings.length === 0) return null

  return (
    <nav className="w-64 border-l p-6">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          On this page
        </h3>
        <ul className="space-y-2">
          {headings.map((heading, index) => (
            <li key={`${heading.id}-${index}`}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={cn(
                  "block text-sm transition-colors hover:text-foreground cursor-pointer",
                  heading.level === 1 && "font-semibold",
                  heading.level === 2 && "pl-4",
                  heading.level === 3 && "pl-8 text-muted-foreground",
                  activeId === heading.id
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

