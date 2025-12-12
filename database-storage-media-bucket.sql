-- Create storage bucket for media files
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Create the media bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true, -- Public bucket so files can be accessed via public URLs
  52428800, -- 50MB file size limit (larger for videos/documents)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'audio/mpeg', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;

-- Step 3: Create storage policies

-- Allow authenticated users to upload to media bucket
CREATE POLICY "Users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to update media
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to delete media
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');

-- Allow public read access to media files
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

