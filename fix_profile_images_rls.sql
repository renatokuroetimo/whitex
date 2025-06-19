-- Fix RLS policies for profile_images table
-- This script addresses authentication issues with the original policies

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile image" ON profile_images;
DROP POLICY IF EXISTS "Users can insert own profile image" ON profile_images;
DROP POLICY IF EXISTS "Users can update own profile image" ON profile_images;
DROP POLICY IF EXISTS "Users can delete own profile image" ON profile_images;

-- Option 1: More permissive policies (recommended for development)
-- These policies allow operations if the user is authenticated

CREATE POLICY "Allow authenticated users to view own profile image" ON profile_images
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid()::text);

CREATE POLICY "Allow authenticated users to insert own profile image" ON profile_images
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid()::text);

CREATE POLICY "Allow authenticated users to update own profile image" ON profile_images
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid()::text);

CREATE POLICY "Allow authenticated users to delete own profile image" ON profile_images
  FOR DELETE 
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid()::text);

-- Alternative Option 2: Temporary disable RLS for debugging (uncomment if needed)
-- ALTER TABLE profile_images DISABLE ROW LEVEL SECURITY;

-- Alternative Option 3: Allow all operations for testing (very permissive, uncomment if needed)
-- CREATE POLICY "Allow all profile image operations" ON profile_images
--   FOR ALL USING (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profile_images';
