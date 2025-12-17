-- Create analytics table for tracking events
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Optional: for authenticated users
  event_type TEXT NOT NULL, -- 'pageview', 'artwork_view', 'artwork_click', 'artwork_share', 'custom'
  domain TEXT NOT NULL, -- Domain where the event occurred
  path TEXT NOT NULL, -- Path/URL where the event occurred
  artwork_id UUID REFERENCES artworks(id) ON DELETE SET NULL, -- Link to artwork if applicable
  referrer TEXT, -- HTTP referrer
  user_agent TEXT, -- User agent string
  ip_address TEXT, -- Hashed IP address for privacy
  country TEXT, -- Country code (e.g., 'US', 'GB')
  city TEXT, -- City name
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT, -- Browser name (Chrome, Firefox, Safari, etc.)
  os TEXT, -- Operating system (Windows, macOS, iOS, Android, etc.)
  screen_width INTEGER, -- Screen width in pixels
  screen_height INTEGER, -- Screen height in pixels
  session_id TEXT, -- Session identifier for grouping events
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional event metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_artwork_id ON analytics(artwork_id) WHERE artwork_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_domain ON analytics(domain);
CREATE INDEX IF NOT EXISTS idx_analytics_path ON analytics(path);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_device_type ON analytics(device_type) WHERE device_type IS NOT NULL;

-- Create index on created_at for time-based queries (for partitioning/archiving old data)
CREATE INDEX IF NOT EXISTS idx_analytics_created_at_date ON analytics(DATE(created_at));

-- Enable Row Level Security (RLS)
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public inserts (for tracking from external sites)
CREATE POLICY "Allow public insert" ON analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow authenticated users to view all analytics
CREATE POLICY "Allow authenticated read" ON analytics
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow service role to do everything (for admin operations)
CREATE POLICY "Allow service role full access" ON analytics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create a view for artwork analytics summary
CREATE OR REPLACE VIEW artwork_analytics_summary AS
SELECT 
  a.id AS artwork_id,
  a.title AS artwork_title,
  a.slug AS artwork_slug,
  COUNT(DISTINCT CASE WHEN an.event_type = 'artwork_view' THEN an.id END) AS total_views,
  COUNT(DISTINCT CASE WHEN an.event_type = 'artwork_click' THEN an.id END) AS total_clicks,
  COUNT(DISTINCT CASE WHEN an.event_type = 'artwork_share' THEN an.id END) AS total_shares,
  COUNT(DISTINCT an.session_id) AS unique_sessions,
  COUNT(DISTINCT an.ip_address) AS unique_visitors,
  MAX(an.created_at) AS last_viewed_at,
  MIN(an.created_at) AS first_viewed_at
FROM artworks a
LEFT JOIN analytics an ON a.id = an.artwork_id
GROUP BY a.id, a.title, a.slug;

-- Create a view for daily analytics
CREATE OR REPLACE VIEW daily_analytics AS
SELECT 
  DATE(created_at) AS date,
  event_type,
  COUNT(*) AS event_count,
  COUNT(DISTINCT session_id) AS unique_sessions,
  COUNT(DISTINCT ip_address) AS unique_visitors,
  COUNT(DISTINCT artwork_id) AS unique_artworks_viewed
FROM analytics
GROUP BY DATE(created_at), event_type
ORDER BY date DESC, event_type;

-- Create a view for device/browser breakdown
CREATE OR REPLACE VIEW device_analytics AS
SELECT 
  device_type,
  browser,
  os,
  COUNT(*) AS event_count,
  COUNT(DISTINCT session_id) AS unique_sessions
FROM analytics
WHERE device_type IS NOT NULL
GROUP BY device_type, browser, os
ORDER BY event_count DESC;

-- Create a view for geographic analytics
CREATE OR REPLACE VIEW geographic_analytics AS
SELECT 
  country,
  city,
  COUNT(*) AS event_count,
  COUNT(DISTINCT session_id) AS unique_sessions,
  COUNT(DISTINCT ip_address) AS unique_visitors
FROM analytics
WHERE country IS NOT NULL
GROUP BY country, city
ORDER BY event_count DESC;

