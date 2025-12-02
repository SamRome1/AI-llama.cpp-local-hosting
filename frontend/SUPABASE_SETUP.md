# Supabase Workspaces Setup

## Overview
Workspaces are now stored in Supabase instead of localStorage, allowing persistent storage across devices and sessions.

## Setup Instructions

### 1. Run the Migration in Supabase

1. Go to your Supabase project: https://app.supabase.com/
2. Navigate to the **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase-migrations/001-create-workspaces-table.sql`
5. Run the query

This will create:
- `workspaces` table with all necessary fields
- Indexes for optimal query performance
- Row Level Security (RLS) policies to ensure users can only access their own workspaces

### 2. Verify the Table

After running the migration, you should see:
- A new `workspaces` table in the **Tables** section
- The table will have columns: `id`, `user_id`, `name`, `model_id`, `model_name`, `created_at`, `last_used`, `updated_at`

### 3. Test It Out

1. Log in to your app
2. Create a new workspace with a name like "Daily Chat" or "Coding Model"
3. The workspace will be saved to Supabase
4. Log out and log back in
5. Your workspace should still be there!

## Features

- ✅ Workspaces are persistent across devices
- ✅ User isolation: Each user only sees their own workspaces
- ✅ Sorted by last used date
- ✅ Create, read, update, and delete workspaces
- ✅ Track creation and last used dates

## Troubleshooting

**Workspaces not showing up?**
- Check that the migration was run successfully
- Verify RLS is enabled on the workspaces table
- Check browser console for any Supabase errors

**Permission denied errors?**
- Ensure RLS policies were created correctly
- Verify the user is authenticated before creating workspaces
