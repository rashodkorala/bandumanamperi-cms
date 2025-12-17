-- Migration to add file storage URLs to existing pages table
-- Run this if you already have a pages table

-- Add new columns for file URLs
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS markdown_file_url TEXT,
ADD COLUMN IF NOT EXISTS json_file_url TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN pages.markdown_file_url IS 'URL to the markdown (.md) file in Supabase storage';
COMMENT ON COLUMN pages.json_file_url IS 'URL to the JSON (.json) file in Supabase storage';

-- Create indexes for the new columns (optional, for better query performance)
CREATE INDEX IF NOT EXISTS idx_pages_markdown_file_url ON pages(markdown_file_url) WHERE markdown_file_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pages_json_file_url ON pages(json_file_url) WHERE json_file_url IS NOT NULL;

-- No need to modify existing data - the uploadPageFiles function will generate files on next update