-- Function to get artwork analytics
CREATE OR REPLACE FUNCTION get_artwork_analytics(
  p_artwork_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  total_views BIGINT,
  total_clicks BIGINT,
  total_shares BIGINT,
  unique_visitors BIGINT,
  unique_sessions BIGINT,
  views_by_device JSONB,
  views_by_country JSONB,
  daily_views JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT CASE WHEN an.event_type = 'artwork_view' THEN an.id END)::BIGINT AS total_views,
    COUNT(DISTINCT CASE WHEN an.event_type = 'artwork_click' THEN an.id END)::BIGINT AS total_clicks,
    COUNT(DISTINCT CASE WHEN an.event_type = 'artwork_share' THEN an.id END)::BIGINT AS total_shares,
    COUNT(DISTINCT an.ip_address)::BIGINT AS unique_visitors,
    COUNT(DISTINCT an.session_id)::BIGINT AS unique_sessions,
    (
      SELECT jsonb_object_agg(device_type, device_count)
      FROM (
        SELECT device_type, COUNT(*) as device_count
        FROM analytics
        WHERE artwork_id = p_artwork_id
          AND event_type = 'artwork_view'
          AND (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
          AND device_type IS NOT NULL
        GROUP BY device_type
      ) device_stats
    ) AS views_by_device,
    (
      SELECT jsonb_object_agg(country, country_count)
      FROM (
        SELECT country, COUNT(*) as country_count
        FROM analytics
        WHERE artwork_id = p_artwork_id
          AND event_type = 'artwork_view'
          AND (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
          AND country IS NOT NULL
        GROUP BY country
      ) country_stats
    ) AS views_by_country,
    (
      SELECT jsonb_object_agg(date::text, daily_count)
      FROM (
        SELECT DATE(created_at) as date, COUNT(*) as daily_count
        FROM analytics
        WHERE artwork_id = p_artwork_id
          AND event_type = 'artwork_view'
          AND (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY DATE(created_at)
        ORDER BY date
      ) daily_stats
    ) AS daily_views
  FROM analytics an
  WHERE an.artwork_id = p_artwork_id
    AND (p_start_date IS NULL OR an.created_at >= p_start_date)
    AND (p_end_date IS NULL OR an.created_at <= p_end_date);
END;
$$ LANGUAGE plpgsql;

-- Function to get overall analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  total_pageviews BIGINT,
  total_artwork_views BIGINT,
  unique_visitors BIGINT,
  unique_sessions BIGINT,
  top_artworks JSONB,
  top_pages JSONB,
  device_breakdown JSONB,
  daily_views JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT CASE WHEN an.event_type = 'pageview' THEN an.id END)::BIGINT AS total_pageviews,
    COUNT(DISTINCT CASE WHEN an.event_type = 'artwork_view' THEN an.id END)::BIGINT AS total_artwork_views,
    COUNT(DISTINCT an.ip_address)::BIGINT AS unique_visitors,
    COUNT(DISTINCT an.session_id)::BIGINT AS unique_sessions,
    (
      SELECT jsonb_agg(jsonb_build_object('artwork_id', artwork_id, 'title', a.title, 'views', views))
      FROM (
        SELECT artwork_id, COUNT(*) as views
        FROM analytics
        WHERE event_type = 'artwork_view'
          AND artwork_id IS NOT NULL
          AND (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY artwork_id
        ORDER BY views DESC
        LIMIT 10
      ) top_art
      LEFT JOIN artworks a ON top_art.artwork_id = a.id
    ) AS top_artworks,
    (
      SELECT jsonb_agg(jsonb_build_object('path', path, 'views', views))
      FROM (
        SELECT path, COUNT(*) as views
        FROM analytics
        WHERE event_type = 'pageview'
          AND (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY path
        ORDER BY views DESC
        LIMIT 10
      ) top_paths
    ) AS top_pages,
    (
      SELECT jsonb_object_agg(device_type, device_count)
      FROM (
        SELECT device_type, COUNT(*) as device_count
        FROM analytics
        WHERE (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
          AND device_type IS NOT NULL
        GROUP BY device_type
      ) device_stats
    ) AS device_breakdown,
    (
      SELECT jsonb_object_agg(date::text, daily_count)
      FROM (
        SELECT DATE(created_at) as date, COUNT(*) as daily_count
        FROM analytics
        WHERE (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY DATE(created_at)
        ORDER BY date
      ) daily_stats
    ) AS daily_views
  FROM analytics an
  WHERE (p_start_date IS NULL OR an.created_at >= p_start_date)
    AND (p_end_date IS NULL OR an.created_at <= p_end_date);
END;
$$ LANGUAGE plpgsql;


