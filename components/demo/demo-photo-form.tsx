"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Photo, PhotoInsert, CameraSettings } from "@/lib/types/photo"

interface DemoPhotoFormProps {
  photo?: Photo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (photo: Photo) => void
}

const categories = [
  "architecture",
  "nature",
  "street",
  "travel",
  "wildlife",
  "night",
  "abstract",
  "interior_spaces",
]

export function DemoPhotoForm({ photo, open, onOpenChange, onSave }: DemoPhotoFormProps) {
  const isEditing = !!photo

  const [formData, setFormData] = useState<PhotoInsert>({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
    location: "",
    dateTaken: "",
    altText: "",
    cameraSettings: null,
    tags: [],
    featured: false,
  })

  const [tagInput, setTagInput] = useState("")
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
        altText: photo.altText || "",
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
    } else {
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        category: "",
        location: "",
        dateTaken: "",
        altText: "",
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
    }
    setTagInput("")
  }, [photo, open])

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.imageUrl) {
      toast.error("Title and Image URL are required")
      return
    }

    const photoData: Photo = {
      id: photo?.id || `demo-${Date.now()}`,
      title: formData.title,
      description: formData.description || null,
      imageUrl: formData.imageUrl,
      category: formData.category || null,
      location: formData.location || null,
      dateTaken: formData.dateTaken || null,
      altText: formData.altText || null,
      cameraSettings: Object.values(cameraSettings).some((v) => v) ? cameraSettings : null,
      tags: formData.tags || null,
      featured: formData.featured || false,
      created_at: photo?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "demo-user",
    }

    onSave(photoData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Photo" : "Add New Photo"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update photo details" : "Add a new photo to your collection"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL *</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              required
            />
            {formData.imageUrl && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTaken">Date Taken</Label>
            <Input
              id="dateTaken"
              type="date"
              value={formData.dateTaken || ""}
              onChange={(e) => setFormData({ ...formData, dateTaken: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="altText">Alt Text</Label>
            <Input
              id="altText"
              value={formData.altText || ""}
              onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
              placeholder="Accessibility description"
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <Label>Camera Settings</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aperture">Aperture</Label>
                <Input
                  id="aperture"
                  value={cameraSettings.aperture || ""}
                  onChange={(e) =>
                    setCameraSettings({ ...cameraSettings, aperture: e.target.value })
                  }
                  placeholder="f/2.8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shutterSpeed">Shutter Speed</Label>
                <Input
                  id="shutterSpeed"
                  value={cameraSettings.shutterSpeed || ""}
                  onChange={(e) =>
                    setCameraSettings({ ...cameraSettings, shutterSpeed: e.target.value })
                  }
                  placeholder="1/250s"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iso">ISO</Label>
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
                  placeholder="400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="focalLength">Focal Length</Label>
                <Input
                  id="focalLength"
                  value={cameraSettings.focalLength || ""}
                  onChange={(e) =>
                    setCameraSettings({ ...cameraSettings, focalLength: e.target.value })
                  }
                  placeholder="50mm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="camera">Camera</Label>
                <Input
                  id="camera"
                  value={cameraSettings.camera || ""}
                  onChange={(e) =>
                    setCameraSettings({ ...cameraSettings, camera: e.target.value })
                  }
                  placeholder="Canon EOS R5"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
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
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 border-t pt-4">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, featured: checked === true })
              }
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Mark as featured
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Update" : "Create"} Photo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

