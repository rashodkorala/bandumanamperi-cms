# Fix: Performance Upload RLS Error

## The Error You're Getting

```
Error [AppError]: new row violates row-level security policy for table "performances"
You don't have permission to create this performance.
```

## What's Wrong

Your `performances` table has **Row Level Security (RLS)** enabled, but it's missing the policies that allow authenticated users to insert new performances.

## ✅ Quick Fix

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Fix Row Level Security for Performances Table
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all performances" ON performances;
DROP POLICY IF EXISTS "Users can insert performances" ON performances;
DROP POLICY IF EXISTS "Users can update performances" ON performances;
DROP POLICY IF EXISTS "Users can delete performances" ON performances;

-- Allow everyone to view performances (for public website)
CREATE POLICY "Users can view all performances"
ON performances FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert performances
CREATE POLICY "Users can insert performances"
ON performances FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update performances
CREATE POLICY "Users can update performances"
ON performances FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete performances
CREATE POLICY "Users can delete performances"
ON performances FOR DELETE
TO authenticated
USING (auth.role() = 'authenticated');
```

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### 2. Run the Fix
1. Copy the SQL code above
2. Paste it into the SQL Editor
3. Click **Run** (or press Ctrl/Cmd + Enter)
4. You should see: "Success. No rows returned"

### 3. Verify It Worked
1. Go back to your CMS
2. Try creating a performance again
3. It should work now! 🎉

## What These Policies Do

| Policy | What It Does |
|--------|-------------|
| **View all** | Anyone can see performances (for your public website) |
| **Insert** | Only logged-in users can create performances |
| **Update** | Only logged-in users can edit performances |
| **Delete** | Only logged-in users can delete performances |

## Alternative: Disable RLS (Not Recommended)

If you want to disable RLS entirely (less secure but simpler):

```sql
ALTER TABLE performances DISABLE ROW LEVEL SECURITY;
```

⚠️ **Warning**: This allows anyone to create/edit/delete performances. Only use this for development/testing.

## Why This Happened

When you created the `performances` table, RLS was likely enabled by default but no policies were created. This is actually good security practice - it forces you to explicitly define who can do what.

## Testing

After running the SQL:

1. **Test Creating**: Try creating a new performance ✅
2. **Test Updating**: Edit an existing performance ✅
3. **Test Deleting**: Delete a performance ✅
4. **Test Viewing**: Visit your public website (should show performances) ✅

## Other Tables to Check

You might have the same issue with other tables. Check these:

### Artworks
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'artworks';
```

If RLS is enabled, run similar policies for artworks, pages, blogs, etc.

## Prevention

When creating new tables in the future:

1. Either **disable RLS** for simple cases:
   ```sql
   ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
   ```

2. Or **create policies** immediately after creating the table:
   ```sql
   CREATE TABLE your_table (...);
   
   ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Public read" ON your_table FOR SELECT TO public USING (true);
   CREATE POLICY "Auth insert" ON your_table FOR INSERT TO authenticated WITH CHECK (true);
   -- etc.
   ```

## Summary

✅ **Run the SQL above** in Supabase SQL Editor  
✅ **Try creating a performance again**  
✅ **Should work now!**

The error message is now much clearer thanks to the error handling we added, so you knew exactly what was wrong! 🎉

