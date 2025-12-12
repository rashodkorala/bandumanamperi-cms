"use client"

import { IconExternalLink, IconBrandGithub, IconFileText } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Project } from "@/lib/types/project"

interface ProjectPreviewProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectPreview({
  project,
  open,
  onOpenChange,
}: ProjectPreviewProps) {
  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Preview</DialogTitle>
          <DialogDescription>
            How this project will appear on your portfolio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cover Image */}
          {project.coverImageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.coverImageUrl}
                alt={project.title}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
          )}

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                {project.subtitle && (
                  <p className="text-xl text-muted-foreground mt-1">
                    {project.subtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {project.category && (
                  <Badge variant="outline">
                    {project.category.charAt(0).toUpperCase() +
                      project.category.slice(1)}
                  </Badge>
                )}
                {project.featured && (
                  <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">
                    Featured
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={
                    project.status === "published"
                      ? "text-green-600 dark:text-green-400"
                      : project.status === "draft"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-gray-600 dark:text-gray-400"
                  }
                >
                  {project.status.charAt(0).toUpperCase() +
                    project.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Links */}
          {(project.liveUrl || project.githubUrl || project.caseStudyUrl) && (
            <div className="flex flex-wrap gap-2">
              {project.liveUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconExternalLink className="size-4" />
                    Live Site
                  </a>
                </Button>
              )}
              {project.githubUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconBrandGithub className="size-4" />
                    GitHub
                  </a>
                </Button>
              )}
              {project.caseStudyUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a
                    href={project.caseStudyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconFileText className="size-4" />
                    Case Study
                  </a>
                </Button>
              )}
            </div>
          )}

          <Separator />

          {/* Problem & Solution */}
          {(project.problem || project.solution) && (
            <div className="space-y-4">
              {project.problem && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Problem</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {project.problem}
                  </p>
                </div>
              )}
              {project.solution && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Solution</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {project.solution}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Roles */}
          {project.roles && project.roles.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">My Role</h2>
              <div className="flex flex-wrap gap-2">
                {project.roles.map((role, index) => (
                  <Badge key={index} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Key Features</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {project.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech Stack */}
          {project.tech && project.tech.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech, index) => (
                  <Badge key={index} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {project.galleryImageUrls &&
            project.galleryImageUrls.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.galleryImageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden border bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`${project.title} screenshot ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}



