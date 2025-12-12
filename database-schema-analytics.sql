-- Create analytics table for tracking page views and events from multiple frontends
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('pageview', 'click', 'custom')),
  domain TEXT NOT NULL, -- e.g., 'www.rashodkorala.com' or 'photos.rashodkorala.com'
  path TEXT NOT NULL, -- e.g., '/projects' or '/photo/sunset'
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT, -- Store hashed IP for privacy
  country TEXT,
  city TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  session_id TEXT, -- To track user sessions
  metadata JSONB, -- For custom event data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only see their own analytics
CREATE POLICY "Users can view their own analytics"
  ON analytics FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own analytics
CREATE POLICY "Users can insert their own analytics"
  ON analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS analytics_user_id_idx ON analytics(user_id);
CREATE INDEX IF NOT EXISTS analytics_domain_idx ON analytics(domain);
CREATE INDEX IF NOT EXISTS analytics_event_type_idx ON analytics(event_type);
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics(created_at);
CREATE INDEX IF NOT EXISTS analytics_path_idx ON analytics(path);
CREATE INDEX IF NOT EXISTS analytics_session_id_idx ON analytics(session_id);

-- Create function to get analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary(
  p_user_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_pageviews BIGINT,
  unique_visitors BIGINT,
  unique_sessions BIGINT,
  top_pages JSONB,
  top_domains JSONB,
  device_breakdown JSONB,
  daily_views JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_pageviews,
    COUNT(DISTINCT session_id)::BIGINT as unique_visitors,
    COUNT(DISTINCT session_id)::BIGINT as unique_sessions,
    (
      SELECT jsonb_agg(jsonb_build_object('path', path, 'views', views))
      FROM (
        SELECT path, COUNT(*) as views
        FROM analytics
        WHERE user_id = p_user_id
          AND event_type = 'pageview'
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY path
        ORDER BY views DESC
        LIMIT 10
      ) top_pages
    ) as top_pages,
    (
      SELECT jsonb_agg(jsonb_build_object('domain', domain, 'views', views))
      FROM (
        SELECT domain, COUNT(*) as views
        FROM analytics
        WHERE user_id = p_user_id
          AND event_type = 'pageview'
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY domain
        ORDER BY views DESC
      ) top_domains
    ) as top_domains,
    (
      SELECT jsonb_agg(jsonb_build_object('device', device_type, 'count', count))
      FROM (
        SELECT device_type, COUNT(*) as count
        FROM analytics
        WHERE user_id = p_user_id
          AND event_type = 'pageview'
          AND created_at BETWEEN p_start_date AND p_end_date
          AND device_type IS NOT NULL
        GROUP BY device_type
      ) device_stats
    ) as device_breakdown,
    (
      SELECT jsonb_agg(jsonb_build_object('date', date, 'views', views))
      FROM (
        SELECT DATE(created_at) as date, COUNT(*) as views
        FROM analytics
        WHERE user_id = p_user_id
          AND event_type = 'pageview'
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      ) daily_stats
    ) as daily_views
  FROM analytics
  WHERE user_id = p_user_id
    AND event_type = 'pageview'
    AND created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

