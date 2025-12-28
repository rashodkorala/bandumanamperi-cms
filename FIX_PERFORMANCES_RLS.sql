-- Fix Row Level Security for Performances Table
-- This allows authenticated users to create, read, update, and delete performances

-- Enable RLS (if not already enabled)
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all performances" ON performances;
DROP POLICY IF EXISTS "Users can insert performances" ON performances;
DROP POLICY IF EXISTS "Users can update performances" ON performances;
DROP POLICY IF EXISTS "Users can delete performances" ON performances;

-- Policy 1: Allow everyone to view all performances (for public website)
CREATE POLICY "Users can view all performances"
ON performances FOR SELECT
TO public
USING (true);

-- Policy 2: Allow authenticated users to insert performances
CREATE POLICY "Users can insert performances"
ON performances FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow authenticated users to update performances
CREATE POLICY "Users can update performances"
ON performances FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to delete performances
CREATE POLICY "Users can delete performances"
ON performances FOR DELETE
TO authenticated
USING (auth.role() = 'authenticated');

