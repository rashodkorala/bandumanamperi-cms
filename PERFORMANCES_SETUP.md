# Performances Feature Setup Guide

This guide will help you set up the Performances feature in your CMS.

## Overview

The Performances feature allows you to:
- Upload and manage performance records
- Add cover images and multiple media files (images/videos)
- Link to external videos (YouTube/Vimeo)
- Organize performances by type (solo, group, collaboration, online, hybrid)
- Categorize by performance type (dance, theatre, music, etc.)
- Track collaborators (director, choreographer, composer, etc.)
- Add venue, location, date, time, and duration details
- Include program notes, reviews, and awards
- Manage status (published, draft, archived)
- Feature performances
- Track views and audience size

## Files Created

### Database Schema
1. **database-schema-performances.sql** - Main performances table schema
2. **database-storage-performances-bucket.sql** - Storage bucket for performance media

### TypeScript Types
3. **lib/types/performance.ts** - TypeScript type definitions

### Server Actions
4. **lib/actions/performances.ts** - Server-side CRUD operations

### UI Components
5. **components/performances/index.tsx** - Main performances list component
6. **components/performances/performance-form.tsx** - Performance form for create/edit

### Pages
7. **app/protected/performances/page.tsx** - Protected performances management page

### Navigation
8. **components/app-sidebar.tsx** - Updated to include Performances menu item

## Setup Instructions

### Step 1: Run Database Migrations

Run the SQL files in your Supabase SQL Editor in this order:

```bash
# 1. Create the performances table
cat database-schema-performances.sql | supabase db execute

# 2. Create the storage bucket
cat database-storage-performances-bucket.sql | supabase db execute
```

Or manually in Supabase Dashboard:
1. Go to SQL Editor in your Supabase dashboard
2. Copy and execute `database-schema-performances.sql`
3. Copy and execute `database-storage-performances-bucket.sql`

### Step 2: Verify Setup

Check that the following were created:

1. **Table**: `performances` table exists
   ```sql
   SELECT * FROM performances LIMIT 1;
   ```

2. **Storage Bucket**: `performances` bucket exists
   - Go to Storage in Supabase Dashboard
   - Verify "performances" bucket is listed

3. **Functions**: Database functions exist
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'increment_performance_views';
   ```

### Step 3: Test the Feature

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to the Performances section in the sidebar

3. Click "Add Performance" to create a test performance

4. Upload a cover image and some media files

5. Fill in the form and save

## Database Schema Details

### Main Fields

- **Basic Info**: title, description
- **Performance Details**: venue, location, date, time, duration
- **Type & Category**: type (solo/group/collaboration/online/hybrid), category (dance/theatre/music/etc.)
- **Collaborators**: director, choreographer, composer, other collaborators
- **Media**: cover_image, media (array), video_url
- **Content**: about, program_notes, reviews
- **Links**: tickets_url, website_url
- **SEO**: slug, tags
- **Status**: status (published/draft/archived), featured
- **Metadata**: awards, audience_size, views_count, sort_order

### Storage Structure

All media files are stored in the `performances` storage bucket:
- Cover images: `{uuid}.{ext}`
- Media files: `{uuid}.{ext}`

### Access Control

- **Public**: Can view published performances only
- **Authenticated**: Full CRUD access to all performances

## Usage Examples

### Creating a Performance

```typescript
import { createPerformance } from "@/lib/actions/performances"

const performance = await createPerformance({
  title: "Dance Performance 2024",
  description: "A contemporary dance piece",
  venue: "Lincoln Center",
  location: "New York, USA",
  date: "March 15, 2024",
  time: "8:00 PM",
  duration: "90 minutes",
  type: "solo",
  category: "dance",
  status: "published",
  featured: true,
})
```

### Fetching Performances

```typescript
import { 
  getPerformances, 
  getFeaturedPerformances,
  getPerformancesByCategory 
} from "@/lib/actions/performances"

// Get all performances
const allPerformances = await getPerformances()

// Get featured performances
const featured = await getFeaturedPerformances()

// Get performances by category
const dancePerformances = await getPerformancesByCategory("dance")
```

## Features

### 1. Performance Management
- Create, read, update, delete performances
- Upload cover images and multiple media files
- Support for images and videos
- External video links (YouTube/Vimeo)

### 2. Organization
- Filter by type (solo, group, collaboration, online, hybrid)
- Filter by category (dance, theatre, music, etc.)
- Tags for better searchability
- Custom sort order

### 3. Collaborators
- Track director, choreographer, composer
- List other collaborators
- Separate field for group performances

### 4. Content Management
- Detailed "about" section
- Program notes
- Reviews and press quotes
- Awards and recognition

### 5. Status & Visibility
- Draft, published, archived states
- Featured performances
- View count tracking
- Public/private access control

### 6. Media Management
- Cover image with preview
- Multiple media files (images/videos)
- External video embedding
- File size limits (10MB for cover, 50MB for media)
- Easy deletion of media files

## Troubleshooting

### Images Not Displaying

1. Check storage bucket exists:
   - Go to Storage in Supabase Dashboard
   - Verify "performances" bucket

2. Check RLS policies:
   ```sql
   SELECT * FROM storage.objects WHERE bucket_id = 'performances';
   ```

### Upload Failing

1. Check file size limits:
   - Cover image: 10MB max
   - Media files: 50MB max each

2. Verify storage policies are set correctly

3. Check browser console for errors

### Database Errors

1. Verify all migrations ran successfully
2. Check for typos in column names
3. Ensure RLS is properly configured

## Next Steps

1. **Public Display**: Create public-facing pages to display performances
   - `/performances` - List all published performances
   - `/performances/[slug]` - Individual performance detail page

2. **Integration**: Link performances to artworks or other content

3. **Search**: Implement search functionality using the `searchPerformances` action

4. **Calendar View**: Create a calendar view for performances by date

5. **Analytics**: Track performance views and engagement

## Support

For issues or questions:
1. Check the database logs in Supabase Dashboard
2. Review the browser console for client-side errors
3. Check server logs for API errors

## API Reference

See `lib/actions/performances.ts` for all available server actions:

- `getPerformances()` - Get all performances
- `getPerformance(id)` - Get single performance
- `getPerformanceBySlug(slug)` - Get by slug
- `getFeaturedPerformances()` - Get featured
- `getPublishedPerformances()` - Get published
- `createPerformance(data)` - Create new
- `updatePerformance(data)` - Update existing
- `deletePerformance(id)` - Delete performance
- `deletePerformanceMedia(id, path)` - Delete media file
- `deletePerformanceCoverImage(id, path)` - Delete cover
- `incrementPerformanceViews(id)` - Increment views
- `getPerformancesByCategory(category)` - Get by category
- `getPerformancesByType(type)` - Get by type
- `searchPerformances(query)` - Search performances


