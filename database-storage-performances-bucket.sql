-- Create storage bucket for performances
INSERT INTO storage.buckets (id, name, public)
VALUES ('performances', 'performances', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to performances bucket
CREATE POLICY IF NOT EXISTS "Allow public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'performances');

-- Policy to allow authenticated users to upload to performances bucket
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'performances'
    AND auth.role() = 'authenticated'
  );

-- Policy to allow authenticated users to update in performances bucket
CREATE POLICY IF NOT EXISTS "Allow authenticated updates"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'performances'
    AND auth.role() = 'authenticated'
  );

-- Policy to allow authenticated users to delete from performances bucket
CREATE POLICY IF NOT EXISTS "Allow authenticated deletes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'performances'
    AND auth.role() = 'authenticated'
  );


