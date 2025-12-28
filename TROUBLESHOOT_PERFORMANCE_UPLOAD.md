# Troubleshooting Performance Upload 500 Error

## The Error You Got
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

This is a server error when uploading a performance. Let's diagnose and fix it.

## Most Likely Causes

### 1. **Storage Bucket Not Created** (MOST LIKELY)
The `performances` storage bucket might not exist in your Supabase project.

#### ✅ Fix: Create the Bucket

**Option A: Via Supabase Dashboard (Easiest)**
1. Go to your Supabase Dashboard
2. Click **Storage** in the left sidebar
3. Click **New bucket** button
4. Enter:
   - **Name**: `performances`
   - **Public bucket**: ✅ Checked (Yes)
   - **File size limit**: `52428800` (50MB)
   - **Allowed MIME types**: Leave empty or add: `image/jpeg, image/png, image/webp, image/gif, video/mp4, video/webm, audio/mpeg, audio/wav`
5. Click **Create bucket**

**Option B: Via SQL**
Run this in Supabase SQL Editor:

```sql
-- Create performances bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'performances',
    'performances',
    true,  -- Public bucket
    52428800,  -- 50MB file size limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'];
```

### 2. **Storage Policies Not Set**
The bucket exists but doesn't have the correct permissions.

#### ✅ Fix: Add Storage Policies

Run this in Supabase SQL Editor:

```sql
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Policy 1: Public Read Access
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'performances');

-- Policy 2: Authenticated Users Can Upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'performances' AND auth.role() = 'authenticated');

-- Policy 3: Authenticated Users Can Update
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'performances' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'performances' AND auth.role() = 'authenticated');

-- Policy 4: Authenticated Users Can Delete
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'performances' AND auth.role() = 'authenticated');
```

### 3. **File Too Large**
Your file might exceed the size limit.

#### ✅ Check File Size
The error message should now tell you if the file is too large (updated in the form).

**Default Limits:**
- Individual file: 50MB
- Total storage: Depends on your Supabase plan

### 4. **Invalid File Type**
The file type might not be allowed.

#### ✅ Fix: Update Allowed Types
If you need to upload different file types (videos, etc.), update the bucket:

```sql
-- Update allowed MIME types for performances bucket
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',  -- .mov files
    'audio/mpeg',       -- .mp3 files
    'audio/wav',
    'audio/mp4'         -- .m4a files
]
WHERE id = 'performances';
```

### 5. **Authentication Issue**
Your session might have expired.

#### ✅ Fix: Refresh Auth
1. Log out of your CMS
2. Log back in
3. Try uploading again

## How to Diagnose

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try uploading again
4. Look for detailed error messages

### Step 2: Check Network Tab
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try uploading again
4. Click on the failed request (red text)
5. Check **Response** tab for error details

### Step 3: Check Supabase Logs
1. Go to Supabase Dashboard
2. Click **Logs** in left sidebar
3. Select **API** logs
4. Look for error messages around the time you tried uploading

## Quick Test

Try this small test file to see if storage works:

1. Create a small text file (< 1KB)
2. Try uploading it as a performance cover image
3. If it works: Your issue is file size/type
4. If it fails: Your issue is bucket/permissions

## After Fixing

Once you fix the issue, try uploading again. The updated form will now:
- ✅ Show detailed error messages
- ✅ Validate file sizes before upload
- ✅ Tell you exactly what went wrong
- ✅ Allow you to report the error to me

## Still Not Working?

If none of the above fixes work:

1. **Click "Report Error"** button in the error toast
2. Add details about:
   - What file you're trying to upload
   - File size
   - File type
   - Any steps you've already tried
3. Send the report - I'll receive all the technical details!

## Common Error Messages (Now Improved)

### Before:
```
❌ Failed to save performance
```

### After:
```
❌ Cover image is too large. Maximum size is 50MB. Your file is 75.32MB.
                                                        [Report Error]
```

or

```
❌ Failed to upload file to storage. Storage bucket 'performances' not found.
                                                        [Report Error]
```

or

```
❌ Some files failed to upload: video.mp4: File type not supported (52.3MB)
```

## Prevention

To prevent future errors:

1. **Check file sizes** before uploading (should be < 50MB)
2. **Use supported formats**: JPEG, PNG, WebP, GIF for images
3. **Keep session active** - refresh page if it's been idle
4. **One file at a time** for large uploads

## Summary

Most likely, you need to:
1. ✅ Create the `performances` storage bucket in Supabase
2. ✅ Set up storage policies (copy-paste SQL above)
3. ✅ Try uploading again with the improved error handling

The form now gives you much better error messages and lets you report issues to me with full details! 🎉

