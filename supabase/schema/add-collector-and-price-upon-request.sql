-- Add collector_name and price_upon_request fields to artworks table

-- Add collector_name field to track who owns/collected the artwork
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS collector_name TEXT;

-- Add price_upon_request field to indicate when pricing should be requested
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS price_upon_request BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN artworks.collector_name IS 'Name of the collector who owns this artwork';
COMMENT ON COLUMN artworks.price_upon_request IS 'When true, price is not displayed and users should inquire for pricing';

