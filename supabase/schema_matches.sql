-- CricYaar — Phase 4 schema: Live matches.
--
-- Run this once in the Supabase SQL Editor, same as the earlier files.
--
-- Teams and tournaments are still local/mock (deliberately deferred — they'll
-- become real once teams are user-generated). So a match here snapshots team
-- names and XIs as plain text/jsonb at scoring time rather than foreign-keying
-- to a `teams` table that doesn't exist yet. `innings` mirrors the shape the
-- umpire scoring engine already builds in memory (UmpireMatchSession.jsx's
-- `createInning()`), stored as jsonb so ball-by-ball detail doesn't need a
-- fully normalized schema at pilot scale.

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  scorer_id uuid references public.profiles(id) not null,

  team1_name text not null,
  team2_name text not null,
  ground text,
  city text,
  overs int not null default 20,

  toss_winner_name text,
  toss_choice text check (toss_choice in ('bat', 'field')),

  status text not null default 'live' check (status in ('live', 'completed', 'abandoned')),
  current_innings_idx int not null default 0,
  innings jsonb not null default '[]',
  result jsonb,
  special_outcome text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.matches enable row level security;

-- Anyone signed in can watch any live/completed match.
create policy "Matches are readable by signed-in users"
  on public.matches for select
  to authenticated
  using (true);

-- Only the scorer who started the match can create or update it.
create policy "Scorer can create their own match"
  on public.matches for insert
  to authenticated
  with check (scorer_id = auth.uid());

create policy "Scorer can update their own match"
  on public.matches for update
  to authenticated
  using (scorer_id = auth.uid())
  with check (scorer_id = auth.uid());

-- Realtime: push every insert/update to subscribed viewers.
alter publication supabase_realtime add table public.matches;
