# Pages Feature Setup Guide

This guide explains how to set up and use the dynamic pages feature with file storage in Supabase.

## Overview

The pages feature allows you to:
- Create and edit pages dynamically through the CMS
- Store page content as both `.md` (Markdown) and `.json` files in Supabase Storage
- Render pages on the frontend by reading from the database or files
- Manage SEO metadata, featured images, and page hierarchy

## Architecture

```
┌─────────────────┐
│   Admin Panel   │  ← Create/Edit Pages
│ (/protected/    │
│    pages)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│   Supabase DB   │────▶│ Supabase Storage │
│  (pages table)  │     │   (pages bucket) │
└────────┬────────┘     └──────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────┐
│         Frontend Pages                  │
│      (/pages/[slug])                    │
│                                         │
│  Reads from DB + Files for rendering   │
└─────────────────────────────────────────┘
```

## Database Setup

### 1. Run the Pages Table Migration

Execute the following SQL in your Supabase SQL Editor:

```sql
-- This creates the pages table with all necessary fields
-- File: database-schema-pages.sql
```

The migration creates:
- `pages` table with fields for content, metadata, and file URLs
- Indexes for performance
- RLS policies for security
- Triggers for automatic timestamp updates

### 2. Create the Storage Bucket

Execute the storage bucket setup:

```sql
-- This creates the 'pages' bucket for storing .md and .json files
-- File: database-storage-pages-bucket.sql
```

This creates:
- A public bucket named `pages`
- RLS policies for file upload/access
- File size limits (10MB) and MIME type restrictions

### 3. Add New Columns (Migration for Existing Installations)

If you already have a `pages` table, add the new columns:

```sql
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS markdown_file_url TEXT,
ADD COLUMN IF NOT EXISTS json_file_url TEXT;
```

## Features

### Page Content Types

The system supports three content types:

1. **HTML**: Raw HTML content
2. **Markdown**: Markdown-formatted content
3. **JSON**: Structured data for page builders

### File Generation

When a page is created or updated:

1. **Markdown File** (`.md`):
   - Contains YAML frontmatter with metadata
   - Includes the page content
   - Stored at: `pages/{slug}.md`

2. **JSON File** (`.json`):
   - Contains complete page data in JSON format
   - Useful for headless CMS integrations
   - Stored at: `pages/{slug}.json`

### Example Files

**Markdown File** (`about-us.md`):
```markdown
---
title: About Us
slug: about-us
contentType: markdown
template: default
metaTitle: About Our Company
metaDescription: Learn more about our company history and values
status: published
publishedAt: 2025-01-15T10:00:00Z
isHomepage: false
---

# About Us

Welcome to our company...
```

**JSON File** (`about-us.json`):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "About Us",
  "slug": "about-us",
  "content": "Welcome to our company...",
  "contentType": "markdown",
  "template": "default",
  "metaTitle": "About Our Company",
  "metaDescription": "Learn more about our company history and values",
  "status": "published",
  "publishedAt": "2025-01-15T10:00:00Z",
  "isHomepage": false
}
```

## Usage

### Creating a Page

1. Navigate to `/protected/pages` in your admin panel
2. Click "New Page"
3. Fill in the form:
   - **Title**: Page title
   - **Slug**: URL-friendly identifier (auto-generated)
   - **Content Type**: Choose HTML, Markdown, or JSON
   - **Content**: Enter your page content
   - **Template**: Optional template name
   - **Featured Image**: Optional hero image
   - **SEO Settings**: Meta title, description, keywords
   - **Status**: Draft, Published, or Archived
   - **Homepage**: Check to set as homepage

4. Click "Create"

The system will:
- Save the page to the database
- Generate and upload `.md` and `.json` files to Supabase Storage
- Store the file URLs in the database

### Frontend Rendering

Pages are accessible at `/pages/{slug}` (e.g., `/pages/about-us`).

The frontend automatically:
- Fetches the page from the database
- Displays the content based on content type
- Shows SEO metadata
- Provides download links for `.md` and `.json` files

### API Endpoints

**Get all published pages:**
```
GET /api/pages
```

**Get page by slug:**
```
GET /api/pages/{slug}
```

**Query parameters:**
- `status`: Filter by status (draft, published, archived)
- `parentId`: Filter by parent page
- `isHomepage`: Filter homepage (true/false)

### Using Files on Frontend

You can fetch and use the files directly:

```javascript
// Fetch JSON file
const response = await fetch(page.jsonFileUrl)
const pageData = await response.json()

// Fetch Markdown file
const mdResponse = await fetch(page.markdownFileUrl)
const markdownContent = await mdResponse.text()
```

## Page Hierarchy

Pages can have parent-child relationships:

```
Home (is_homepage: true)
├── About
│   ├── Team
│   └── History
├── Services
│   ├── Consulting
│   └── Training
└── Contact
```

Set `parentId` when creating/editing a page to establish hierarchy.

## Security

### Row Level Security (RLS)

- **Authenticated users**: Can create, read, update, delete their own pages
- **Public users**: Can only read published pages
- **Storage files**: Public read access, authenticated write access

### Best Practices

1. Always use `status: "draft"` for pages under development
2. Only set `status: "published"` when ready for public viewing
3. Use meaningful slugs for SEO (e.g., `about-us` instead of `page-1`)
4. Fill in SEO metadata for better search engine visibility
5. Use featured images for social media sharing

## Troubleshooting

### Files not uploading

Check Supabase Storage bucket permissions:
```sql
SELECT * FROM storage.objects WHERE bucket_id = 'pages';
```

### Pages not displaying

1. Verify page status is "published"
2. Check RLS policies are enabled
3. Ensure slug matches URL exactly

### Performance optimization

1. Enable caching for static pages
2. Use CDN for file distribution
3. Index frequently queried fields

## Future Enhancements

Potential improvements:

1. **Markdown Rendering**: Add markdown-to-HTML conversion
2. **Version Control**: Track page revisions
3. **Preview Mode**: Preview drafts before publishing
4. **Custom Templates**: Create reusable page templates
5. **Bulk Operations**: Import/export multiple pages
6. **Page Builder**: Visual drag-and-drop editor
7. **Localization**: Multi-language support

## Related Documentation

- [Database Schema](./database-schema-pages.sql)
- [Storage Bucket Setup](./database-storage-pages-bucket.sql)
- [API Routes](./app/api/pages/)
- [Admin Components](./components/pages/)

## Support

For issues or questions:
1. Check Supabase logs for errors
2. Review RLS policies
3. Verify storage bucket permissions
4. Check file MIME types and sizes


