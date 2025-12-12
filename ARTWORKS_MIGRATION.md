# Artworks Migration Summary

This document tracks the migration from "projects" and "photos" to "artworks".

## Completed ✅

1. ✅ Created `lib/types/artwork.ts` - Artwork types based on schema
2. ✅ Created `lib/actions/artworks.ts` - Server actions for artworks
3. ✅ Created `app/api/artworks/route.ts` - API route for artworks list
4. ✅ Created `app/api/artworks/[slug]/route.ts` - API route for single artwork
5. ✅ Created `app/protected/artworks/page.tsx` - Protected artworks page
6. ✅ Created `app/protected/artworks/loading.tsx` - Loading state

## Remaining Tasks

### Components
- [ ] Create `components/artworks/index.tsx` - Main artworks list component
- [ ] Create `components/artworks/artwork-form.tsx` - Form for creating/editing artworks
- [ ] Create `components/artworks/artwork-preview.tsx` - Preview component (optional)

### Storage Bucket
- [ ] Update all references from `"projects"` bucket to `"artworks"` bucket
- [ ] Update all references from `"photos"` bucket to `"artworks"` bucket
- [ ] Create storage bucket documentation for artworks

### Navigation & Sidebar
- [ ] Update `components/app-sidebar.tsx` - Replace projects/photos with artworks
- [ ] Update `components/docs/docs-sidebar.tsx` - Update documentation links
- [ ] Update `components/docs/docs-nav.tsx` - Update navigation

### Documentation
- [ ] Update `app/docs/database/projects/page.mdx` → `artworks/page.mdx`
- [ ] Update `app/docs/database/photos/page.mdx` → remove or merge
- [ ] Update `app/docs/storage/projects/page.mdx` → `artworks/page.mdx`
- [ ] Update `app/docs/storage/photos/page.mdx` → remove or merge
- [ ] Update `app/docs/features/projects/page.mdx` → `artworks/page.mdx`
- [ ] Update `app/docs/features/photography/page.mdx` → remove or merge
- [ ] Update `README.md` - Replace projects/photos references
- [ ] Update `PROJECTS_SETUP.md` → `ARTWORKS_SETUP.md`
- [ ] Update `PHOTOS_SETUP.md` → remove or merge
- [ ] Update `BULK_UPLOAD_SETUP.md` - Update for artworks
- [ ] Update `TROUBLESHOOTING_STORAGE.md` - Update bucket references

### Database Schema
- [ ] Create `database-schema-artworks.sql` with the provided schema
- [ ] Update migration documentation

### Other Files
- [ ] Update `components/dashboard/index.tsx` - Replace projects/photos stats
- [ ] Update `components/section-cards.tsx` - Update card references
- [ ] Update `app/page.tsx` - Update homepage references
- [ ] Update seed data files if needed

## Storage Bucket Changes

All references to:
- `supabase.storage.from("projects")` → `supabase.storage.from("artworks")`
- `supabase.storage.from("photos")` → `supabase.storage.from("artworks")`

## Database Table Changes

All references to:
- `from("projects")` → `from("artworks")`
- `from("photos")` → `from("artworks")`

## Route Changes

- `/protected/projects` → `/protected/artworks`
- `/protected/photos` → `/protected/artworks`
- `/api/projects` → `/api/artworks`
- `/api/photos` → `/api/artworks` (if exists)

