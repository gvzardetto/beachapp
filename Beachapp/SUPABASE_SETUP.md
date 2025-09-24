# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose your organization and give your project a name
4. Set a database password and select a region
5. Wait for the project to be created

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (long string starting with `eyJ...`)

## 3. Create Environment File

Create a file named `.env.local` in your project root (same level as `package.json`) with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the placeholder values with your actual Supabase credentials.

## 4. Create Database Tables

Run these SQL commands in your Supabase SQL Editor (Dashboard → SQL Editor):

### Matches Table
```sql
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  player1_id INTEGER NOT NULL,
  player2_id INTEGER NOT NULL,
  score TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Players Table (Optional)
```sql
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample players
INSERT INTO players (name) VALUES 
  ('Player 1'),
  ('Player 2'),
  ('Player 3'),
  ('Player 4');
```

## 5. Set Up Row Level Security (RLS)

```sql
-- Enable RLS on matches table
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read matches
CREATE POLICY "Allow public read access on matches" ON matches
  FOR SELECT USING (true);

-- Allow anyone to insert matches
CREATE POLICY "Allow public insert access on matches" ON matches
  FOR INSERT WITH CHECK (true);

-- Enable RLS on players table (if created)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read players
CREATE POLICY "Allow public read access on players" ON players
  FOR SELECT USING (true);
```

## 6. Test Your Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your app and try logging a match
3. **Simplified Form**: You only need to select a winning team (no score input required)
4. Check your Supabase dashboard → Table Editor to see if the match was saved

## 7. Simplified Match Logging

The form now only requires:
- ✅ **Date selection** (defaults to today)
- ✅ **Team selection** (A, B, or C)
- ✅ **No score input needed** - just select which team won!

The system automatically:
- Records the winning team players
- Sets score to "Won" 
- Calculates rankings based on wins
- Updates player statistics

## Troubleshooting

### Error: "supabaseUrl is required"
- Make sure you created `.env.local` in the correct location
- Check that the environment variable names are exactly as shown
- Restart your development server after creating the file

### Error: "Invalid API key"
- Double-check that you copied the correct anon key from Supabase
- Make sure there are no extra spaces or characters

### Error: "Failed to fetch"
- Check that your Supabase URL is correct
- Verify that RLS policies are set up correctly
- Check the Supabase dashboard for any error logs
