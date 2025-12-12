"use client"

import { useState, useEffect } from "react"
import { IconDotsVertical, IconEdit, IconEye, IconFileText, IconPlus, IconRefresh, IconTrash } from "@tabler/icons-react"
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
import { BlogForm } from "./blog-form"
import type { Blog } from "@/lib/types/blog"
import { deleteBlog } from "@/lib/actions/blogs"
import { cn } from "@/lib/utils"

interface BlogsProps {
  initialBlogs: Blog[]
}

const statusColors = {
  draft: "secondary",
  published: "default",
  archived: "outline",
} as const

export function Blogs({ initialBlogs }: BlogsProps) {
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    setBlogs(initialBlogs)
  }, [initialBlogs])

  const filteredBlogs = statusFilter === "all"
    ? blogs
    : blogs.filter((b) => b.status === statusFilter)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) {
      return
    }

    try {
      await deleteBlog(id)
      setBlogs(blogs.filter((b) => b.id !== id))
      toast.success("Blog deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete blog"
      )
    }
  }

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog)
    setIsFormOpen(true)
  }

  const handleNewBlog = () => {
    setEditingBlog(null)
    setIsFormOpen(true)
  }

  const handleFormClose = (shouldRefresh: boolean = true) => {
    setIsFormOpen(false)
    setEditingBlog(null)
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
    total: blogs.length,
    published: blogs.filter((b) => b.status === "published").length,
    draft: blogs.filter((b) => b.status === "draft").length,
    views: blogs.reduce((sum, b) => sum + b.views, 0),
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage your blog content and articles
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
          <Button onClick={handleNewBlog}>
            <IconPlus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
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
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardDescription className="text-2xl font-bold">{stats.views}</CardDescription>
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
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBlogs.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell className="font-medium">{blog.title}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[blog.status]}>
                    {blog.status}
                  </Badge>
                </TableCell>
                <TableCell>{blog.category || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <IconEye className="h-4 w-4 text-muted-foreground" />
                    {blog.views}
                  </div>
                </TableCell>
                <TableCell>
                  {blog.publishedAt
                    ? new Date(blog.publishedAt).toLocaleDateString()
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
                      <DropdownMenuItem onClick={() => handleEdit(blog)}>
                        <IconEdit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(blog.id)}
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

      {filteredBlogs.length === 0 && (
        <div className="text-center py-12">
          <IconFileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No blog posts found</p>
          <Button onClick={handleNewBlog} className="mt-4">
            <IconPlus className="h-4 w-4 mr-2" />
            Create Your First Blog Post
          </Button>
        </div>
      )}

      <BlogForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editingBlog={editingBlog}
      />
    </div>
  )
}

