"use client"

import { useState, useEffect } from "react"
import { IconDotsVertical, IconEdit, IconHome, IconPlus, IconRefresh, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageForm } from "./page-form"
import type { Page } from "@/lib/types/page"
import { deletePage } from "@/lib/actions/pages"
import { cn } from "@/lib/utils"

interface PagesProps {
  initialPages: Page[]
}

const statusColors = {
  draft: "secondary",
  published: "default",
  archived: "outline",
} as const

export function Pages({ initialPages }: PagesProps) {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>(initialPages)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    setPages(initialPages)
  }, [initialPages])

  const filteredPages = statusFilter === "all"
    ? pages
    : pages.filter((p) => p.status === statusFilter)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) {
      return
    }

    try {
      await deletePage(id)
      setPages(pages.filter((p) => p.id !== id))
      toast.success("Page deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete page"
      )
    }
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setIsFormOpen(true)
  }

  const handleNewPage = () => {
    setEditingPage(null)
    setIsFormOpen(true)
  }

  const handleFormClose = (shouldRefresh: boolean = true) => {
    setIsFormOpen(false)
    setEditingPage(null)
    if (shouldRefresh) {
      router.refresh()
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const stats = {
    total: pages.length,
    published: pages.filter((p) => p.status === "published").length,
    draft: pages.filter((p) => p.status === "draft").length,
    homepage: pages.filter((p) => p.isHomepage).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground">
            Create and manage website pages
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <IconRefresh className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={handleNewPage}>
            <IconPlus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
          </CardHeader>
          <CardDescription className="text-2xl font-bold">{stats.total}</CardDescription>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardDescription className="text-2xl font-bold">{stats.published}</CardDescription>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardDescription className="text-2xl font-bold">{stats.draft}</CardDescription>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Homepage</CardTitle>
          </CardHeader>
          <CardDescription className="text-2xl font-bold">{stats.homepage}</CardDescription>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          All
        </Button>
        <Button
          variant={statusFilter === "published" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("published")}
        >
          Published
        </Button>
        <Button
          variant={statusFilter === "draft" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("draft")}
        >
          Drafts
        </Button>
        <Button
          variant={statusFilter === "archived" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("archived")}
        >
          Archived
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Homepage</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell className="font-mono text-sm">{page.slug}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[page.status]}>
                    {page.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{page.contentType}</Badge>
                </TableCell>
                <TableCell>
                  {page.isHomepage && (
                    <IconHome className="h-4 w-4 text-primary" />
                  )}
                </TableCell>
                <TableCell>
                  {page.publishedAt
                    ? new Date(page.publishedAt).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(page)}>
                        <IconEdit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(page.id)}
                      >
                        <IconTrash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-12">
          <IconHome className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No pages found</p>
          <Button onClick={handleNewPage} className="mt-4">
            <IconPlus className="h-4 w-4 mr-2" />
            Create Your First Page
          </Button>
        </div>
      )}

      <PageForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editingPage={editingPage}
        allPages={pages}
      />
    </div>
  )
}

