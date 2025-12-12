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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { Photo, PhotoInsert, CameraSettings } from "@/lib/types/photo"
import { createPhoto, updatePhoto } from "@/lib/actions/photos"

interface PhotoFormProps {
  photo?: Photo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PhotoForm({ photo, open, onOpenChange }: PhotoFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!photo

  const [formData, setFormData] = useState<PhotoInsert>({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
    location: "",
    dateTaken: "",
    cameraSettings: null,
    tags: [],
    featured: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
    aperture: "",
    shutterSpeed: "",
    iso: undefined,
    focalLength: "",
    camera: "",
    lens: "",
  })

  useEffect(() => {
    if (photo) {
      setFormData({
        title: photo.title,
        description: photo.description || "",
        imageUrl: photo.imageUrl,
        category: photo.category || "",
        location: photo.location || "",
        dateTaken: photo.dateTaken || "",
        cameraSettings: photo.cameraSettings,
        tags: photo.tags || [],
        featured: photo.featured,
      })
      setCameraSettings(photo.cameraSettings || {
        aperture: "",
        shutterSpeed: "",
        iso: undefined,
        focalLength: "",
        camera: "",
        lens: "",
      })
      setSelectedFile(null)
      setPreviewUrl(null)
    } else {
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        category: "",
        location: "",
        dateTaken: "",
        cameraSettings: null,
        tags: [],
        featured: false,
      })
      setCameraSettings({
        aperture: "",
        shutterSpeed: "",
        iso: undefined,
        focalLength: "",
        camera: "",
        lens: "",
      })
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }, [photo, open])

  // Clean up preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const generateUniqueName = (file: File) => {
    const extension = file.name.split(".").pop() ?? "jpg"
    const randomPart =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
    return `${randomPart}.${extension}`
  }

  const handleAnalyzeImage = async () => {
    if (!selectedFile) {
      toast.error("Please select an image file first")
      return
    }

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/analyze-photo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to analyze image")
      }

      const analysis = await response.json()

      // Populate form fields with AI analysis
      setFormData((prev) => ({
        ...prev,
        title: analysis.title || prev.title,
        description: analysis.description || prev.description,
        category: analysis.category || prev.category,
        location: analysis.location || prev.location,
        tags: analysis.tags || prev.tags,
      }))

      // Update alt text if provided
      if (analysis.alt_text) {
        // Note: alt_text is not in PhotoInsert, but we can store it separately if needed
        // For now, we'll add it to description if it's different
      }

      toast.success("Image analyzed successfully! Review and adjust the fields as needed.")
    } catch (error) {
      console.error("Error analyzing image:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to analyze image. Please fill in the fields manually."
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let imageUrl = formData.imageUrl

      // If a new file is selected, upload it to Supabase Storage
      if (selectedFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error("You must be logged in to upload photos")
        }

        const uniqueName = generateUniqueName(selectedFile)
        const filePath = `photography/${uniqueName}`

        const { error: storageError } = await supabase.storage
          .from("media")
          .upload(filePath, selectedFile)

        if (storageError) {
          console.error("[PhotoForm] Storage upload error:", storageError)
          throw new Error(`Failed to upload image: ${storageError.message}`)
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      // If editing and no new file selected, use existing imageUrl
      if (isEditing && !selectedFile && photo) {
        imageUrl = photo.imageUrl
      }

      // Validate that we have an image URL
      if (!imageUrl) {
        throw new Error("Please select an image file")
      }

      const cameraSettingsData = Object.values(cameraSettings).some((v) => v)
        ? cameraSettings
        : null

      if (isEditing && photo) {
        const updateData = {
          id: photo.id,
          ...formData,
          imageUrl,
          cameraSettings: cameraSettingsData,
        }
        await updatePhoto(updateData)
        toast.success("Photo updated successfully")
      } else {
        await createPhoto({
          ...formData,
          imageUrl,
          cameraSettings: cameraSettingsData,
        })
        toast.success("Photo created successfully")
      }

      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }

      onOpenChange(false)
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save photo"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((_, i) => i !== index) || [],
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Photo" : "New Photo"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your photo details"
              : "Add a new photo to your collection"}
          </DialogDescription>
        </DialogHeader>
        <form id="photo-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Sunset over Mountains"
              required
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your photo..."
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="imageFile">
                {isEditing ? "Image (select new file to replace)" : "Image *"}
              </Label>
              {selectedFile && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing}
                  className="gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      AI Analyze
                    </>
                  )}
                </Button>
              )}
            </div>
            <Input
              id="imageFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              required={!isEditing}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, WEBP, GIF (max 10MB)
            </p>
            {(previewUrl || (isEditing && photo && !selectedFile)) && (
              <div className="relative aspect-video w-full rounded-lg border overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl || photo?.imageUrl || ""}
                  alt="Preview"
                  className="object-cover w-full h-full rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Landscape, Portrait"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., New York, USA"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="dateTaken">Date Taken</Label>
            <Input
              id="dateTaken"
              type="date"
              value={formData.dateTaken || ""}
              onChange={(e) =>
                setFormData({ ...formData, dateTaken: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label>Camera Settings (Optional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="aperture" className="text-xs">Aperture</Label>
                <Input
                  id="aperture"
                  value={cameraSettings.aperture || ""}
                  onChange={(e) =>
                    setCameraSettings({
                      ...cameraSettings,
                      aperture: e.target.value,
                    })
                  }
                  placeholder="e.g., f/2.8"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="shutterSpeed" className="text-xs">Shutter Speed</Label>
                <Input
                  id="shutterSpeed"
                  value={cameraSettings.shutterSpeed || ""}
                  onChange={(e) =>
                    setCameraSettings({
                      ...cameraSettings,
                      shutterSpeed: e.target.value,
                    })
                  }
                  placeholder="e.g., 1/250s"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="iso" className="text-xs">ISO</Label>
                <Input
                  id="iso"
                  type="number"
                  value={cameraSettings.iso || ""}
                  onChange={(e) =>
                    setCameraSettings({
                      ...cameraSettings,
                      iso: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="e.g., 400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="focalLength" className="text-xs">Focal Length</Label>
                <Input
                  id="focalLength"
                  value={cameraSettings.focalLength || ""}
                  onChange={(e) =>
                    setCameraSettings({
                      ...cameraSettings,
                      focalLength: e.target.value,
                    })
                  }
                  placeholder="e.g., 50mm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="camera" className="text-xs">Camera</Label>
                <Input
                  id="camera"
                  value={cameraSettings.camera || ""}
                  onChange={(e) =>
                    setCameraSettings({
                      ...cameraSettings,
                      camera: e.target.value,
                    })
                  }
                  placeholder="e.g., Canon EOS R5"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lens" className="text-xs">Lens</Label>
                <Input
                  id="lens"
                  value={cameraSettings.lens || ""}
                  onChange={(e) =>
                    setCameraSettings({
                      ...cameraSettings,
                      lens: e.target.value,
                    })
                  }
                  placeholder="e.g., 24-70mm f/2.8"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Add tag (press Enter)"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, featured: !!checked })
              }
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Featured photo (show on frontend)
            </Label>
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="photo-form" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Photo" : "Create Photo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

