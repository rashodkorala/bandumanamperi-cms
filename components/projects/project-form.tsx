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
import { Separator } from "@/components/ui/separator"
import { IconSparkles, IconLoader } from "@tabler/icons-react"
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
  ProjectCategory,
  ProjectStatus,
} from "@/lib/types/project"
import { createProject, updateProject } from "@/lib/actions/projects"
import { generateSlug, validateSlug } from "@/lib/utils/slug"
import { ProjectQuestionnaire } from "./project-questionnaire"

interface QuestionnaireAnswers {
  projectName: string
  category: ProjectCategory | null
  oneLineDescription: string
  problem: string
  targetAudience: string
  uniqueSolution: string
  mainFeatures: string
  userCapabilities: string
  technologies: string
  frameworks: string
  role: string
  liveUrl: string
  githubUrl: string
  caseStudyUrl: string
}

interface ProjectFormProps {
  project?: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectForm({ project, open, onOpenChange }: ProjectFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!project

  const [formData, setFormData] = useState<ProjectInsert>({
    slug: "",
    title: "",
    subtitle: "",
    problem: "",
    solution: "",
    roles: [],
    features: [],
    tech: [],
    liveUrl: "",
    githubUrl: "",
    caseStudyUrl: "",
    coverImageUrl: "",
    galleryImageUrls: [],
    category: null,
    status: "draft",
    featured: false,
    sortOrder: 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [roleInput, setRoleInput] = useState("")
  const [featureInput, setFeatureInput] = useState("")
  const [techInput, setTechInput] = useState("")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>("")
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<Record<string, string>>({})
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [aiLoading, setAiLoading] = useState<{
    subtitle?: boolean
    problem?: boolean
    solution?: boolean
    features?: boolean
    tech?: boolean
  }>({})

  useEffect(() => {
    if (project) {
      setFormData({
        slug: project.slug,
        title: project.title,
        subtitle: project.subtitle || "",
        problem: project.problem || "",
        solution: project.solution || "",
        roles: project.roles || [],
        features: project.features || [],
        tech: project.tech || [],
        liveUrl: project.liveUrl || "",
        githubUrl: project.githubUrl || "",
        caseStudyUrl: project.caseStudyUrl || "",
        coverImageUrl: project.coverImageUrl || "",
        galleryImageUrls: project.galleryImageUrls || [],
        category: project.category,
        status: project.status,
        featured: project.featured,
        sortOrder: project.sortOrder,
      })
      setAutoGenerateSlug(false)
      setCoverPreview(project.coverImageUrl || "")
      setCoverFile(null)
      setGalleryFiles([])
      setGalleryPreviews({})
    } else {
      setFormData({
        slug: "",
        title: "",
        subtitle: "",
        problem: "",
        solution: "",
        roles: [],
        features: [],
        tech: [],
        liveUrl: "",
        githubUrl: "",
        caseStudyUrl: "",
        coverImageUrl: "",
        galleryImageUrls: [],
        category: null,
        status: "draft",
        featured: false,
        sortOrder: 0,
      })
      setAutoGenerateSlug(true)
      setCoverPreview("")
      setCoverFile(null)
      setGalleryFiles([])
      setGalleryPreviews({})
    }
  }, [project, open])

  // Auto-generate slug from title
  useEffect(() => {
    if (autoGenerateSlug && formData.title && !isEditing) {
      const newSlug = generateSlug(formData.title)
      setFormData((prev) => ({ ...prev, slug: newSlug }))
    }
  }, [formData.title, autoGenerateSlug, isEditing])

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview)
      }
      Object.values(galleryPreviews).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [coverPreview, galleryPreviews])

  const generateUniqueName = (file: File) => {
    const extension = file.name.split(".").pop() ?? "jpg"
    const randomPart =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
    return `${randomPart}.${extension}`
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB")
      return
    }

