-- Create artworks table
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  year TEXT,
  description TEXT,
  link TEXT,
  featured BOOLEAN DEFAULT false,
  category TEXT,
  medium TEXT,
  -- Dimensions
  width NUMERIC,
  height NUMERIC,
  depth NUMERIC,
  unit TEXT DEFAULT 'cm', -- Unit of measurement (cm, m, in, ft, etc.)
  -- SEO and URL
  slug TEXT UNIQUE, -- SEO-friendly URL slug (e.g., "bandaged-body")
  -- Status and visibility
  status TEXT DEFAULT 'published', -- published, draft, archived
  -- Organization and categorization
  tags TEXT[], -- Array of tags for searchability and filtering
  series TEXT, -- Series or collection name (e.g., "Body Works", "Urban Reflections")
  -- Additional details
  materials TEXT, -- Detailed list of materials used
  technique TEXT, -- Artistic technique or method
  -- Location and availability
  location TEXT, -- Current location of the artwork
  availability TEXT DEFAULT 'available', -- available, sold, on_loan, private_collection, nfs (not for sale)
  -- Pricing (optional)
  price NUMERIC, -- Price in base currency
  currency TEXT DEFAULT 'USD', -- Currency code (USD, EUR, LKR, etc.)
  price_upon_request BOOLEAN DEFAULT false, -- When true, price is not displayed and users should inquire
  collector_name TEXT, -- Name of the collector who owns this artwork
  -- Display and ordering
  sort_order INTEGER DEFAULT 0, -- Custom sort order for display
  thumbnail_path TEXT, -- Path to thumbnail image (if different from main media)
  -- Additional information
  artist_notes TEXT, -- Additional notes from the artist
  date_created DATE, -- Date when the artwork was actually created (separate from DB timestamp)
  -- Exhibition history (stored as JSONB array)
  -- Example: [{"name": "Gallery Show 2023", "location": "New York", "date": "2023-06-01"}]
  exhibition_history JSONB DEFAULT '[]'::jsonb,
  -- Analytics
  views_count INTEGER DEFAULT 0, -- Number of times the artwork has been viewed
  -- media stores an array of file paths (strings) to images in Supabase Storage
  -- Example: ["media/artworks/image1.jpg", "media/artworks/image2.jpg"]
  media JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on featured for faster queries
CREATE INDEX IF NOT EXISTS idx_artworks_featured ON artworks(featured);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_artworks_slug ON artworks(slug) WHERE slug IS NOT NULL;

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);

-- Create index on tags using GIN for array searches
CREATE INDEX IF NOT EXISTS idx_artworks_tags ON artworks USING GIN(tags);

-- Create index on series for grouping
CREATE INDEX IF NOT EXISTS idx_artworks_series ON artworks(series) WHERE series IS NOT NULL;

-- Create index on availability for filtering
CREATE INDEX IF NOT EXISTS idx_artworks_availability ON artworks(availability);

-- Create index on sort_order for ordering
CREATE INDEX IF NOT EXISTS idx_artworks_sort_order ON artworks(sort_order);

-- Enable Row Level Security (RLS)
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to published artworks only
CREATE POLICY "Allow public read access" ON artworks
  FOR SELECT
  USING (status = 'published');

-- Create a policy to allow authenticated users to insert (adjust based on your needs)
CREATE POLICY "Allow authenticated insert" ON artworks
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to update (adjust based on your needs)
CREATE POLICY "Allow authenticated update" ON artworks
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to delete (adjust based on your needs)
CREATE POLICY "Allow authenticated delete" ON artworks
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create a function to increment artwork views (works for public access)
CREATE OR REPLACE FUNCTION increment_artwork_views(artwork_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE artworks
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = artwork_id AND status = 'published';
END;
$$;

