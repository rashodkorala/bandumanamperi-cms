"use client"

import { useState, useEffect } from "react"
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconPlus,
  IconRefresh,
  IconCalendar,
  IconMapPin,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PerformanceForm } from "./performance-form"
import type { Performance } from "@/lib/types/performance"
import { deletePerformance } from "@/lib/actions/performances"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface PerformancesProps {
  initialPerformances: Performance[]
}

export function Performances({ initialPerformances }: PerformancesProps) {
  const router = useRouter()
  const supabase = createClient()
  const [performances, setPerformances] = useState<Performance[]>(initialPerformances)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    setPerformances(initialPerformances)
  }, [initialPerformances])

  // Get unique types and categories
  const types = Array.from(
    new Set(performances.map((p) => p.type).filter(Boolean))
  )
  const categories = Array.from(
    new Set(performances.map((p) => p.category).filter(Boolean))
  ) as string[]

  // Filter performances
  let filteredPerformances = performances
  if (selectedType) {
    filteredPerformances = filteredPerformances.filter((p) => p.type === selectedType)
  }
  if (selectedCategory) {
    filteredPerformances = filteredPerformances.filter(
      (p) => p.category === selectedCategory
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this performance?")) {
      return
    }

    try {
      await deletePerformance(id)
      setPerformances(performances.filter((p) => p.id !== id))
      toast.success("Performance deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete performance"
      )
    }
  }

  const handleEdit = (performance: Performance) => {
    setEditingPerformance(performance)
    setIsFormOpen(true)
  }

  const handleNewPerformance = () => {
    setEditingPerformance(null)
    setIsFormOpen(true)
  }

  const handleFormClose = (shouldRefresh: boolean = true) => {
    setIsFormOpen(false)
    setEditingPerformance(null)
    if (shouldRefresh) {
      router.refresh()
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const stats = {
    total: performances.length,
    published: performances.filter((p) => p.status === "published").length,
    draft: performances.filter((p) => p.status === "draft").length,
    featured: performances.filter((p) => p.featured).length,
  }

  const getCoverImageUrl = (coverImage: string | null) => {
    if (!coverImage) return null
    const { data } = supabase.storage.from("performances").getPublicUrl(coverImage)
    return data.publicUrl
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performances</h1>
          <p className="text-muted-foreground">
            Manage your performance history and upcoming shows
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <IconRefresh
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
            Refresh
          </Button>
          <Button onClick={handleNewPerformance}>
            <IconPlus className="h-4 w-4 mr-2" />
            Add Performance
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardDescription className="text-2xl font-bold px-6 pb-4">
            {stats.total}
          </CardDescription>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardDescription className="text-2xl font-bold px-6 pb-4">
            {stats.published}
          </CardDescription>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardDescription className="text-2xl font-bold px-6 pb-4">
            {stats.draft}
          </CardDescription>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
          </CardHeader>
          <CardDescription className="text-2xl font-bold px-6 pb-4">
            {stats.featured}
          </CardDescription>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        {types.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground self-center">Type:</span>
            <Button
              variant={selectedType === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(null)}
            >
              All
            </Button>
            {types.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        )}

        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground self-center">
              Category:
            </span>
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Performance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPerformances.map((performance) => {
          const coverUrl = getCoverImageUrl(performance.coverImage)
          return (
            <Card key={performance.id} className="relative group">
              <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt={performance.title}
                    className="w-full h-full object-cover"
                    width={400}
                    height={225}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconCalendar className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {performance.title}
                    </CardTitle>
                    {performance.date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <IconCalendar className="h-3 w-3" />
                        {performance.date}
                      </div>
                    )}
                    {performance.venue && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <IconMapPin className="h-3 w-3" />
                        {performance.venue}
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(performance)}>
                        <IconEdit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(performance.id)}
                      >
                        <IconTrash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex gap-1 flex-wrap mt-2">
                  <Badge variant={performance.status === "published" ? "default" : "secondary"}>
                    {performance.status}
                  </Badge>
                  {performance.featured && (
                    <Badge variant="outline">Featured</Badge>
                  )}
                  {performance.type && (
                    <Badge variant="outline">{performance.type}</Badge>
                  )}
                  {performance.category && (
                    <Badge variant="secondary">{performance.category}</Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {filteredPerformances.length === 0 && (
        <div className="text-center py-12">
          <IconCalendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No performances found</p>
          <Button onClick={handleNewPerformance} className="mt-4">
            <IconPlus className="h-4 w-4 mr-2" />
            Add Your First Performance
          </Button>
        </div>
      )}

      <PerformanceForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editingPerformance={editingPerformance}
      />
    </div>
  )
}



