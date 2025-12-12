-- Create projects table for portfolio CMS
-- Run this SQL in your Supabase SQL Editor
-- WARNING: This will drop the existing projects table and all its data

-- Drop existing table and all dependencies (policies, indexes, etc. will be dropped automatically)
DROP TABLE IF EXISTS projects CASCADE;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  problem TEXT,
  solution TEXT,
  roles TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  tech TEXT[] DEFAULT '{}',
  live_url TEXT,
  github_url TEXT,
  case_study_url TEXT,
  cover_image_url TEXT,
  gallery_image_urls TEXT[] DEFAULT '{}',
  category TEXT CHECK (category IN ('startup', 'client', 'personal', 'school')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Authenticated users can view all their own projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Public (anon) can view only published projects
CREATE POLICY "Public can view published projects"
  ON projects FOR SELECT
  TO anon
  USING (status = 'published');

-- Authenticated users can insert their own projects
CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own projects
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own projects
CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_slug_idx ON projects(slug);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_featured_idx ON projects(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS projects_category_idx ON projects(category);
CREATE INDEX IF NOT EXISTS projects_sort_order_idx ON projects(sort_order);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

