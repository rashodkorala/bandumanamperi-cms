-- Create blogs table for blog/content management
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL, -- Full blog content (markdown or HTML)
  featured_image_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own blogs"
  ON blogs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blogs"
  ON blogs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blogs"
  ON blogs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blogs"
  ON blogs FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS blogs_user_id_idx ON blogs(user_id);
CREATE INDEX IF NOT EXISTS blogs_slug_idx ON blogs(slug);
CREATE INDEX IF NOT EXISTS blogs_status_idx ON blogs(status);
CREATE INDEX IF NOT EXISTS blogs_published_at_idx ON blogs(published_at);
CREATE INDEX IF NOT EXISTS blogs_featured_idx ON blogs(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS blogs_category_idx ON blogs(category);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_blogs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_blogs_updated_at();

