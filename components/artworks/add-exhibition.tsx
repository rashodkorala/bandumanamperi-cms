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
import { IconPlus, IconSearch, IconCheck, IconCalendar } from "@tabler/icons-react"
import type { Artwork } from "@/lib/types/artwork"
import { addExhibitionToArtworks } from "@/lib/actions/exhibitions"
import { getArtworks } from "@/lib/actions/artworks"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { IconPalette } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"

interface AddExhibitionProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddExhibition({ open, onOpenChange }: AddExhibitionProps) {
    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])

    const [artworks, setArtworks] = useState<Artwork[]>([])
    const [selectedArtworkIds, setSelectedArtworkIds] = useState<Set<string>>(new Set())
    const [exhibitionName, setExhibitionName] = useState("")
    const [exhibitionLocation, setExhibitionLocation] = useState("")
    const [exhibitionDate, setExhibitionDate] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Fetch artworks when drawer opens
    useEffect(() => {
        if (open) {
            setIsLoading(true)
            getArtworks({ includeDrafts: true })
                .then(setArtworks)
                .catch((error) => {
                    console.error("Failed to fetch artworks:", error)
                    toast.error("Failed to load artworks")
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }, [open])

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

    const toggleArtwork = (artworkId: string) => {
        setSelectedArtworkIds((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(artworkId)) {
                newSet.delete(artworkId)
            } else {
                newSet.add(artworkId)
            }
            return newSet
        })
    }

    const selectAll = () => {
        const filtered = filteredArtworks.map((a) => a.id)
        setSelectedArtworkIds(new Set(filtered))
    }

    const deselectAll = () => {
        setSelectedArtworkIds(new Set())
    }

    const handleSave = async () => {
        if (selectedArtworkIds.size === 0) {
            toast.error("Please select at least one artwork")
            return
        }

        if (!exhibitionName.trim()) {
            toast.error("Please enter an exhibition name")
            return
        }

        if (!exhibitionLocation.trim()) {
            toast.error("Please enter an exhibition location")
            return
        }

        if (!exhibitionDate) {
            toast.error("Please select an exhibition date")
            return
        }

        setIsSaving(true)
        try {
            await addExhibitionToArtworks(Array.from(selectedArtworkIds), {
                name: exhibitionName.trim(),
                location: exhibitionLocation.trim(),
                date: exhibitionDate,
            })
            toast.success(
                `Added exhibition "${exhibitionName}" to ${selectedArtworkIds.size} artwork(s)`
            )
            handleClose()
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add exhibition")
        } finally {
            setIsSaving(false)
        }
    }

    const handleClose = () => {
        if (!isSaving) {
            setSelectedArtworkIds(new Set())
            setExhibitionName("")
            setExhibitionLocation("")
            setExhibitionDate("")
            setSearchQuery("")
            onOpenChange(false)
        }
    }

    // Filter artworks by search query
    const filteredArtworks = useMemo(() => {
        if (!searchQuery.trim()) {
            return artworks
        }

        const query = searchQuery.toLowerCase()
        return artworks.filter(
            (artwork) =>
                artwork.title?.toLowerCase().includes(query) ||
                artwork.description?.toLowerCase().includes(query) ||
                artwork.category?.toLowerCase().includes(query) ||
                artwork.series?.toLowerCase().includes(query)
        )
    }, [artworks, searchQuery])

    return (
        <Drawer open={open} onOpenChange={handleClose}>
            <DrawerContent className="max-h-[90vh]">
                <DrawerHeader>
                    <DrawerTitle>Add Exhibition</DrawerTitle>
                    <DrawerDescription>
                        Create a new exhibition and select artworks to include
                    </DrawerDescription>
                </DrawerHeader>

                <div className="overflow-y-auto px-4 pb-4">
                    {/* Exhibition Details */}
                    <div className="mb-6 space-y-4 rounded-lg border p-4">
                        <h3 className="text-sm font-semibold">Exhibition Details</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="exhibition-name">Exhibition Name *</Label>
                                <Input
                                    id="exhibition-name"
                                    value={exhibitionName}
                                    onChange={(e) => setExhibitionName(e.target.value)}
                                    placeholder="e.g., Solo Show 2024"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exhibition-location">Location *</Label>
                                <Input
                                    id="exhibition-location"
                                    value={exhibitionLocation}
                                    onChange={(e) => setExhibitionLocation(e.target.value)}
                                    placeholder="e.g., Gallery XYZ, New York"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exhibition-date">Date *</Label>
                                <Input
                                    id="exhibition-date"
                                    type="date"
                                    value={exhibitionDate}
                                    onChange={(e) => setExhibitionDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Search and Selection Controls */}
                    <div className="mb-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Select Artworks</h3>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={selectAll}
                                    disabled={isLoading || filteredArtworks.length === 0}
                                >
                                    Select All
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={deselectAll}
                                    disabled={isLoading || selectedArtworkIds.size === 0}
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search artworks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {selectedArtworkIds.size} artwork(s) selected
                        </div>
                    </div>

                    {/* Artworks Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-sm text-muted-foreground">Loading artworks...</div>
                        </div>
                    ) : filteredArtworks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                            <IconPalette className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                {searchQuery
                                    ? "No artworks match your search query."
                                    : "No artworks found. Create artworks first."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {filteredArtworks.map((artwork) => {
                                const isSelected = selectedArtworkIds.has(artwork.id)
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
                                        onClick={() => toggleArtwork(artwork.id)}
                                    >
                                        {/* Checkbox */}
                                        <div className="absolute left-3 top-3 z-10">
                                            <div
                                                className={cn(
                                                    "flex h-6 w-6 items-center justify-center rounded-md border-2 bg-background transition-all",
                                                    isSelected
                                                        ? "border-primary bg-primary"
                                                        : "border-muted-foreground/50"
                                                )}
                                            >
                                                {isSelected && (
                                                    <IconCheck className="h-4 w-4 text-primary-foreground" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Image */}
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

                                        {/* Info */}
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

                <DrawerFooter>
                    <div className="flex items-center justify-between w-full">
                        <div className="text-sm text-muted-foreground">
                            {selectedArtworkIds.size > 0
                                ? `${selectedArtworkIds.size} artwork(s) ready to add`
                                : "No artworks selected"}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={
                                    isSaving ||
                                    selectedArtworkIds.size === 0 ||
                                    !exhibitionName.trim() ||
                                    !exhibitionLocation.trim() ||
                                    !exhibitionDate
                                }
                            >
                                {isSaving ? (
                                    <>
                                        <IconPlus className={cn("mr-2 h-4 w-4", "animate-pulse")} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <IconPlus className="mr-2 h-4 w-4" />
                                        Add Exhibition
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

