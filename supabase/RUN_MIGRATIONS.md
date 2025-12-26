# Running Exhibition Storage Migrations

## Quick Start

Choose **ONE** of these methods:

---

## Method 1: Single Complete Migration (Recommended)

Run the complete setup file which includes both bucket and policies:

### Via Supabase Dashboard:
1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy the entire contents of: `exhibitions_storage_complete.sql`
4. **Important:** Check the box "Run as postgres" or "Use service role"
5. Click **Run**

---

## Method 2: Separate Files

If you prefer to run in steps:

### Step 1: Create Bucket
```sql
-- Run: exhibitions_storage_bucket.sql
-- This creates the bucket (doesn't need elevated permissions)
```

### Step 2: Create Policies
```sql
-- Run: exhibitions_storage_policies.sql
-- This needs elevated permissions - enable "Run as postgres"
```

---

## Method 3: Via Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd /path/to/your/project

# Apply all migrations
supabase db push

# Or apply a specific migration
supabase db push --file supabase/migrations/exhibitions_storage_complete.sql
```

---

## Method 4: Manual Dashboard Setup (No SQL Required)

If SQL permissions are an issue, create policies manually:

### 1. Create Bucket (Dashboard UI)
- Go to **Storage**
- Click **New bucket**
- Name: `exhibitions`
- Public: ✅ **Enabled**
- File size limit: `52428800` (50MB)
- Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp, image/gif`

### 2. Create Policies (Dashboard UI)
Go to **Storage** > **exhibitions** > **Policies**

#### Policy 1: Public Read
- Click **New Policy** > **Get started quickly** > **Select** (for read)
- Policy name: `Public Access to exhibitions bucket`
- Target role: `public`
- Click **Review** > **Save policy**

#### Policy 2: Authenticated Insert
- Click **New Policy** > **Get started quickly** > **Insert** (for upload)
- Policy name: `Authenticated users can upload to exhibitions`
- Target role: `authenticated`
- Click **Review** > **Save policy**

#### Policy 3: Authenticated Update
- Click **New Policy** > **Get started quickly** > **Update**
- Policy name: `Authenticated users can update exhibitions`
- Target role: `authenticated`
- Click **Review** > **Save policy**

#### Policy 4: Authenticated Delete
- Click **New Policy** > **Get started quickly** > **Delete**
- Policy name: `Authenticated users can delete from exhibitions`
- Target role: `authenticated`
- Click **Review** > **Save policy**

---

## After Setup: Database Schema

Don't forget to also run the database schema migration:

```sql
-- Run: exhibitions_schema.sql
-- This adds the exhibition_history column and helper functions
```

---

## Verification

After running migrations, verify everything works:

### Check Bucket Exists
```sql
SELECT * FROM storage.buckets WHERE id = 'exhibitions';
```

Should return:
```
id: exhibitions
name: exhibitions
public: true
```

### Check Policies Exist
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%exhibition%';
```

Should return 4 policies.

### Test Upload (Optional)
1. Go to **Storage** > **exhibitions**
2. Try uploading a test image
3. Verify you can see the public URL
4. Try accessing the URL in an incognito browser (should work)

---

## Troubleshooting

### "Must be owner of table objects"
- You need elevated permissions
- Use "Run as postgres" in SQL Editor
- Or use Dashboard UI method (Method 4)

### "Bucket already exists"
- Run `exhibitions_storage_complete.sql` (it has `ON CONFLICT` handling)
- Or ignore the error, it's safe

### "Policy already exists"
- Run `exhibitions_storage_complete.sql` (it drops existing policies first)
- Or drop policies manually then re-create

### Uploads fail with "Permission denied"
- Verify all 4 policies are created
- Check user is authenticated
- Verify file is an allowed image type

---

## Files Reference

| File | Purpose | Requires Elevated Permissions |
|------|---------|------------------------------|
| `exhibitions_storage_bucket.sql` | Create bucket only | ❌ No |
| `exhibitions_storage_policies.sql` | Create policies only | ✅ Yes |
| `exhibitions_storage_complete.sql` | Complete setup | ✅ Yes |
| `exhibitions_schema.sql` | Database schema | ❌ No |


