"use client"

import { useState } from "react"
import Image from "next/image"
import { IconCalendar, IconMapPin, IconRuler, IconTag, IconEye, IconLink, IconPalette, IconX } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Artwork } from "@/lib/types/artwork"

interface ArtworkPreviewProps {
    artwork: Artwork | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ArtworkPreview({ artwork, open, onOpenChange }: ArtworkPreviewProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    if (!artwork) return null

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
        if (artwork.priceUponRequest) return "Price upon request"
        if (!artwork.price) return null
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: artwork.currency || "USD",
        })
        return formatter.format(Number(artwork.price))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{artwork.title || "Untitled"}</DialogTitle>
                    {artwork.year && (
                        <DialogDescription>{artwork.year}</DialogDescription>
                    )}
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
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
                                />
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
                                        onClick={() => setSelectedImageIndex(index)}
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
                    <div className="space-y-4">
                        {artwork.series && (
                            <Badge variant="outline">{artwork.series}</Badge>
                        )}

                        {artwork.description && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Description</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{artwork.description}</p>
                            </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {artwork.category && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-xs">Category</CardDescription>
                                        <CardTitle className="text-sm">{artwork.category}</CardTitle>
                                    </CardHeader>
                                </Card>
                            )}

                            {artwork.medium && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-xs">Medium</CardDescription>
                                        <CardTitle className="text-sm">{artwork.medium}</CardTitle>
                                    </CardHeader>
                                </Card>
                            )}

                            {formatDimensions() && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-xs flex items-center gap-1">
                                            <IconRuler className="size-3" />
                                            Dimensions
                                        </CardDescription>
                                        <CardTitle className="text-sm">{formatDimensions()}</CardTitle>
                                    </CardHeader>
                                </Card>
                            )}

                            {artwork.dateCreated && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-xs flex items-center gap-1">
                                            <IconCalendar className="size-3" />
                                            Created
                                        </CardDescription>
                                        <CardTitle className="text-sm">
                                            {new Date(artwork.dateCreated).getFullYear()}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            )}

                            {artwork.location && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-xs flex items-center gap-1">
                                            <IconMapPin className="size-3" />
                                            Location
                                        </CardDescription>
                                        <CardTitle className="text-sm">{artwork.location}</CardTitle>
                                    </CardHeader>
                                </Card>
                            )}

                            {formatPrice() && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-xs">Price</CardDescription>
                                        <CardTitle className="text-sm">{formatPrice()}</CardTitle>
                                    </CardHeader>
                                </Card>
                            )}

                            {artwork.collectorName && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-xs">Collector</CardDescription>
                                        <CardTitle className="text-sm">{artwork.collectorName}</CardTitle>
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
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Information */}
                        {(artwork.materials || artwork.technique || artwork.artistNotes) && (
                            <div className="space-y-3">
                                {artwork.materials && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-1">Materials</h3>
                                        <p className="text-sm text-muted-foreground">{artwork.materials}</p>
                                    </div>
                                )}

                                {artwork.technique && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-1">Technique</h3>
                                        <p className="text-sm text-muted-foreground">{artwork.technique}</p>
                                    </div>
                                )}

                                {artwork.artistNotes && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-1">Artist Notes</h3>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{artwork.artistNotes}</p>
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
                                                <CardTitle className="text-sm">{exhibition.name}</CardTitle>
                                                <CardDescription className="text-xs">
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
                        <div className="flex gap-4 pt-4 border-t">
                            {artwork.slug && artwork.status === "published" && (
                                <Button asChild variant="outline" size="sm">
                                    <a href={`/artworks/${artwork.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        <IconLink className="size-4" />
                                        View Full Page
                                    </a>
                                </Button>
                            )}
                            {artwork.link && (
                                <Button asChild variant="outline" size="sm">
                                    <a href={artwork.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        <IconLink className="size-4" />
                                        External Link
                                    </a>
                                </Button>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
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
            </DialogContent>
        </Dialog>
    )
}



