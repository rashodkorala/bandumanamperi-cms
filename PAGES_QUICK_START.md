# Pages Feature - Quick Start Guide

⚡ **Get started in 5 minutes!**

---

## Step 1: Database Setup (2 minutes)

### Option A: New Installation

1. Open **Supabase SQL Editor**
2. Run the complete schema:
   ```sql
   -- Copy and paste from: database-schema-pages.sql
   ```
3. Create the storage bucket:
   ```sql
   -- Copy and paste from: database-storage-pages-bucket.sql
   ```

### Option B: Existing Installation

1. Run the migration to add new columns:
   ```sql
   -- Copy and paste from: database-schema-pages-migration.sql
   ```
2. Create the storage bucket:
   ```sql
   -- Copy and paste from: database-storage-pages-bucket.sql
   ```

---

## Step 2: Verify Setup (30 seconds)

Check your Supabase dashboard:

✅ **Table Editor** → `pages` table exists  
✅ **Storage** → `pages` bucket exists  
✅ **Storage** → `pages` bucket is **public**

---

## Step 3: Create Your First Page (2 minutes)

1. **Start your dev server:**
   ```bash
   pnpm dev
   ```

2. **Navigate to admin:**
   ```
   http://localhost:3000/protected/pages
   ```

3. **Click "New Page"** and fill in:
   - **Title:** `About Us`
   - **Content Type:** `HTML`
   - **Content:** 
     ```html
     <h1>Welcome to Our Company</h1>
     <p>This is our about page!</p>
     ```
   - **Status:** `Published`

4. **Click "Create"**

---

## Step 4: View Your Page (30 seconds)

Visit your new page:
```
http://localhost:3000/pages/about-us
```

You should see:
- Your page content rendered
- Download links for `.md` and `.json` files

---

## Step 5: Check the Files (30 seconds)

1. Go to **Supabase Storage** → `pages` bucket
2. You should see:
   - `about-us.md`
   - `about-us.json`
3. Click on them to view/download

---

## 🎉 Done!

You now have a fully functional pages system!

---

## What You Can Do Now

### Create Different Content Types

**HTML Page:**
```html
<div class="container">
  <h1>My HTML Page</h1>
  <p>Custom styling and layout</p>
</div>
```

**Markdown Page:**
```markdown
# My Markdown Page

This is **bold** and this is *italic*.

- List item 1
- List item 2

[Link to Google](https://google.com)
```

**JSON Page (for page builders):**
```json
{
  "sections": [
    {
      "type": "hero",
      "title": "Welcome",
      "subtitle": "To our website"
    },
    {
      "type": "features",
      "items": [
        { "title": "Fast", "description": "Lightning fast" },
        { "title": "Secure", "description": "Bank-level security" }
      ]
    }
  ]
}
```

---

## Access Your Pages

### Frontend Route
```
http://localhost:3000/pages/{slug}
```

### API Endpoints
```
GET /api/pages              # All published pages
GET /api/pages/{slug}       # Single page
```

### Download Files
```
https://your-project.supabase.co/storage/v1/object/public/pages/{slug}.md
https://your-project.supabase.co/storage/v1/object/public/pages/{slug}.json
```

---

## Common Tasks

### Set Homepage
1. Edit a page
2. Check "Set as Homepage"
3. Save

### Create Page Hierarchy
1. Create a parent page (e.g., "Products")
2. Create a child page
3. In child page form, select "Products" as Parent Page

### Draft Workflow
1. Create page with **Status: Draft**
2. Preview and edit
3. Change **Status: Published** when ready

---

## Next Steps

📚 Read the full guide: `PAGES_SETUP_GUIDE.md`  
📖 Check examples: `README_PAGES_FEATURE.md`  
🔧 Customize rendering: `lib/utils/page-renderer.tsx`

---

## Need Help?

### Page not showing?
- ✅ Check status is "published"
- ✅ Verify slug matches URL
- ✅ Check RLS policies are enabled

### Files not uploading?
- ✅ Check storage bucket exists
- ✅ Verify bucket is public
- ✅ Check bucket policies

### Frontend errors?
- ✅ Check Supabase connection
- ✅ Verify API routes work
- ✅ Check browser console for errors

---

## Quick Reference

| Action | Location |
|--------|----------|
| Admin Panel | `/protected/pages` |
| View Page | `/pages/{slug}` |
| API All Pages | `/api/pages` |
| API Single Page | `/api/pages/{slug}` |
| Markdown File | Storage: `pages/{slug}.md` |
| JSON File | Storage: `pages/{slug}.json` |

---

**Enjoy building with your new pages system! 🚀**
