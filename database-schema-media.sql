-- Create media table for managing media files
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'video', 'document', 'audio', 'other'
  file_size BIGINT, -- Size in bytes
  mime_type TEXT,
  alt_text TEXT,
  tags TEXT[] DEFAULT '{}',
  folder TEXT, -- Optional folder organization
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own media"
  ON media FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media"
  ON media FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media"
  ON media FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media"
  ON media FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS media_user_id_idx ON media(user_id);
CREATE INDEX IF NOT EXISTS media_file_type_idx ON media(file_type);
CREATE INDEX IF NOT EXISTS media_folder_idx ON media(folder);
CREATE INDEX IF NOT EXISTS media_featured_idx ON media(featured) WHERE featured = TRUE;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_media_updated_at();

