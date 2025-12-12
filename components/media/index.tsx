"use client"

import { useState, useEffect } from "react"
import { IconDotsVertical, IconEdit, IconFile, IconPhoto, IconMusic, IconPlus, IconRefresh, IconTrash, IconVideo } from "@tabler/icons-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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
import { MediaForm } from "./media-form"
import type { MediaItem } from "@/lib/types/media"
import { deleteMedia } from "@/lib/actions/media"
import { cn } from "@/lib/utils"

interface MediaProps {
    initialMedia: MediaItem[]
}

const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
        case "image":
            return IconPhoto
        case "video":
            return IconVideo
        case "audio":
            return IconMusic
        default:
            return IconFile
    }
}

const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "Unknown"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function MediaLibrary({ initialMedia }: MediaProps) {
    const router = useRouter()
    const [media, setMedia] = useState<MediaItem[]>(initialMedia)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

    useEffect(() => {
        setMedia(initialMedia)
    }, [initialMedia])

    // Get folders from media items, plus default folders
    const defaultFolders = ["photography", "projects", "blog-images"]
    const mediaFolders = Array.from(new Set(media.map((m) => m.folder).filter(Boolean))) as string[]
    const folders = Array.from(new Set([...defaultFolders, ...mediaFolders]))

    const filteredMedia = selectedFolder
        ? media.filter((m) => m.folder === selectedFolder)
        : media

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this media file?")) {
            return
        }

        try {
            await deleteMedia(id)
            setMedia(media.filter((m) => m.id !== id))
            toast.success("Media deleted successfully")
            router.refresh()
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to delete media"
            )
        }
    }

    const handleEdit = (mediaItem: MediaItem) => {
        setEditingMedia(mediaItem)
        setIsFormOpen(true)
    }

    const handleNewMedia = () => {
        setEditingMedia(null)
        setIsFormOpen(true)
    }

    const handleFormClose = (shouldRefresh: boolean = true) => {
        setIsFormOpen(false)
        setEditingMedia(null)
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
        total: media.length,
        images: media.filter((m) => m.fileType === "image").length,
        videos: media.filter((m) => m.fileType === "video").length,
        documents: media.filter((m) => m.fileType === "document").length,
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Media Library</h1>
                    <p className="text-muted-foreground">
                        Manage your media files and assets
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <IconRefresh className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button onClick={handleNewMedia}>
                        <IconPlus className="h-4 w-4 mr-2" />
                        Upload Media
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                    </CardHeader>
                    <CardDescription className="text-2xl font-bold">{stats.total}</CardDescription>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Images</CardTitle>
                    </CardHeader>
                    <CardDescription className="text-2xl font-bold">{stats.images}</CardDescription>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Videos</CardTitle>
                    </CardHeader>
                    <CardDescription className="text-2xl font-bold">{stats.videos}</CardDescription>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Documents</CardTitle>
                    </CardHeader>
                    <CardDescription className="text-2xl font-bold">{stats.documents}</CardDescription>
                </Card>
            </div>

            {folders.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={selectedFolder === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedFolder(null)}
                    >
                        All
                    </Button>
                    {folders.map((folder) => (
                        <Button
                            key={folder}
                            variant={selectedFolder === folder ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedFolder(folder)}
                        >
                            {folder}
                        </Button>
                    ))}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredMedia.map((item) => {
                    const Icon = getFileTypeIcon(item.fileType)
                    return (
                        <Card key={item.id} className="relative group">
                            <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                                {item.fileType === "image" ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.fileUrl}
                                        alt={item.altText || item.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Icon className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-sm truncate">{item.title}</CardTitle>
                                        <CardDescription className="text-xs mt-1">
                                            {formatFileSize(item.fileSize)}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <IconDotsVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                <IconEdit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                variant="destructive"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <IconTrash className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex gap-1 flex-wrap mt-2">
                                    <Badge variant="outline" className="text-xs">
                                        {item.fileType}
                                    </Badge>
                                    {item.folder && (
                                        <Badge variant="secondary" className="text-xs">
                                            {item.folder}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>
                    )
                })}
            </div>

            {filteredMedia.length === 0 && (
                <div className="text-center py-12">
                    <IconFile className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No media files found</p>
                    <Button onClick={handleNewMedia} className="mt-4">
                        <IconPlus className="h-4 w-4 mr-2" />
                        Upload Your First Media File
                    </Button>
                </div>
            )}

            <MediaForm
                isOpen={isFormOpen}
                onClose={handleFormClose}
                editingMedia={editingMedia}
            />
        </div>
    )
}

