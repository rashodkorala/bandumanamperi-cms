# Analytics Quick Fix

## Problem
Getting error: `Analytics summary error: {}` 

This means the analytics database schema hasn't been created yet.

## Solution (2 minutes)

### Step 1: Go to Supabase Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Analytics Schema

1. Click **+ New Query**
2. Copy and paste the contents of `database-schema-analytics.sql`
3. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify

Run this query to verify it worked:

```sql
SELECT * FROM get_analytics_summary(NOW() - INTERVAL '30 days', NOW());
```

You should see a result with columns like `total_pageviews`, `unique_visitors`, etc.

### Step 4: Refresh Your CMS

Go back to your CMS and refresh the analytics page. The error should be gone!

## What This Creates

The migration creates:
- ✅ `analytics` table for storing events
- ✅ `get_analytics_summary()` function
- ✅ `get_artwork_analytics()` function
- ✅ Views for daily analytics, device breakdown, etc.
- ✅ RLS policies for security
- ✅ Indexes for performance

## After Setup

You'll see the analytics page showing:
- Total Pageviews: 0 (no data yet)
- Unique Visitors: 0
- Device Breakdown: empty
- Top Pages: empty

This is normal! You need to start tracking events to see data.

## Start Tracking Events

See `ANALYTICS_SETUP.md` for how to add tracking to your frontend websites.

