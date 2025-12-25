-- Storage Policies for Exhibitions Bucket
-- 
-- IMPORTANT: These policies require elevated permissions (service_role or postgres role)
-- 
-- Option 1: Run this via Supabase Dashboard SQL Editor with "Run as postgres" enabled
-- Option 2: Run via Supabase CLI with: supabase db push
-- Option 3: Create policies manually via Dashboard UI (Storage > exhibitions > Policies)

-- Drop existing policies if they exist (to allow re-running)
DROP POLICY IF EXISTS "Public Access to exhibitions bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to exhibitions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update exhibitions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from exhibitions" ON storage.objects;

-- Policy 1: Public Read Access
-- Allows anyone (including non-authenticated users) to view exhibition images
CREATE POLICY "Public Access to exhibitions bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exhibitions');

-- Policy 2: Authenticated Upload
-- Allows authenticated users to upload new files
CREATE POLICY "Authenticated users can upload to exhibitions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exhibitions');

-- Policy 3: Authenticated Update
-- Allows authenticated users to update existing files
CREATE POLICY "Authenticated users can update exhibitions"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'exhibitions');

-- Policy 4: Authenticated Delete
-- Allows authenticated users to delete files
CREATE POLICY "Authenticated users can delete from exhibitions"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'exhibitions');

