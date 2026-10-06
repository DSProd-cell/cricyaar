-- Legacy player records (imported career data that a new user can "claim"
-- at sign-up from the "Is this you?" screen).
--
-- Safe to run more than once, and safe on top of the legacy_players table that
-- already exists in the project (empty at the time of writing).
--
-- Security model:
--   * legacy_players is NOT readable or writable by any client role. Before
--     this file ran it was readable with the public anon key, which would have
--     let anyone download every record without signing in.
--   * The app only touches it through two SECURITY DEFINER functions below,
--     which require a signed-in user, return a limited set of fields, never
--     return unclaimed-by-someone-else data twice, and let one user claim one
--     record.

-- ── 0. Reset an empty pre-existing table ────────────────────────────────────
-- A legacy_players table was created earlier outside this repo, so its column
-- types are unknown. If it holds NO rows (checked as the table owner, so RLS
-- can't hide any), recreate it cleanly. If it holds rows, keep it and stop
-- only when the id type is incompatible, so nothing is ever lost silently.
do $$
declare
  id_type text;
  n bigint;
begin
  if to_regclass('public.legacy_players') is not null then
    select count(*) into n from public.legacy_players;
    select data_type into id_type from information_schema.columns
     where table_schema = 'public' and table_name = 'legacy_players' and column_name = 'id';
    if n = 0 then
      drop table public.legacy_players cascade;
    elsif id_type is distinct from 'uuid' then
      raise exception 'legacy_players already holds % rows with a non-uuid id; not touching it — review manually', n;
    end if;
  end if;

  -- profiles.legacy_player_id may exist from earlier code with another type.
  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'profiles'
                and column_name = 'legacy_player_id' and data_type <> 'uuid') then
    if (select count(*) from public.profiles where legacy_player_id is not null) = 0 then
      alter table public.profiles drop column legacy_player_id;
    else
      raise exception 'profiles.legacy_player_id has values of a non-uuid type; review manually';
    end if;
  end if;
end $$;

-- ── 1. Table ────────────────────────────────────────────────────────────────
create table if not exists public.legacy_players (
  id uuid primary key default gen_random_uuid()
);

alter table public.legacy_players
  add column if not exists source_player_id text,
  add column if not exists name text,
  add column if not exists city text,
  add column if not exists role text,
  add column if not exists batting_style text,
  add column if not exists bowling_style text,
  add column if not exists team_name text,
  add column if not exists teams jsonb not null default '[]'::jsonb,
  add column if not exists photo_url text,
  add column if not exists matches_played int,
  add column if not exists runs_scored int,
  add column if not exists wickets_taken int,
  add column if not exists highest_runs text,
  add column if not exists batting_avg numeric,
  add column if not exists strike_rate numeric,
  add column if not exists bowling_avg numeric,
  add column if not exists economy numeric,
  add column if not exists fifties int,
  add column if not exists hundreds int,
  add column if not exists fours int,
  add column if not exists sixes int,
  add column if not exists catches int,
  add column if not exists best_bowling text,
  add column if not exists claimed_by uuid references auth.users (id) on delete set null,
  add column if not exists claimed_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists legacy_players_source_player_id_key
  on public.legacy_players (source_player_id);
-- One user can claim at most one record.
create unique index if not exists legacy_players_claimed_by_key
  on public.legacy_players (claimed_by) where claimed_by is not null;
create index if not exists legacy_players_name_lower_idx
  on public.legacy_players (lower(name));

-- ── 2. Lock the table down ──────────────────────────────────────────────────
alter table public.legacy_players enable row level security;

do $$
declare r record;
begin
  for r in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'legacy_players'
  loop
    execute format('drop policy %I on public.legacy_players', r.policyname);
  end loop;
end $$;

revoke all on public.legacy_players from anon, authenticated;

-- ── 3. Profile link + career stats ──────────────────────────────────────────
alter table public.profiles
  add column if not exists legacy_player_id uuid references public.legacy_players (id) on delete set null;

