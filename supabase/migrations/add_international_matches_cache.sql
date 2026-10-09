-- One-row cache for the international-matches Edge Function, so every app open
-- reuses one provider call. Only the function (service role) touches it:
-- RLS is on with no policies, so the app itself cannot read or write it.
-- Safe to run twice.

create table if not exists public.international_matches_cache (
  id int primary key default 1 check (id = 1),
  payload jsonb not null default '[]'::jsonb,
  fetched_at timestamptz not null default now()
);

alter table public.international_matches_cache enable row level security;
revoke all on public.international_matches_cache from anon, authenticated;
