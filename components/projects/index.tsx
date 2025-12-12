"use client"

import { useState, useEffect } from "react"
import {
  IconDotsVertical,
  IconEdit,
  IconFolder,
  IconPlus,
  IconRefresh,
  IconStar,
  IconTrash,
  IconCopy,
  IconEye,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProjectForm } from "./project-form"
import { ProjectPreview } from "./project-preview"
import type { Project, ProjectCategory, ProjectStatus } from "@/lib/types/project"
import { deleteProject, duplicateProject } from "@/lib/actions/projects"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ProjectsProps {
  initialProjects: Project[]
}

const Projects = ({ initialProjects }: ProjectsProps) => {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [previewProject, setPreviewProject] = useState<Project | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Sync state when initialProjects changes (after refresh)
  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    if (statusFilter !== "all" && project.status !== statusFilter) {
      return false
    }
    if (categoryFilter !== "all" && project.category !== categoryFilter) {
      return false
    }
    return true
  })

  // Sort by sort_order then updated_at desc
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return
    }

    try {
      await deleteProject(id)
      setProjects(projects.filter((p) => p.id !== id))
      toast.success("Project deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete project"
      )
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateProject(id)
      toast.success("Project duplicated successfully")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to duplicate project"
      )
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsFormOpen(true)
  }

  const handlePreview = (project: Project) => {
    setPreviewProject(project)
    setIsPreviewOpen(true)
  }

  const handleNewProject = () => {
    setEditingProject(null)
    setIsFormOpen(true)
  }

  const handleFormClose = (shouldRefresh: boolean = true) => {
    setIsFormOpen(false)
    setEditingProject(null)
    if (shouldRefresh) {
      router.refresh()
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      router.refresh()
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success("Data refreshed")
    } catch {
      toast.error("Failed to refresh data")
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusBadgeColor = (status: ProjectStatus) => {
    switch (status) {
      case "published":
        return "text-green-600 dark:text-green-400"
      case "draft":
        return "text-yellow-600 dark:text-yellow-400"
      case "archived":
        return "text-gray-600 dark:text-gray-400"
      default:
        return ""
    }
  }

  const categories: ProjectCategory[] = ["startup", "client", "personal", "school"]
  const statuses: ProjectStatus[] = ["draft", "published", "archived"]

  return (
    <div className="flex flex-grow flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Stats Card */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardDescription>Total Projects</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {projects.length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Projects Table */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">All Projects</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your portfolio projects
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                >
                  <IconRefresh
                    className={cn("size-4", isRefreshing && "animate-spin")}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button onClick={handleNewProject}>
                  <IconPlus className="size-4" />
                  New Project
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <div className="flex flex-col gap-2 w-48">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 w-48">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Updated At</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProjects.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No projects found. Click &quot;New Project&quot; to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconFolder className="size-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{project.title}</div>
                              {project.subtitle && (
                                <div className="text-sm text-muted-foreground">
                                  {project.subtitle ?? ""}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {project.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeColor(project.status)}
                          >
                            {project.status.charAt(0).toUpperCase() +
                              project.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.category ? (
                            <Badge variant="outline">
                              {project.category.charAt(0).toUpperCase() +
                                project.category.slice(1)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {project.featured && (
                            <IconStar className="size-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {project.sortOrder}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                size="icon"
                              >
                                <IconDotsVertical />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => handlePreview(project)}>
                                <IconEye className="size-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(project)}>
                                <IconEdit className="size-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(project.id)}
                              >
                                <IconCopy className="size-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(project.id)}
                              >
                                <IconTrash className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      <ProjectForm
        project={editingProject}
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleFormClose()
          } else {
            setIsFormOpen(true)
          }
        }}
      />
      <ProjectPreview
        project={previewProject}
        open={isPreviewOpen}
        onOpenChange={(open) => {
          setIsPreviewOpen(open)
          if (!open) {
            setPreviewProject(null)
          }
        }}
      />
    </div>
  )
}

export default Projects
