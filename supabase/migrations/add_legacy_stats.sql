-- Add legacy/imported career stats columns to profiles
-- Run in Supabase SQL Editor
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS legacy_runs     integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS legacy_wickets  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS legacy_matches  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS legacy_mom      integer NOT NULL DEFAULT 0;
