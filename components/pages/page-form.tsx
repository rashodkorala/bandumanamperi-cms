"use client"

import { useState, useEffect } from "react"
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
import type { Page, PageContentType, PageInsert, PageStatus } from "@/lib/types/page"
import { createPage, updatePage } from "@/lib/actions/pages"
import Image from "next/image"

interface PageFormProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  editingPage: Page | null
  allPages: Page[]
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

export function PageForm({ isOpen, onClose, editingPage, allPages }: PageFormProps) {
  const supabase = createClient()
  const isEditing = !!editingPage

  const [formData, setFormData] = useState<PageInsert>({
    title: "",
    slug: "",
    content: "",
    contentType: "html",
    template: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    featuredImageUrl: "",
    status: "draft",
    parentId: null,
    sortOrder: 0,
    isHomepage: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [keywordInput, setKeywordInput] = useState("")

  useEffect(() => {
    if (editingPage) {
      setFormData({
        title: editingPage.title,
        slug: editingPage.slug,
        content: editingPage.content,
        contentType: editingPage.contentType,
        template: editingPage.template || "",
        metaTitle: editingPage.metaTitle || "",
        metaDescription: editingPage.metaDescription || "",
        metaKeywords: editingPage.metaKeywords || [],
        featuredImageUrl: editingPage.featuredImageUrl || "",
        status: editingPage.status,
        parentId: editingPage.parentId,
        sortOrder: editingPage.sortOrder,
        isHomepage: editingPage.isHomepage,
      })
      setSelectedFile(null)
      setPreviewUrl(editingPage.featuredImageUrl || null)
    } else {
      setFormData({
        title: "",
        slug: "",
        content: "",
        contentType: "html",
        template: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: [],
        featuredImageUrl: "",
        status: "draft",
        parentId: null,
        sortOrder: 0,
        isHomepage: false,
      })
      setSelectedFile(null)
      setPreviewUrl(null)
    }
    setKeywordInput("")
  }, [editingPage, isOpen])

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

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        metaKeywords: [...(prev.metaKeywords || []), keywordInput.trim()],
      }))
      setKeywordInput("")
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      metaKeywords: (prev.metaKeywords || []).filter((k) => k !== keyword),
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
        const filePath = `pages/${uniqueName}`
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

      if (isEditing && editingPage) {
        await updatePage({
          id: editingPage.id,
          ...formData,
          featuredImageUrl,
        })
        toast.success("Page updated successfully")
      } else {
        await createPage({
          ...formData,
          slug: formData.slug || slugify(formData.title),
          featuredImageUrl,
        })
        toast.success("Page created successfully")
      }

      onClose(true)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save page"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const availableParentPages = allPages.filter((p) => p.id !== editingPage?.id)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Page" : "New Page"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update your website page" : "Create a new page for your website"}
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
            <p className="text-xs text-muted-foreground mt-1">
              URL path: /{formData.slug || "page-slug"}
            </p>
          </div>

          <div>
            <Label htmlFor="contentType">Content Type *</Label>
            <Select
              value={formData.contentType}
              onValueChange={(value) => setFormData({ ...formData, contentType: value as PageContentType })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="json">JSON (Page Builder)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              disabled={isLoading}
              rows={12}
              placeholder={formData.contentType === "html" ? "Enter HTML content" : formData.contentType === "markdown" ? "Enter Markdown content" : "Enter JSON for page builder"}
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="template">Template</Label>
            <Input
              id="template"
              value={formData.template || ""}
              onChange={(e) => setFormData({ ...formData, template: e.target.value })}
              disabled={isLoading}
              placeholder="e.g., default, landing, blog"
            />
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
                onValueChange={(value) => setFormData({ ...formData, status: value as PageStatus })}
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
              <Label htmlFor="parentId">Parent Page</Label>
              <Select
                value={formData.parentId || "none"}
                onValueChange={(value) => setFormData({ ...formData, parentId: value === "none" ? null : value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (Top Level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {availableParentPages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder || 0}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>SEO Settings</Label>
            <div>
              <Label htmlFor="metaTitle" className="text-sm">Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle || ""}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                disabled={isLoading}
                placeholder="SEO optimized title"
              />
            </div>
            <div>
              <Label htmlFor="metaDescription" className="text-sm">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription || ""}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                disabled={isLoading}
                rows={2}
                placeholder="Meta description for search engines"
              />
            </div>
            <div>
              <Label className="text-sm">Meta Keywords</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddKeyword()
                    }
                  }}
                  placeholder="Add a keyword"
                  disabled={isLoading}
                />
                <Button type="button" onClick={handleAddKeyword} disabled={isLoading}>
                  Add
                </Button>
              </div>
              {formData.metaKeywords && formData.metaKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.metaKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isHomepage"
              checked={formData.isHomepage}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isHomepage: checked as boolean })
              }
              disabled={isLoading}
            />
            <Label htmlFor="isHomepage" className="cursor-pointer">
              Set as Homepage
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

