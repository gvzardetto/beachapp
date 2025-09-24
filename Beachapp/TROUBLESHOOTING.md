# Troubleshooting Guide

## Current Error: "Network error: Please check your internet connection and Supabase configuration."

This error means your Supabase credentials are not properly configured. Follow these steps:

## Step 1: Get Your Supabase Credentials

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign in** to your account
3. **Create a new project** if you haven't already:
   - Click "New Project"
   - Choose your organization
   - Enter project name (e.g., "beachapp")
   - Set a database password
   - Select a region close to you
   - Click "Create new project"
   - Wait for it to finish (2-3 minutes)

4. **Get your credentials**:
   - In your project dashboard, go to **Settings** → **API**
   - Copy the **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - Copy the **anon/public key** (long string starting with `eyJ...`)

## Step 2: Update Your Environment File

1. **Open your `.env.local` file** in the project root
2. **Replace the placeholder values** with your real credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Example of real values:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.example-signature
```

## Step 3: Create Database Tables

1. **Go to your Supabase dashboard**
2. **Click on "SQL Editor"** in the left sidebar
3. **Click "New query"**
4. **Copy and paste this SQL**:

```sql
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

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Allow public access
CREATE POLICY "Allow public read access on matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on matches" ON matches
  FOR INSERT WITH CHECK (true);
```

5. **Click "Run"** to execute the SQL

## Step 4: Test Your Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser console** (F12 → Console tab)
3. **Look for debug messages** like:
   - `Supabase URL: https://your-project-id.supabase.co`
   - `Supabase Key: Set`
   - `Testing Supabase connection...`

4. **Try logging a match** in your app

## Step 5: Verify in Supabase

1. **Go to your Supabase dashboard**
2. **Click "Table Editor"** in the left sidebar
3. **Click on "matches" table**
4. **You should see your logged matches**

## Common Issues

### Issue: "supabaseUrl is required"
- **Solution**: Make sure `.env.local` exists and has the correct variable names
- **Check**: File should be in the same folder as `package.json`

### Issue: "Please replace the placeholder values"
- **Solution**: You're still using the example values
- **Fix**: Replace `your-project-id` and `your-anon-key-here` with real values

### Issue: "Failed to fetch" or "Network error"
- **Solution**: Check your internet connection and Supabase URL
- **Fix**: Make sure the URL starts with `https://` and ends with `.supabase.co`

### Issue: "Invalid API key"
- **Solution**: Double-check your anon key from Supabase dashboard
- **Fix**: Make sure there are no extra spaces or characters

## Still Having Issues?

1. **Check the browser console** for specific error messages
2. **Verify your Supabase project is active** (not paused)
3. **Make sure you're using the correct region** for your project
4. **Try creating a new Supabase project** if the current one has issues

## Quick Test

Run this in your browser console to test the connection:

```javascript
// This will show you what values are being loaded
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```
