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
import type { MediaItem, MediaInsert, MediaUpdate } from "@/lib/types/media"
import { createMedia, updateMedia } from "@/lib/actions/media"
import Image from "next/image"
interface MediaFormProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  editingMedia: MediaItem | null
}

const generateUniqueName = (file: File) => {
  const extension = file.name.split(".").pop() ?? ""
  const randomPart = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  return `${randomPart}.${extension}`
}

const getFileType = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("video/")) return "video"
  if (mimeType.startsWith("audio/")) return "audio"
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("word")) return "document"
  return "other"
}

export function MediaForm({ isOpen, onClose, editingMedia }: MediaFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!editingMedia

  const [formData, setFormData] = useState<MediaInsert>({
    title: "",
    description: "",
    fileUrl: "",
    fileType: "image",
    fileSize: null,
    mimeType: null,
    altText: "",
    tags: [],
    folder: "",
    featured: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (editingMedia) {
      setFormData({
        title: editingMedia.title,
        description: editingMedia.description || "",
        fileUrl: editingMedia.fileUrl,
        fileType: editingMedia.fileType,
        fileSize: editingMedia.fileSize,
        mimeType: editingMedia.mimeType,
        altText: editingMedia.altText || "",
        tags: editingMedia.tags || [],
        folder: editingMedia.folder || "",
        featured: editingMedia.featured,
      })
      setSelectedFile(null)
      setPreviewUrl(editingMedia.fileType === "image" ? editingMedia.fileUrl : null)
    } else {
      setFormData({
        title: "",
        description: "",
        fileUrl: "",
        fileType: "image",
        fileSize: null,
        mimeType: null,
        altText: "",
        tags: [],
        folder: "",
        featured: false,
      })
      setSelectedFile(null)
      setPreviewUrl(null)
    }
    setTagInput("")
  }, [editingMedia, isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB")
      return
    }

    setSelectedFile(file)
    setFormData((prev) => ({
      ...prev,
      fileType: getFileType(file.type) as any,
      fileSize: file.size,
      mimeType: file.type,
      title: prev.title || file.name.split(".")[0],
    }))

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
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
      let fileUrl = formData.fileUrl

      // Upload file if new file is selected
      if (selectedFile) {
        const uniqueName = generateUniqueName(selectedFile)
        // Use folder path if specified, otherwise upload to root
        const filePath = formData.folder ? `${formData.folder}/${uniqueName}` : uniqueName
        
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, selectedFile)

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from("media")
          .getPublicUrl(filePath)

        fileUrl = publicUrl
      }

      if (isEditing && editingMedia) {
        await updateMedia({
          id: editingMedia.id,
          ...formData,
          fileUrl,
        })
        toast.success("Media updated successfully")
      } else {
        await createMedia({
          ...formData,
          fileUrl,
        })
        toast.success("Media uploaded successfully")
      }

      onClose(true)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save media"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Media" : "Upload Media"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update media file information" : "Upload a new media file to your library"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">File {!isEditing && "*"}</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              disabled={isLoading}
              className="mt-1"
            />
            {previewUrl && (
              <div className="mt-2">
                <Image
                  src={previewUrl as string}
                  alt="Preview"
                  className="max-w-full h-48 object-contain rounded-lg border"
                  width={100}
                  height={100}
                />
              </div>
            )}
            {!isEditing && !selectedFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Select a file to upload (max 50MB)
              </p>
            )}
          </div>

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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="fileType">File Type *</Label>
            <Select
              value={formData.fileType}
              onValueChange={(value) => setFormData({ ...formData, fileType: value as any })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="altText">Alt Text</Label>
            <Input
              id="altText"
              value={formData.altText || ""}
              onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
              disabled={isLoading}
              placeholder="Accessibility description"
            />
          </div>

          <div>
            <Label htmlFor="folder">Folder</Label>
            <Select
              value={formData.folder || ""}
              onValueChange={(value) => setFormData({ ...formData, folder: value || null })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="blog-images">Blog Images</SelectItem>
                <SelectItem value="assets">Assets</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Organize files by category. Photos go to "photography", project images to "projects", etc.
            </p>
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
              Featured
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || (!isEditing && !selectedFile)}>
              {isLoading ? "Saving..." : isEditing ? "Update" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

