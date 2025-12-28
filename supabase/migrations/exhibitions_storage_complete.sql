-- Complete Exhibition Storage Setup
-- This file combines bucket creation and policies in one script
-- 
-- REQUIREMENTS:
-- - Must be run with elevated permissions (service_role or postgres)
-- - In Supabase Dashboard SQL Editor, enable "Run as postgres"
-- - Or run via: supabase db push (if using Supabase CLI)

-- ============================================================================
-- STEP 1: Create the exhibitions storage bucket
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'exhibitions',
    'exhibitions',
    true,  -- Public bucket (allows public read access to files)
    52428800,  -- 50MB file size limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- STEP 2: Drop existing policies (if any) to allow clean re-runs
-- ============================================================================

DROP POLICY IF EXISTS "Public Access to exhibitions bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to exhibitions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update exhibitions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from exhibitions" ON storage.objects;

-- ============================================================================
-- STEP 3: Create storage policies
-- ============================================================================

-- Policy 1: Public Read Access
-- Allows anyone to view exhibition images (required for public website)
CREATE POLICY "Public Access to exhibitions bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exhibitions');

-- Policy 2: Authenticated Upload
-- Allows logged-in users to upload new exhibition images
CREATE POLICY "Authenticated users can upload to exhibitions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exhibitions');

-- Policy 3: Authenticated Update
-- Allows logged-in users to replace existing images
CREATE POLICY "Authenticated users can update exhibitions"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'exhibitions');

-- Policy 4: Authenticated Delete
-- Allows logged-in users to delete exhibition images
CREATE POLICY "Authenticated users can delete from exhibitions"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'exhibitions');

-- ============================================================================
-- STEP 4: Add documentation
-- ============================================================================

COMMENT ON TABLE storage.objects IS 
'Storage objects table. The exhibitions bucket stores:
- Cover images: cover-{timestamp}.{ext}
- Exhibition photos: img-{timestamp}-{index}.{ext}
All exhibition images are public-readable but require authentication to modify.';

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this after to verify the bucket was created:
-- SELECT * FROM storage.buckets WHERE id = 'exhibitions';
-- 
-- Verify policies were created:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%exhibition%';



