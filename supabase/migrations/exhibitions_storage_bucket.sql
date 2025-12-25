-- Create storage bucket for exhibition images
-- This bucket will store cover images and exhibition space photos

-- Create the exhibitions bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('exhibitions', 'exhibitions', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (Row Level Security) on the exhibitions bucket
CREATE POLICY "Public Access to exhibitions bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exhibitions');

-- Allow authenticated users to upload to exhibitions bucket
CREATE POLICY "Authenticated users can upload to exhibitions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exhibitions');

-- Allow authenticated users to update in exhibitions bucket
CREATE POLICY "Authenticated users can update exhibitions"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'exhibitions');

-- Allow authenticated users to delete from exhibitions bucket
CREATE POLICY "Authenticated users can delete from exhibitions"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'exhibitions');

-- Add comment
COMMENT ON TABLE storage.objects IS 
'Storage bucket for exhibition images including:
- Cover images (exhibition-cover-*.jpg/png)
- Exhibition space photos (exhibition-img-*.jpg/png)
All exhibition-related images are stored in the "exhibitions" bucket.';

