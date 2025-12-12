-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'html' CHECK (content_type IN ('html', 'markdown', 'json')),
  template TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  featured_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  parent_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_homepage BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure unique slug per user
  UNIQUE(user_id, slug)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON pages(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pages_is_homepage ON pages(is_homepage) WHERE is_homepage = true;
CREATE INDEX IF NOT EXISTS idx_pages_sort_order ON pages(sort_order);
CREATE INDEX IF NOT EXISTS idx_pages_published_at ON pages(published_at) WHERE published_at IS NOT NULL;

-- Ensure only one homepage per user (using unique partial index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_unique_homepage_per_user 
  ON pages(user_id) 
  WHERE is_homepage = true;

-- Enable Row Level Security (RLS)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view their own pages
CREATE POLICY "Allow authenticated users to view own pages" ON pages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Allow authenticated users to insert their own pages
CREATE POLICY "Allow authenticated users to insert own pages" ON pages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Allow authenticated users to update their own pages
CREATE POLICY "Allow authenticated users to update own pages" ON pages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Allow authenticated users to delete their own pages
CREATE POLICY "Allow authenticated users to delete own pages" ON pages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Allow public read access to published pages
CREATE POLICY "Allow public read access to published pages" ON pages
  FOR SELECT
  TO public
  USING (status = 'published');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_pages_updated_at();

-- Function to ensure only one homepage per user
CREATE OR REPLACE FUNCTION ensure_single_homepage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_homepage = true THEN
    -- Unset homepage flag for other pages by the same user
    UPDATE pages
    SET is_homepage = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_homepage = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure only one homepage per user
CREATE TRIGGER ensure_single_homepage_trigger
  BEFORE INSERT OR UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_homepage();

