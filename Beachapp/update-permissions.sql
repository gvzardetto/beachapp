-- Add update and delete permissions for matches table
-- Run this in your Supabase SQL Editor

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow public read access on matches" ON matches;
DROP POLICY IF EXISTS "Allow public insert access on matches" ON matches;

-- Create comprehensive policies
CREATE POLICY "Allow public read access on matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on matches" ON matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on matches" ON matches
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on matches" ON matches
  FOR DELETE USING (true);

-- Test the permissions
SELECT 'Permissions updated successfully' as status;
