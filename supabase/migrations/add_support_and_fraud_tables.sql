-- Support requests table
-- Run in Supabase SQL Editor.
CREATE TABLE IF NOT EXISTS public.support_requests (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  category   text        NOT NULL,
  message    text,
  status     text        NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create support requests"
  ON public.support_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own support requests"
  ON public.support_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fraud reports table
CREATE TABLE IF NOT EXISTS public.fraud_reports (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_id   uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_name text,
  reason        text        NOT NULL,
  note          text,
  status        text        NOT NULL DEFAULT 'pending',
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit fraud reports"
  ON public.fraud_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);
