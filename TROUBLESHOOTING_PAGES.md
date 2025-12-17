# 🔧 Troubleshooting Pages 404 Issue

## Issue: Getting 404 but files exist in Storage

If you see `.md` and `.json` files in Supabase Storage but get 404 when accessing `/pages/{slug}`, here's how to fix it:

---

## Step 1: Check What's in Your Database

Visit this debug endpoint in your browser:
```
http://localhost:3000/api/pages/debug
```

This will show you ALL pages in the database with their slugs and statuses.

---

## Step 2: Common Issues & Solutions

### ❌ Issue A: Page Status is "Draft"

**Problem:** Pages with status "draft" are NOT accessible on the frontend (by design for security)

**Solution:**
1. Go to: http://localhost:3000/protected/pages
2. Find your page
3. Click the menu (⋮) → Edit
4. Change **Status** from "Draft" to "Published"
5. Click "Update"
6. Try accessing the page again

---

### ❌ Issue B: Page Not in Database

**Problem:** Files exist in Storage but no database entry

**How this happens:**
- Database migration failed
- Page creation was interrupted
- Manual file upload without database entry

**Solution:**
1. Go to: http://localhost:3000/protected/pages
2. Recreate the page using the admin interface
3. Make sure Status is "Published"

---

### ❌ Issue C: Slug Mismatch

**Problem:** The slug in the database doesn't match the URL

**Check:**
- URL you're trying: `/pages/test-page`
- Slug in database: `test_page` or `testpage`

**Solution:**
1. Check the debug endpoint to see actual slugs
2. Use the exact slug shown in database
3. Or edit the page to fix the slug

---

### ❌ Issue D: RLS Policy Blocking Access

**Problem:** Row Level Security preventing public access

**Check in Supabase:**
```sql
-- Run this in Supabase SQL Editor
SELECT * FROM pages WHERE slug = 'your-slug-here';
```

If you see the page but it's not accessible publicly, check RLS:

```sql
-- Verify public read policy exists
SELECT * FROM pg_policies WHERE tablename = 'pages' AND policyname LIKE '%public%';
```

**Solution:**
If policy is missing, re-run:
```sql
-- From: database-schema-pages.sql
CREATE POLICY "Allow public read access to published pages" ON pages
  FOR SELECT
  TO public
  USING (status = 'published');
```

---

## Step 3: Verify Your Setup

Run these checks:

### ✅ Check 1: Database Table Exists
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'pages';
```
Should return: `pages`

### ✅ Check 2: Page Exists in Database
```sql
SELECT id, title, slug, status FROM pages;
```
Should show your pages

### ✅ Check 3: RLS is Enabled
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'pages';
```
Should show: `rowsecurity = true`

### ✅ Check 4: Public Policy Exists
```sql
SELECT * FROM pg_policies WHERE tablename = 'pages';
```
Should show multiple policies including public read

---

## Step 4: Quick Fix - Test Without Status Filter

**TEMPORARY ONLY - for debugging:**

Edit `app/pages/[slug]/page.tsx` line 38:

```typescript
// Remove the status filter temporarily
const { data, error } = await supabase
  .from("pages")
  .select("*")
  .eq("slug", slug)
  // .eq("status", "published")  // Comment this out
  .single()
```

**Important:** Remove this change after debugging! You don't want draft pages public.

---

## Step 5: Check Console Logs

With the updated code, check your terminal where `pnpm dev` is running.

You should see messages like:
- `Error fetching page: [error details]`
- `No published page found with slug: test-page`

---

## Step 6: Verify Files in Storage

In Supabase Dashboard → Storage → `pages` bucket:

**Check:**
- ✅ `{slug}.md` exists
- ✅ `{slug}.json` exists
- ✅ Bucket is PUBLIC (Settings → Public access enabled)
- ✅ Files are accessible (click and preview)

---

## Common Solutions Summary

| Problem | Solution |
|---------|----------|
| Status is "draft" | Change to "published" in admin |
| No database entry | Recreate page in admin |
| Slug mismatch | Check debug endpoint for actual slug |
| RLS blocking | Re-run database migration |
| Table doesn't exist | Run `database-schema-pages.sql` |
| Policy missing | Run RLS policies from migration |

---

## Still Having Issues?

### Debug Checklist:

- [ ] Ran `database-schema-pages.sql` successfully
- [ ] Ran `database-storage-pages-bucket.sql` successfully
- [ ] Page exists in database (check debug endpoint)
- [ ] Page status is "published"
- [ ] Slug matches exactly (case-sensitive)
- [ ] RLS policies are enabled
- [ ] Storage bucket is public
- [ ] Console shows no errors

### Get More Help:

1. **Check the debug endpoint:** http://localhost:3000/api/pages/debug
2. **Check terminal logs** where `pnpm dev` is running
3. **Check Supabase logs** in Dashboard → Logs
4. **Check browser console** (F12) for frontend errors

---

## Working Example

Here's what should work:

1. **Create page in admin:**
   - Title: "Test Page"
   - Content: "<h1>Hello</h1>"
   - Status: **Published** ← IMPORTANT!

2. **Check database:**
   - Visit: http://localhost:3000/api/pages/debug
   - Should show: `slug: "test-page", status: "published"`

3. **View on frontend:**
   - Visit: http://localhost:3000/pages/test-page
   - Should display your page!

4. **Check storage:**
   - Supabase → Storage → pages
   - Should see: `test-page.md` and `test-page.json`

---

## Need to Start Fresh?

If all else fails:

1. **Delete the page from admin**
2. **Delete files from storage** (optional)
3. **Create a new page with Status: Published**
4. **Test immediately**

---

**Most common fix:** Change status from "Draft" to "Published"! 🎉
