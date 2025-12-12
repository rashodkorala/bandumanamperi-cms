# Bulk Photo Upload Setup

This guide explains how to set up and use the bulk photo upload feature.

## Prerequisites

1. **Supabase Storage Bucket**: Create a storage bucket named `photos` in your Supabase project
2. **Database Schema**: Run the migration to add `alt_text` column if needed

## Storage Bucket Setup

1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Name it `photos`
4. Make it **Public** (so images can be accessed via public URLs)
5. Set up policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

-- Allow authenticated users to update their own photos
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');
```

## Database Migration

Run this SQL to add the `alt_text` column if it doesn't exist:

```sql
-- Add alt_text column to photos table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'photos' 
    AND column_name = 'alt_text'
  ) THEN
    ALTER TABLE photos ADD COLUMN alt_text TEXT;
  END IF;
END $$;
```

Or use the file: `database-migration-add-alt-text.sql`

## Metadata JSON Format

Create a JSON file with this structure:

```json
{
  "photos": [
    {
      "title": "Sunset over Mountains",
      "description": "A beautiful sunset captured in the mountains",
      "category": "nature",
      "alt_text": "Sunset over mountain range with orange and pink sky",
      "image_path": "sunset-mountains.jpg",
      "location": "Yosemite, CA",
      "date_taken": "2024-01-15"
    },
    {
      "title": "Urban Street Scene",
      "description": "Busy street in downtown",
      "category": "street",
      "alt_text": "People walking on busy city street",
      "image_path": "street-scene.jpg",
      "location": "New York, NY",
      "date_taken": "2024-02-20"
    }
  ]
}
```

### Required Fields:
- `image_path`: **Required** - Must match the filename of the uploaded photo

### Optional Fields:
- `title`: Photo title (defaults to filename without extension)
- `description`: Photo description
- `category`: One of the supported categories (see below)
- `alt_text`: Alt text for accessibility
- `location`: Where the photo was taken
- `date_taken`: Date in YYYY-MM-DD format

### Supported Categories:
- `architecture` or `architecture & heritage`
- `nature` or `nature & landscapes`
- `street` or `street & urban life`
- `travel` or `travel photography`
- `wildlife`
- `night` or `night & lights`
- `abstract` or `abstract/artistic`
- `interior_spaces` or `interior spaces`

## Usage

1. **Navigate to Photos Page**: Go to `/protected/photos`
2. **Click "Bulk Upload"**: Opens the bulk upload drawer
3. **Step 1 - Upload Metadata**: 
   - Click the metadata upload area
   - Select your JSON file
   - System will parse and validate the metadata
4. **Step 2 - Upload Photos**:
   - Click the photos upload area
   - Select multiple image files
   - File names must match the `image_path` in metadata
5. **Step 3 - Review & Edit**:
   - Review all matched photos
   - Edit titles, descriptions, alt text, categories
   - Check status (Ready or Missing photo)
6. **Upload**:
   - Click "Upload X Photos" button
   - Photos are uploaded to Supabase Storage
   - Database records are created
   - Success notification appears

## Features

- **File Matching**: Automatically matches metadata entries with photo files by filename
- **Preview**: See photo previews before uploading
- **Editable**: Edit metadata before upload
- **Category Normalization**: Automatically normalizes category names
- **Error Handling**: Shows which photos are missing or unmatched
- **Bulk Processing**: Uploads all photos in parallel for speed

## Troubleshooting

### Photos not matching
- Ensure file names in metadata `image_path` exactly match the uploaded file names (case-insensitive)
- Check for extra spaces or special characters

### Upload fails
- Verify storage bucket exists and is named `photos`
- Check storage bucket policies allow uploads
- Ensure you're authenticated
- Check file sizes (recommended max 10MB per file)

### Database errors
- Run the `alt_text` migration if you get column errors
- Verify RLS policies are set up correctly

## Example Metadata File

Save this as `metadata.json`:

```json
{
  "photos": [
    {
      "title": "Mountain Landscape",
      "description": "Beautiful mountain view at sunset",
      "category": "nature",
      "alt_text": "Mountain landscape with sunset",
      "image_path": "mountain-sunset.jpg",
      "location": "Colorado, USA",
      "date_taken": "2024-03-15"
    }
  ]
}
```

Then upload `mountain-sunset.jpg` as the photo file.

