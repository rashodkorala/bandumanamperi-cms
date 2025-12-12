import { notFound } from "next/navigation"
import { getArtworkBySlug } from "@/lib/actions/artworks"
import { ArtworkDetail } from "@/components/artworks/artwork-detail"
import type { Metadata } from "next"

interface ArtworkPageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata(
    { params }: ArtworkPageProps
): Promise<Metadata> {
    const { slug } = await params
    const artwork = await getArtworkBySlug(slug)

    if (!artwork) {
        return {
            title: "Artwork Not Found",
        }
    }

    return {
        title: artwork.title || "Artwork",
        description: artwork.description || undefined,
        openGraph: {
            title: artwork.title || "Artwork",
            description: artwork.description || undefined,
            images: artwork.thumbnailPath ? [artwork.thumbnailPath] : artwork.media?.[0] ? [artwork.media[0]] : undefined,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: artwork.title || "Artwork",
            description: artwork.description || undefined,
            images: artwork.thumbnailPath ? [artwork.thumbnailPath] : artwork.media?.[0] ? [artwork.media[0]] : undefined,
        },
    }
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
    const { slug } = await params
    const artwork = await getArtworkBySlug(slug)

    if (!artwork) {
        notFound()
    }

    return <ArtworkDetail artwork={artwork} />
}

