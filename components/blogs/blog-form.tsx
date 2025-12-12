"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { Blog, BlogInsert, BlogUpdate } from "@/lib/types/blog"
import { createBlog, updateBlog } from "@/lib/actions/blogs"
import Image from "next/image"

interface BlogFormProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  editingBlog: Blog | null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

const generateUniqueName = (file: File) => {
  const extension = file.name.split(".").pop() ?? ""
  const randomPart = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  return `${randomPart}.${extension}`
}

export function BlogForm({ isOpen, onClose, editingBlog }: BlogFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!editingBlog

  const [formData, setFormData] = useState<BlogInsert>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImageUrl: "",
    status: "draft",
    authorName: "",
    category: "",
    tags: [],
    seoTitle: "",
    seoDescription: "",
    featured: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (editingBlog) {
      setFormData({
        title: editingBlog.title,
        slug: editingBlog.slug,
        excerpt: editingBlog.excerpt || "",
        content: editingBlog.content,
        featuredImageUrl: editingBlog.featuredImageUrl || "",
        status: editingBlog.status,
        authorName: editingBlog.authorName || "",
        category: editingBlog.category || "",
        tags: editingBlog.tags || [],
        seoTitle: editingBlog.seoTitle || "",
        seoDescription: editingBlog.seoDescription || "",
        featured: editingBlog.featured,
      })
      setSelectedFile(null)
      setPreviewUrl(editingBlog.featuredImageUrl || null)
    } else {
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        featuredImageUrl: "",
        status: "draft",
        authorName: "",
        category: "",
        tags: [],
        seoTitle: "",
        seoDescription: "",
        featured: false,
      })
      setSelectedFile(null)
      setPreviewUrl(null)
    }
    setTagInput("")
  }, [editingBlog, isOpen])

  useEffect(() => {
    if (!isEditing && formData.title && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }))
    }
  }, [formData.title, isEditing])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB")
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tag),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let featuredImageUrl = formData.featuredImageUrl

      // Upload featured image if new file is selected
      if (selectedFile) {
        const uniqueName = generateUniqueName(selectedFile)
        const filePath = `blog-images/${uniqueName}`
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, selectedFile)

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from("media")
          .getPublicUrl(filePath)

        featuredImageUrl = publicUrl
      }

      if (isEditing && editingBlog) {
        await updateBlog({
          id: editingBlog.id,
          ...formData,
          featuredImageUrl,
        })
        toast.success("Blog updated successfully")
      } else {
        await createBlog({
          ...formData,
          slug: formData.slug || slugify(formData.title),
          featuredImageUrl,
        })
        toast.success("Blog created successfully")
      }

      onClose(true)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save blog"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Blog Post" : "New Blog Post"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update your blog post" : "Create a new blog post"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
              required
              disabled={isLoading}
              placeholder="auto-generated-from-title"
            />
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt || ""}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              disabled={isLoading}
              rows={2}
              placeholder="Brief description of the post"
            />
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              disabled={isLoading}
              rows={20}
              className="font-mono text-sm"
              placeholder="Write your blog post content here (supports Markdown)

Example:
# Heading
## Subheading
**Bold text** and *italic text*
- List item 1
- List item 2

[Link text](https://example.com)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supports Markdown formatting. Use # for headings, ** for bold, * for italic, etc.
            </p>
          </div>

          <div>
            <Label htmlFor="featuredImage">Featured Image</Label>
            <Input
              id="featuredImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
              className="mt-1"
            />
            {previewUrl && (
              <div className="mt-2">
                <Image
                  src={previewUrl as string}
                  alt="Featured"
                  className="max-w-full h-48 object-cover rounded-lg border"
                  width={100}
                  height={100}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={isLoading}
                placeholder="e.g., Technology, Design"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="authorName">Author Name</Label>
            <Input
              id="authorName"
              value={formData.authorName || ""}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Add a tag"
                disabled={isLoading}
              />
              <Button type="button" onClick={handleAddTag} disabled={isLoading}>
                Add
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>SEO Settings</Label>
            <div>
              <Label htmlFor="seoTitle" className="text-sm">SEO Title</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle || ""}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                disabled={isLoading}
                placeholder="SEO optimized title"
              />
            </div>
            <div>
              <Label htmlFor="seoDescription" className="text-sm">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={formData.seoDescription || ""}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                disabled={isLoading}
                rows={2}
                placeholder="Meta description for search engines"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, featured: checked as boolean })
              }
              disabled={isLoading}
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Featured Post
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

