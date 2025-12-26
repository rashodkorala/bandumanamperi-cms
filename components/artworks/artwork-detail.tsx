"use client"

import { useState } from "react"
import Image from "next/image"
import { IconCalendar, IconMapPin, IconRuler, IconTag, IconEye, IconLink, IconPalette } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Artwork } from "@/lib/types/artwork"
import { incrementArtworkViews } from "@/lib/actions/artworks"
import { useEffect } from "react"

interface ArtworkDetailProps {
    artwork: Artwork
}

export function ArtworkDetail({ artwork }: ArtworkDetailProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    // Track view on mount
    useEffect(() => {
        incrementArtworkViews(artwork.id).catch(console.error)
    }, [artwork.id])

    const images = artwork.media && artwork.media.length > 0
        ? artwork.media
        : artwork.thumbnailPath
            ? [artwork.thumbnailPath]
            : []

    const displayImage = images[selectedImageIndex] || artwork.thumbnailPath

    const formatDimensions = () => {
        if (!artwork.width && !artwork.height) return null
        const parts = []
        if (artwork.width) parts.push(`${artwork.width}`)
        if (artwork.height) parts.push(`${artwork.height}`)
        if (artwork.depth) parts.push(`${artwork.depth}`)
        return parts.join(" × ") + (artwork.unit ? ` ${artwork.unit}` : "")
    }

    const formatPrice = () => {
        if (!artwork.price) return null
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: artwork.currency || "USD",
        })
        return formatter.format(Number(artwork.price))
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {displayImage ? (
                            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
                                <Image
                                    src={displayImage}
                                    alt={artwork.title || "Artwork"}
                                    fill
                                    className="object-contain"
                                    priority
                                    onLoad={() => setIsLoading(false)}
                                />
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                                        <IconPalette className="size-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center">
                                <IconPalette className="size-24 text-muted-foreground" />
                            </div>
                        )}

                        {/* Thumbnail Gallery */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedImageIndex(index)
                                            setIsLoading(true)
                                        }}
                                        className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${selectedImageIndex === index
                                            ? "border-primary"
                                            : "border-transparent hover:border-muted-foreground"
                                            }`}
                                    >
                                        <Image
                                            src={image}
                                            alt={`${artwork.title} - View ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Artwork Details */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{artwork.title || "Untitled"}</h1>
                            {artwork.year && (
                                <p className="text-lg text-muted-foreground">{artwork.year}</p>
                            )}
                            {artwork.series && (
                                <Badge variant="outline" className="mt-2">
                                    {artwork.series}
                                </Badge>
                            )}
                        </div>

                        {artwork.description && (
                            <div>
                                <h2 className="text-xl font-semibold mb-2">Description</h2>
                                <p className="text-muted-foreground whitespace-pre-wrap">{artwork.description}</p>
                            </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {artwork.category && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription>Category</CardDescription>
                                        <CardTitle className="text-base">{artwork.category}</CardTitle>
                                    </CardHeader>
                                </Card>
                            )}

                            {artwork.medium && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription>Medium</CardDescription>
                                        <CardTitle className="text-base">{artwork.medium}</CardTitle>
                                    </CardHeader>
                                </Card>
                            )}

                            {formatDimensions() && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription className="flex items-center gap-2">
                                            <IconRuler className="size-4" />
                                            Dimensions
                                        </CardDescription>
                                        <CardTitle className="text-base">{formatDimensions()}</CardTitle>
                                    </CardHeader>
                                </Card>
                            )}

                            {artwork.dateCreated && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription className="flex items-center gap-2">
                                            <IconCalendar className="size-4" />
                                            Created
                                        </CardDescription>
                                        <CardTitle className="text-base">
                                            {new Date(artwork.dateCreated).getFullYear()}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            )}

                            {artwork.location && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription className="flex items-center gap-2">
                                            <IconMapPin className="size-4" />
                                            Location
                                        </CardDescription>
                                        <CardTitle className="text-base">{artwork.location}</CardTitle>
                                    </CardHeader>
                                </Card>
                            )}

                            {formatPrice() && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription>Price</CardDescription>
                                        <CardTitle className="text-base">{formatPrice()}</CardTitle>
                                    </CardHeader>
                                </Card>
                            )}
                        </div>

                        {/* Tags */}
                        {artwork.tags && artwork.tags.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <IconTag className="size-4" />
                                    Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {artwork.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Information */}
                        {(artwork.materials || artwork.technique || artwork.artistNotes) && (
                            <div className="space-y-4">
                                {artwork.materials && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-2">Materials</h3>
                                        <p className="text-muted-foreground">{artwork.materials}</p>
                                    </div>
                                )}

                                {artwork.technique && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-2">Technique</h3>
                                        <p className="text-muted-foreground">{artwork.technique}</p>
                                    </div>
                                )}

                                {artwork.artistNotes && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-2">Artist Notes</h3>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{artwork.artistNotes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Exhibition History */}
                        {artwork.exhibitionHistory && artwork.exhibitionHistory.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Exhibition History</h3>
                                <div className="space-y-2">
                                    {artwork.exhibitionHistory.map((exhibition, index) => (
                                        <Card key={index}>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">{exhibition.name}</CardTitle>
                                                <CardDescription>
                                                    {exhibition.venue}
                                                    {exhibition.dates && ` • ${exhibition.dates}`}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            {artwork.link && (
                                <Button asChild variant="outline">
                                    <a href={artwork.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        <IconLink className="size-4" />
                                        View More
                                    </a>
                                </Button>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <IconEye className="size-4" />
                                {artwork.viewsCount.toLocaleString()} views
                            </div>
                        </div>

                        {/* Availability Badge */}
                        <div>
                            <Badge
                                variant={
                                    artwork.availability === "available"
                                        ? "default"
                                        : artwork.availability === "sold"
                                            ? "destructive"
                                            : "secondary"
                                }
                            >
                                {artwork.availability === "available"
                                    ? "Available"
                                    : artwork.availability === "sold"
                                        ? "Sold"
                                        : artwork.availability === "on_loan"
                                            ? "On Loan"
                                            : artwork.availability === "private_collection"
                                                ? "Private Collection"
                                                : "Not For Sale"}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}



