"use client"

import { useState, useEffect, useMemo } from "react"
import {
  IconDotsVertical,
  IconEdit,
  IconPalette,
  IconEye,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ArtworkPreview } from "./artwork-preview"
import type { Artwork, ArtworkStatus } from "@/lib/types/artwork"
import { deleteArtwork } from "@/lib/actions/artworks"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface CollectionsProps {
  initialCollections: Record<string, Artwork[]>
}

const Collections = ({ initialCollections }: CollectionsProps) => {
  const router = useRouter()
  const [collections, setCollections] = useState<Record<string, Artwork[]>>(initialCollections)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewArtwork, setPreviewArtwork] = useState<Artwork | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const supabase = useMemo(() => createClient(), [])

  // Sync state when initialCollections changes
  useEffect(() => {
    setCollections(initialCollections)
  }, [initialCollections])

  // Filter collections by search query
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) {
      return collections
    }

    const query = searchQuery.toLowerCase()
    const filtered: Record<string, Artwork[]> = {}

    Object.entries(collections).forEach(([collectionName, artworks]) => {
      // Filter by collection name
      if (collectionName.toLowerCase().includes(query)) {
        filtered[collectionName] = artworks
        return
      }

      // Filter by artwork titles in collection
      const matchingArtworks = artworks.filter(
        (artwork) =>
          artwork.title?.toLowerCase().includes(query) ||
          artwork.description?.toLowerCase().includes(query) ||
          artwork.category?.toLowerCase().includes(query)
      )

      if (matchingArtworks.length > 0) {
        filtered[collectionName] = matchingArtworks
      }
    })

    return filtered
  }, [collections, searchQuery])

  const handleDelete = async (id: string, collectionName: string) => {
    if (!confirm("Are you sure you want to delete this artwork?")) {
      return
    }

    try {
      await deleteArtwork(id)
      setCollections((prev) => {
        const updated = { ...prev }
        if (updated[collectionName]) {
          updated[collectionName] = updated[collectionName].filter((a) => a.id !== id)
          // Remove collection if empty
          if (updated[collectionName].length === 0) {
            delete updated[collectionName]
          }
        }
        return updated
      })
      toast.success("Artwork deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete artwork"
      )
    }
  }

  const handlePreview = (artwork: Artwork) => {
    setPreviewArtwork(artwork)
    setIsPreviewOpen(true)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      router.refresh()
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success("Data refreshed")
    } catch {
      toast.error("Failed to refresh data")
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusBadgeColor = (status: ArtworkStatus) => {
    switch (status) {
      case "published":
        return "text-green-600 dark:text-green-400"
      case "draft":
        return "text-yellow-600 dark:text-yellow-400"
      case "archived":
        return "text-gray-600 dark:text-gray-400"
      default:
        return ""
    }
  }

  const getImageUrl = (path: string | null) => {
    if (!path) return null

    // If path is already a full URL, return it as-is
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path
    }

    // Otherwise, create public URL from storage path
    const { data } = supabase.storage.from("artworks").getPublicUrl(path)
    return data.publicUrl
  }

  const collectionNames = Object.keys(filteredCollections).sort()
  const totalCollections = collectionNames.length
  const totalArtworks = Object.values(filteredCollections).reduce(
    (sum, artworks) => sum + artworks.length,
    0
  )

  const stats = {
    totalCollections,
    totalArtworks,
    published: Object.values(filteredCollections).reduce(
      (sum, artworks) => sum + artworks.filter((a) => a.status === "published").length,
      0
    ),
    draft: Object.values(filteredCollections).reduce(
      (sum, artworks) => sum + artworks.filter((a) => a.status === "draft").length,
      0
    ),
  }

  return (
    <div className="flex flex-grow flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-6 @xl/main:grid-cols-4">
            <Card>
              <CardHeader>
                <CardDescription>Total Collections</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {stats.totalCollections}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Total Artworks</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {stats.totalArtworks}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Published</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {stats.published}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Drafts</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {stats.draft}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Collections List */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Collections</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage your artwork collections
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                >
                  <IconRefresh
                    className={cn("size-4", isRefreshing && "animate-spin")}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Link href="/protected/artworks">
                  <Button variant="outline" size="sm">
                    <IconPalette className="size-4" />
                    <span className="hidden sm:inline">All Artworks</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <Input
                placeholder="Search collections or artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {collectionNames.length === 0 ? (
              <Card>
                <CardHeader className="text-center">
                  <IconPalette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <CardTitle>No Collections Found</CardTitle>
                  <CardDescription>
                    {searchQuery
                      ? "No collections match your search query."
                      : "Create collections by assigning a series name to your artworks."}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-6">
                {collectionNames.map((collectionName) => {
                  const artworks = filteredCollections[collectionName]
                  const publishedCount = artworks.filter((a) => a.status === "published").length
                  const draftCount = artworks.filter((a) => a.status === "draft").length

                  return (
                    <Card key={collectionName}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl">{collectionName}</CardTitle>
                            <CardDescription>
                              {artworks.length} artwork{artworks.length !== 1 ? "s" : ""}
                              {publishedCount > 0 && (
                                <span className="ml-2">
                                  • {publishedCount} published
                                  {draftCount > 0 && `, ${draftCount} draft${draftCount !== 1 ? "s" : ""}`}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <div className="px-6 pb-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {artworks.map((artwork) => {
                            const imageUrl = artwork.thumbnailPath
                              ? getImageUrl(artwork.thumbnailPath)
                              : artwork.media && artwork.media.length > 0
                                ? getImageUrl(artwork.media[0])
                                : null

                            return (
                              <Card key={artwork.id} className="group relative overflow-hidden">
                                <div className="relative aspect-square overflow-hidden">
                                  {imageUrl ? (
                                    <Image
                                      src={imageUrl}
                                      alt={artwork.title || "Artwork"}
                                      fill
                                      className="object-cover transition-transform group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                      <IconPalette className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                                  <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="secondary"
                                          size="icon"
                                          className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                                        >
                                          <IconDotsVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handlePreview(artwork)}>
                                          <IconEye className="size-4 mr-2" />
                                          Preview
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-destructive focus:text-destructive"
                                          onClick={() => handleDelete(artwork.id, collectionName)}
                                        >
                                          <IconTrash className="size-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm line-clamp-1">
                                    {artwork.title || "Untitled"}
                                  </CardTitle>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className={cn("text-xs", getStatusBadgeColor(artwork.status))}
                                    >
                                      {artwork.status.charAt(0).toUpperCase() +
                                        artwork.status.slice(1)}
                                    </Badge>
                                    {artwork.category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {artwork.category}
                                      </Badge>
                                    )}
                                  </div>
                                </CardHeader>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <ArtworkPreview
        artwork={previewArtwork}
        open={isPreviewOpen}
        onOpenChange={(open) => {
          setIsPreviewOpen(open)
          if (!open) {
            setPreviewArtwork(null)
          }
        }}
      />
    </div>
  )
}

export default Collections

