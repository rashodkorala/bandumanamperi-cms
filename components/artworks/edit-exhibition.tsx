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
import { IconEdit, IconTrash, IconCheck, IconX, IconPlus, IconSearch, IconUpload } from "@tabler/icons-react"
import type { Artwork, ExhibitionType } from "@/lib/types/artwork"
import {
    updateExhibition,
    removeArtworksFromExhibition,
    addExhibitionToArtworks,
} from "@/lib/actions/exhibitions"
import { getArtworks } from "@/lib/actions/artworks"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { IconPalette } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Exhibition } from "@/lib/actions/exhibitions"

interface EditExhibitionProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    exhibition: Exhibition | null
}

export function EditExhibition({ open, onOpenChange, exhibition }: EditExhibitionProps) {
    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])

    const [newName, setNewName] = useState("")
    const [newVenue, setNewVenue] = useState("")
    const [newAbout, setNewAbout] = useState("")
    const [newCurator, setNewCurator] = useState("")
    const [newDates, setNewDates] = useState("")
    const [newType, setNewType] = useState<ExhibitionType>("solo")
    const [newOtherArtists, setNewOtherArtists] = useState("")
    const [newCoverImage, setNewCoverImage] = useState<File | null>(null)
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
    const [newExhibitionImages, setNewExhibitionImages] = useState<File[]>([])
    const [exhibitionImagePreviews, setExhibitionImagePreviews] = useState<string[]>([])
    const [existingExhibitionImages, setExistingExhibitionImages] = useState<string[]>([])
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [selectedRemoveIds, setSelectedRemoveIds] = useState<Set<string>>(new Set())
    const [selectedAddIds, setSelectedAddIds] = useState<Set<string>>(new Set())
    const [availableArtworks, setAvailableArtworks] = useState<Artwork[]>([])
    const [isLoadingAvailable, setIsLoadingAvailable] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    // Reset state and fetch available artworks when drawer opens
    useEffect(() => {
        if (open && exhibition) {
            setNewName(exhibition.name)
            setNewVenue(exhibition.venue)
            setNewAbout(exhibition.about)
            setNewCurator(exhibition.curator)
            setNewDates(exhibition.dates)
            setNewType(exhibition.type as ExhibitionType)
            setNewOtherArtists(exhibition.otherArtists || "")
            setNewCoverImage(null)
            setCoverImagePreview(exhibition.coverImage ? getImageUrl(exhibition.coverImage) : null)
            setNewExhibitionImages([])
            setExhibitionImagePreviews([])
            setExistingExhibitionImages(exhibition.exhibitionImages || [])
            setSelectedRemoveIds(new Set())
            setSelectedAddIds(new Set())
            setSearchQuery("")

            // Fetch all artworks to show available ones
            setIsLoadingAvailable(true)
            getArtworks({ includeDrafts: true })
                .then((allArtworks) => {
                    // Filter out artworks already in this exhibition
                    const currentArtworkIds = new Set(exhibition.artworks.map((a) => a.id))
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
    }, [open, exhibition])

    const getImageUrl = (path: string | null) => {
        if (!path) return null

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path
        }

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
        if (!exhibition) return
        setSelectedRemoveIds(new Set(exhibition.artworks.map((a) => a.id)))
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

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file")
                return
            }
            setNewCoverImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setCoverImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeCoverImage = () => {
        setNewCoverImage(null)
        setCoverImagePreview(null)
    }

    const uploadCoverImage = async (): Promise<string | null | undefined> => {
        if (!newCoverImage) return undefined // undefined means no change

        setIsUploadingImage(true)
        try {
            const fileExt = newCoverImage.name.split(".").pop()
            const fileName = `exhibition-${Date.now()}.${fileExt}`
            const filePath = `exhibitions/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from("artworks")
                .upload(filePath, newCoverImage)

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

        setNewExhibitionImages(prev => [...prev, ...validFiles])

        validFiles.forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () => {
                setExhibitionImagePreviews(prev => [...prev, reader.result as string])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeNewExhibitionImage = (index: number) => {
        setNewExhibitionImages(prev => prev.filter((_, i) => i !== index))
        setExhibitionImagePreviews(prev => prev.filter((_, i) => i !== index))
    }

    const removeExistingExhibitionImage = (imagePath: string) => {
        setExistingExhibitionImages(prev => prev.filter(path => path !== imagePath))
    }

    const uploadExhibitionImages = async (): Promise<string[]> => {
        if (newExhibitionImages.length === 0) return []

        const uploadedPaths: string[] = []

        for (const [index, file] of newExhibitionImages.entries()) {
            try {
                const fileExt = file.name.split(".").pop()
                const fileName = `exhibition-img-${Date.now()}-${index}.${fileExt}`
                const filePath = `exhibitions/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from("artworks")
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

    const handleUpdate = async () => {
        if (!exhibition) return

        const trimmedName = newName.trim()
        const trimmedVenue = newVenue.trim()
        const trimmedAbout = newAbout.trim()
        const trimmedCurator = newCurator.trim()
        const trimmedOtherArtists = newOtherArtists.trim()

        if (!trimmedName || !trimmedVenue || !trimmedAbout || !trimmedCurator || !newDates) {
            toast.error("All exhibition fields are required")
            return
        }

        if (newType === "group" && !trimmedOtherArtists) {
            toast.error("Please enter other artists for group exhibition")
            return
        }

        const hasChanges =
            trimmedName !== exhibition.name ||
            trimmedVenue !== exhibition.venue ||
            trimmedAbout !== exhibition.about ||
            trimmedCurator !== exhibition.curator ||
            newDates !== exhibition.dates ||
            newType !== exhibition.type ||
            trimmedOtherArtists !== (exhibition.otherArtists || "") ||
            newCoverImage !== null ||
            (coverImagePreview === null && exhibition.coverImage !== null) ||
            newExhibitionImages.length > 0 ||
            existingExhibitionImages.length !== exhibition.exhibitionImages.length

        if (!hasChanges) {
            toast.error("Please make changes to update the exhibition")
            return
        }

        setIsSaving(true)
        try {
            // Upload new cover image and exhibition images if provided
            const uploadedImagePath = await uploadCoverImage()
            const finalCoverImage = uploadedImagePath !== undefined
                ? uploadedImagePath
                : (coverImagePreview === null ? null : exhibition.coverImage)

            const uploadedExhibitionImages = await uploadExhibitionImages()
            const finalExhibitionImages = [...existingExhibitionImages, ...uploadedExhibitionImages]

            await updateExhibition(
                {
                    name: exhibition.name,
                    venue: exhibition.venue,
                    about: exhibition.about,
                    curator: exhibition.curator,
                    dates: exhibition.dates,
                    coverImage: exhibition.coverImage,
                    exhibitionImages: exhibition.exhibitionImages,
                    type: exhibition.type as ExhibitionType,
                    otherArtists: exhibition.otherArtists,
                },
                {
                    name: trimmedName,
                    venue: trimmedVenue,
                    about: trimmedAbout,
                    curator: trimmedCurator,
                    dates: newDates,
                    coverImage: finalCoverImage,
                    exhibitionImages: finalExhibitionImages,
                    type: newType,
                    otherArtists: newType === "group" ? trimmedOtherArtists : null,
                }
            )
            toast.success("Exhibition updated successfully")
            handleClose()
            router.refresh()
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update exhibition"
            )
        } finally {
            setIsSaving(false)
        }
    }

    const handleRemoveArtworks = async () => {
        if (!exhibition) return

        if (selectedRemoveIds.size === 0) {
            toast.error("Please select artworks to remove")
            return
        }

        if (
            !confirm(
                `Remove ${selectedRemoveIds.size} artwork(s) from "${exhibition.name}"?`
            )
        ) {
            return
        }

        setIsSaving(true)
        try {
            await removeArtworksFromExhibition(Array.from(selectedRemoveIds), {
                name: exhibition.name,
                venue: exhibition.venue,
                about: exhibition.about,
                curator: exhibition.curator,
                dates: exhibition.dates,
                coverImage: exhibition.coverImage,
                exhibitionImages: exhibition.exhibitionImages,
                type: exhibition.type as ExhibitionType,
                otherArtists: exhibition.otherArtists,
            })
            toast.success(`Removed ${selectedRemoveIds.size} artwork(s) from exhibition`)
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
        if (!exhibition) return

        if (selectedAddIds.size === 0) {
            toast.error("Please select artworks to add")
            return
        }

        setIsSaving(true)
        try {
            await addExhibitionToArtworks(Array.from(selectedAddIds), {
                name: exhibition.name,
                venue: exhibition.venue,
                about: exhibition.about,
                curator: exhibition.curator,
                dates: exhibition.dates,
                coverImage: exhibition.coverImage,
                exhibitionImages: exhibition.exhibitionImages,
                type: exhibition.type as ExhibitionType,
                otherArtists: exhibition.otherArtists,
            })
            toast.success(`Added ${selectedAddIds.size} artwork(s) to "${exhibition.name}"`)
            handleClose()
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add artworks")
        } finally {
            setIsSaving(false)
        }
    }

    const handleClose = () => {
        if (!isSaving) {
            setSelectedRemoveIds(new Set())
            setSelectedAddIds(new Set())
            setSearchQuery("")
            onOpenChange(false)
        }
    }

    if (!exhibition) return null

    return (
        <Drawer open={open} onOpenChange={handleClose}>
            <DrawerContent className="max-h-[90vh]">
                <DrawerHeader>
                    <DrawerTitle>Edit Exhibition</DrawerTitle>
                    <DrawerDescription>
                        Update exhibition details or manage artworks
                    </DrawerDescription>
                </DrawerHeader>

                <div className="overflow-y-auto px-4 pb-4">
                    {/* Update Exhibition Details */}
                    <div className="mb-4 space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Exhibition Details</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="exhibition-name">Name</Label>
                                <Input
                                    id="exhibition-name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Exhibition name"
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exhibition-venue">Venue</Label>
                                <Input
                                    id="exhibition-venue"
                                    value={newVenue}
                                    onChange={(e) => setNewVenue(e.target.value)}
                                    placeholder="Venue"
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exhibition-about">About</Label>
                                <Input
                                    id="exhibition-about"
                                    value={newAbout}
                                    onChange={(e) => setNewAbout(e.target.value)}
                                    placeholder="Exhibition description"
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exhibition-curator">Curator</Label>
                                <Input
                                    id="exhibition-curator"
                                    value={newCurator}
                                    onChange={(e) => setNewCurator(e.target.value)}
                                    placeholder="Curator name"
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exhibition-dates">Dates</Label>
                                <Input
                                    id="exhibition-dates"
                                    value={newDates}
                                    onChange={(e) => setNewDates(e.target.value)}
                                    placeholder="e.g., Jan 15 - Feb 28, 2024"
                                    disabled={isSaving}
                                />
                            </div>
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
                                <Label htmlFor="exhibition-type">Exhibition Type</Label>
                                <Select value={newType} onValueChange={(value: ExhibitionType) => setNewType(value)}>
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
                            {newType === "group" && (
                                <div className="space-y-2">
                                    <Label htmlFor="other-artists">Other Artists</Label>
                                    <Input
                                        id="other-artists"
                                        value={newOtherArtists}
                                        onChange={(e) => setNewOtherArtists(e.target.value)}
                                        placeholder="e.g., John Doe, Jane Smith"
                                        disabled={isSaving}
                                    />
                                </div>
                            )}
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
                                    Add more images of the exhibition space, installations, etc.
                                </p>
                                {(existingExhibitionImages.length > 0 || exhibitionImagePreviews.length > 0) && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Current & New Images:</p>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {existingExhibitionImages.map((imagePath, index) => (
                                                <div key={`existing-${index}`} className="relative group">
                                                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                                        <Image
                                                            src={getImageUrl(imagePath) || ""}
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
                                                        onClick={() => removeExistingExhibitionImage(imagePath)}
                                                        disabled={isSaving}
                                                    >
                                                        <IconX className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {exhibitionImagePreviews.map((preview, index) => (
                                                <div key={`new-${index}`} className="relative group">
                                                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-primary">
                                                        <Image
                                                            src={preview}
                                                            alt={`New exhibition image ${index + 1}`}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <Badge className="absolute top-1 left-1 text-xs">New</Badge>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeNewExhibitionImage(index)}
                                                        disabled={isSaving}
                                                    >
                                                        <IconX className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={handleUpdate}
                            disabled={
                                isSaving ||
                                isUploadingImage ||
                                !newName.trim() ||
                                !newVenue.trim() ||
                                !newAbout.trim() ||
                                !newCurator.trim() ||
                                !newDates ||
                                (newType === "group" && !newOtherArtists.trim())
                            }
                            size="sm"
                        >
                            <IconEdit className="mr-2 h-4 w-4" />
                            {isUploadingImage ? "Uploading..." : "Update Exhibition"}
                        </Button>
                    </div>

                    {/* Tabbed Interface for Add/Remove Artworks */}
                    <Tabs defaultValue="current" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="current">
                                Current Artworks ({exhibition.artworks.length})
                            </TabsTrigger>
                            <TabsTrigger value="add">
                                Add Artworks ({availableArtworks.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Current Artworks Tab */}
                        <TabsContent value="current" className="space-y-4 mt-4">
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold">Remove Artworks</h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Select artworks to remove from this exhibition
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={selectAllRemove}
                                            disabled={isSaving || exhibition.artworks.length === 0}
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
                                            Remove from Exhibition
                                        </Button>
                                    </div>
                                )}

                                {exhibition.artworks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                        <IconPalette className="mb-4 h-12 w-12 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            No artworks in this exhibition
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                        {exhibition.artworks.map((artwork) => {
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
                                                            {isSelected && (
                                                                <IconCheck className="h-4 w-4 text-primary-foreground" />
                                                            )}
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
                                            Select artworks to add to this exhibition
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={selectAllAdd}
                                            disabled={
                                                isSaving ||
                                                isLoadingAvailable ||
                                                filteredAvailableArtworks.length === 0
                                            }
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
                                            Add to Exhibition
                                        </Button>
                                    </div>
                                )}

                                {isLoadingAvailable ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-sm text-muted-foreground">
                                            Loading artworks...
                                        </div>
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
                                                            {isSelected && (
                                                                <IconCheck className="h-4 w-4 text-primary-foreground" />
                                                            )}
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

