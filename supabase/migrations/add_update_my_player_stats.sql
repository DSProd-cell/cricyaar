-- Lets a signed-in user save self-reported career numbers (matches / runs /
-- wickets) from the "Update your profile details" section of PlayerMatch.
--
-- player_stats is write-protected for client roles (see
-- schema_legacy_players.sql), so this goes through a SECURITY DEFINER function
-- that can only ever touch the caller's own row. It rejects absurd numbers,
-- and refuses once the user has claimed a legacy record, so self-typed numbers
-- can never overwrite imported ones. Safe to run twice.

create or replace function public.update_my_player_stats(
  p_matches int, p_runs int, p_wickets int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Sign in required' using errcode = '28000';
  end if;

  if p_matches is null or p_runs is null or p_wickets is null
     or p_matches < 0 or p_runs < 0 or p_wickets < 0
     or p_matches > 5000 or p_runs > 100000 or p_wickets > 5000 then
    raise exception 'Those numbers look wrong. Please check and try again.';
  end if;

  if exists (select 1 from public.profiles where id = uid and legacy_player_id is not null) then
    raise exception 'Your stats come from your linked player record and can''t be edited here.';
  end if;

  insert into public.player_stats (user_id, matches, runs, wickets)
  values (uid, p_matches, p_runs, p_wickets)
  on conflict (user_id) do update set
    matches = excluded.matches, runs = excluded.runs, wickets = excluded.wickets,
    updated_at = now();
end;
$$;

revoke all on function public.update_my_player_stats(int, int, int) from public, anon;
grant execute on function public.update_my_player_stats(int, int, int) to authenticated;
