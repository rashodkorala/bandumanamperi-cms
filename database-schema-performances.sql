-- Create performances table
CREATE TABLE IF NOT EXISTS performances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic information
  title TEXT NOT NULL,
  description TEXT,
  
  -- Performance details
  venue TEXT,
  location TEXT, -- City, country
  date TEXT, -- Performance date(s) as text (e.g., "Jan 15, 2024" or "Jan 15-20, 2024")
  time TEXT, -- Performance time (e.g., "8:00 PM")
  duration TEXT, -- Duration (e.g., "2 hours", "45 minutes")
  
  -- Type and category
  type TEXT DEFAULT 'solo', -- solo, group, collaboration, online, hybrid
  category TEXT, -- dance, theatre, music, spoken word, multimedia, etc.
  
  -- Collaborators
  director TEXT,
  choreographer TEXT,
  composer TEXT,
  collaborators TEXT, -- Comma-separated list of other collaborators
  
  -- Media
  cover_image TEXT, -- Path to cover image in "performances" storage bucket
  media JSONB DEFAULT '[]'::jsonb, -- Array of media paths (images/videos) in "performances" bucket
  video_url TEXT, -- External video URL (YouTube, Vimeo, etc.)
  
  -- Content
  about TEXT, -- Detailed about the performance
  program_notes TEXT, -- Program or performance notes
  reviews TEXT, -- Reviews or press quotes
  
  -- Links
  tickets_url TEXT, -- Link to buy tickets
  website_url TEXT, -- Performance website
  
  -- SEO and URL
  slug TEXT UNIQUE, -- SEO-friendly URL slug
  
  -- Status and visibility
  status TEXT DEFAULT 'published', -- published, draft, archived
  featured BOOLEAN DEFAULT false,
  
  -- Organization
  tags TEXT[], -- Array of tags for searchability
  
  -- Additional metadata
  awards TEXT, -- Awards or recognition
  audience_size INTEGER, -- Estimated or actual audience size
  
  -- Display and ordering
  sort_order INTEGER DEFAULT 0,
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_performances_status ON performances(status);
CREATE INDEX IF NOT EXISTS idx_performances_featured ON performances(featured);
CREATE INDEX IF NOT EXISTS idx_performances_slug ON performances(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_performances_category ON performances(category);
CREATE INDEX IF NOT EXISTS idx_performances_type ON performances(type);
CREATE INDEX IF NOT EXISTS idx_performances_tags ON performances USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_performances_sort_order ON performances(sort_order);
CREATE INDEX IF NOT EXISTS idx_performances_date ON performances(date);

-- Enable Row Level Security (RLS)
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to published performances only
CREATE POLICY "Allow public read access" ON performances
  FOR SELECT
  USING (status = 'published');

-- Create a policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON performances
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON performances
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated delete" ON performances
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create a function to increment performance views
CREATE OR REPLACE FUNCTION increment_performance_views(performance_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE performances
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = performance_id AND status = 'published';
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_performance_views(UUID) TO anon, authenticated;

-- Add comment to document the media structure
COMMENT ON COLUMN performances.media IS 
'JSONB array storing media file paths. Each item is a path to a file in the "performances" storage bucket.
Example: ["image1.jpg", "image2.jpg", "video1.mp4"]
Access via: supabase.storage.from("performances").getPublicUrl(path)';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_performances_updated_at
  BEFORE UPDATE ON performances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

