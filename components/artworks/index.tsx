"use client"

import { useState, useEffect, useMemo } from "react"
import {
    IconDotsVertical,
    IconEdit,
    IconPalette,
    IconPlus,
    IconRefresh,
    IconStar,
    IconTrash,
    IconCopy,
    IconEye,
} from "@tabler/icons-react"
import { toast } from "sonner"
import Image from "next/image"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ArtworkForm } from "./artwork-form"
import { ArtworkPreview } from "./artwork-preview"
import { ArtworkBulkUpload } from "./artwork-bulk-upload"
import type { Artwork, ArtworkStatus } from "@/lib/types/artwork"
import { deleteArtwork, duplicateArtwork } from "@/lib/actions/artworks"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { IconUpload } from "@tabler/icons-react"

interface ArtworksProps {
    initialArtworks: Artwork[]
}

const Artworks = ({ initialArtworks }: ArtworksProps) => {
    const router = useRouter()
    const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
    const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null)
    const [previewArtwork, setPreviewArtwork] = useState<Artwork | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")

    const supabase = useMemo(() => createClient(), [])

    // Sync state when initialArtworks changes (after refresh)
    useEffect(() => {
        setArtworks(initialArtworks)
    }, [initialArtworks])

    // Filter artworks
    const filteredArtworks = artworks.filter((artwork) => {
        if (statusFilter !== "all" && artwork.status !== statusFilter) {
            return false
        }
        if (categoryFilter !== "all" && artwork.category !== categoryFilter) {
            return false
        }
        return true
    })

    // Sort by sort_order then updated_at desc
    const sortedArtworks = [...filteredArtworks].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
            return a.sortOrder - b.sortOrder
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this artwork?")) {
            return
        }

        try {
            await deleteArtwork(id)
            setArtworks(artworks.filter((a) => a.id !== id))
            toast.success("Artwork deleted successfully")
            router.refresh()
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to delete artwork"
            )
        }
    }

    const handleDuplicate = async (id: string) => {
        try {
            await duplicateArtwork(id)
            toast.success("Artwork duplicated successfully")
            router.refresh()
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to duplicate artwork"
            )
        }
    }

    const handleEdit = (artwork: Artwork) => {
        setEditingArtwork(artwork)
        setIsFormOpen(true)
    }

    const handlePreview = (artwork: Artwork) => {
        setPreviewArtwork(artwork)
        setIsPreviewOpen(true)
    }

    const handleNewArtwork = () => {
        setEditingArtwork(null)
        setIsFormOpen(true)
    }

    const handleFormClose = (shouldRefresh: boolean = true) => {
        setIsFormOpen(false)
        setEditingArtwork(null)
        if (shouldRefresh) {
            router.refresh()
        }
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

    const categories = Array.from(new Set(artworks.map((a) => a.category).filter(Boolean))) as string[]
    const statuses: ArtworkStatus[] = ["draft", "published", "archived"]

    const stats = {
        total: artworks.length,
        published: artworks.filter((a) => a.status === "published").length,
        draft: artworks.filter((a) => a.status === "draft").length,
        views: artworks.reduce((sum, a) => sum + (a.viewsCount || 0), 0),
    }

    return (
        <div className="flex flex-grow flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-6 @xl/main:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardDescription>Total Artworks</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums">
                                    {stats.total}
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
                        <Card>
                            <CardHeader>
                                <CardDescription>Total Views</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums">
                                    {stats.views.toLocaleString()}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Artworks Table */}
                    <div className="px-4 lg:px-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold">All Artworks</h2>
                                <p className="text-sm text-muted-foreground">
                                    Manage your artwork collection
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
                                    onClick={() => setIsBulkUploadOpen(true)}
                                    variant="outline"
                                    size="sm"
                                >
                                    <IconUpload className="size-4" />
                                    <span className="hidden sm:inline">Bulk Upload</span>
                                </Button>
                                <Button onClick={handleNewArtwork}>
                                    <IconPlus className="size-4" />
                                    New Artwork
                                </Button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4 mb-4">
                            <div className="flex flex-col gap-2 w-48">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        {statuses.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {categories.length > 0 && (
                                <div className="flex flex-col gap-2 w-48">
                                    <label className="text-sm font-medium">Category</label>
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Image</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Views</TableHead>
                                        <TableHead>Featured</TableHead>
                                        <TableHead>Updated At</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedArtworks.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="text-center py-8 text-muted-foreground"
                                            >
                                                No artworks found. Click &quot;New Artwork&quot; to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sortedArtworks.map((artwork) => {
                                            const imageUrl = artwork.thumbnailPath
                                                ? getImageUrl(artwork.thumbnailPath)
                                                : artwork.media && artwork.media.length > 0
                                                    ? getImageUrl(artwork.media[0])
                                                    : null

                                            return (
                                                <TableRow key={artwork.id}>
                                                    <TableCell>
                                                        {imageUrl ? (
                                                            <div className="relative h-16 w-16 overflow-hidden rounded-md">
                                                                <Image
                                                                    src={imageUrl}
                                                                    alt={artwork.title || "Artwork"}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                                                                <IconPalette className="h-6 w-6 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{artwork.title || "Untitled"}</div>
                                                            {artwork.year && (
                                                                <div className="text-sm text-muted-foreground">
                                                                    {artwork.year}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {artwork.category ? (
                                                            <Badge variant="outline">
                                                                {artwork.category}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={getStatusBadgeColor(artwork.status)}
                                                        >
                                                            {artwork.status.charAt(0).toUpperCase() +
                                                                artwork.status.slice(1)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <IconEye className="h-4 w-4 text-muted-foreground" />
                                                            {artwork.viewsCount || 0}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {artwork.featured && (
                                                            <IconStar className="size-4 text-yellow-500 fill-yellow-500" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {new Date(artwork.updatedAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                                                    size="icon"
                                                                >
                                                                    <IconDotsVertical />
                                                                    <span className="sr-only">Open menu</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem onClick={() => handlePreview(artwork)}>
                                                                    <IconEye className="size-4 mr-2" />
                                                                    Preview
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleEdit(artwork)}>
                                                                    <IconEdit className="size-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDuplicate(artwork.id)}
                                                                >
                                                                    <IconCopy className="size-4 mr-2" />
                                                                    Duplicate
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() => handleDelete(artwork.id)}
                                                                >
                                                                    <IconTrash className="size-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
            <ArtworkForm
                artwork={editingArtwork}
                open={isFormOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleFormClose()
                    } else {
                        setIsFormOpen(true)
                    }
                }}
            />
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
            <ArtworkBulkUpload
                open={isBulkUploadOpen}
                onOpenChange={(open) => {
                    setIsBulkUploadOpen(open)
                    if (!open) {
                        router.refresh()
                    }
                }}
            />
        </div>
    )
}

export default Artworks
