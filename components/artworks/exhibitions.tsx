"use client"

import { useState, useEffect, useMemo } from "react"
import {
    IconDotsVertical,
    IconEdit,
    IconPalette,
    IconEye,
    IconRefresh,
    IconTrash,
    IconPlus,
    IconCalendar,
    IconMapPin,
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
import { AddExhibition } from "./add-exhibition"
import { EditExhibition } from "./edit-exhibition"
import type { Artwork, ArtworkStatus, ExhibitionHistory } from "@/lib/types/artwork"
import { deleteArtwork } from "@/lib/actions/artworks"
import { deleteExhibition } from "@/lib/actions/exhibitions"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Exhibition } from "@/lib/actions/exhibitions"

interface ExhibitionsProps {
    initialExhibitions: Exhibition[]
}

const Exhibitions = ({ initialExhibitions }: ExhibitionsProps) => {
    const router = useRouter()
    const [exhibitions, setExhibitions] = useState<Exhibition[]>(initialExhibitions)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [previewArtwork, setPreviewArtwork] = useState<Artwork | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddExhibitionOpen, setIsAddExhibitionOpen] = useState(false)
    const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null)

    const supabase = useMemo(() => createClient(), [])

    // Sync state when initialExhibitions changes
    useEffect(() => {
        setExhibitions(initialExhibitions)
    }, [initialExhibitions])

    // Filter exhibitions by search query
    const filteredExhibitions = useMemo(() => {
        if (!searchQuery.trim()) {
            return exhibitions
        }

        const query = searchQuery.toLowerCase()
        return exhibitions.filter(
            (exhibition) =>
                exhibition.name.toLowerCase().includes(query) ||
                exhibition.location.toLowerCase().includes(query) ||
                exhibition.artworks.some(
                    (artwork) =>
                        artwork.title?.toLowerCase().includes(query) ||
                        artwork.category?.toLowerCase().includes(query)
                )
        )
    }, [exhibitions, searchQuery])

    const handleDeleteArtwork = async (id: string, exhibitionIndex: number) => {
        if (!confirm("Are you sure you want to delete this artwork?")) {
            return
        }

        try {
            await deleteArtwork(id)
            setExhibitions((prev) => {
                const updated = [...prev]
                updated[exhibitionIndex].artworks = updated[exhibitionIndex].artworks.filter(
                    (a) => a.id !== id
                )
                // Remove exhibition if no artworks left
                if (updated[exhibitionIndex].artworks.length === 0) {
                    updated.splice(exhibitionIndex, 1)
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

    const handleEditExhibition = (exhibition: Exhibition) => {
        setEditingExhibition(exhibition)
    }

    const handleDeleteExhibition = async (exhibition: Exhibition) => {
        if (
            !confirm(
                `Are you sure you want to delete the exhibition "${exhibition.name}"? This will remove the exhibition from ${exhibition.artworks.length} artwork(s). The artworks themselves will not be deleted.`
            )
        ) {
            return
        }

        try {
            await deleteExhibition({
                name: exhibition.name,
                location: exhibition.location,
                date: exhibition.date,
            })
            setExhibitions((prev) =>
                prev.filter(
                    (e) =>
                        !(
                            e.name === exhibition.name &&
                            e.location === exhibition.location &&
                            e.date === exhibition.date
                        )
                )
            )
            toast.success(`Exhibition "${exhibition.name}" deleted successfully`)
            router.refresh()
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to delete exhibition"
            )
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

    const totalExhibitions = filteredExhibitions.length
    const totalArtworks = filteredExhibitions.reduce(
        (sum, exhibition) => sum + exhibition.artworks.length,
        0
    )

    const stats = {
        totalExhibitions,
        totalArtworks,
        published: filteredExhibitions.reduce(
            (sum, exhibition) =>
                sum + exhibition.artworks.filter((a) => a.status === "published").length,
            0
        ),
        draft: filteredExhibitions.reduce(
            (sum, exhibition) =>
                sum + exhibition.artworks.filter((a) => a.status === "draft").length,
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
                                <CardDescription>Total Exhibitions</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums">
                                    {stats.totalExhibitions}
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

                    {/* Exhibitions List */}
                    <div className="px-4 lg:px-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold">Exhibitions</h2>
                                <p className="text-sm text-muted-foreground">
                                    View and manage your artwork exhibitions
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
                                <Button
                                    onClick={() => setIsAddExhibitionOpen(true)}
                                    size="sm"
                                >
                                    <IconPlus className="size-4" />
                                    <span className="hidden sm:inline">Add Exhibition</span>
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
                                placeholder="Search exhibitions or artworks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>

                        {filteredExhibitions.length === 0 ? (
                            <Card>
                                <CardHeader className="text-center">
                                    <IconCalendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <CardTitle>No Exhibitions Found</CardTitle>
                                    <CardDescription>
                                        {searchQuery
                                            ? "No exhibitions match your search query."
                                            : "Create exhibitions by adding them to your artworks."}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {filteredExhibitions.map((exhibition, exhibitionIndex) => {
                                    const artworks = exhibition.artworks
                                    const publishedCount = artworks.filter((a) => a.status === "published").length
                                    const draftCount = artworks.filter((a) => a.status === "draft").length

                                    return (
                                        <Card key={`${exhibition.name}-${exhibition.location}-${exhibition.date}`}>
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-xl flex items-center gap-2">
                                                            {exhibition.name}
                                                        </CardTitle>
                                                        <CardDescription className="mt-1 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <IconMapPin className="h-3.5 w-3.5" />
                                                                {exhibition.location}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <IconCalendar className="h-3.5 w-3.5" />
                                                                {new Date(exhibition.date).toLocaleDateString("en-US", {
                                                                    year: "numeric",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                })}
                                                            </div>
                                                            <div className="mt-2">
                                                                {artworks.length} artwork{artworks.length !== 1 ? "s" : ""}
                                                                {publishedCount > 0 && (
                                                                    <span className="ml-2">
                                                                        • {publishedCount} published
                                                                        {draftCount > 0 &&
                                                                            `, ${draftCount} draft${draftCount !== 1 ? "s" : ""}`}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </CardDescription>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <IconDotsVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => handleEditExhibition(exhibition)}
                                                            >
                                                                <IconEdit className="size-4 mr-2" />
                                                                Edit Exhibition
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => handleDeleteExhibition(exhibition)}
                                                            >
                                                                <IconTrash className="size-4 mr-2" />
                                                                Delete Exhibition
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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
                                                            <Card
                                                                key={artwork.id}
                                                                className="group relative overflow-hidden"
                                                            >
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
                                                                                <DropdownMenuItem
                                                                                    onClick={() => handlePreview(artwork)}
                                                                                >
                                                                                    <IconEye className="size-4 mr-2" />
                                                                                    Preview
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuSeparator />
                                                                                <DropdownMenuItem
                                                                                    className="text-destructive focus:text-destructive"
                                                                                    onClick={() =>
                                                                                        handleDeleteArtwork(artwork.id, exhibitionIndex)
                                                                                    }
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
                                                                            className={cn(
                                                                                "text-xs",
                                                                                getStatusBadgeColor(artwork.status)
                                                                            )}
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
            <AddExhibition
                open={isAddExhibitionOpen}
                onOpenChange={(open) => {
                    setIsAddExhibitionOpen(open)
                    if (!open) {
                        router.refresh()
                    }
                }}
            />
            <EditExhibition
                open={!!editingExhibition}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingExhibition(null)
                    }
                }}
                exhibition={editingExhibition}
            />
        </div>
    )
}

export default Exhibitions

