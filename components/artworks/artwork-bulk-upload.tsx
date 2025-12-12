"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
import { Badge } from "@/components/ui/badge"
import { IconUpload, IconX, IconCheck } from "@tabler/icons-react"
import type { ArtworkInsert, ArtworkStatus, ArtworkAvailability } from "@/lib/types/artwork"
import { createArtwork, getArtworkSeries } from "@/lib/actions/artworks"
import { generateSlug } from "@/lib/utils/slug"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useEffect } from "react"

interface ArtworkBulkUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ArtworkUploadItem {
  file: File
  preview: string
  title: string
  description: string | null
  category: string | null
  year: string | null
  medium: string | null
  status: ArtworkStatus
  availability: ArtworkAvailability
  featured: boolean
  slug: string | null
  tags: string[]
  series: string | null
  materials: string | null
  technique: string | null
  location: string | null
  price: number | null
  currency: string
  sortOrder: number
  artistNotes: string | null
  dateCreated: string | null
  width: number | null
  height: number | null
  depth: number | null
  unit: string
}

function generateUniqueName(file: File): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = file.name.split(".").pop()
  return `${timestamp}-${random}.${extension}`
}

export function ArtworkBulkUpload({ open, onOpenChange }: ArtworkBulkUploadProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [files, setFiles] = useState<File[]>([])
  const [uploadItems, setUploadItems] = useState<ArtworkUploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const [existingSeries, setExistingSeries] = useState<string[]>([])

  // Common defaults that apply to all artworks
  const [commonDefaults, setCommonDefaults] = useState({
    category: "",
    series: "",
    status: "draft" as ArtworkStatus,
    availability: "available" as ArtworkAvailability,
    featured: false,
    currency: "USD",
    unit: "cm",
    sortOrder: 0,
  })

  // Fetch existing series when drawer opens
  useEffect(() => {
    if (open) {
      getArtworkSeries()
        .then(setExistingSeries)
        .catch((error) => {
          console.error("Failed to fetch series:", error)
          // Don't show error to user, just continue without existing series
        })
    }
  }, [open])

  // Initialize upload items when files change
  const handleFilesChange = (selectedFiles: File[]) => {
    const newFiles = Array.from(selectedFiles)
    setFiles((prev) => [...prev, ...newFiles])

    const newItems: ArtworkUploadItem[] = newFiles.map((file) => {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
      const autoSlug = generateSlug(nameWithoutExt)

      return {
        file,
        preview: URL.createObjectURL(file),
        title: nameWithoutExt,
        description: null,
        category: commonDefaults.category || null,
        year: null,
        medium: null,
        status: commonDefaults.status,
        availability: commonDefaults.availability,
        featured: commonDefaults.featured,
        slug: autoSlug,
        tags: [],
        series: commonDefaults.series || null,
        materials: null,
        technique: null,
        location: null,
        price: null,
        currency: commonDefaults.currency,
        sortOrder: commonDefaults.sortOrder,
        artistNotes: null,
        dateCreated: null,
        width: null,
        height: null,
        depth: null,
        unit: commonDefaults.unit,
      }
    })

    setUploadItems((prev) => [...prev, ...newItems])
  }

  const removeItem = (index: number) => {
    const item = uploadItems[index]
    if (item.preview.startsWith("blob:")) {
      URL.revokeObjectURL(item.preview)
    }
    setFiles((prev) => prev.filter((_, i) => i !== files.length - uploadItems.length + index))
    setUploadItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, updates: Partial<ArtworkUploadItem>) => {
    setUploadItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], ...updates }
      // Auto-update slug if title changes
      if (updates.title && !updates.slug) {
        updated[index].slug = generateSlug(updates.title)
      }
      return updated
    })
  }

  const applyCommonDefaults = () => {
    setUploadItems((prev) =>
      prev.map((item) => ({
        ...item,
        category: commonDefaults.category || item.category,
        series: commonDefaults.series || item.series,
        status: commonDefaults.status,
        availability: commonDefaults.availability,
        featured: commonDefaults.featured,
        currency: commonDefaults.currency,
        unit: commonDefaults.unit,
        sortOrder: commonDefaults.sortOrder,
      }))
    )
    toast.success("Common defaults applied to all artworks")
  }

  const handleUpload = async () => {
    if (uploadItems.length === 0) {
      toast.error("Please select at least one image to upload")
      return
    }

    setIsUploading(true)
    setUploadProgress({})

    try {
      // Verify user is authenticated
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error("You must be logged in to upload files. Please refresh the page and try again.")
      }

      const results = []
      const errors: string[] = []

      for (let i = 0; i < uploadItems.length; i++) {
        const item = uploadItems[i]
        setUploadProgress((prev) => ({ ...prev, [i]: 0 }))

        try {
          // Validate required fields
          if (!item.title || !item.title.trim()) {
            errors.push(`${item.file.name}: Title is required`)
            continue
          }

          // Upload thumbnail (using the image file as thumbnail)
          const uniqueName = generateUniqueName(item.file)
          const timestamp = Date.now()
          const thumbnailPath = `thumbnails/${timestamp}-${uniqueName}`

          setUploadProgress((prev) => ({ ...prev, [i]: 25 }))

          const { data: uploadData, error: storageError } = await supabase.storage
            .from("artworks")
            .upload(thumbnailPath, item.file, {
              cacheControl: "3600",
              upsert: false,
            })

          if (storageError) {
            throw new Error(`Failed to upload image: ${storageError.message}`)
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("artworks").getPublicUrl(thumbnailPath)

          if (!publicUrl) {
            throw new Error("Failed to get public URL for uploaded image")
          }

          setUploadProgress((prev) => ({ ...prev, [i]: 50 }))

          // Create artwork record
          const artworkData: ArtworkInsert = {
            title: item.title,
            year: item.year || null,
            description: item.description || null,
            link: null,
            featured: item.featured,
            category: item.category || null,
            medium: item.medium || null,
            width: item.width,
            height: item.height,
            depth: item.depth,
            unit: item.unit,
            slug: item.slug || generateSlug(item.title),
            status: item.status,
            tags: item.tags.length > 0 ? item.tags : null,
            series: item.series || null,
            materials: item.materials || null,
            technique: item.technique || null,
            location: item.location || null,
            availability: item.availability,
            price: item.price,
            currency: item.currency,
            sortOrder: item.sortOrder,
            thumbnailPath: publicUrl,
            artistNotes: item.artistNotes || null,
            dateCreated: item.dateCreated || null,
            exhibitionHistory: null,
            media: [publicUrl], // Use thumbnail as media too
          }

          setUploadProgress((prev) => ({ ...prev, [i]: 75 }))

          await createArtwork(artworkData)
          results.push(item.title)

          setUploadProgress((prev) => ({ ...prev, [i]: 100 }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          errors.push(`${item.file.name}: ${errorMessage}`)
          console.error(`Error uploading ${item.file.name}:`, error)
        }
      }

      // Clean up preview URLs
      uploadItems.forEach((item) => {
        if (item.preview.startsWith("blob:")) {
          URL.revokeObjectURL(item.preview)
        }
      })

      if (results.length > 0) {
        toast.success(`Successfully uploaded ${results.length} artwork(s)`)
        setFiles([])
        setUploadItems([])
        setUploadProgress({})
        onOpenChange(false)
        setTimeout(() => {
          router.refresh()
        }, 100)
      }

      if (errors.length > 0) {
        toast.error(`Failed to upload ${errors.length} artwork(s). Check console for details.`)
        console.error("Upload errors:", errors)
      }
    } catch (error) {
      console.error("Bulk upload error:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to upload artworks"
      )
    } finally {
      setIsUploading(false)
      setUploadProgress({})
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      // Clean up preview URLs
      uploadItems.forEach((item) => {
        if (item.preview.startsWith("blob:")) {
          URL.revokeObjectURL(item.preview)
        }
      })
      setFiles([])
      setUploadItems([])
      setUploadProgress({})
      onOpenChange(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Bulk Upload Artworks</DrawerTitle>
          <DrawerDescription>
            Upload multiple artwork images at once. Set common defaults or customize each artwork individually.
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4">
          {/* Common Defaults Section */}
          <div className="mb-6 space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Common Defaults</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyCommonDefaults}
                disabled={uploadItems.length === 0}
              >
                Apply to All
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="common-category">Category</Label>
                <Input
                  id="common-category"
                  value={commonDefaults.category}
                  onChange={(e) =>
                    setCommonDefaults((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="e.g., Painting"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="common-series">Collection/Series</Label>
                <div className="relative">
                  <Input
                    id="common-series"
                    value={commonDefaults.series}
                    onChange={(e) =>
                      setCommonDefaults((prev) => ({ ...prev, series: e.target.value }))
                    }
                    placeholder="e.g., Body Works"
                    list="series-list"
                  />
                  {existingSeries.length > 0 && (
                    <datalist id="series-list">
                      {existingSeries.map((series) => (
                        <option key={series} value={series} />
                      ))}
                    </datalist>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="common-status">Status</Label>
                <Select
                  value={commonDefaults.status}
                  onValueChange={(value: ArtworkStatus) =>
                    setCommonDefaults((prev) => ({ ...prev, status: value }))
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
                <Label htmlFor="common-availability">Availability</Label>
                <Select
                  value={commonDefaults.availability}
                  onValueChange={(value: ArtworkAvailability) =>
                    setCommonDefaults((prev) => ({ ...prev, availability: value }))
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
                <Label htmlFor="common-currency">Currency</Label>
                <Select
                  value={commonDefaults.currency}
                  onValueChange={(value) =>
                    setCommonDefaults((prev) => ({ ...prev, currency: value }))
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
            </div>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <Label htmlFor="file-upload" className="mb-2 block text-sm font-medium">
              Select Images
            </Label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="file-upload"
                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
              >
                <IconUpload className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to select images or drag and drop
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {uploadItems.length > 0 && `${uploadItems.length} file(s) selected`}
                </span>
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files || [])
                  if (selectedFiles.length > 0) {
                    handleFilesChange(selectedFiles)
                  }
                }}
              />
            </div>
          </div>

          {/* Upload Items List */}
          {uploadItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">
                Artworks to Upload ({uploadItems.length})
              </h3>
              <div className="space-y-4">
                {uploadItems.map((item, index) => {
                  const progress = uploadProgress[index] || 0
                  const isUploadingItem = isUploading && progress > 0 && progress < 100

                  return (
                    <div
                      key={index}
                      className="rounded-lg border p-4 space-y-4"
                    >
                      <div className="flex gap-4">
                        {/* Image Preview */}
                        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-md border">
                          <Image
                            src={item.preview}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                          {isUploadingItem && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <div className="text-center text-white text-xs">
                                <div className="mb-1">{progress}%</div>
                                <div className="h-1 w-24 bg-white/20 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-white transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          {progress === 100 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/50">
                              <IconCheck className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`title-${index}`} className="text-xs">
                                Title *
                              </Label>
                              <Input
                                id={`title-${index}`}
                                value={item.title}
                                onChange={(e) =>
                                  updateItem(index, { title: e.target.value })
                                }
                                placeholder="Artwork title"
                                disabled={isUploading}
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`year-${index}`} className="text-xs">
                                Year
                              </Label>
                              <Input
                                id={`year-${index}`}
                                value={item.year || ""}
                                onChange={(e) =>
                                  updateItem(index, { year: e.target.value || null })
                                }
                                placeholder="2024"
                                disabled={isUploading}
                                className="h-8"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`category-${index}`} className="text-xs">
                                Category
                              </Label>
                              <Input
                                id={`category-${index}`}
                                value={item.category || ""}
                                onChange={(e) =>
                                  updateItem(index, { category: e.target.value || null })
                                }
                                placeholder="Category"
                                disabled={isUploading}
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`series-${index}`} className="text-xs">
                                Collection/Series
                              </Label>
                              <div className="relative">
                                <Input
                                  id={`series-${index}`}
                                  value={item.series || ""}
                                  onChange={(e) =>
                                    updateItem(index, { series: e.target.value || null })
                                  }
                                  placeholder="Collection/Series"
                                  disabled={isUploading}
                                  className="h-8"
                                  list={`series-list-${index}`}
                                />
                                {existingSeries.length > 0 && (
                                  <datalist id={`series-list-${index}`}>
                                    {existingSeries.map((series) => (
                                      <option key={series} value={series} />
                                    ))}
                                  </datalist>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`medium-${index}`} className="text-xs">
                                Medium
                              </Label>
                              <Input
                                id={`medium-${index}`}
                                value={item.medium || ""}
                                onChange={(e) =>
                                  updateItem(index, { medium: e.target.value || null })
                                }
                                placeholder="Medium"
                                disabled={isUploading}
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`status-${index}`} className="text-xs">
                                Status
                              </Label>
                              <Select
                                value={item.status}
                                onValueChange={(value: ArtworkStatus) =>
                                  updateItem(index, { status: value })
                                }
                                disabled={isUploading}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="published">Published</SelectItem>
                                  <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor={`description-${index}`} className="text-xs">
                              Description
                            </Label>
                            <Textarea
                              id={`description-${index}`}
                              value={item.description || ""}
                              onChange={(e) =>
                                updateItem(index, { description: e.target.value || null })
                              }
                              placeholder="Artwork description"
                              disabled={isUploading}
                              rows={2}
                              className="resize-none"
                            />
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Slug: {item.slug || "auto-generated"}</span>
                            {item.featured && (
                              <Badge variant="secondary" className="text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={isUploading}
                          className="h-8 w-8 flex-shrink-0"
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {uploadItems.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <IconUpload className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No images selected. Click the upload area above to select images.
              </p>
            </div>
          )}
        </div>

        <DrawerFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {uploadItems.length > 0
                ? `${uploadItems.length} artwork(s) ready to upload`
                : "No artworks selected"}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || uploadItems.length === 0}
              >
                {isUploading ? (
                  <>
                    <IconUpload className={cn("mr-2 h-4 w-4", "animate-pulse")} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <IconUpload className="mr-2 h-4 w-4" />
                    Upload {uploadItems.length} Artwork(s)
                  </>
                )}
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

