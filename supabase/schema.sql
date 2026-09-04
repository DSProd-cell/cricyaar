-- CricYaar — Phase 1 schema: real accounts.
--
-- Run this once in the Supabase dashboard: Project -> SQL Editor -> New query
-- -> paste this whole file -> Run. Safe to re-run only after dropping the
-- objects it creates (it does not use IF NOT EXISTS, on purpose — so a
-- second accidental run fails loudly instead of silently doing nothing).
--
-- What this sets up: a `profiles` table (one row per signed-in user, holding
-- the app-specific fields Supabase Auth itself doesn't store — name, city,
-- role, subscription tier, ...), Row Level Security so users can only edit
-- their own row, and a trigger that creates that row automatically the
-- moment someone verifies their phone for the first time.
--
-- Grounds, teams, matches, tournaments, bookings and notifications land in
-- a follow-up migration in Phase 2 — this file is intentionally just enough
-- for real login to work end-to-end.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text,
  name text,
  username text unique,
  city text,
  role text not null default 'fan',
  roles text[] not null default array['fan'],
  avatar_url text,
  subscription text not null default 'free',
  onboarded boolean not null default false,
  last_role_changed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Any signed-in user can read any profile (needed to show teammates' names,
-- ground owners' names, umpire listings, etc.) — nobody can read profiles
-- while signed out.
create policy "Profiles are readable by signed-in users"
  on public.profiles for select
  to authenticated
  using (true);

-- You can only ever edit your own row.
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- There is deliberately no INSERT policy: the only way a profile row is
-- created is the trigger below, which runs as the table owner and bypasses
-- RLS. This stops anyone from creating profile rows for ids that aren't
-- theirs.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
