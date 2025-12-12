-- Create pages table for website page management
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL, -- Page content (HTML, markdown, or JSON for page builder)
  content_type TEXT NOT NULL CHECK (content_type IN ('html', 'markdown', 'json')) DEFAULT 'html',
  template TEXT, -- Optional template name
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[] DEFAULT '{}',
  featured_image_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  parent_id UUID REFERENCES pages(id) ON DELETE SET NULL, -- For hierarchical pages
  sort_order INTEGER DEFAULT 0,
  is_homepage BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own pages"
  ON pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pages"
  ON pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pages"
  ON pages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages"
  ON pages FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS pages_user_id_idx ON pages(user_id);
CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages(slug);
CREATE INDEX IF NOT EXISTS pages_status_idx ON pages(status);
CREATE INDEX IF NOT EXISTS pages_parent_id_idx ON pages(parent_id);
CREATE INDEX IF NOT EXISTS pages_is_homepage_idx ON pages(is_homepage) WHERE is_homepage = TRUE;
CREATE INDEX IF NOT EXISTS pages_published_at_idx ON pages(published_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_pages_updated_at();

