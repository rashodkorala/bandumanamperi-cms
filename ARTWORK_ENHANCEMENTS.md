# Artwork Enhancements Summary

## Changes Made

This document summarizes the enhancements made to the artwork system to support:
1. LKR (Sri Lankan Rupee) as a currency option
2. Collector Name field
3. "Price Upon Request" option

## Database Changes

### Migration Required

**File:** `supabase/schema/add-collector-and-price-upon-request.sql`

Run this SQL script in your Supabase SQL Editor to add the new fields:

```sql
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
```

### Schema Updates

The main schema file `supabase/schema/database-schema-artworks.sql` has been updated to include:
- `collector_name TEXT` - Name of the collector who owns the artwork
- `price_upon_request BOOLEAN DEFAULT false` - Flag to indicate price should be requested
- Updated currency comment to include LKR

## TypeScript Type Changes

### `lib/types/artwork.ts`

Added new fields to all relevant interfaces:

**ArtworkDB** (database schema):
- `price_upon_request: boolean`
- `collector_name: string | null`

**Artwork** (application type):
- `priceUponRequest: boolean`
- `collectorName: string | null`

**ArtworkInsert** (insert operations):
- `priceUponRequest?: boolean`
- `collectorName?: string | null`

## Backend Changes

### `lib/actions/artworks.ts`

Updated the following functions:

1. **`transformArtwork`** - Added transformation for new fields from snake_case to camelCase
2. **`createArtwork`** - Added new fields to insert statement with defaults
3. **`updateArtwork`** - Added new fields to update logic

## Frontend Changes

### 1. Artwork Form (`components/artworks/artwork-form.tsx`)

**Currency Dropdown:**
- Added LKR (Sri Lankan Rupee) to the currency options

**New Fields:**
- Added "Collector Name" text input field
- Added "Price Upon Request" checkbox
- Price and Currency fields are disabled when "Price Upon Request" is checked

**Form Layout:**
The pricing section now includes:
- Price input (disabled when price upon request is checked)
- Currency dropdown (disabled when price upon request is checked)
- Date Created field
- Collector Name input field (new)
- Price Upon Request checkbox (new)

### 2. Artwork Preview (`components/artworks/artwork-preview.tsx`)

**Display Updates:**
- `formatPrice()` function now returns "Price upon request" when the flag is set
- Added Collector card to display collector name when available

### 3. Artwork Detail (`components/artworks/artwork-detail.tsx`)

**Display Updates:**
- `formatPrice()` function now returns "Price upon request" when the flag is set
- Added Collector card to display collector name when available

### 4. Artwork Bulk Upload (`components/artworks/artwork-bulk-upload.tsx`)

**Currency Dropdown:**
- Added LKR (Sri Lankan Rupee) to the currency options

## Documentation Updates

### `app/docs/database/artworks/page.mdx`

Updated documentation to reflect:
- New fields in the schema code block
- New fields in the "Availability & Pricing" section
- LKR added to Currency Codes section

## How to Apply These Changes

1. **Run the Database Migration:**
   - Open your Supabase SQL Editor
   - Execute the SQL script from `supabase/schema/add-collector-and-price-upon-request.sql`

2. **Deploy the Code:**
   - All TypeScript and React component changes are already in place
   - No additional configuration needed

3. **Test the Changes:**
   - Create/edit an artwork and verify:
     - LKR appears in the currency dropdown
     - Collector Name field is available
     - "Price Upon Request" checkbox works and disables price/currency fields
   - View an artwork and verify:
     - "Price upon request" displays when checkbox is selected
     - Collector name displays when provided

## Usage Examples

### Creating an Artwork with Price Upon Request

1. Open the artwork form
2. Fill in the artwork details
3. Check the "Price Upon Request" checkbox
4. The price and currency fields will be disabled
5. Optionally add a collector name
6. Save the artwork

### Creating an Artwork with LKR Currency

1. Open the artwork form
2. Fill in the artwork details
3. Enter a price
4. Select "LKR" from the currency dropdown
5. Save the artwork

### Adding a Collector Name

1. Open the artwork form (new or edit)
2. Scroll to the pricing section
3. Enter the collector's name in the "Collector Name" field
4. Save the artwork

## Notes

- When "Price Upon Request" is checked, the price and currency fields are disabled in the form
- The collector name is optional and can be left empty
- LKR formatting follows the standard Intl.NumberFormat conventions
- All existing artworks will have `price_upon_request = false` and `collector_name = null` by default

