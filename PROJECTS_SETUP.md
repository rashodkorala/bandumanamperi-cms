# Projects Database Setup

This guide will help you set up the projects database for your personal CMS.

## Database Setup

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Database Schema**
   - Copy the contents of `database-schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the SQL

   This will create:
   - The `projects` table with all necessary columns
   - Row Level Security (RLS) policies
   - Indexes for performance
   - A trigger to automatically update the `updated_at` timestamp

## Database Schema

The projects table includes:
- **Basic Info**: name, description, category
- **Status Tracking**: status, progress, priority
- **Dates**: due_date, created_at, updated_at
- **Links**: project_url, github_url, image_url
- **Metadata**: technologies (array), featured (boolean)
- **User Association**: user_id (links to auth.users)

## Features

### Security
- Row Level Security (RLS) is enabled
- Users can only see, create, update, and delete their own projects
- All operations are authenticated

### Frontend Display
- Projects marked as `featured: true` can be displayed on your personal website
- All project data is available via the API for frontend consumption

## Usage

1. **Add a Project**
   - Navigate to `/protected/projects`
   - Click "New Project"
   - Fill in the form and save

2. **Edit a Project**
   - Click the actions menu (three dots) on any project
   - Select "Edit"
   - Update the information and save

3. **Delete a Project**
   - Click the actions menu on any project
   - Select "Delete"
   - Confirm the deletion

4. **Feature a Project**
   - When creating or editing a project, check "Featured project"
   - Featured projects can be displayed on your frontend website

## API for Frontend

To fetch projects for your frontend website, you can:

1. **Get all projects** (for a user):
   ```typescript
   const projects = await getProjects()
   ```

2. **Get featured projects only**:
   ```typescript
   const featuredProjects = projects.filter(p => p.featured)
   ```

3. **Get a single project**:
   ```typescript
   const project = await getProject(projectId)
   ```

## Next Steps

1. Set up the database using the SQL schema
2. Start adding your projects through the CMS
3. Mark important projects as "featured"
4. Use the API to display projects on your personal website

