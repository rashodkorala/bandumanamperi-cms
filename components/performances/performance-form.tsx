"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useErrorReport } from "@/hooks/use-error-report"
import { ErrorReportDialog } from "@/components/error-report-dialog"
import { parseStorageError } from "@/lib/utils/error-handler"
import Image from "next/image"
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
import { IconX, IconUpload } from "@tabler/icons-react"
import type {
  Performance,
  PerformanceInsert,
  PerformanceType,
  PerformanceStatus,
} from "@/lib/types/performance"
import {
  createPerformance,
  updatePerformance,
  deletePerformanceMedia,
  deletePerformanceCoverImage,
} from "@/lib/actions/performances"

interface PerformanceFormProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  editingPerformance: Performance | null
}

const generateUniqueName = (file: File) => {
  const extension = file.name.split(".").pop() ?? ""
  const randomPart =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${randomPart}.${extension}`
}

export function PerformanceForm({
  isOpen,
  onClose,
  editingPerformance,
}: PerformanceFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!editingPerformance
  const { isOpen: isErrorReportOpen, error: reportError, reportError: showErrorReport, closeDialog } = useErrorReport()

  const [formData, setFormData] = useState<PerformanceInsert>({
    title: "",
    description: "",
    venue: "",
    location: "",
    date: "",
    time: "",
    duration: "",
    type: "solo",
    category: "",
    director: "",
    choreographer: "",
    composer: "",
    collaborators: "",
    coverImage: null,
    media: [],
    videoUrl: "",
    about: "",
    programNotes: "",
    reviews: "",
    ticketsUrl: "",
    websiteUrl: "",
    slug: "",
    status: "draft",
    featured: false,
    tags: [],
    awards: "",
    audienceSize: null,
    sortOrder: 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null)
  const [selectedMediaFiles, setSelectedMediaFiles] = useState<File[]>([])
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (editingPerformance) {
      setFormData({
        title: editingPerformance.title,
        description: editingPerformance.description || "",
        venue: editingPerformance.venue || "",
        location: editingPerformance.location || "",
        date: editingPerformance.date || "",
        time: editingPerformance.time || "",
        duration: editingPerformance.duration || "",
        type: editingPerformance.type,
        category: editingPerformance.category || "",
        director: editingPerformance.director || "",
        choreographer: editingPerformance.choreographer || "",
        composer: editingPerformance.composer || "",
        collaborators: editingPerformance.collaborators || "",
        coverImage: editingPerformance.coverImage,
        media: editingPerformance.media || [],
        videoUrl: editingPerformance.videoUrl || "",
        about: editingPerformance.about || "",
        programNotes: editingPerformance.programNotes || "",
        reviews: editingPerformance.reviews || "",
        ticketsUrl: editingPerformance.ticketsUrl || "",
        websiteUrl: editingPerformance.websiteUrl || "",
        slug: editingPerformance.slug || "",
        status: editingPerformance.status,
        featured: editingPerformance.featured,
        tags: editingPerformance.tags || [],
        awards: editingPerformance.awards || "",
        audienceSize: editingPerformance.audienceSize,
        sortOrder: editingPerformance.sortOrder,
      })
      setSelectedCoverImage(null)
      setSelectedMediaFiles([])
      if (editingPerformance.coverImage) {
        const { data } = supabase.storage
          .from("performances")
          .getPublicUrl(editingPerformance.coverImage)
        setCoverImagePreview(data.publicUrl)
      } else {
        setCoverImagePreview(null)
      }
    } else {
      setFormData({
        title: "",
        description: "",
        venue: "",
        location: "",
        date: "",
        time: "",
        duration: "",
        type: "solo",
        category: "",
        director: "",
        choreographer: "",
        composer: "",
        collaborators: "",
        coverImage: null,
        media: [],
        videoUrl: "",
        about: "",
        programNotes: "",
        reviews: "",
        ticketsUrl: "",
        websiteUrl: "",
        slug: "",
        status: "draft",
        featured: false,
        tags: [],
        awards: "",
        audienceSize: null,
        sortOrder: 0,
      })
      setSelectedCoverImage(null)
      setSelectedMediaFiles([])
      setCoverImagePreview(null)
    }
    setTagInput("")
  }, [editingPerformance, isOpen, supabase.storage])

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover image must be less than 10MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Cover image must be an image file")
      return
    }

    setSelectedCoverImage(file)
    const url = URL.createObjectURL(file)
    setCoverImagePreview(url)
  }

  const handleMediaFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter((file) => {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 50MB)`)
        return false
      }
      return true
    })

    setSelectedMediaFiles((prev) => [...prev, ...validFiles])
  }

  const handleRemoveNewMedia = (index: number) => {
    setSelectedMediaFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingMedia = async (filePath: string) => {
    if (!editingPerformance) return

    if (!confirm("Are you sure you want to delete this media file?")) {
      return
    }

    try {
      await deletePerformanceMedia(editingPerformance.id, filePath)
      setFormData((prev) => ({
        ...prev,
        media: (prev.media || []).filter((path) => path !== filePath),
      }))
      toast.success("Media file deleted")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete media"
      )
    }
  }

  const handleRemoveCoverImage = async () => {
    if (!editingPerformance?.coverImage) return

    if (!confirm("Are you sure you want to delete the cover image?")) {
      return
    }

    try {
      await deletePerformanceCoverImage(
        editingPerformance.id,
        editingPerformance.coverImage
      )
      setFormData((prev) => ({ ...prev, coverImage: null }))
      setCoverImagePreview(null)
      toast.success("Cover image deleted")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete cover image"
      )
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
      let coverImagePath = formData.coverImage

      // Upload cover image if new file is selected
      if (selectedCoverImage) {
        // Validate file size (50MB max)
        const maxSize = 50 * 1024 * 1024 // 50MB
        if (selectedCoverImage.size > maxSize) {
          throw new Error(`Cover image is too large. Maximum size is 50MB. Your file is ${(selectedCoverImage.size / 1024 / 1024).toFixed(2)}MB.`)
        }

        const uniqueName = generateUniqueName(selectedCoverImage)
        const { error: uploadError } = await supabase.storage
          .from("performances")
          .upload(uniqueName, selectedCoverImage)

        if (uploadError) {
          const storageError = parseStorageError(uploadError, selectedCoverImage.name)
          console.error("Cover image upload error:", uploadError)
          throw storageError
        }
        coverImagePath = uniqueName
      }

      // Upload new media files
      const newMediaPaths: string[] = []
      const uploadErrors: string[] = []
      
      for (const file of selectedMediaFiles) {
        // Validate file size
        const maxSize = 50 * 1024 * 1024 // 50MB
        if (file.size > maxSize) {
          uploadErrors.push(`${file.name}: Too large (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
          continue
        }

        const uniqueName = generateUniqueName(file)
        const { error: uploadError } = await supabase.storage
          .from("performances")
          .upload(uniqueName, file)

        if (uploadError) {
          console.error("Error uploading media file:", uploadError)
          const storageError = parseStorageError(uploadError, file.name)
          uploadErrors.push(`${file.name}: ${storageError.message}`)
          continue
        }
        newMediaPaths.push(uniqueName)
      }

      // Show warnings for failed uploads
      if (uploadErrors.length > 0) {
        toast.warning(`Some files failed to upload: ${uploadErrors.join(", ")}`)
      }

      // Combine existing and new media paths
      const allMediaPaths = [...(formData.media || []), ...newMediaPaths]

      const performanceData: PerformanceInsert = {
        ...formData,
        coverImage: coverImagePath,
        media: allMediaPaths,
        audienceSize: formData.audienceSize
          ? Number(formData.audienceSize)
          : null,
        sortOrder: formData.sortOrder ? Number(formData.sortOrder) : 0,
      }

      if (isEditing && editingPerformance) {
        await updatePerformance({
          id: editingPerformance.id,
          ...performanceData,
        })
        toast.success("Performance updated successfully")
      } else {
        await createPerformance(performanceData)
        toast.success("Performance created successfully")
      }

      onClose(true)
    } catch (err) {
      console.error("Error saving performance:", err)
      
      // Show detailed error message with report option
      const errorMessage = err instanceof Error ? err.message : "Failed to save performance"
      toast.error(errorMessage, {
        duration: 6000,
        action: {
          label: "Report Error",
          onClick: () => showErrorReport(err, {
            operation: isEditing ? "updatePerformance" : "createPerformance",
            performanceTitle: formData.title,
            coverImageSize: selectedCoverImage ? selectedCoverImage.size : undefined,
            mediaFilesCount: selectedMediaFiles.length,
            errorDetails: err instanceof Error ? err.stack : undefined,
          }),
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getExistingMediaUrl = (path: string) => {
    const { data } = supabase.storage.from("performances").getPublicUrl(path)
    return data.publicUrl
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Performance" : "Add Performance"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update performance information"
              : "Add a new performance to your portfolio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Information</h3>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={isLoading}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as PerformanceType })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  disabled={isLoading}
                  placeholder="e.g., dance, theatre, music"
                />
              </div>
            </div>
          </div>

          {/* Performance Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Performance Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={formData.venue || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, venue: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  disabled={isLoading}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  value={formData.date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  disabled={isLoading}
                  placeholder="Jan 15, 2024"
                />
              </div>

              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={formData.time || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  disabled={isLoading}
                  placeholder="8:00 PM"
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  disabled={isLoading}
                  placeholder="2 hours"
                />
              </div>
            </div>
          </div>

          {/* Collaborators */}
          <div className="space-y-4">
            <h3 className="font-semibold">Collaborators</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="director">Director</Label>
                <Input
                  id="director"
                  value={formData.director || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, director: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="choreographer">Choreographer</Label>
                <Input
                  id="choreographer"
                  value={formData.choreographer || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, choreographer: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="composer">Composer</Label>
                <Input
                  id="composer"
                  value={formData.composer || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, composer: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="collaborators">Other Collaborators</Label>
              <Input
                id="collaborators"
                value={formData.collaborators || ""}
                onChange={(e) =>
                  setFormData({ ...formData, collaborators: e.target.value })
                }
                disabled={isLoading}
                placeholder="Comma-separated names"
              />
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="font-semibold">Media</h3>

            <div>
              <Label htmlFor="coverImage">Cover Image</Label>
              <Input
                id="coverImage"
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                disabled={isLoading}
                className="mt-1"
              />
              {coverImagePreview && (
                <div className="mt-2 relative inline-block">
                  <Image
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="max-w-full h-48 object-contain rounded-lg border"
                    width={300}
                    height={200}
                  />
                  {isEditing && formData.coverImage && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveCoverImage}
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="media">Additional Media Files</Label>
              <Input
                id="media"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaFilesChange}
                disabled={isLoading}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload images or videos (max 50MB each)
              </p>

              {/* Existing media files */}
              {isEditing && formData.media && formData.media.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium">Existing Files:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.media.map((path) => (
                      <div key={path} className="relative group">
                        <Image
                          src={getExistingMediaUrl(path)}
                          alt="Media"
                          className="w-full h-24 object-cover rounded border"
                          width={100}
                          height={100}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => handleRemoveExistingMedia(path)}
                        >
                          <IconX className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New media files to upload */}
              {selectedMediaFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium">Files to Upload:</p>
                  <div className="space-y-1">
                    {selectedMediaFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div className="flex items-center gap-2">
                          <IconUpload className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveNewMedia(index)}
                        >
                          <IconX className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="videoUrl">Video URL (YouTube/Vimeo)</Label>
              <Input
                id="videoUrl"
                type="url"
                value={formData.videoUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, videoUrl: e.target.value })
                }
                disabled={isLoading}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h3 className="font-semibold">Content</h3>

            <div>
              <Label htmlFor="about">About the Performance</Label>
              <Textarea
                id="about"
                value={formData.about || ""}
                onChange={(e) =>
                  setFormData({ ...formData, about: e.target.value })
                }
                disabled={isLoading}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="programNotes">Program Notes</Label>
              <Textarea
                id="programNotes"
                value={formData.programNotes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, programNotes: e.target.value })
                }
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="reviews">Reviews / Press</Label>
              <Textarea
                id="reviews"
                value={formData.reviews || ""}
                onChange={(e) =>
                  setFormData({ ...formData, reviews: e.target.value })
                }
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Links</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ticketsUrl">Tickets URL</Label>
                <Input
                  id="ticketsUrl"
                  type="url"
                  value={formData.ticketsUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ticketsUrl: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, websiteUrl: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* SEO & Organization */}
          <div className="space-y-4">
            <h3 className="font-semibold">SEO & Organization</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  disabled={isLoading}
                  placeholder="my-performance-2024"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as PerformanceStatus,
                    })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="audienceSize">Audience Size</Label>
                <Input
                  id="audienceSize"
                  type="number"
                  value={formData.audienceSize || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      audienceSize: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
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
            </div>

            <div>
              <Label htmlFor="awards">Awards / Recognition</Label>
              <Input
                id="awards"
                value={formData.awards || ""}
                onChange={(e) =>
                  setFormData({ ...formData, awards: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : isEditing
                ? "Update Performance"
                : "Create Performance"}
            </Button>
          </DialogFooter>
        </form>
        </DialogContent>
      </Dialog>

      {/* Error Report Dialog */}
      {reportError && (
        <ErrorReportDialog
          open={isErrorReportOpen}
          onOpenChange={closeDialog}
          error={reportError}
        />
      )}
    </>
  )
}



