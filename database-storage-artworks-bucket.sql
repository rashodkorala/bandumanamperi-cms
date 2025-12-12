-- Create artworks bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artworks',
  'artworks',
  true, -- Public bucket
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to artworks" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update artworks" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete artworks" ON storage.objects;

-- Create storage policies for authenticated users
-- Policy: Allow authenticated users to upload to artworks bucket
CREATE POLICY "Users can upload artwork images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artworks');

-- Policy: Allow authenticated users to update files in artworks bucket
CREATE POLICY "Users can update their own artwork images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'artworks')
WITH CHECK (bucket_id = 'artworks');

-- Policy: Allow authenticated users to delete files in artworks bucket
CREATE POLICY "Users can delete their own artwork images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'artworks');

-- Policy: Allow public to view artwork images
CREATE POLICY "Public can view artwork images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'artworks');

