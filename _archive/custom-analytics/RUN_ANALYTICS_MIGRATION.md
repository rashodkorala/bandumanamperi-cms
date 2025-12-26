# Fix Analytics Error - Run Migration

## The Problem

You're seeing this error:
```
Analytics summary error: {}
```

**Why:** The `analytics` table and `get_analytics_summary()` function don't exist in your database yet.

**Fix:** Run the analytics migration (takes 2 minutes)

---

## Quick Fix Steps

### 1. Open Supabase Dashboard

Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)

### 2. Open SQL Editor

- Click **SQL Editor** in the left sidebar
- Click **+ New Query**

### 3. Copy the Migration SQL

Open the file: `database-schema-analytics.sql` in your project

Copy **ALL** the contents (lines 1-265)

### 4. Paste and Run

- Paste into the SQL Editor
- Click **Run** (or press Cmd/Ctrl + Enter)

### 5. Verify It Worked

Run this test query:

```sql
SELECT 
  COUNT(*) as function_exists 
FROM pg_proc 
WHERE proname = 'get_analytics_summary';
```

Should return: `function_exists: 1`

### 6. Refresh Your CMS

Go back to your CMS at `http://localhost:3000/protected/analytics`

✅ The error should be gone!
✅ You'll see the analytics dashboard (showing 0 since no data yet)

---

## What This Migration Creates

```sql
✅ analytics table             -- Stores all tracking events
✅ get_analytics_summary()     -- Function to fetch dashboard data
✅ get_artwork_analytics()     -- Function for artwork-specific stats
✅ artwork_analytics_summary   -- View for artwork stats
✅ daily_analytics             -- View for daily stats
✅ device_analytics            -- View for device breakdown
✅ geographic_analytics        -- View for geo stats
✅ RLS policies                -- Security policies
✅ Indexes                     -- For performance
```

---

## After Migration: Next Steps

### 1. Analytics Dashboard Will Show

- Total Pageviews: 0
- Unique Visitors: 0  
- Device Breakdown: (empty)
- Top Pages: (empty)

**This is normal!** You don't have any tracking data yet.

### 2. Start Tracking Events

To get data in your analytics, you need to send events to your CMS.

See: `ANALYTICS_SETUP.md` for how to add tracking scripts to your frontend.

### 3. Test with Sample Data (Optional)

Want to see how it looks with data? Insert some test data:

```sql
-- Insert test pageviews
INSERT INTO analytics (event_type, domain, path, device_type, session_id, ip_address)
VALUES 
  ('pageview', 'www.example.com', '/', 'desktop', 'session1', 'hash1'),
  ('pageview', 'www.example.com', '/about', 'mobile', 'session2', 'hash2'),
  ('pageview', 'www.example.com', '/contact', 'desktop', 'session3', 'hash3');

-- Verify it worked
SELECT * FROM get_analytics_summary(NOW() - INTERVAL '30 days', NOW());
```

Then refresh your analytics page to see the test data!

---

## Troubleshooting

### Migration Fails with "Table already exists"

**Solution:** The table might already exist from a previous attempt.

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'analytics'
);
```

If true, drop it and re-run:

```sql
DROP TABLE IF EXISTS analytics CASCADE;
-- Then run the full migration again
```

### "Permission denied" Error

**Solution:** You might need elevated permissions.

1. In SQL Editor, look for a toggle "Run as postgres" or "Use service role"
2. Enable it
3. Run the migration again

### Function Still Not Found

**Solution:** Check which schema it's in:

```sql
SELECT proname, pronamespace::regnamespace 
FROM pg_proc 
WHERE proname = 'get_analytics_summary';
```

Should be in `public` schema.

### Still Getting Errors After Migration

**Solution:** Clear your Next.js cache:

```bash
# Stop dev server (Ctrl+C)
rm -rf .next
pnpm dev
```

---

## Alternative: Use Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're linked to your project
supabase link

# Apply the migration
supabase db push --file database-schema-analytics.sql
```

---

## Manual Verification Checklist

After running the migration, verify:

- [ ] Analytics table exists
- [ ] get_analytics_summary function exists  
- [ ] get_artwork_analytics function exists
- [ ] RLS policies are enabled
- [ ] Indexes are created
- [ ] No errors in SQL Editor
- [ ] Analytics page loads without errors

---

## Need Help?

### Check Migration Succeeded

```sql
-- 1. Check table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'analytics';

-- 2. Check functions exist
SELECT proname FROM pg_proc 
WHERE proname LIKE '%analytics%';

-- 3. Check policies exist
SELECT policyname FROM pg_policies 
WHERE tablename = 'analytics';

-- 4. Test the function
SELECT * FROM get_analytics_summary(
  (NOW() - INTERVAL '30 days')::timestamptz, 
  NOW()::timestamptz
);
```

All should return results!

---

## Summary

1. ✅ Open Supabase Dashboard
2. ✅ Go to SQL Editor
3. ✅ Copy contents of `database-schema-analytics.sql`
4. ✅ Paste and Run
5. ✅ Refresh your CMS analytics page
6. ✅ Error gone!

**Time:** ~2 minutes
**Difficulty:** Easy
**Risk:** Low (can easily drop and re-create if needed)

