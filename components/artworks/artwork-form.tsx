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
import { Badge } from "@/components/ui/badge"
import type {
  Artwork,
  ArtworkInsert,
  ArtworkUpdate,
  ArtworkStatus,
  ArtworkAvailability,
  ExhibitionHistory,
} from "@/lib/types/artwork"
import { createArtwork, updateArtwork } from "@/lib/actions/artworks"
import { generateSlug, validateSlug } from "@/lib/utils/slug"

interface ArtworkFormProps {
  artwork?: Artwork | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function generateUniqueName(file: File): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = file.name.split(".").pop()
  return `${timestamp}-${random}.${extension}`
}

export function ArtworkForm({ artwork, open, onOpenChange }: ArtworkFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!artwork

  const [formData, setFormData] = useState<ArtworkInsert>({
    title: null,
    year: null,
    description: null,
    link: null,
    featured: false,
    category: null,
    medium: null,
    width: null,
    height: null,
    depth: null,
    unit: "cm",
    slug: null,
    status: "draft",
    tags: [],
    series: null,
    materials: null,
    technique: null,
    location: null,
    availability: "available",
    price: null,
    currency: "USD",
    sortOrder: 0,
    thumbnailPath: null,
    artistNotes: null,
    dateCreated: null,
    exhibitionHistory: [],
    media: [],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<Record<string, string>>({})
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("")
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true)
  const [exhibitionHistory, setExhibitionHistory] = useState<ExhibitionHistory[]>([])

  useEffect(() => {
    if (artwork) {
      setFormData({
        title: artwork.title,
        year: artwork.year,
        description: artwork.description,
        link: artwork.link,
        featured: artwork.featured,
        category: artwork.category,
        medium: artwork.medium,
        width: artwork.width,
        height: artwork.height,
        depth: artwork.depth,
        unit: artwork.unit,
        slug: artwork.slug,
        status: artwork.status,
        tags: artwork.tags || [],
        series: artwork.series,
        materials: artwork.materials,
        technique: artwork.technique,
        location: artwork.location,
        availability: artwork.availability,
        price: artwork.price,
        currency: artwork.currency,
        sortOrder: artwork.sortOrder,
        thumbnailPath: artwork.thumbnailPath,
        artistNotes: artwork.artistNotes,
        dateCreated: artwork.dateCreated,
        exhibitionHistory: artwork.exhibitionHistory || [],
        media: artwork.media || [],
      })
      setAutoGenerateSlug(false)
      setThumbnailPreview(artwork.thumbnailPath || "")
      setThumbnailFile(null)
      setMediaFiles([])
      setMediaPreviews({})
      setExhibitionHistory(artwork.exhibitionHistory || [])
    } else {
      setFormData({
        title: null,
        year: null,
        description: null,
        link: null,
        featured: false,
        category: null,
        medium: null,
        width: null,
        height: null,
        depth: null,
        unit: "cm",
        slug: null,
        status: "draft",
        tags: [],
        series: null,
        materials: null,
        technique: null,
        location: null,
        availability: "available",
        price: null,
        currency: "USD",
        sortOrder: 0,
        thumbnailPath: null,
        artistNotes: null,
        dateCreated: null,
        exhibitionHistory: [],
        media: [],
      })
      setAutoGenerateSlug(true)
      setThumbnailPreview("")
      setThumbnailFile(null)
      setMediaFiles([])
      setMediaPreviews({})
      setExhibitionHistory([])
    }
  }, [artwork, open])

  // Auto-generate slug from title
  useEffect(() => {
    if (autoGenerateSlug && formData.title) {
      const slug = generateSlug(formData.title)
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.title, autoGenerateSlug])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setMediaFiles((prev) => [...prev, ...files])
    
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setMediaPreviews((prev) => ({
          ...prev,
          [file.name]: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeMediaFile = (fileName: string) => {
    setMediaFiles((prev) => prev.filter((f) => f.name !== fileName))
    setMediaPreviews((prev) => {
      const newPreviews = { ...prev }
      delete newPreviews[fileName]
      return newPreviews
    })
  }

  const removeMediaUrl = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      media: (prev.media || []).filter((m) => m !== url),
    }))
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

  const handleAddExhibition = () => {
    setExhibitionHistory([
      ...exhibitionHistory,
      { name: "", location: "", date: "" },
    ])
  }

  const handleUpdateExhibition = (
    index: number,
    field: keyof ExhibitionHistory,
    value: string
  ) => {
    const updated = [...exhibitionHistory]
    updated[index] = { ...updated[index], [field]: value }
    setExhibitionHistory(updated)
  }

  const handleRemoveExhibition = (index: number) => {
    setExhibitionHistory(exhibitionHistory.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.title) {
        toast.error("Title is required")
        return
      }

      if (formData.slug && !validateSlug(formData.slug)) {
        toast.error("Invalid slug format. Use only lowercase letters, numbers, and hyphens.")
        return
      }

      let thumbnailPath = formData.thumbnailPath

      // Upload thumbnail if new file is selected
      if (thumbnailFile) {
        // Verify user is authenticated
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          throw new Error("You must be logged in to upload files. Please refresh the page and try again.")
        }

        const uniqueName = generateUniqueName(thumbnailFile)
        const timestamp = Date.now()
        const filePath = `thumbnails/${timestamp}-${uniqueName}`

        const { data: uploadData, error: storageError } = await supabase.storage
          .from("artworks")
          .upload(filePath, thumbnailFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (storageError) {
          console.error("Thumbnail upload error:", storageError)
          // Provide more helpful error messages
          if (storageError.message.includes("row-level security")) {
            throw new Error(
              "Storage bucket not configured. Please run the database-storage-artworks-bucket.sql script in your Supabase SQL Editor."
            )
          }
          throw new Error(`Failed to upload thumbnail: ${storageError.message}`)
        }

        if (!uploadData) {
          throw new Error("Upload succeeded but no data returned")
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("artworks").getPublicUrl(filePath)

        if (!publicUrl) {
          throw new Error("Failed to get public URL for uploaded thumbnail")
        }

        thumbnailPath = publicUrl
      }

      // Upload media files
      const uploadedMediaUrls: string[] = []
      for (const file of mediaFiles) {
        try {
          const uniqueName = generateUniqueName(file)
          const timestamp = Date.now()
          const filePath = `media/${timestamp}-${uniqueName}`

          const { data: uploadData, error: storageError } = await supabase.storage
            .from("artworks")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            })

          if (storageError) {
            console.error("Media upload error:", storageError)
            // Provide more helpful error messages
            if (storageError.message.includes("row-level security")) {
              throw new Error(
                "Storage bucket not configured. Please run the database-storage-artworks-bucket.sql script in your Supabase SQL Editor."
              )
            }
            throw new Error(`Failed to upload media: ${storageError.message}`)
          }

          if (!uploadData) {
            throw new Error("Upload succeeded but no data returned")
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("artworks").getPublicUrl(filePath)

          if (!publicUrl) {
            throw new Error("Failed to get public URL for uploaded media")
          }

          uploadedMediaUrls.push(publicUrl)
        } catch (error) {
          console.error("Error uploading media:", error)
          throw error
        }
      }

      // Combine existing media with newly uploaded ones
      const allMediaUrls = [
        ...(formData.media || []),
        ...uploadedMediaUrls,
      ]

      const artworkData: ArtworkInsert = {
        ...formData,
        thumbnailPath,
        media: allMediaUrls,
        exhibitionHistory: exhibitionHistory.filter(
          (e) => e.name && e.location && e.date
        ),
      }

      if (isEditing && artwork) {
        const updateData: ArtworkUpdate = {
          id: artwork.id,
          ...artworkData,
        }
        await updateArtwork(updateData)
        toast.success("Artwork updated successfully")
      } else {
        await createArtwork(artworkData)
        toast.success("Artwork created successfully")
      }

      onOpenChange(false)
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      console.error("Error saving artwork:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to save artwork"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Artwork" : "New Artwork"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update artwork information"
              : "Create a new artwork entry"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={formData.year || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, year: e.target.value }))
                  }
                  placeholder="2024"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                type="url"
                value={formData.link || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Categorization */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Categorization</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medium">Medium</Label>
                <Input
                  id="medium"
                  value={formData.medium || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, medium: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="series">Series</Label>
              <Input
                id="series"
                value={formData.series || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, series: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                />
                <Button type="button" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Dimensions</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.01"
                  value={formData.width || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      width: e.target.value ? parseFloat(e.target.value) : null,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  value={formData.height || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      height: e.target.value ? parseFloat(e.target.value) : null,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depth">Depth</Label>
                <Input
                  id="depth"
                  type="number"
                  step="0.01"
                  value={formData.depth || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      depth: e.target.value ? parseFloat(e.target.value) : null,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, unit: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                    <SelectItem value="in">in</SelectItem>
                    <SelectItem value="ft">ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Additional Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="materials">Materials</Label>
                <Textarea
                  id="materials"
                  value={formData.materials || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      materials: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technique">Technique</Label>
                <Input
                  id="technique"
                  value={formData.technique || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      technique: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artistNotes">Artist Notes</Label>
              <Textarea
                id="artistNotes"
                value={formData.artistNotes || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    artistNotes: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
          </div>

          {/* Status & Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Status & Settings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ArtworkStatus) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
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
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value: ArtworkAvailability) =>
                    setFormData((prev) => ({ ...prev, availability: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="on_loan">On Loan</SelectItem>
                    <SelectItem value="private_collection">Private Collection</SelectItem>
                    <SelectItem value="nfs">Not For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder || 0}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: e.target.value ? parseFloat(e.target.value) : null,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateCreated">Date Created</Label>
                <Input
                  id="dateCreated"
                  type="date"
                  value={formData.dateCreated || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dateCreated: e.target.value || null,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  value={formData.slug || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    setAutoGenerateSlug(false)
                  }}
                  placeholder="auto-generated-from-title"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAutoGenerateSlug(true)}
                >
                  Auto
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, featured: !!checked }))
                }
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured artwork
              </Label>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Media</h3>
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {thumbnailPreview && (
                <div className="mt-2">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="h-32 w-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="media">Media Files</Label>
              <Input
                id="media"
                type="file"
                accept="image/*"
                multiple
                onChange={handleMediaChange}
              />
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {mediaFiles.map((file) => (
                    <div key={file.name} className="relative">
                      <img
                        src={mediaPreviews[file.name]}
                        alt={file.name}
                        className="h-24 w-24 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-0 right-0"
                        onClick={() => removeMediaFile(file.name)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {formData.media && formData.media.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {formData.media.map((url) => (
                    <div key={url} className="relative">
                      <img
                        src={url}
                        alt="Media"
                        className="h-24 w-24 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-0 right-0"
                        onClick={() => removeMediaUrl(url)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Exhibition History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Exhibition History</h3>
              <Button type="button" variant="outline" onClick={handleAddExhibition}>
                Add Exhibition
              </Button>
            </div>
            {exhibitionHistory.map((exhibition, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 p-2 border rounded">
                <Input
                  placeholder="Exhibition Name"
                  value={exhibition.name}
                  onChange={(e) =>
                    handleUpdateExhibition(index, "name", e.target.value)
                  }
                />
                <Input
                  placeholder="Location"
                  value={exhibition.location}
                  onChange={(e) =>
                    handleUpdateExhibition(index, "location", e.target.value)
                  }
                />
                <Input
                  type="date"
                  placeholder="Date"
                  value={exhibition.date}
                  onChange={(e) =>
                    handleUpdateExhibition(index, "date", e.target.value)
                  }
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveExhibition(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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

