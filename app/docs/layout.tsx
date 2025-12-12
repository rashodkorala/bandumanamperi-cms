"use client"

import { useEffect, useState, useRef } from "react"
import { DocsNav } from "@/components/docs/docs-nav"
import { TableOfContents } from "@/components/docs/table-of-contents"
import { EditOnGitHub } from "@/components/docs/edit-on-github"

interface Heading {
  id: string
  text: string
  level: number
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const extractHeadings = () => {
      // Only extract headings from the main content area (prose container)
      // This excludes headings from the navigation sidebar
      const contentContainer = contentRef.current
      if (!contentContainer) return

      const headingElements = contentContainer.querySelectorAll("h1, h2, h3")
      const extracted: Heading[] = []
      const idCounts = new Map<string, number>()

      headingElements.forEach((el) => {
        const text = el.textContent?.trim() || ""
        if (!text) return

        // Use existing ID if present, otherwise generate one
        let baseId = el.id
        if (!baseId) {
          baseId = slugify(text)
        }

        // Ensure unique IDs by appending a counter if needed
        let uniqueId = baseId
        const count = idCounts.get(baseId) || 0
        if (count > 0) {
          uniqueId = `${baseId}-${count}`
        }
        idCounts.set(baseId, count + 1)

        // Set ID if it doesn't match
        if (el.id !== uniqueId) {
          el.id = uniqueId
        }

        extracted.push({
          id: uniqueId,
          text: text,
          level: parseInt(el.tagName.charAt(1)),
        })
      })

      setHeadings(extracted)
    }

    // Extract headings after content loads
    const timer = setTimeout(extractHeadings, 200)

    // Re-extract on navigation and content changes
    const contentContainer = contentRef.current
    let observer: MutationObserver | null = null

    if (contentContainer) {
      observer = new MutationObserver(() => {
        setTimeout(extractHeadings, 100)
      })
      observer.observe(contentContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['id']
      })
    }

    return () => {
      clearTimeout(timer)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])

  return (
    <>
      <main className="@container/main flex flex-1 flex-col bg-background rounded-2xl">
        <div className="flex h-[calc(100vh-3.5rem)]">
          <DocsNav />
          <div className="flex-1 overflow-y-auto">
            <div className="container max-w-4xl mx-auto px-6 py-12">
              <div ref={contentRef} className="prose prose-slate dark:prose-invert max-w-none">
                {children}
              </div>
              <EditOnGitHub />
            </div>
          </div>
          {headings.length > 0 && (
            <div className="hidden xl:block">
              <TableOfContents headings={headings} />
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}
