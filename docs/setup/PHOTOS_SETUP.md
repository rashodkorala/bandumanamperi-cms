# Photography Section Setup

This guide will help you set up the photography section for your personal CMS.

## Database Setup

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Database Schema**
   - Copy the contents of `database-schema-photos.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the SQL

   This will create:
   - The `photos` table with all necessary columns
   - Row Level Security (RLS) policies
   - Indexes for performance
   - A trigger to automatically update the `updated_at` timestamp

## Database Schema

The photos table includes:
- **Basic Info**: title, description, image_url
- **Organization**: category, location, date_taken
- **Camera Settings**: aperture, shutter speed, ISO, focal length, camera, lens (stored as JSONB)
- **Metadata**: tags (array), featured (boolean)
- **Timestamps**: created_at, updated_at
- **User Association**: user_id (links to auth.users)

## Features

### Security
- Row Level Security (RLS) is enabled
- Users can only see, create, update, and delete their own photos
- All operations are authenticated

### Frontend Display
- Photos marked as `featured: true` can be displayed on your personal website
- All photo data is available via the API for frontend consumption
- Camera settings can be displayed for photography enthusiasts

### Organization
- **Categories**: Organize photos by type (Landscape, Portrait, Street, etc.)
- **Tags**: Add multiple tags for better searchability
- **Location**: Track where photos were taken
- **Date Taken**: Sort and filter by date

## Usage

1. **Add a Photo**
   - Navigate to `/protected/photos`
   - Click "New Photo"
   - Fill in the form:
     - Title (required)
     - Image URL (required)
     - Description (optional)
     - Category, Location, Date Taken
     - Camera Settings (optional)
     - Tags (add multiple)
     - Featured checkbox
   - Save

2. **Edit a Photo**
   - Click the actions menu (three dots) on any photo
   - Select "Edit"
   - Update the information and save

3. **Delete a Photo**
   - Click the actions menu on any photo
   - Select "Delete"
   - Confirm the deletion

4. **Feature a Photo**
   - When creating or editing a photo, check "Featured photo"
   - Featured photos can be displayed on your frontend website

## API for Frontend

To fetch photos for your frontend website, you can:

1. **Get all photos** (for a user):
   ```typescript
   const photos = await getPhotos()
   ```

2. **Get featured photos only**:
   ```typescript
   const featuredPhotos = await getFeaturedPhotos()
   ```

3. **Get photos by category**:
   ```typescript
   const landscapePhotos = await getPhotosByCategory("Landscape")
   ```

4. **Get a single photo**:
   ```typescript
   const photo = await getPhoto(photoId)
   ```

## Camera Settings

Camera settings are stored as JSONB and include:
- `aperture`: e.g., "f/2.8"
- `shutterSpeed`: e.g., "1/250s"
- `iso`: number, e.g., 400
- `focalLength`: e.g., "50mm"
- `camera`: e.g., "Canon EOS R5"
- `lens`: e.g., "24-70mm f/2.8"

These are optional but useful for photography portfolios.

## Next Steps

1. Set up the database using the SQL schema
2. Start adding your photos through the CMS
3. Mark important photos as "featured"
4. Use the API to display photos on your personal website
5. Organize photos with categories and tags for easy browsing

