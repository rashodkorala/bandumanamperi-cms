# Exhibition Data API Documentation

## For Frontend Developers

This document describes how to retrieve and display exhibition data.

---

## API Function

### `getExhibitions()`

**Location:** `@/lib/actions/exhibitions`

**Description:** Retrieves all exhibitions with their associated artworks.

**Usage:**
```typescript
import { getExhibitions } from "@/lib/actions/exhibitions"

const exhibitions = await getExhibitions()
```

---

## Data Structure

### Exhibition Object

```typescript
interface Exhibition {
  // Basic Information
  name: string                    // Exhibition title
  venue: string                   // Location/gallery name
  about: string                   // Exhibition description
  curator: string                 // Curator name
  dates: string                   // Date range (e.g., "Jan 15 - Feb 28, 2024")
  
  // Images
  coverImage: string | null       // Cover/banner image path
  exhibitionImages: string[]      // Array of exhibition space photo paths
  
  // Type & Participants
  type: "solo" | "group" | "online"  // Exhibition type
  otherArtists: string | null     // Comma-separated list (only for group exhibitions)
  
  // Related Content
  artworks: Artwork[]             // Array of artworks in this exhibition
}
```

### Artwork Object (Nested in Exhibition)

```typescript
interface Artwork {
  id: string
  title: string | null
  year: string | null
  category: string | null
  status: "published" | "draft" | "archived"
  thumbnailPath: string | null
  media: string[] | null
  // ... other artwork fields
}
```

---

## Getting Image URLs

Exhibition images are stored in the `exhibitions` Supabase storage bucket.

### Method 1: Using Supabase Client (Recommended)

```typescript
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

function getExhibitionImageUrl(path: string | null): string | null {
  if (!path) return null
  
  // Handle full URLs
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }
  
  // Get public URL from exhibitions bucket
  const { data } = supabase.storage
    .from("exhibitions")
    .getPublicUrl(path)
  
  return data.publicUrl
}

// Usage
const coverUrl = getExhibitionImageUrl(exhibition.coverImage)
const imageUrls = exhibition.exhibitionImages.map(getExhibitionImageUrl)
```

### Method 2: Direct URL Pattern

```typescript
const BASE_URL = "https://YOUR-PROJECT-REF.supabase.co/storage/v1/object/public/exhibitions"

function getDirectUrl(path: string): string {
  return `${BASE_URL}/${path}`
}
```

---

## Complete Example

### Server Component (Next.js App Router)

```typescript
// app/exhibitions/page.tsx
import { getExhibitions } from "@/lib/actions/exhibitions"
import { ExhibitionCard } from "@/components/exhibition-card"

export default async function ExhibitionsPage() {
  const exhibitions = await getExhibitions()
  
  return (
    <div className="container">
      <h1>Exhibitions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exhibitions.map((exhibition) => (
          <ExhibitionCard 
            key={`${exhibition.name}-${exhibition.dates}`}
            exhibition={exhibition}
          />
        ))}
      </div>
    </div>
  )
}
```

### Client Component Example

