-- Adds mother_tongue to profiles for language-based team matching.
-- Run in Supabase SQL Editor.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mother_tongue text;
