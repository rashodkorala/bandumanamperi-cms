# Setting Up Exhibition Storage Bucket

## Step 1: Run the SQL Migration

Execute the SQL file in Supabase SQL Editor:
```bash
supabase/migrations/exhibitions_storage_bucket.sql
```

This creates the `exhibitions` bucket with:
- Public read access
- 50MB file size limit
- Allowed image types: JPEG, PNG, WebP, GIF

## Step 2: Configure Storage Policies (Via Dashboard)

Storage policies must be set up via the **Supabase Dashboard** due to permission requirements.

### Go to Storage Settings
1. Open your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click on the **exhibitions** bucket
4. Click on **Policies** tab
5. Click **New Policy**

### Policy 1: Public Read Access
```sql
Policy Name: Public read access
Allowed operation: SELECT
Policy definition: (bucket_id = 'exhibitions'::text)
Target roles: public
```

Or use the visual editor:
- **Policy name:** `Public read access`
- **Allowed operation:** `SELECT`
- **Target roles:** `public`
- **USING expression:** `bucket_id = 'exhibitions'`

### Policy 2: Authenticated Users Can Upload
```sql
Policy Name: Authenticated users can upload
Allowed operation: INSERT
Policy definition: (bucket_id = 'exhibitions'::text)
Target roles: authenticated
```

Or use the visual editor:
- **Policy name:** `Authenticated users can upload`
- **Allowed operation:** `INSERT`
- **Target roles:** `authenticated`
- **WITH CHECK expression:** `bucket_id = 'exhibitions'`

### Policy 3: Authenticated Users Can Update
```sql
Policy Name: Authenticated users can update
Allowed operation: UPDATE
Policy definition: (bucket_id = 'exhibitions'::text)
Target roles: authenticated
```

Or use the visual editor:
- **Policy name:** `Authenticated users can update`
- **Allowed operation:** `UPDATE`
- **Target roles:** `authenticated`
- **USING expression:** `bucket_id = 'exhibitions'`

### Policy 4: Authenticated Users Can Delete
```sql
Policy Name: Authenticated users can delete
Allowed operation: DELETE
Policy definition: (bucket_id = 'exhibitions'::text)
Target roles: authenticated
```

Or use the visual editor:
- **Policy name:** `Authenticated users can delete`
- **Allowed operation:** `DELETE`
- **Target roles:** `authenticated`
- **USING expression:** `bucket_id = 'exhibitions'`

## Alternative: Quick Setup via SQL (Requires Superuser)

If you have superuser access, you can run this SQL directly:

```sql
-- Create policies (requires superuser/service_role permissions)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exhibitions');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exhibitions');

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'exhibitions');

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'exhibitions');
```

## Verification

After setup, verify the bucket works:

1. Go to **Storage > exhibitions**
2. Try uploading a test image
3. Check that the public URL works
4. Delete the test image

## Troubleshooting

### "Bucket not found" error
- Run the SQL migration first
- Refresh the Supabase dashboard

### "Permission denied" when uploading
- Check that storage policies are created
- Verify user is authenticated
- Check file size (must be under 50MB)
- Verify file type is an allowed image format

### Public URLs not working
- Ensure bucket is set to `public = true`
- Check that "Public read access" policy exists
- Verify the file was uploaded successfully



