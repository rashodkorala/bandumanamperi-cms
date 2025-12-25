-- Exhibition History Schema for Artworks Table
-- This migration adds exhibition tracking functionality to artworks

-- Ensure the artworks table has the exhibition_history column
-- This column stores an array of exhibition objects as JSONB
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS exhibition_history JSONB;

-- Create an index on exhibition_history for better query performance
CREATE INDEX IF NOT EXISTS idx_artworks_exhibition_history 
ON artworks USING GIN (exhibition_history);

-- Function to get all unique exhibitions across artworks
CREATE OR REPLACE FUNCTION get_all_exhibitions()
RETURNS TABLE (
  name TEXT,
  venue TEXT,
  about TEXT,
  curator TEXT,
  dates TEXT,
  cover_image TEXT,
  exhibition_images JSONB,
  type TEXT,
  other_artists TEXT,
  artwork_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (exhibition->>'name')::TEXT as name,
    (exhibition->>'venue')::TEXT as venue,
    (exhibition->>'about')::TEXT as about,
    (exhibition->>'curator')::TEXT as curator,
    (exhibition->>'dates')::TEXT as dates,
    (exhibition->>'coverImage')::TEXT as cover_image,
    (exhibition->'exhibitionImages')::JSONB as exhibition_images,
    (exhibition->>'type')::TEXT as type,
    (exhibition->>'otherArtists')::TEXT as other_artists,
    COUNT(DISTINCT artworks.id) as artwork_count
  FROM 
    artworks,
    jsonb_array_elements(exhibition_history) as exhibition
  WHERE 
    exhibition_history IS NOT NULL
  GROUP BY 
    exhibition->>'name',
    exhibition->>'venue',
    exhibition->>'about',
    exhibition->>'curator',
    exhibition->>'dates',
    exhibition->>'coverImage',
    exhibition->'exhibitionImages',
    exhibition->>'type',
    exhibition->>'otherArtists'
  ORDER BY 
    (exhibition->>'dates')::TEXT DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get artworks for a specific exhibition
CREATE OR REPLACE FUNCTION get_artworks_by_exhibition(
  p_name TEXT,
  p_venue TEXT,
  p_dates TEXT
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  year TEXT,
  category TEXT,
  status TEXT,
  thumbnail_path TEXT,
  media JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    artworks.id,
    artworks.title,
    artworks.year,
    artworks.category,
    artworks.status,
    artworks.thumbnail_path,
    artworks.media
  FROM 
    artworks,
    jsonb_array_elements(exhibition_history) as exhibition
  WHERE 
    exhibition_history IS NOT NULL
    AND exhibition->>'name' = p_name
    AND exhibition->>'venue' = p_venue
    AND exhibition->>'dates' = p_dates
  ORDER BY 
    artworks.sort_order ASC,
    artworks.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION get_all_exhibitions() TO authenticated;
GRANT EXECUTE ON FUNCTION get_artworks_by_exhibition(TEXT, TEXT, TEXT) TO authenticated;

-- Add comment to document the exhibition_history structure
COMMENT ON COLUMN artworks.exhibition_history IS 
'JSONB array storing exhibition history. Each exhibition object contains:
- name: Exhibition name (required)
- venue: Exhibition venue/location (required)
- about: Exhibition description (required)
- curator: Curator name (required)
- dates: Exhibition dates as text (required)
- coverImage: Path to cover image in "exhibitions" storage bucket (nullable)
- exhibitionImages: Array of image paths in "exhibitions" storage bucket (array, can be empty)
- type: Exhibition type - "solo", "group", or "online" (required)
- otherArtists: Comma-separated list of other artists (nullable, required for group exhibitions)

Note: All exhibition images are stored in the "exhibitions" storage bucket, not the "artworks" bucket.';

-- Example of exhibition_history structure (for reference):
/*
[
  {
    "name": "Solo Show 2024",
    "venue": "Gallery XYZ, New York",
    "about": "A retrospective of recent works",
    "curator": "Jane Doe",
    "dates": "Jan 15 - Feb 28, 2024",
    "coverImage": "cover-1234567890.jpg",
    "exhibitionImages": [
      "img-1234567890-0.jpg",
      "img-1234567890-1.jpg"
    ],
    "type": "solo",
    "otherArtists": null
  },
  {
    "name": "Group Exhibition",
    "venue": "Art Space",
    "about": "Contemporary art showcase",
    "curator": "John Smith",
    "dates": "March 1-31, 2024",
    "coverImage": "cover-1234567891.jpg",
    "exhibitionImages": [
      "img-1234567891-0.jpg"
    ],
    "type": "group",
    "otherArtists": "Artist A, Artist B, Artist C"
  }
]

Note: All paths reference files in the "exhibitions" storage bucket.
Access via: supabase.storage.from("exhibitions").getPublicUrl(path)
*/