```typescript
// components/exhibition-card.tsx
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

interface ExhibitionCardProps {
  exhibition: Exhibition
}

export function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  const supabase = createClient()
  
  const getImageUrl = (path: string | null) => {
    if (!path) return null
    if (path.startsWith("http")) return path
    
    const { data } = supabase.storage
      .from("exhibitions")
      .getPublicUrl(path)
    return data.publicUrl
  }
  
  const coverUrl = getImageUrl(exhibition.coverImage)
  
  return (
    <div className="exhibition-card">
      {/* Cover Image */}
      {coverUrl && (
        <div className="aspect-video relative">
          <Image
            src={coverUrl}
            alt={exhibition.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      {/* Exhibition Info */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{exhibition.name}</h2>
          <span className="badge">{exhibition.type}</span>
        </div>
        
        <p className="text-gray-600">{exhibition.venue}</p>
        <p className="text-gray-600">{exhibition.dates}</p>
        <p className="text-gray-600">Curator: {exhibition.curator}</p>
        
        <p className="mt-2">{exhibition.about}</p>
        
        {exhibition.otherArtists && (
          <p className="text-sm">
            Other Artists: {exhibition.otherArtists}
          </p>
        )}
        
        {/* Exhibition Images Gallery */}
        {exhibition.exhibitionImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {exhibition.exhibitionImages.map((imagePath, index) => (
              <div key={index} className="aspect-video relative">
                <Image
                  src={getImageUrl(imagePath) || ""}
                  alt={`${exhibition.name} ${index + 1}`}
                  fill
                  className="object-cover rounded"
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Artworks */}
        <div className="mt-4">
          <h3 className="font-semibold">
            Artworks ({exhibition.artworks.length})
          </h3>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {exhibition.artworks.map((artwork) => (
              <ArtworkThumbnail key={artwork.id} artwork={artwork} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## API Response Example

```json
[
  {
    "name": "Solo Show 2024",
    "venue": "Modern Art Gallery, New York",
    "about": "A retrospective collection showcasing recent works exploring themes of nature and urbanization.",
    "curator": "Jane Doe",
    "dates": "January 15 - February 28, 2024",
    "coverImage": "cover-1703001234567.jpg",
    "exhibitionImages": [
      "img-1703001234567-0.jpg",
      "img-1703001234567-1.jpg",
      "img-1703001234567-2.jpg"
    ],
    "type": "solo",
    "otherArtists": null,
    "artworks": [
      {
        "id": "uuid-here",
        "title": "Sunset Over Mountains",
        "year": "2024",
        "category": "Painting",
        "status": "published",
        "thumbnailPath": "path/to/thumbnail.jpg",
        "media": ["path/to/image1.jpg", "path/to/image2.jpg"]
      },
      // ... more artworks
    ]
  },
  {
    "name": "Group Exhibition: Modern Voices",
    "venue": "Contemporary Art Space, London",
    "about": "A collaborative showcase featuring emerging artists from around the world.",
    "curator": "John Smith",
    "dates": "March 1-31, 2024",
    "coverImage": "cover-1703001234568.jpg",
    "exhibitionImages": [
      "img-1703001234568-0.jpg"
    ],
    "type": "group",
    "otherArtists": "Artist A, Artist B, Artist C",
    "artworks": [
      // ... artworks
    ]
  }
]
```

---

## Filtering & Sorting

### By Type
```typescript
const soloExhibitions = exhibitions.filter(e => e.type === "solo")
const groupExhibitions = exhibitions.filter(e => e.type === "group")
const onlineExhibitions = exhibitions.filter(e => e.type === "online")
```

### By Date (Most Recent First)
```typescript
// Already sorted by date (most recent first) from the API
// If you need custom sorting:
const sorted = [...exhibitions].sort((a, b) => 
  new Date(b.dates).getTime() - new Date(a.dates).getTime()
)
```

### Search
```typescript
const searchResults = exhibitions.filter(e =>
  e.name.toLowerCase().includes(query.toLowerCase()) ||
  e.venue.toLowerCase().includes(query.toLowerCase()) ||
  e.about.toLowerCase().includes(query.toLowerCase())
)
```

---

## Common Use Cases

### 1. Exhibition List Page
- Display all exhibitions with cover images
- Show type badges (solo/group/online)
- Display venue and dates
- Show artwork count

### 2. Exhibition Detail Page
- Full cover image
- Complete description and curator info
- Exhibition images gallery
- List/grid of all artworks
- Link to individual artworks

### 3. Homepage Featured Exhibition
- Get first exhibition (most recent)
- Display cover image and basic info
- Link to full exhibition page

### 4. Artist Portfolio
- Show exhibitions where artist participated
- Filter by artist name or ID

---

## Performance Tips

### 1. Image Optimization
```typescript
// Use Next.js Image component with proper sizes
<Image
  src={imageUrl}
  alt={exhibition.name}
  width={800}
  height={450}
  sizes="(max-width: 768px) 100vw, 800px"
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
/>
```

### 2. Lazy Loading
```typescript
// Load exhibition images on scroll
<Image
  src={imageUrl}
  loading="lazy"
  // ...
/>
```

### 3. Caching
```typescript
// Next.js App Router automatically caches server components
// For client-side, use SWR or React Query:
import useSWR from 'swr'

function useExhibitions() {
  const { data, error } = useSWR('exhibitions', getExhibitions)
  return { exhibitions: data, isLoading: !error && !data, error }
}
```

---

## Error Handling

```typescript
try {
  const exhibitions = await getExhibitions()
  
  if (exhibitions.length === 0) {
    return <EmptyState message="No exhibitions yet" />
  }
  
  return <ExhibitionsList exhibitions={exhibitions} />
} catch (error) {
  console.error("Failed to load exhibitions:", error)
  return <ErrorState message="Failed to load exhibitions" />
}
```

---

## TypeScript Types

All types are available in:
```typescript
import type { Exhibition } from "@/lib/actions/exhibitions"
import type { Artwork } from "@/lib/types/artwork"
import type { ExhibitionType } from "@/lib/types/artwork"
```

---

## Questions?

For backend/data issues, check:
- `lib/actions/exhibitions.ts` - Server actions
- `lib/types/artwork.ts` - Type definitions
- `supabase/migrations/exhibitions_schema.sql` - Database schema