create table if not exists public.player_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  matches int not null default 0,
  runs int not null default 0,
  wickets int not null default 0,
  batting_avg numeric not null default 0,
  bowling_avg numeric not null default 0,
  strike_rate numeric,
  economy numeric,
  updated_at timestamptz not null default now()
);

alter table public.player_stats enable row level security;
revoke insert, update, delete on public.player_stats from anon, authenticated;

drop policy if exists "Stats are readable by signed-in users" on public.player_stats;
create policy "Stats are readable by signed-in users"
  on public.player_stats for select to authenticated using (true);
-- No insert/update policy: rows are written only by claim_legacy_player().

-- ── 4. Search: "Is this you?" ───────────────────────────────────────────────
-- Minimum 3 characters so the list can't be dumped with a one-letter query,
-- 10 results max, unclaimed records only, and never the raw source id.
create or replace function public.search_legacy_players(q text)
returns table (
  id uuid, name text, city text, role text, team_name text, teams jsonb,
  photo_url text, matches_played int, runs_scored int, wickets_taken int,
  batting_avg numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '28000';
  end if;
  q := trim(coalesce(q, ''));
  if length(q) < 3 then
    return;
  end if;
  return query
    select p.id, p.name, p.city, p.role, p.team_name, p.teams,
           p.photo_url, p.matches_played, p.runs_scored, p.wickets_taken,
           p.batting_avg
    from public.legacy_players p
    where p.claimed_by is null
      and p.name ilike '%' || replace(replace(q, '%', ''), '_', '') || '%'
    order by p.matches_played desc nulls last, p.name
    limit 10;
end;
$$;

-- ── 5. Claim: copies the record onto the caller's own profile ───────────────
create or replace function public.claim_legacy_player(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rec public.legacy_players%rowtype;
begin
  if uid is null then
    raise exception 'Sign in required' using errcode = '28000';
  end if;

  if exists (select 1 from public.profiles where id = uid and legacy_player_id is not null) then
    raise exception 'You have already linked a player record';
  end if;

  update public.legacy_players
     set claimed_by = uid, claimed_at = now()
   where id = p_id and claimed_by is null
  returning * into rec;

  if not found then
    raise exception 'That record is no longer available';
  end if;

  update public.profiles
     set legacy_player_id = rec.id,
         name       = coalesce(rec.name, name),
         city       = coalesce(rec.city, city),
         avatar_url = coalesce(avatar_url, rec.photo_url)
   where id = uid;

  insert into public.player_stats
    (user_id, matches, runs, wickets, batting_avg, bowling_avg, strike_rate, economy)
  values
    (uid, coalesce(rec.matches_played, 0), coalesce(rec.runs_scored, 0),
     coalesce(rec.wickets_taken, 0), coalesce(rec.batting_avg, 0),
     coalesce(rec.bowling_avg, 0), rec.strike_rate, rec.economy)
  on conflict (user_id) do update set
    matches = excluded.matches, runs = excluded.runs, wickets = excluded.wickets,
    batting_avg = excluded.batting_avg, bowling_avg = excluded.bowling_avg,
    strike_rate = excluded.strike_rate, economy = excluded.economy,
    updated_at = now();

  return jsonb_build_object(
    'id', rec.id, 'name', rec.name, 'city', rec.city, 'role', rec.role,
    'photo_url', rec.photo_url, 'teams', rec.teams
  );
end;
$$;

revoke all on function public.search_legacy_players(text) from public, anon;
revoke all on function public.claim_legacy_player(uuid) from public, anon;
grant execute on function public.search_legacy_players(text) to authenticated;
grant execute on function public.claim_legacy_player(uuid) to authenticated;

-- ── 6. Public bucket for the copied profile photos ──────────────────────────
-- Files are named by the record's random uuid (not the source site's player
-- id), so they can't be enumerated. Only the service role writes here.
insert into storage.buckets (id, name, public)
values ('legacy-avatars', 'legacy-avatars', true)
on conflict (id) do nothing;
