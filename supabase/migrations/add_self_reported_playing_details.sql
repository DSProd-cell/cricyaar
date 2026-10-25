-- Playing details a player can enter themselves on "Fetch Past Records" when
-- no matching record exists. The career numbers reuse the existing
-- profiles.legacy_* columns; these add the rest of what a record card shows
-- (playing role, club) plus where the numbers came from, so self-entered
-- stats can later be told apart from claimed or scored ones.
-- Safe to run twice.

alter table public.profiles
  add column if not exists playing_role text,
  add column if not exists club_name text,
  add column if not exists legacy_source text;

alter table public.profiles drop constraint if exists profiles_playing_role_valid;
alter table public.profiles
  add constraint profiles_playing_role_valid
  check (playing_role is null or playing_role in ('Batter', 'Bowler', 'All-rounder', 'Wicketkeeper'));

alter table public.profiles drop constraint if exists profiles_legacy_source_valid;
alter table public.profiles
  add constraint profiles_legacy_source_valid
  check (legacy_source is null or legacy_source in ('self', 'claimed'));
