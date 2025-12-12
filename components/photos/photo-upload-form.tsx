"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

type CategoryOption =
  | "architecture"
  | "nature"
  | "street"
  | "travel"
  | "wildlife"
  | "night"
  | "abstract"
  | "interior_spaces"

interface PhotoMetadata {
  title?: string
  description?: string
  category?: string
  alt_text?: string
  image_path: string
  location?: string
  date_taken?: string
}

interface BulkUploadData {
  photos: PhotoMetadata[]
}

interface PhotoUploadFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface MatchedPhoto {
  metadata: PhotoMetadata
  fileName: string
  normalizedCategory: CategoryOption
  index: number
  file?: File
  previewUrl?: string
}

const CATEGORY_MAP: Record<string, CategoryOption> = {
  "architecture & heritage": "architecture",
  architecture: "architecture",
  "nature & landscapes": "nature",
  nature: "nature",
  "street & urban life": "street",
  street: "street",
  "travel photography": "travel",
  travel: "travel",
  wildlife: "wildlife",
  "night & lights": "night",
  night: "night",
  abstract: "abstract",
  "abstract/artistic": "abstract",
  "interior spaces": "interior_spaces",
}

const DEFAULT_CATEGORY: CategoryOption = "abstract"

const CATEGORY_OPTIONS: { value: CategoryOption; label: string }[] = [
  { value: "architecture", label: "Architecture & Heritage" },
  { value: "nature", label: "Nature & Landscapes" },
  { value: "street", label: "Street & Urban Life" },
  { value: "travel", label: "Travel Photography" },
  { value: "wildlife", label: "Wildlife" },
  { value: "night", label: "Night & Lights" },
  { value: "abstract", label: "Abstract / Artistic" },
  { value: "interior_spaces", label: "Interior Spaces" },
]

const CATEGORY_LABELS = CATEGORY_OPTIONS.reduce<Record<CategoryOption, string>>(
  (acc, option) => {
    acc[option.value] = option.label
    return acc
  },
  {} as Record<CategoryOption, string>
)

const sanitizeFileName = (path: string): string => {
  return path.split(/[/\\]/).pop()?.trim() ?? ""
}

const normalizeCategory = (category?: string): CategoryOption => {
  if (!category) {
    return DEFAULT_CATEGORY
  }
  const key = category.trim().toLowerCase()
  if (CATEGORY_MAP[key]) {
    return CATEGORY_MAP[key]
  }
  console.warn(
    "[BulkUpload] Unknown category in metadata, falling back to abstract:",
    category
  )
  return DEFAULT_CATEGORY
}

