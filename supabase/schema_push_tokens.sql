-- CricYaar — Phase 5 schema: Push notification device tokens.
--
-- Run this once in the Supabase SQL Editor, same as the earlier files.
--
-- One row per device a user has ever opened the app on. `token` is unique
-- across everyone so re-registering the same device (reinstall, token
-- refresh) just replaces the row instead of piling up duplicates. Sending
-- a push happens server-side (an Edge Function using the service role key,
-- built in a later step) — RLS here only needs to let a signed-in user
-- manage their own device's row.

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  token text not null unique,
  platform text not null,
  created_at timestamptz not null default now()
);

alter table public.push_tokens enable row level security;

create policy "Users can manage their own push tokens"
  on public.push_tokens for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
