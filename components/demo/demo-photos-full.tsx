"use client"

import { useState, useEffect } from "react"
import {
    IconDotsVertical,
    IconEdit,
    IconPhoto,
    IconPlus,
    IconRefresh,
    IconStar,
    IconTrash,
    IconTrendingUp,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardDescription,
    CardFooter,
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
import { DemoPhotoForm } from "./demo-photo-form"
import { demoStorage } from "@/lib/demo/storage"
import type { Photo } from "@/lib/types/photo"
import { cn } from "@/lib/utils"

// Initial demo photos
const initialDemoPhotos: Photo[] = [
    {
        id: "demo-1",
        title: "Mountain Sunset",
        description: "A breathtaking sunset over the mountain range, captured during golden hour.",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
        category: "nature",
        location: "Yosemite, CA",
        dateTaken: "2024-01-15",
        altText: "Sunset over mountain range with orange and pink sky",
        featured: true,
        tags: ["sunset", "mountains", "nature", "landscape"],
        cameraSettings: {
            aperture: "f/8",
            shutterSpeed: "1/125s",
            iso: 200,
            focalLength: "24mm",
            camera: "Canon EOS R5",
        },
        created_at: new Date("2024-01-15").toISOString(),
        updated_at: new Date("2024-01-15").toISOString(),
        user_id: "demo-user",
    },
    {
        id: "demo-2",
        title: "Urban Street Scene",
        description: "Vibrant street photography capturing the energy of city life.",
        imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=800&fit=crop",
        category: "street",
        location: "New York, NY",
        dateTaken: "2024-01-20",
        altText: "Busy city street with pedestrians and urban architecture",
        featured: false,
        tags: ["street", "urban", "city", "people"],
        cameraSettings: {
            aperture: "f/2.8",
            shutterSpeed: "1/250s",
            iso: 400,
            focalLength: "50mm",
            camera: "Sony A7III",
        },
        created_at: new Date("2024-01-20").toISOString(),
        updated_at: new Date("2024-01-20").toISOString(),
        user_id: "demo-user",
    },
    {
        id: "demo-3",
        title: "Modern Architecture",
        description: "Stunning modern building with geometric patterns and clean lines.",
        imageUrl: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=800&fit=crop",
        category: "architecture",
        location: "Los Angeles, CA",
        dateTaken: "2024-01-25",
        altText: "Modern architectural building with geometric design",
        featured: true,
        tags: ["architecture", "modern", "building", "design"],
        cameraSettings: {
            aperture: "f/11",
            shutterSpeed: "1/60s",
            iso: 100,
            focalLength: "35mm",
            camera: "Nikon Z6",
        },
        created_at: new Date("2024-01-25").toISOString(),
        updated_at: new Date("2024-01-25").toISOString(),
        user_id: "demo-user",
    },
]

export function DemoPhotos() {
    const [photos, setPhotos] = useState<Photo[]>([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // Load photos from localStorage on mount
    useEffect(() => {
        const stored = demoStorage.get<Photo[]>("photos", [])
        if (stored.length === 0) {
            // Initialize with demo data
            demoStorage.set("photos", initialDemoPhotos)
            setPhotos(initialDemoPhotos)
        } else {
            setPhotos(stored)
        }
    }, [])

    // Save to localStorage whenever photos change
    useEffect(() => {
        if (photos.length > 0) {
            demoStorage.set("photos", photos)
        }
    }, [photos])

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this photo?")) {
            return
        }

        const updated = photos.filter((p) => p.id !== id)
        setPhotos(updated)
        demoStorage.set("photos", updated)
        toast.success("Photo deleted successfully")
    }

    const handleEdit = (photo: Photo) => {
        setEditingPhoto(photo)
        setIsFormOpen(true)
    }

    const handleNewPhoto = () => {
        setEditingPhoto(null)
        setIsFormOpen(true)
    }

    const handleFormClose = () => {
        setIsFormOpen(false)
        setEditingPhoto(null)
    }

    const handleSave = (photoData: Photo) => {
        if (editingPhoto) {
            // Update existing
            const updated = photos.map((p) => (p.id === photoData.id ? photoData : p))
            setPhotos(updated)
            toast.success("Photo updated successfully")
        } else {
            // Create new
            const newPhoto: Photo = {
                ...photoData,
                id: `demo-${Date.now()}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: "demo-user",
            }
            setPhotos([...photos, newPhoto])
            toast.success("Photo created successfully")
        }
        handleFormClose()
    }

    const handleRefresh = () => {
        const stored = demoStorage.get<Photo[]>("photos", initialDemoPhotos)
        setPhotos(stored)
        toast.success("Data refreshed")
    }

    // Get unique categories
    const categories = Array.from(new Set(photos.map((p) => p.category).filter(Boolean)))
    const featuredCount = photos.filter((p) => p.featured).length

    const filteredPhotos = selectedCategory
        ? photos.filter((p) => p.category === selectedCategory)
        : photos

    return (
        <div className="flex flex-grow flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Stats Cards */}
                    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:px-6 @xl/main:grid-cols-4">
                        <Card className="@container/card">
                            <CardHeader>
                                <CardDescription>Total Photos</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {photos.length}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                        <IconTrendingUp />
                                        Active
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    All your photos in one place
                                </div>
                            </CardFooter>
                        </Card>
                        <Card className="@container/card">
                            <CardHeader>
                                <CardDescription>Categories</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {categories.length}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                                        Collections
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    Photo categories
                                </div>
                            </CardFooter>
                        </Card>
                        <Card className="@container/card">
                            <CardHeader>
                                <CardDescription>Featured</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {featuredCount}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">
                                        <IconStar className="size-3" />
                                        Starred
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    Featured photos for portfolio
                                </div>
                            </CardFooter>
                        </Card>
                        <Card className="@container/card">
                            <CardHeader>
                                <CardDescription>This Month</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {photos.filter((p) => {
                                        if (!p.dateTaken) return false
                                        const photoDate = new Date(p.dateTaken)
                                        const now = new Date()
                                        return (
                                            photoDate.getMonth() === now.getMonth() &&
                                            photoDate.getFullYear() === now.getFullYear()
                                        )
                                    }).length}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-green-600 dark:text-green-400">
                                        Recent
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    Photos taken this month
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Photos Grid */}
                    <div className="px-4 lg:px-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold">All Photos</h2>
                                <p className="text-sm text-muted-foreground">
                                    Manage and organize your photography
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleRefresh}
                                    variant="outline"
                                    size="sm"
                                >
                                    <IconRefresh className="size-4" />
                                    <span className="hidden sm:inline">Refresh</span>
                                </Button>
                                <Button onClick={handleNewPhoto}>
                                    <IconPlus className="size-4" />
                                    New Photo
                                </Button>
                            </div>
                        </div>

                        {/* Category Filters */}
                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
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
                                        {category?.charAt(0).toUpperCase() + (category?.slice(1) || "") || ""}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {filteredPhotos.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-12 text-center">
                                <IconPhoto className="size-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Get started by adding your first photo
                                </p>
                                <Button onClick={handleNewPhoto}>
                                    <IconPlus className="size-4" />
                                    Add Photo
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredPhotos.map((photo) => (
                                    <Card key={photo.id} className="group overflow-hidden">
                                        <div className="relative aspect-square overflow-hidden bg-muted">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={photo.imageUrl}
                                                alt={photo.altText || photo.title || "Photo"}
                                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            {photo.featured && (
                                                <div className="absolute top-2 right-2">
                                                    <IconStar className="size-5 text-yellow-500 fill-yellow-500" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-white hover:text-white hover:bg-white/20"
                                                        >
                                                            <IconDotsVertical />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(photo)}>
                                                            <IconEdit className="size-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDelete(photo.id)}
                                                        >
                                                            <IconTrash className="size-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <CardHeader className="p-4">
                                            <CardTitle className="text-sm font-medium line-clamp-1">
                                                {photo.title}
                                            </CardTitle>
                                            {photo.category && (
                                                <CardDescription className="text-xs">
                                                    {photo.category}
                                                </CardDescription>
                                            )}
                                            {photo.location && (
                                                <CardDescription className="text-xs">
                                                    📍 {photo.location}
                                                </CardDescription>
                                            )}
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <DemoPhotoForm
                photo={editingPhoto}
                open={isFormOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleFormClose()
                    } else {
                        setIsFormOpen(true)
                    }
                }}
                onSave={handleSave}
            />
        </div>
    )
}

