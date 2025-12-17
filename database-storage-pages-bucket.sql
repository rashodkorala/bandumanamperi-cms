-- Create storage bucket for pages
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pages',
  'pages',
  true,
  10485760, -- 10MB
  ARRAY['text/markdown', 'text/plain', 'application/json']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for pages bucket
CREATE POLICY "Authenticated users can upload page files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pages');

CREATE POLICY "Authenticated users can update their page files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pages');

CREATE POLICY "Authenticated users can delete their page files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pages');

CREATE POLICY "Public can view published page files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pages');

CREATE POLICY "Authenticated users can view all page files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'pages');
