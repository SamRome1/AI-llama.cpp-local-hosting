-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  model_id text NOT NULL,
  model_name text NOT NULL,
  created_at timestamp WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_used timestamp WITH TIME ZONE,
  updated_at timestamp WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_last_used ON workspaces(user_id, last_used DESC NULLS LAST);

-- Enable RLS (Row Level Security)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only see their own workspaces
CREATE POLICY "Users can view their own workspaces" ON workspaces
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policy: Users can insert their own workspaces
CREATE POLICY "Users can insert their own workspaces" ON workspaces
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policy: Users can update their own workspaces
CREATE POLICY "Users can update their own workspaces" ON workspaces
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policy: Users can delete their own workspaces
CREATE POLICY "Users can delete their own workspaces" ON workspaces
  FOR DELETE
  USING (auth.uid() = user_id);
