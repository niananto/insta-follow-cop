-- Insta Follow Cop — initial schema
-- Run this in Supabase SQL editor or via: supabase db push

CREATE TABLE IF NOT EXISTS analyses (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_type              TEXT NOT NULL CHECK (source_type IN ('zip', 'json')),

  -- Aggregate counts for fast list queries
  followers_count          INTEGER NOT NULL,
  following_count          INTEGER NOT NULL,
  not_following_back_count INTEGER NOT NULL,
  not_followed_back_count  INTEGER NOT NULL,

  -- Full payload as JSONB (IGUser[])
  not_following_back       JSONB NOT NULL DEFAULT '[]',
  not_followed_back        JSONB NOT NULL DEFAULT '[]',

  -- Future: Google Drive source reference
  drive_file_id            TEXT,
  drive_file_name          TEXT
);

-- Row Level Security — users can only access their own rows
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own analyses"
  ON analyses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for listing by user, newest first
CREATE INDEX IF NOT EXISTS idx_analyses_user_created
  ON analyses (user_id, created_at DESC);

-- Grant table access to authenticated users (RLS controls row-level access)
GRANT ALL ON TABLE analyses TO authenticated;
