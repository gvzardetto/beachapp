-- Beach App Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Drop existing tables if they exist (to ensure clean setup)
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS players CASCADE;

-- Create matches table
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  player1_id INTEGER NOT NULL,
  player2_id INTEGER NOT NULL,
  score TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample players
INSERT INTO players (name) VALUES 
  ('Player 1'),
  ('Player 2'),
  ('Player 3'),
  ('Player 4')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
-- Drop existing policies first (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow public read access on matches" ON matches;
DROP POLICY IF EXISTS "Allow public insert access on matches" ON matches;
DROP POLICY IF EXISTS "Allow public read access on players" ON players;

-- Create new policies
CREATE POLICY "Allow public read access on matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on matches" ON matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on players" ON players
  FOR SELECT USING (true);

-- Test the setup by inserting a sample match
INSERT INTO matches (player1_id, player2_id, score, date) VALUES 
  (1, 2, 'Won', NOW())
ON CONFLICT DO NOTHING;