    // Clean up previous preview URL if it was a blob URL
    if (coverPreview && coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview)
    }

    setCoverFile(file)
    const previewUrl = URL.createObjectURL(file)
    setCoverPreview(previewUrl)

    // Clear the existing cover image URL when a new file is selected
    // This ensures the new file will be uploaded instead of keeping the old one
    setFormData((prev) => ({ ...prev, coverImageUrl: "" }))
  }

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`)
        return false
      }
      return true
    })

    const newPreviews: Record<string, string> = {}
    validFiles.forEach((file) => {
      newPreviews[file.name] = URL.createObjectURL(file)
    })

    setGalleryFiles((prev) => [...prev, ...validFiles])
    setGalleryPreviews((prev) => ({ ...prev, ...newPreviews }))
  }

  const removeGalleryFile = (index: number) => {
    const fileToRemove = galleryFiles[index]
    if (galleryPreviews[fileToRemove.name]) {
      URL.revokeObjectURL(galleryPreviews[fileToRemove.name])
    }
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index))
    setGalleryPreviews((prev) => {
      const newPreviews = { ...prev }
      delete newPreviews[fileToRemove.name]
      return newPreviews
    })
  }

  const removeGalleryImage = (index: number) => {
    setFormData({
      ...formData,
      galleryImageUrls: formData.galleryImageUrls?.filter((_, i) => i !== index) || [],
    })
  }

  const addRole = () => {
    if (roleInput.trim()) {
      setFormData({
        ...formData,
        roles: [...(formData.roles || []), roleInput.trim()],
      })
      setRoleInput("")
    }
  }

  const removeRole = (index: number) => {
    setFormData({
      ...formData,
      roles: formData.roles?.filter((_, i) => i !== index) || [],
    })
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), featureInput.trim()],
      })
      setFeatureInput("")
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features?.filter((_, i) => i !== index) || [],
    })
  }

  const addTech = () => {
    if (techInput.trim()) {
      setFormData({
        ...formData,
        tech: [...(formData.tech || []), techInput.trim()],
      })
      setTechInput("")
    }
  }

  const removeTech = (index: number) => {
    setFormData({
      ...formData,
      tech: formData.tech?.filter((_, i) => i !== index) || [],
    })
  }

  const handleQuestionnaireGenerate = async (answers: QuestionnaireAnswers) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/generate-project-from-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answers),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate content")
      }

      const generatedData = await response.json()

      // Populate form with generated data
      setFormData((prev) => ({
        ...prev,
        title: generatedData.title,
        subtitle: generatedData.subtitle,
        problem: generatedData.problem,
        solution: generatedData.solution,
        features: generatedData.features || [],
        tech: generatedData.tech || [],
        roles: generatedData.roles || [],
        category: generatedData.category,
        liveUrl: generatedData.liveUrl,
        githubUrl: generatedData.githubUrl,
        caseStudyUrl: generatedData.caseStudyUrl,
        slug: generateSlug(generatedData.title),
      }))

      toast.success("Project content generated! Review and adjust as needed.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate content. Please fill in the form manually."
      )
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const generateWithAI = async (type: "subtitle" | "problem" | "solution" | "features" | "tech") => {
    if (!formData.title.trim()) {
      toast.error("Please enter a project title first")
      return
    }

    setAiLoading((prev) => ({ ...prev, [type]: true }))

    try {
      const response = await fetch("/api/generate-project-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          title: formData.title,
          subtitle: formData.subtitle,
          context: formData.category ? `Category: ${formData.category}` : undefined,
          problem: formData.problem,
          solution: formData.solution,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate content")
      }

      const data = await response.json()
      const content = data.content

      if (type === "features" || type === "tech") {
        // For arrays, replace the existing array
        setFormData({
          ...formData,
          [type === "features" ? "features" : "tech"]: content,
        })
        toast.success(
          `Generated ${content.length} ${type === "features" ? "features" : "technologies"}`
        )
      } else {
        // For text fields, set the content
        setFormData({
          ...formData,
          [type]: content,
        })
        toast.success("Content generated successfully")
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate content. Make sure OPENAI_API_KEY is set."
      )
    } finally {
      setAiLoading((prev) => ({ ...prev, [type]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!formData.slug.trim()) {
      toast.error("Slug is required")
      return
    }
    if (!validateSlug(formData.slug)) {
      toast.error("Slug must be lowercase, alphanumeric with hyphens only")
      return
    }

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in")
      }

      // Upload cover image
      let coverImageUrl = formData.coverImageUrl
      if (coverFile) {
        try {
          const uniqueName = generateUniqueName(coverFile)
          const timestamp = Date.now()
          const filePath = `cover/${timestamp}-${uniqueName}`

          console.log("Uploading cover image to:", filePath)

          const { data: uploadData, error: storageError } = await supabase.storage
            .from("projects")
            .upload(filePath, coverFile, {
              cacheControl: "3600",
              upsert: false,
            })

          if (storageError) {
            console.error("Storage upload error:", storageError)

            // Check if bucket exists
            if (storageError.message.includes("Bucket not found") || storageError.message.includes("does not exist")) {
              throw new Error(
                "Projects storage bucket not found. Please create the 'projects' bucket in Supabase Storage. See documentation for setup instructions."
              )
            }

            // Check permissions
            if (storageError.message.includes("new row violates") || storageError.message.includes("policy")) {
              throw new Error(
                "Storage permission denied. Please check your Supabase storage policies. See documentation for setup instructions."
              )
            }

            throw new Error(`Failed to upload cover image: ${storageError.message}`)
          }

          if (!uploadData) {
            throw new Error("Upload succeeded but no data returned")
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("projects").getPublicUrl(filePath)

          if (!publicUrl) {
            throw new Error("Failed to get public URL for uploaded image")
          }

          coverImageUrl = publicUrl
          console.log("Cover image uploaded successfully:", publicUrl)
        } catch (error) {
          console.error("Error uploading cover image:", error)
          throw error
        }
      }

      // Upload gallery images
      const uploadedGalleryUrls: string[] = []
      for (const file of galleryFiles) {
        try {
          const uniqueName = generateUniqueName(file)
          const timestamp = Date.now()
          const filePath = `gallery/${timestamp}-${uniqueName}`

          const { data: uploadData, error: storageError } = await supabase.storage
            .from("projects")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            })

          if (storageError) {
            console.error("Gallery image upload error:", storageError)
            throw new Error(`Failed to upload gallery image: ${storageError.message}`)
          }

          if (!uploadData) {
            throw new Error("Upload succeeded but no data returned")
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("projects").getPublicUrl(filePath)

          if (!publicUrl) {
            throw new Error("Failed to get public URL for uploaded image")
          }

          uploadedGalleryUrls.push(publicUrl)
        } catch (error) {
          console.error("Error uploading gallery image:", error)
          throw error
        }
      }

      // Combine existing gallery images with newly uploaded ones
      const allGalleryUrls = [
        ...(formData.galleryImageUrls || []),
        ...uploadedGalleryUrls,
      ]

      const projectData: ProjectInsert = {
        ...formData,
        coverImageUrl,
        galleryImageUrls: allGalleryUrls,
      }

      if (isEditing && project) {
        const updateData: ProjectUpdate = {
          id: project.id,
          ...projectData,
        }
        await updateProject(updateData)
        toast.success("Project updated successfully")
      } else {
        await createProject(projectData)
        toast.success("Project created successfully")
      }

      onOpenChange(false)
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      console.error("Error saving project:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save project"
      toast.error(errorMessage)
      // Log full error for debugging
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Project" : "New Project"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your project details"
              : "Add a new project to your portfolio"}
          </DialogDescription>
          {!isEditing && (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowQuestionnaire(true)}
                className="gap-2"
              >
                <IconSparkles className="size-4" />
                Use AI Questionnaire (Optional)
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Answer a few questions and we&apos;ll generate all content for you
              </p>
            </div>
          )}
        </DialogHeader>
        <form id="project-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Basic Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., AetherLabs"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => generateWithAI("subtitle")}
                    disabled={aiLoading.subtitle || !formData.title.trim()}
                    className="h-7 text-xs"
                  >
                    {aiLoading.subtitle ? (
                      <IconLoader className="size-3 mr-1 animate-spin" />
                    ) : (
                      <IconSparkles className="size-3 mr-1" />
                    )}
                    AI Generate
                  </Button>
                </div>
                <Input
                  id="subtitle"
                  value={formData.subtitle || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="Short one-liner summary (optional)"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">Slug *</Label>
                {!isEditing && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="auto-slug"
                      checked={autoGenerateSlug}
                      onCheckedChange={(checked) => setAutoGenerateSlug(!!checked)}
                    />
                    <Label htmlFor="auto-slug" className="text-xs cursor-pointer">
                      Auto-generate from title
                    </Label>
                  </div>
                )}
              </div>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="url-friendly-slug"
                required
                disabled={autoGenerateSlug && !isEditing}
              />
              <p className="text-xs text-muted-foreground">
                Used for URL routing (lowercase, hyphens only)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || ""}
                  onValueChange={(value: ProjectCategory) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ProjectStatus) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, featured: !!checked })
                  }
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Featured project
                </Label>
              </div>
              <div className="flex flex-col gap-2">
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
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Content Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Content</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="problem">Problem</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => generateWithAI("problem")}
                  disabled={aiLoading.problem || !formData.title.trim()}
                  className="h-7 text-xs"
                >
                  {aiLoading.problem ? (
                    <IconLoader className="size-3 mr-1 animate-spin" />
                  ) : (
                    <IconSparkles className="size-3 mr-1" />
                  )}
                  AI Generate
                </Button>
              </div>
              <Textarea
                id="problem"
                value={formData.problem || ""}
                onChange={(e) =>
                  setFormData({ ...formData, problem: e.target.value })
                }
                placeholder="Describe the problem this project solves..."
                rows={4}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="solution">Solution</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => generateWithAI("solution")}
                  disabled={aiLoading.solution || !formData.title.trim()}
                  className="h-7 text-xs"
                >
                  {aiLoading.solution ? (
                    <IconLoader className="size-3 mr-1 animate-spin" />
                  ) : (
                    <IconSparkles className="size-3 mr-1" />
                  )}
                  AI Generate
                </Button>
              </div>
              <Textarea
                id="solution"
                value={formData.solution || ""}
                onChange={(e) =>
                  setFormData({ ...formData, solution: e.target.value })
                }
                placeholder="Describe how this project solves the problem..."
                rows={4}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="roles">Roles</Label>
              <div className="flex gap-2">
                <Input
                  id="roles"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addRole()
                    }
                  }}
                  placeholder="e.g., Full-stack development"
                />
                <Button type="button" onClick={addRole} variant="outline">
                  Add
                </Button>
              </div>
              {formData.roles && formData.roles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.roles.map((role, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                    >
                      <span>{role}</span>
                      <button
                        type="button"
                        onClick={() => removeRole(index)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="features">Features</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => generateWithAI("features")}
                  disabled={aiLoading.features || !formData.title.trim()}
                  className="h-7 text-xs"
                >
                  {aiLoading.features ? (
                    <IconLoader className="size-3 mr-1 animate-spin" />
                  ) : (
                    <IconSparkles className="size-3 mr-1" />
                  )}
                  AI Generate All
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  id="features"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addFeature()
                    }
                  }}
                  placeholder="Add a feature..."
                />
                <Button type="button" onClick={addFeature} variant="outline">
                  Add
                </Button>
              </div>
              {formData.features && formData.features.length > 0 && (
                <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                  {formData.features.map((feature, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span>{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tech">Tech Stack</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => generateWithAI("tech")}
                  disabled={aiLoading.tech || !formData.title.trim()}
                  className="h-7 text-xs"
                >
                  {aiLoading.tech ? (
                    <IconLoader className="size-3 mr-1 animate-spin" />
                  ) : (
                    <IconSparkles className="size-3 mr-1" />
                  )}
                  AI Generate All
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  id="tech"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTech()
                    }
                  }}
                  placeholder="e.g., Next.js"
                />
                <Button type="button" onClick={addTech} variant="outline">
                  Add
                </Button>
              </div>
              {formData.tech && formData.tech.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tech.map((tech, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => removeTech(index)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Links</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor="liveUrl">Live URL</Label>
              <Input
                id="liveUrl"
                type="url"
                value={formData.liveUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, liveUrl: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                type="url"
                value={formData.githubUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, githubUrl: e.target.value })
                }
                placeholder="https://github.com/user/repo"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="caseStudyUrl">Case Study URL</Label>
              <Input
                id="caseStudyUrl"
                type="url"
                value={formData.caseStudyUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, caseStudyUrl: e.target.value })
                }
                placeholder="https://example.com/case-study"
              />
            </div>
          </div>

          <Separator />

          {/* Images Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Images</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor="coverImage">Cover Image</Label>
              <Input
                id="coverImage"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleCoverImageChange}
              />
              {(coverFile || coverPreview || formData.coverImageUrl) && (
                <div className="relative w-full max-w-md aspect-video rounded-lg border overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      coverFile && coverPreview
                        ? coverPreview // New file preview (blob URL)
                        : formData.coverImageUrl || coverPreview || "" // Existing image or fallback
                    }
                    alt="Cover preview"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // Clean up blob URL if it exists
                      if (coverPreview && coverPreview.startsWith("blob:")) {
                        URL.revokeObjectURL(coverPreview)
                      }
                      setCoverFile(null)
                      setCoverPreview("")
                      // If editing, also clear the existing cover image URL
                      if (isEditing) {
                        setFormData((prev) => ({ ...prev, coverImageUrl: "" }))
                      }
                    }}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    title="Remove cover image"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="galleryImages">Gallery Images</Label>
              <Input
                id="galleryImages"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleGalleryImagesChange}
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: JPEG, PNG, WEBP, GIF (max 10MB each)
              </p>

              {/* New gallery file previews */}
              {galleryFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {galleryFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative group aspect-video rounded-lg border overflow-hidden bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={galleryPreviews[file.name]}
                        alt={file.name}
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryFile(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Existing gallery images */}
              {formData.galleryImageUrls && formData.galleryImageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {formData.galleryImageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative group aspect-video rounded-lg border overflow-hidden bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Gallery image ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="project-form" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : isEditing
                ? "Update Project"
                : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Questionnaire Dialog */}
      <ProjectQuestionnaire
        open={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        onGenerate={handleQuestionnaireGenerate}
      />
    </Dialog>
  )
}
