"use client"

import { usePathname } from "next/navigation"
import { IconPencil } from "@tabler/icons-react"

interface EditOnGitHubProps {
  githubUrl?: string
  branch?: string
}

export function EditOnGitHub({ 
  githubUrl,
  branch = "main" 
}: EditOnGitHubProps) {
  const pathname = usePathname()
  
  // Map pathname to file path
  // e.g., /docs -> app/docs/page.mdx
  // e.g., /docs/installation -> app/docs/installation/page.mdx
  const getFilePath = (path: string): string => {
    if (path === "/docs") {
      return "app/docs/page.mdx"
    }
    // Remove leading /docs and add app/docs prefix and /page.mdx suffix
    const pathWithoutDocs = path.replace(/^\/docs/, "")
    if (pathWithoutDocs === "") {
      return "app/docs/page.mdx"
    }
    return `app/docs${pathWithoutDocs}/page.mdx`
  }

  const filePath = getFilePath(pathname || "/docs")
  
  // Default GitHub URL - can be overridden via env var or prop
  const defaultGithubUrl = 
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_GITHUB_REPO_URL) ||
    "https://github.com/rashodkorala/rashodkorala-cms"
  
  const repoUrl = githubUrl || defaultGithubUrl
  const editUrl = `${repoUrl}/edit/${branch}/${filePath}`

  return (
    <div className="mt-8 pt-6 border-t">
      <a
        href={editUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <IconPencil className="h-4 w-4" />
        <span>Edit this page on GitHub</span>
      </a>
    </div>
  )
}

