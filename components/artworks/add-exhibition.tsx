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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconPlus, IconSearch, IconCheck, IconCalendar, IconUpload, IconX } from "@tabler/icons-react"
import type { Artwork, ExhibitionType } from "@/lib/types/artwork"
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
    const [exhibitionVenue, setExhibitionVenue] = useState("")
    const [exhibitionAbout, setExhibitionAbout] = useState("")
    const [exhibitionCurator, setExhibitionCurator] = useState("")
    const [exhibitionDates, setExhibitionDates] = useState("")
    const [exhibitionType, setExhibitionType] = useState<ExhibitionType>("solo")
    const [otherArtists, setOtherArtists] = useState("")
    const [coverImage, setCoverImage] = useState<File | null>(null)
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
    const [exhibitionImages, setExhibitionImages] = useState<File[]>([])
    const [exhibitionImagePreviews, setExhibitionImagePreviews] = useState<string[]>([])
    const [isUploadingImage, setIsUploadingImage] = useState(false)
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

        // Determine bucket based on path (for backward compatibility)
        // New exhibition images don't have folder prefix
        // Old exhibition images have "exhibitions/" prefix
        const isExhibitionImage = !path.includes("/") || path.startsWith("exhibitions/")
        const bucket = isExhibitionImage ? "exhibitions" : "artworks"
        const filePath = path.replace("exhibitions/", "") // Remove old prefix if exists

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
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

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file")
                return
            }
            setCoverImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setCoverImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeCoverImage = () => {
        setCoverImage(null)
        setCoverImagePreview(null)
    }

    const uploadCoverImage = async (): Promise<string | null> => {
        if (!coverImage) return null

        setIsUploadingImage(true)
        try {
            const fileExt = coverImage.name.split(".").pop()
            const fileName = `cover-${Date.now()}.${fileExt}`
            const filePath = fileName

            const { error: uploadError } = await supabase.storage
                .from("exhibitions")
                .upload(filePath, coverImage)

            if (uploadError) {
                throw uploadError
            }

            return filePath
        } catch (error) {
            console.error("Error uploading cover image:", error)
            toast.error("Failed to upload cover image")
            return null
        } finally {
            setIsUploadingImage(false)
        }
    }

    const handleExhibitionImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        const validFiles = files.filter(file => file.type.startsWith("image/"))
        if (validFiles.length !== files.length) {
            toast.error("Some files were not images and were skipped")
        }

        setExhibitionImages(prev => [...prev, ...validFiles])

        validFiles.forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () => {
                setExhibitionImagePreviews(prev => [...prev, reader.result as string])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeExhibitionImage = (index: number) => {
        setExhibitionImages(prev => prev.filter((_, i) => i !== index))
        setExhibitionImagePreviews(prev => prev.filter((_, i) => i !== index))
    }

    const uploadExhibitionImages = async (): Promise<string[]> => {
        if (exhibitionImages.length === 0) return []

        const uploadedPaths: string[] = []

        for (const [index, file] of exhibitionImages.entries()) {
            try {
                const fileExt = file.name.split(".").pop()
                const fileName = `img-${Date.now()}-${index}.${fileExt}`
                const filePath = fileName

                const { error: uploadError } = await supabase.storage
                    .from("exhibitions")
                    .upload(filePath, file)

                if (uploadError) {
                    throw uploadError
                }

                uploadedPaths.push(filePath)
            } catch (error) {
                console.error(`Error uploading exhibition image ${index}:`, error)
                toast.error(`Failed to upload image ${index + 1}`)
            }
        }

        return uploadedPaths
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

        if (!exhibitionVenue.trim()) {
            toast.error("Please enter an exhibition venue")
            return
        }

        if (!exhibitionAbout.trim()) {
            toast.error("Please enter exhibition about/description")
            return
        }

        if (!exhibitionCurator.trim()) {
            toast.error("Please enter exhibition curator")
            return
        }

        if (!exhibitionDates) {
            toast.error("Please enter exhibition dates")
            return
        }

        if (exhibitionType === "group" && !otherArtists.trim()) {
            toast.error("Please enter other artists for group exhibition")
            return
        }

        setIsSaving(true)
        try {
            // Upload cover image and exhibition images if provided
            const coverImagePath = await uploadCoverImage()
            const exhibitionImagePaths = await uploadExhibitionImages()

            await addExhibitionToArtworks(Array.from(selectedArtworkIds), {
                name: exhibitionName.trim(),
                venue: exhibitionVenue.trim(),
                about: exhibitionAbout.trim(),
                curator: exhibitionCurator.trim(),
                dates: exhibitionDates,
                coverImage: coverImagePath,
                exhibitionImages: exhibitionImagePaths,
                type: exhibitionType,
                otherArtists: exhibitionType === "group" ? otherArtists.trim() : null,
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
            setExhibitionVenue("")
            setExhibitionAbout("")
            setExhibitionCurator("")
            setExhibitionDates("")
            setExhibitionType("solo")
            setOtherArtists("")
            setCoverImage(null)
            setCoverImagePreview(null)
            setExhibitionImages([])
            setExhibitionImagePreviews([])
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
                        <div className="grid grid-cols-1 gap-4">
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
                                <Label htmlFor="exhibition-venue">Venue *</Label>
                                <Input
                                    id="exhibition-venue"
                                    value={exhibitionVenue}
                                    onChange={(e) => setExhibitionVenue(e.target.value)}
                                    placeholder="e.g., Gallery XYZ, New York"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exhibition-about">About *</Label>
                                <Input
                                    id="exhibition-about"
                                    value={exhibitionAbout}
                                    onChange={(e) => setExhibitionAbout(e.target.value)}
                                    placeholder="Exhibition description"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exhibition-curator">Curator *</Label>
                                <Input
                                    id="exhibition-curator"
                                    value={exhibitionCurator}
                                    onChange={(e) => setExhibitionCurator(e.target.value)}
                                    placeholder="Curator name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exhibition-dates">Dates *</Label>
                                <Input
                                    id="exhibition-dates"
                                    value={exhibitionDates}
                                    onChange={(e) => setExhibitionDates(e.target.value)}
                                    placeholder="e.g., Jan 15 - Feb 28, 2024"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exhibition-type">Exhibition Type *</Label>
                                <Select value={exhibitionType} onValueChange={(value: ExhibitionType) => setExhibitionType(value)}>
                                    <SelectTrigger id="exhibition-type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="solo">Solo</SelectItem>
                                        <SelectItem value="group">Group</SelectItem>
                                        <SelectItem value="online">Online</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {exhibitionType === "group" && (
                                <div className="space-y-2">
                                    <Label htmlFor="other-artists">Other Artists *</Label>
                                    <Input
                                        id="other-artists"
                                        value={otherArtists}
                                        onChange={(e) => setOtherArtists(e.target.value)}
                                        placeholder="e.g., John Doe, Jane Smith"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="cover-image">Cover Image</Label>
                                {coverImagePreview ? (
                                    <div className="relative">
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                            <Image
                                                src={coverImagePreview}
                                                alt="Cover preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="mt-2"
                                            onClick={removeCoverImage}
                                            disabled={isSaving}
                                        >
                                            <IconX className="mr-2 h-4 w-4" />
                                            Remove Image
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="cover-image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCoverImageChange}
                                            disabled={isSaving}
                                            className="cursor-pointer"
                                        />
                                        <IconUpload className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exhibition-images">Exhibition Images</Label>
                                <Input
                                    id="exhibition-images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleExhibitionImagesChange}
                                    disabled={isSaving}
                                    className="cursor-pointer"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Upload multiple images of the exhibition space, installations, etc.
                                </p>
                                {exhibitionImagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-3">
                                        {exhibitionImagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                                    <Image
                                                        src={preview}
                                                        alt={`Exhibition image ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeExhibitionImage(index)}
                                                    disabled={isSaving}
                                                >
                                                    <IconX className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                    !exhibitionVenue.trim() ||
                                    !exhibitionAbout.trim() ||
                                    !exhibitionCurator.trim() ||
                                    !exhibitionDates ||
                                    (exhibitionType === "group" && !otherArtists.trim())
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

