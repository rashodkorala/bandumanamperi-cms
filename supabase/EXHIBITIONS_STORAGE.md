# Exhibition Storage Structure

## Overview
Exhibition images are stored in a dedicated Supabase storage bucket called **`exhibitions`**.

## Storage Buckets

### `exhibitions` Bucket
- **Purpose:** Store all exhibition-related images
- **Public Access:** Yes (read-only for public)
- **Write Access:** Authenticated users only

### File Types

#### 1. Cover Images
- **Format:** `cover-{timestamp}.{ext}`
- **Example:** `cover-1703001234567.jpg`
- **Purpose:** Main banner/hero image for the exhibition

#### 2. Exhibition Images
- **Format:** `img-{timestamp}-{index}.{ext}`
- **Example:** `img-1703001234567-0.jpg`, `img-1703001234567-1.jpg`
- **Purpose:** Photos of exhibition space, installations, artworks displayed, etc.

## Database Storage

Exhibition data is stored in the `artworks` table in the `exhibition_history` JSONB column:

```json
{
  "name": "Solo Show 2024",
  "venue": "Gallery XYZ, New York",
  "about": "A retrospective of recent works",
  "curator": "Jane Doe",
  "dates": "Jan 15 - Feb 28, 2024",
  "coverImage": "cover-1234567890.jpg",
  "exhibitionImages": [
    "img-1234567890-0.jpg",
    "img-1234567890-1.jpg"
  ],
  "type": "solo",
  "otherArtists": null
}
```

## Accessing Images

### From Code
```typescript
// Get public URL for exhibition image
const { data } = supabase.storage
  .from("exhibitions")
  .getPublicUrl("cover-1234567890.jpg")

const imageUrl = data.publicUrl
```

### Direct URL Pattern
```
https://{project-ref}.supabase.co/storage/v1/object/public/exhibitions/{filename}
```

## Migration Steps

1. **Create the bucket:**
   ```sql
   -- Run: supabase/migrations/exhibitions_storage_bucket.sql
   ```

2. **Update database schema:**
   ```sql
   -- Run: supabase/migrations/exhibitions_schema.sql
   ```

3. **Backward Compatibility:**
   - The code handles both old (`exhibitions/filename.jpg`) and new (`filename.jpg`) path formats
   - Old paths with `exhibitions/` prefix are automatically converted

## Storage Policies

- **Public Read:** Anyone can view exhibition images
- **Authenticated Write:** Only authenticated users can upload/update/delete
- **RLS Enabled:** Row Level Security policies are in place

## File Organization

```
Supabase Storage
└── exhibitions (bucket)
    ├── cover-1703001234567.jpg
    ├── cover-1703001234568.jpg
    ├── img-1703001234567-0.jpg
    ├── img-1703001234567-1.jpg
    ├── img-1703001234567-2.jpg
    └── img-1703001234568-0.jpg
```

## Benefits of Separate Bucket

1. **Organization:** Clear separation between artwork images and exhibition images
2. **Permissions:** Can set different access policies for exhibitions vs artworks
3. **Performance:** Easier to manage and optimize storage
4. **Billing:** Can track storage usage per bucket
5. **Cleanup:** Easier to identify and remove unused exhibition images

