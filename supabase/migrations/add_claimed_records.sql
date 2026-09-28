-- Tracks which past records have been claimed so they cannot be double-claimed.
-- Run in Supabase SQL Editor.
CREATE TABLE IF NOT EXISTS public.claimed_records (
  record_id   int       PRIMARY KEY,
  claimed_by  uuid      REFERENCES public.profiles(id) ON DELETE SET NULL,
  claimed_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.claimed_records ENABLE ROW LEVEL SECURITY;

-- Any signed-in user can see which records are already taken
CREATE POLICY "Anyone can read claimed records"
  ON public.claimed_records FOR SELECT
  TO authenticated
  USING (true);

-- A user can only insert a row for themselves
CREATE POLICY "Users can claim records"
  ON public.claimed_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = claimed_by);
