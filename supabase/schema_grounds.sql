-- CricYaar — Phase 2 schema: grounds.
--
-- Run this once in the Supabase SQL Editor (after schema.sql from Phase 1),
-- then run seed_grounds.sql to load the 85 real Bengaluru grounds.
--
-- Design notes:
--  - `owner_id` is nullable: the 85 seeded grounds came from a form, not
--    from someone signing into the app, so they have no linked account yet.
--    A real user's own submission always sets it (own_id = auth.uid()).
--  - `status` gates visibility: seeded/curated grounds go straight to
--    'approved'; anything a user submits through the app starts 'pending'
--    until reviewed in the Supabase table editor (see the roadmap, p2-4).
--  - `facilities` is a jsonb blob mirroring the app's existing shape
--    ({ parking, changingRoom, practiceNets, washrooms, cafeteria, firstAid })
--    rather than six boolean columns — cheaper to extend later.

create table public.grounds (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete set null,
  name text not null,
  area text not null,
  city text not null,
  state text,
  pitch_type text,
  pitch_condition text,
  floodlights boolean not null default false,
  floodlight_hours text,
  rent_per_hour numeric,
  rent_per_match numeric,
  rating numeric not null default 0,
  rating_count integer not null default 0,
  match_count integer not null default 0,
  facilities jsonb not null default '{}'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  lat double precision,
  lng double precision,
  owner_name text,
  owner_phone text,
  owner_phone_alt text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.grounds enable row level security;

-- Anyone signed in can browse approved grounds — this is the search/detail
-- screens' read path.
create policy "Approved grounds are readable by signed-in users"
  on public.grounds for select
  to authenticated
  using (status = 'approved');

-- A ground owner can also see their own pending/rejected submissions (so
-- "My Grounds" can show them before approval), in addition to the approved
-- rule above.
create policy "Owners can read their own submissions regardless of status"
  on public.grounds for select
  to authenticated
  using (owner_id = auth.uid());

-- Submitting a new ground always starts pending, and always under your own id.
create policy "Users can submit a ground under their own id"
  on public.grounds for insert
  to authenticated
  with check (owner_id = auth.uid() and status = 'pending');

-- Owners can edit their own listing (photos, pricing, ...). At pilot scale,
-- with approvals reviewed by hand in the table editor and a small trusted
-- user base, we're not additionally locking the status column here — worth
-- revisiting with a trigger before this is open to the public.
create policy "Owners can update their own ground"
  on public.grounds for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
