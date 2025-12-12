# Storage Upload Troubleshooting

If you're having issues uploading cover images or gallery images for projects, follow these steps:

## Quick Check

1. **Check Browser Console**: Open browser DevTools (F12) → Console tab
   - Look for error messages when uploading
   - Common errors will be logged there

2. **Check Storage Bucket Exists**:
   - Go to Supabase Dashboard → Storage
   - Verify you have a bucket named `projects`
   - If it doesn't exist, create it (see below)

## Setup Storage Bucket

### Option 1: Using SQL (Recommended)

Run this SQL in your Supabase SQL Editor:

```sql
-- Create projects bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'projects',
  'projects',
  true, -- Public bucket
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own project images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own project images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view project images" ON storage.objects;

-- Create storage policies
CREATE POLICY "Users can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'projects');

CREATE POLICY "Users can update their own project images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'projects')
WITH CHECK (bucket_id = 'projects');

CREATE POLICY "Users can delete their own project images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'projects');

CREATE POLICY "Public can view project images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'projects');
```

### Option 2: Manual Setup

1. Go to **Supabase Dashboard → Storage**
2. Click **"Create a new bucket"**
3. Name it: `projects`
4. Make it **Public** (toggle ON)
5. Set file size limit: **10MB**
6. Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`
7. Run the SQL policies from Option 1 above

## Common Errors

### "Bucket not found" or "does not exist"
- **Solution**: Create the `projects` bucket (see above)

### "new row violates" or "policy" error
- **Solution**: Run the storage policies SQL (see above)

### "File too large"
- **Solution**: Ensure your image is under 10MB
- Compress the image if needed

### "Invalid file type"
- **Solution**: Only JPEG, PNG, WEBP, and GIF are allowed
- Convert your image to one of these formats

### "Unauthorized" or "Permission denied"
- **Solution**: 
  1. Check you're logged in
  2. Verify storage policies are set up correctly
  3. Check your Supabase project is active

## Verify Setup

After setting up, test by:
1. Creating a new project
2. Selecting a cover image (under 10MB, JPEG/PNG/WEBP/GIF)
3. The upload should work

If it still doesn't work:
1. Check browser console for specific error messages
2. Verify bucket exists in Supabase Dashboard
3. Verify policies are active in Supabase Dashboard → Storage → Policies

