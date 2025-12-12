-- Create storage bucket for project images
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Create the projects bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'projects',
  'projects',
  true, -- Public bucket so images can be accessed via public URLs
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own project images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own project images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view project images" ON storage.objects;

-- Step 3: Create storage policies

-- Allow authenticated users to upload to projects bucket
CREATE POLICY "Users can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'projects');

-- Allow authenticated users to update project images
CREATE POLICY "Users can update their own project images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'projects')
WITH CHECK (bucket_id = 'projects');

-- Allow authenticated users to delete project images
CREATE POLICY "Users can delete their own project images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'projects');

-- Allow public read access to project images
CREATE POLICY "Public can view project images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'projects');

