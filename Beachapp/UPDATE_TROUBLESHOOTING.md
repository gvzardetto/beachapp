# 🔧 Match Update Troubleshooting

## Issue: "Failed to update match"

This error can occur due to several reasons. Here's how to fix it:

## ✅ **Step 1: Fix React Import (COMPLETED)**
- ✅ **Fixed React import** - Added `useEffect` to imports
- ✅ **Fixed useEffect call** - Changed from `React.useEffect` to `useEffect`

## 🔧 **Step 2: Add Database Permissions**

The most likely cause is missing UPDATE and DELETE permissions. Run this SQL in your Supabase SQL Editor:

```sql
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
```

## 🔍 **Step 3: Check Browser Console**

1. **Open your app**: http://localhost:3000
2. **Open browser console** (F12 → Console)
3. **Try to edit a match**
4. **Look for these debug messages**:
   - `Updating match: { matchId: "123", player1Id: 1, player2Id: 2, date: "..." }`
   - `Match updated successfully: { ... }`

## 🚨 **Common Issues & Solutions**

### **Issue: "Permission denied"**
- **Solution**: Run the SQL permissions script above
- **Check**: Go to Supabase → Authentication → Policies

### **Issue: "Match not found"**
- **Solution**: Make sure the match ID is correct
- **Check**: Verify the match exists in your database

### **Issue: "Network error"**
- **Solution**: Check your internet connection
- **Check**: Verify Supabase URL and key are correct

### **Issue: "Invalid data"**
- **Solution**: Check that player IDs are valid (1, 2, 3, 4)
- **Check**: Verify the date format is correct

## 🧪 **Step 4: Test Update Manually**

1. **Go to your Supabase dashboard**
2. **Click "Table Editor"** → **"matches"**
3. **Find a match** and note its ID
4. **Click "Edit"** on the match
5. **Change the score** to "Updated Test"
6. **Click "Save"**
7. **Verify it saved** successfully

## 🎯 **Step 5: Test in Your App**

1. **Refresh your app** (http://localhost:3000)
2. **Try editing a match**:
   - Click the pencil icon
   - Select a different team
   - Click "Update Match"
3. **Check for success message**
4. **Verify the match updated** in the list

## 🔍 **Debug Information**

When you try to update a match, check the browser console for:

```javascript
// These should appear in console:
Updating match: { matchId: "123", player1Id: 1, player2Id: 2, date: "2024-01-15T10:00:00.000Z" }
Match updated successfully: { id: 123, player1_id: 1, player2_id: 2, score: "Won", date: "2024-01-15T10:00:00.000Z" }
```

## 🎉 **Expected Result**

After fixing the permissions, you should see:
- ✅ **No error messages** in console
- ✅ **Success message** when updating
- ✅ **Match list refreshes** automatically
- ✅ **Updated match** shows new winning team

## 🚀 **Quick Fix Summary**

1. **Run the SQL permissions script** in Supabase
2. **Refresh your app**
3. **Try editing a match**
4. **Check browser console** for debug info

The update functionality should work perfectly after adding the database permissions! 🎾

