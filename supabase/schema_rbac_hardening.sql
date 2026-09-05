-- CricYaar — RBAC hardening.
--
-- Run this once in the Supabase SQL Editor, same as the earlier files.
--
-- The UI already gates who sees "List a ground" / "Start a Match" by role,
-- but that's cosmetic — anyone with a valid login can currently call the
-- Supabase REST API directly and insert a grounds/matches row regardless of
-- their actual role, since the RLS policies only ever checked ownership
-- (auth.uid() = owner_id), never role. This closes that gap, and adds a
-- guardrail so `profiles.role`/`roles` can't be set to garbage values.

-- ── profiles: role must be one of the 5 real roles ──────────────────────────
-- Doesn't restrict WHO can switch roles or WHEN (that's deliberately open —
-- "change anytime, no OTP needed" is the intended design) — only WHAT
-- values are allowed, so a stray typo or a malicious direct API call can't
-- leave a profile in a broken state that crashes role-based UI lookups.
alter table public.profiles
  add constraint profiles_role_valid
  check (role in ('fan', 'player', 'organiser', 'umpire', 'ground_owner'));

alter table public.profiles
  add constraint profiles_roles_valid
  check (roles <@ array['fan', 'player', 'organiser', 'umpire', 'ground_owner']::text[]);

-- ── grounds: only ground owners can list a ground ───────────────────────────
drop policy if exists "Users can submit a ground under their own id" on public.grounds;
create policy "Users can submit a ground under their own id"
  on public.grounds for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and status = 'pending'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'ground_owner')
  );

-- ── matches: only umpires/organisers can start a match ──────────────────────
-- (organiser is included because that role's own description already
-- promises "create matches ... and score live" — the UI for that specific
-- flow isn't built yet, but the permission shouldn't lag behind and then
-- need a second migration once it is.)
drop policy if exists "Scorer can create their own match" on public.matches;
create policy "Scorer can create their own match"
  on public.matches for insert
  to authenticated
  with check (
    scorer_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('umpire', 'organiser'))
  );

-- ── storage: only ground owners can upload ground photos ────────────────────
-- (the avatars bucket is untouched — every role has a profile photo, so
-- there's nothing to restrict there.)
drop policy if exists "Users can upload photos under their own folder" on storage.objects;
create policy "Users can upload photos under their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'grounds'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'ground_owner')
  );