const generateUniqueName = (file: File) => {
  const extension = file.name.split(".").pop() ?? "jpg"
  const randomPart =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${randomPart}.${extension}`
}

export function PhotoUploadForm({ open, onOpenChange }: PhotoUploadFormProps) {
  const supabase = createClient()
  const router = useRouter()

  const [isUploading, setIsUploading] = useState(false)
  const [metadataEntries, setMetadataEntries] = useState<PhotoMetadata[]>([])
  const [metadataFileName, setMetadataFileName] = useState<string>("")
  const [metadataError, setMetadataError] = useState<string | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({})

  const handleMetadataFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".json")) {
      toast.error("Please upload a JSON metadata file")
      return
    }

    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as BulkUploadData

      if (!parsed.photos || !Array.isArray(parsed.photos)) {
        throw new Error('Invalid JSON format. Expected a "photos" array.')
      }

      setMetadataEntries(parsed.photos)
      setMetadataFileName(file.name)
      setMetadataError(null)
      toast.success(
        `Loaded metadata for ${parsed.photos.length} photo${
          parsed.photos.length === 1 ? "" : "s"
        }`
      )
    } catch (error) {
      console.error("[BulkUpload] Failed to parse metadata file:", error)
      setMetadataEntries([])
      setMetadataFileName("")
      setMetadataError(
        error instanceof Error ? error.message : "Invalid metadata file"
      )
      toast.error(
        error instanceof Error ? error.message : "Invalid metadata file"
      )
    }
  }

  const handlePhotoFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    Object.values(photoPreviews).forEach((url) => URL.revokeObjectURL(url))

    const nextPreviews: Record<string, string> = {}
    files.forEach((file) => {
      nextPreviews[file.name.toLowerCase()] = URL.createObjectURL(file)
    })

    setPhotoFiles(files)
    setPhotoPreviews(nextPreviews)
  }

  useEffect(() => {
    return () => {
      Object.values(photoPreviews).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photoPreviews])

  const photoFileMap = useMemo(() => {
    const map = new Map<string, File>()
    photoFiles.forEach((file) => {
      map.set(file.name.toLowerCase(), file)
    })
    return map
  }, [photoFiles])

  const matchedPhotos: MatchedPhoto[] = useMemo(() => {
    return metadataEntries.map((metadata, index) => {
      const fileName = sanitizeFileName(metadata.image_path)
      const key = fileName.toLowerCase()
      const file = photoFileMap.get(key)
      const previewUrl = file ? photoPreviews[key] : undefined

      return {
        metadata,
        fileName,
        index,
        file,
        previewUrl,
        normalizedCategory: normalizeCategory(metadata.category),
      }
    })
  }, [metadataEntries, photoFileMap, photoPreviews])

  const unmatchedPhotoFiles = useMemo(() => {
    const matchedNames = new Set(
      matchedPhotos
        .filter((match) => match.file)
        .map((match) => match.file?.name.toLowerCase() ?? "")
    )
    return photoFiles.filter(
      (file) => !matchedNames.has(file.name.toLowerCase())
    )
  }, [matchedPhotos, photoFiles])

  const missingPhotoMatches = matchedPhotos.filter((match) => !match.file)

  const canUpload =
    matchedPhotos.length > 0 &&
    missingPhotoMatches.length === 0 &&
    !isUploading

  const updateMetadataEntry = (
    entryIndex: number,
    updates: Partial<PhotoMetadata>
  ) => {
    setMetadataEntries((prev) =>
      prev.map((entry, index) => {
        if (index !== entryIndex) {
          return entry
        }
        return {
          ...entry,
          ...updates,
        }
      })
    )
  }

  const handleUpload = async () => {
    if (matchedPhotos.length === 0) {
      toast.error("Please upload metadata and photos before continuing")
      return
    }

    if (missingPhotoMatches.length > 0) {
      toast.error("Some metadata entries are missing matching photo files")
      return
    }

    setIsUploading(true)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to upload photos")
      }

      const uploadPromises = matchedPhotos.map(async (match) => {
        const file = match.file
        if (!file) {
          throw new Error(`Missing file for ${match.fileName}`)
        }

        const uniqueName = generateUniqueName(file)
        const filePath = `photography/${uniqueName}`

        const { error: storageError } = await supabase.storage
          .from("media")
          .upload(filePath, file)

        if (storageError) {
          console.error("[BulkUpload] Storage upload error:", storageError)
          throw storageError
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(filePath)

        const fallbackTitle = match.fileName.replace(/\.[^/.]+$/, "")

        return {
          title: match.metadata.title?.trim() || fallbackTitle || "Untitled",
          description: match.metadata.description?.trim() || null,
          category: match.normalizedCategory,
          image_url: publicUrl,
          alt_text: match.metadata.alt_text?.trim() || null,
          location: match.metadata.location?.trim() || null,
          date_taken: match.metadata.date_taken || null,
          user_id: user.id,
        }
      })

      const photoRecords = await Promise.all(uploadPromises)

      const { error: dbError } = await supabase.from("photos").insert(photoRecords)

      if (dbError) {
        console.error("[BulkUpload] Database insert error:", dbError)
        throw dbError
      }

      toast.success(
        `Uploaded ${photoRecords.length} photo${
          photoRecords.length === 1 ? "" : "s"
        } successfully`
      )

      // Reset form
      setMetadataEntries([])
      setMetadataFileName("")
      setPhotoFiles([])
      Object.values(photoPreviews).forEach((url) => URL.revokeObjectURL(url))
      setPhotoPreviews({})

      // Close drawer and refresh
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("[BulkUpload] Upload failed:", error)
      const message = error instanceof Error ? error.message : "Unknown error"
      toast.error(`Upload failed: ${message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setMetadataEntries([])
    setMetadataFileName("")
    setPhotoFiles([])
    Object.values(photoPreviews).forEach((url) => URL.revokeObjectURL(url))
    setPhotoPreviews({})
    setMetadataError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Photo Upload</DialogTitle>
          <DialogDescription>
            Upload metadata JSON and matching photo files to bulk upload photos
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Step 1: Metadata */}
            <div className="space-y-3 rounded-lg border p-4">
              <div>
                <h4 className="text-sm font-semibold">Step 1: Metadata</h4>
                <p className="text-xs text-muted-foreground">
                  Upload a JSON file with photo metadata
                </p>
              </div>
              <Label
                htmlFor="metadata-file"
                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition hover:border-primary"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <svg
                    className="mb-2 h-8 w-8 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="mb-1 text-sm">
                    <span className="font-semibold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-muted-foreground">metadata.json</p>
                </div>
                <Input
                  id="metadata-file"
                  type="file"
                  accept="application/json,.json"
                  onChange={handleMetadataFileChange}
                  className="hidden"
                />
              </Label>
              <div className="rounded-md bg-muted p-3 text-sm">
                {metadataFileName ? (
                  <div>
                    <p className="font-medium">{metadataFileName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {metadataEntries.length} photo record
                      {metadataEntries.length === 1 ? "" : "s"} loaded
                    </p>
                  </div>
                ) : metadataError ? (
                  <p className="text-sm text-destructive">{metadataError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No metadata file selected yet.
                  </p>
                )}
              </div>
            </div>

            {/* Step 2: Photos */}
            <div className="space-y-3 rounded-lg border p-4">
              <div>
                <h4 className="text-sm font-semibold">Step 2: Photos</h4>
                <p className="text-xs text-muted-foreground">
                  Select photos that match the metadata file names
                </p>
              </div>
              <Label
                htmlFor="photo-files"
                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition hover:border-primary"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <svg
                    className="mb-2 h-8 w-8 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4-4 4 4 8-8"
                    />
                  </svg>
                  <p className="mb-1 text-sm">
                    <span className="font-semibold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to 10MB each
                  </p>
                </div>
                <Input
                  id="photo-files"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handlePhotoFilesChange}
                  className="hidden"
                />
              </Label>
              <div className="rounded-md bg-muted p-3 text-sm">
                {photoFiles.length > 0 ? (
                  <p>
                    {photoFiles.length} photo file{photoFiles.length === 1 ? "" : "s"}{" "}
                    selected
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No photo files selected yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Preview */}
          {matchedPhotos.length > 0 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold">Step 3: Preview & Confirm</h4>
                <p className="text-xs text-muted-foreground">
                  Review the matches below. Only entries with both metadata and photos
                  will be uploaded.
                </p>
              </div>
              <div className="overflow-hidden rounded-lg border">
                <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
                  <table className="min-w-full divide-y">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Photo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Metadata
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-background">
                      {matchedPhotos.map((match) => (
                        <tr
                          key={`${match.fileName}-${match.index}`}
                          className={!match.file ? "bg-destructive/10" : ""}
                        >
                          <td className="px-4 py-3">
                            {match.previewUrl ? (
                              <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={match.previewUrl}
                                  alt={
                                    match.metadata.alt_text ||
                                    match.metadata.title ||
                                    match.fileName
                                  }
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-lg border text-xs text-muted-foreground">
                                No preview
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs">Title</Label>
                                <Input
                                  type="text"
                                  className="mt-1 h-8 text-sm"
                                  value={match.metadata.title ?? ""}
                                  onChange={(event) =>
                                    updateMetadataEntry(match.index, {
                                      title: event.target.value,
                                    })
                                  }
                                  placeholder={match.fileName}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Description</Label>
                                <Textarea
                                  className="mt-1 text-sm"
                                  rows={2}
                                  value={match.metadata.description ?? ""}
                                  onChange={(event) =>
                                    updateMetadataEntry(match.index, {
                                      description: event.target.value,
                                    })
                                  }
                                  placeholder="Optional description"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Alt Text</Label>
                                <Input
                                  type="text"
                                  className="mt-1 h-8 text-sm"
                                  value={match.metadata.alt_text ?? ""}
                                  onChange={(event) =>
                                    updateMetadataEntry(match.index, {
                                      alt_text: event.target.value,
                                    })
                                  }
                                  placeholder="Optional alt text"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                File: {match.fileName}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={normalizeCategory(match.metadata.category)}
                              onValueChange={(value) =>
                                updateMetadataEntry(match.index, {
                                  category: value,
                                })
                              }
                            >
                              <SelectTrigger className="w-44">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORY_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {CATEGORY_LABELS[normalizeCategory(match.metadata.category)]}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs font-medium">
                            {match.file ? (
                              <span className="text-green-600">Ready</span>
                            ) : (
                              <span className="text-destructive">Missing photo</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {missingPhotoMatches.length > 0 && (
                <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                  {missingPhotoMatches.length} metadata entr
                  {missingPhotoMatches.length === 1 ? "y" : "ies"} missing a matching
                  photo file.
                </div>
              )}

              {unmatchedPhotoFiles.length > 0 && (
                <div className="rounded-md border bg-muted p-3 text-sm">
                  <p className="font-medium">Unmatched Photos:</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">
                    {unmatchedPhotoFiles.map((file) => (
                      <li key={file.name}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex w-full justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canUpload}
              onClick={handleUpload}
            >
              {isUploading
                ? "Uploading..."
                : `Upload ${matchedPhotos.length} Photo${
                    matchedPhotos.length === 1 ? "" : "s"
                  }`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

