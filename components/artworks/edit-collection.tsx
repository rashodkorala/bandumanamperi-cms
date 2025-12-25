"use client"

import { useState, useEffect, useMemo } from "react"
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
import { IconEdit, IconTrash, IconCheck, IconX, IconPlus, IconSearch } from "@tabler/icons-react"
import type { Artwork } from "@/lib/types/artwork"
import { renameCollection, removeArtworksFromCollection, getArtworks, updateArtworksCollection } from "@/lib/actions/artworks"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { IconPalette } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EditCollectionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionName: string
  artworks: Artwork[]
}

export function EditCollection({ open, onOpenChange, collectionName, artworks }: EditCollectionProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [newCollectionName, setNewCollectionName] = useState(collectionName)
  const [selectedRemoveIds, setSelectedRemoveIds] = useState<Set<string>>(new Set())
  const [selectedAddIds, setSelectedAddIds] = useState<Set<string>>(new Set())
  const [availableArtworks, setAvailableArtworks] = useState<Artwork[]>([])
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Reset state and fetch available artworks when drawer opens
  useEffect(() => {
    if (open) {
      setNewCollectionName(collectionName)
      setSelectedRemoveIds(new Set())
      setSelectedAddIds(new Set())
      setSearchQuery("")
      
      // Fetch all artworks to show available ones
      setIsLoadingAvailable(true)
      getArtworks({ includeDrafts: true })
        .then((allArtworks) => {
          // Filter out artworks already in this collection
          const currentArtworkIds = new Set(artworks.map((a) => a.id))
          const available = allArtworks.filter((a) => !currentArtworkIds.has(a.id))
          setAvailableArtworks(available)
        })
        .catch((error) => {
          console.error("Failed to fetch artworks:", error)
          toast.error("Failed to load available artworks")
        })
        .finally(() => {
          setIsLoadingAvailable(false)
        })
    }
  }, [open, collectionName, artworks])

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

  const toggleRemoveArtwork = (artworkId: string) => {
    setSelectedRemoveIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(artworkId)) {
        newSet.delete(artworkId)
      } else {
        newSet.add(artworkId)
      }
      return newSet
    })
  }

  const toggleAddArtwork = (artworkId: string) => {
    setSelectedAddIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(artworkId)) {
        newSet.delete(artworkId)
      } else {
        newSet.add(artworkId)
      }
      return newSet
    })
  }

  const selectAllRemove = () => {
    setSelectedRemoveIds(new Set(artworks.map((a) => a.id)))
  }

  const deselectAllRemove = () => {
    setSelectedRemoveIds(new Set())
  }

  const selectAllAdd = () => {
    const filtered = filteredAvailableArtworks.map((a) => a.id)
    setSelectedAddIds(new Set(filtered))
  }

  const deselectAllAdd = () => {
    setSelectedAddIds(new Set())
  }

  // Filter available artworks by search query
  const filteredAvailableArtworks = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableArtworks
    }

    const query = searchQuery.toLowerCase()
    return availableArtworks.filter(
      (artwork) =>
        artwork.title?.toLowerCase().includes(query) ||
        artwork.description?.toLowerCase().includes(query) ||
        artwork.category?.toLowerCase().includes(query) ||
        artwork.series?.toLowerCase().includes(query)
    )
  }, [availableArtworks, searchQuery])

  const handleRename = async () => {
    const trimmedName = newCollectionName.trim()
    
    if (!trimmedName) {
      toast.error("Collection name cannot be empty")
      return
    }

    if (trimmedName === collectionName) {
      toast.error("Please enter a different name")
      return
    }

    setIsSaving(true)
    try {
      await renameCollection(collectionName, trimmedName)
      toast.success(`Collection renamed to "${trimmedName}"`)
      handleClose()
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to rename collection"
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveArtworks = async () => {
    if (selectedRemoveIds.size === 0) {
      toast.error("Please select artworks to remove")
      return
    }

    if (!confirm(`Remove ${selectedRemoveIds.size} artwork(s) from "${collectionName}"?`)) {
      return
    }

    setIsSaving(true)
    try {
      await removeArtworksFromCollection(Array.from(selectedRemoveIds))
      toast.success(`Removed ${selectedRemoveIds.size} artwork(s) from collection`)
      handleClose()
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove artworks"
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddArtworks = async () => {
    if (selectedAddIds.size === 0) {
      toast.error("Please select artworks to add")
      return
    }

    setIsSaving(true)
    try {
      await updateArtworksCollection(Array.from(selectedAddIds), collectionName)
      toast.success(`Added ${selectedAddIds.size} artwork(s) to "${collectionName}"`)
      handleClose()
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add artworks"
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      setSelectedRemoveIds(new Set())
      setSelectedAddIds(new Set())
      setNewCollectionName(collectionName)
      setSearchQuery("")
      onOpenChange(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Edit Collection</DrawerTitle>
          <DrawerDescription>
            Rename the collection or remove artworks from it
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4">
          {/* Rename Section */}
          <div className="mb-4 space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Collection Name</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection-name">Name</Label>
              <div className="flex gap-2">
                <Input
                  id="collection-name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Collection name"
                  disabled={isSaving}
                />
                <Button
                  type="button"
                  onClick={handleRename}
                  disabled={isSaving || !newCollectionName.trim() || newCollectionName.trim() === collectionName}
                  size="sm"
                >
                  <IconEdit className="mr-2 h-4 w-4" />
                  Rename
                </Button>
              </div>
            </div>
          </div>

          {/* Tabbed Interface for Add/Remove */}
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">
                Current Artworks ({artworks.length})
              </TabsTrigger>
              <TabsTrigger value="add">
                Add Artworks ({availableArtworks.length})
              </TabsTrigger>
            </TabsList>

            {/* Current Artworks Tab - Remove */}
            <TabsContent value="current" className="space-y-4 mt-4">
              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Remove Artworks</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select artworks to remove from this collection
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllRemove}
                      disabled={isSaving || artworks.length === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={deselectAllRemove}
                      disabled={isSaving || selectedRemoveIds.size === 0}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {selectedRemoveIds.size > 0 && (
                  <div className="flex items-center justify-between rounded-md bg-muted p-3">
                    <span className="text-sm">
                      {selectedRemoveIds.size} artwork(s) selected
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveArtworks}
                      disabled={isSaving}
                    >
                      <IconTrash className="mr-2 h-4 w-4" />
                      Remove from Collection
                    </Button>
                  </div>
                )}

                {artworks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <IconPalette className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No artworks in this collection
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {artworks.map((artwork) => {
                      const isSelected = selectedRemoveIds.has(artwork.id)
                      const imageUrl = artwork.thumbnailPath
                        ? getImageUrl(artwork.thumbnailPath)
                        : artwork.media && artwork.media.length > 0
                          ? getImageUrl(artwork.media[0])
                          : null

                      return (
                        <div
                          key={artwork.id}
                          className={cn(
                            "group relative cursor-pointer rounded-lg border p-2 transition-all hover:border-primary",
                            isSelected && "border-primary bg-primary/5 ring-2 ring-primary"
                          )}
                          onClick={() => toggleRemoveArtwork(artwork.id)}
                        >
                          <div className="absolute left-3 top-3 z-10">
                            <div
                              className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-md border-2 bg-background transition-all",
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/50"
                              )}
                            >
                              {isSelected && <IconCheck className="h-4 w-4 text-primary-foreground" />}
                            </div>
                          </div>

                          <div className="relative aspect-square overflow-hidden rounded-md">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={artwork.title || "Artwork"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted">
                                <IconPalette className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="mt-2 space-y-1">
                            <p className="line-clamp-1 text-sm font-medium">
                              {artwork.title || "Untitled"}
                            </p>
                            {artwork.category && (
                              <Badge variant="secondary" className="text-xs">
                                {artwork.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Add Artworks Tab */}
            <TabsContent value="add" className="space-y-4 mt-4">
              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Add Artworks</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select artworks to add to this collection
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllAdd}
                      disabled={isSaving || isLoadingAvailable || filteredAvailableArtworks.length === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={deselectAllAdd}
                      disabled={isSaving || selectedAddIds.size === 0}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search artworks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    disabled={isSaving}
                  />
                </div>

                {selectedAddIds.size > 0 && (
                  <div className="flex items-center justify-between rounded-md bg-muted p-3">
                    <span className="text-sm">
                      {selectedAddIds.size} artwork(s) selected
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddArtworks}
                      disabled={isSaving}
                    >
                      <IconPlus className="mr-2 h-4 w-4" />
                      Add to Collection
                    </Button>
                  </div>
                )}

                {isLoadingAvailable ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-sm text-muted-foreground">Loading artworks...</div>
                  </div>
                ) : filteredAvailableArtworks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <IconPalette className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? "No artworks match your search."
                        : "No artworks available to add."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredAvailableArtworks.map((artwork) => {
                      const isSelected = selectedAddIds.has(artwork.id)
                      const imageUrl = artwork.thumbnailPath
                        ? getImageUrl(artwork.thumbnailPath)
                        : artwork.media && artwork.media.length > 0
                          ? getImageUrl(artwork.media[0])
                          : null

                      return (
                        <div
                          key={artwork.id}
                          className={cn(
                            "group relative cursor-pointer rounded-lg border p-2 transition-all hover:border-primary",
                            isSelected && "border-primary bg-primary/5 ring-2 ring-primary"
                          )}
                          onClick={() => toggleAddArtwork(artwork.id)}
                        >
                          <div className="absolute left-3 top-3 z-10">
                            <div
                              className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-md border-2 bg-background transition-all",
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/50"
                              )}
                            >
                              {isSelected && <IconCheck className="h-4 w-4 text-primary-foreground" />}
                            </div>
                          </div>

                          <div className="relative aspect-square overflow-hidden rounded-md">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={artwork.title || "Artwork"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted">
                                <IconPalette className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="mt-2 space-y-1">
                            <p className="line-clamp-1 text-sm font-medium">
                              {artwork.title || "Untitled"}
                            </p>
                            <div className="flex flex-wrap items-center gap-1">
                              {artwork.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {artwork.category}
                                </Badge>
                              )}
                              {artwork.series && (
                                <Badge variant="outline" className="text-xs">
                                  {artwork.series}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DrawerFooter>
          <div className="flex items-center justify-end w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
            >
              <IconX className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

