-- Live cricket data pipeline, run entirely inside the database.
--
-- Why: CricAPI resets TLS connections from Supabase's Edge Function servers,
-- but accepts them from the database (pg_net). So a scheduled database job
-- fetches the matches and saves the raw answer; the `international-matches`
-- Edge Function only reads it, maps it and serves it to the app.
--
-- The CricAPI key is NOT in this file. Store it once in Vault:
--   select vault.create_secret('<your key>', 'cricapi_key', 'CricAPI key');
--
-- Safe to run twice.

create extension if not exists pg_cron;

-- ── One row holding the latest raw provider answer ──────────────────────────
create table if not exists public.cricapi_raw (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '[]'::jsonb,
  fetched_at timestamptz,
  hits_today int,
  hits_limit int,
  pending_request_id bigint,
  pending_since timestamptz,
  last_attempt timestamptz,
  last_error text
);
insert into public.cricapi_raw (id) values (1) on conflict (id) do nothing;
alter table public.cricapi_raw enable row level security;
revoke all on public.cricapi_raw from anon, authenticated;

-- ── Which matches the app shows (mirrors logic.ts: isWanted) ────────────────
create or replace function public.cricapi_wanted(m jsonb)
returns boolean
language sql
immutable
as $$
  select
    (
      jsonb_array_length(coalesce(m->'teams', '[]'::jsonb)) = 2
      and not exists (
        select 1 from jsonb_array_elements_text(m->'teams') t
        where btrim(regexp_replace(regexp_replace(lower(t), '\m(women|woman)\M', '', 'g'), '\s+', ' ', 'g'))
              <> all (array[
                'india','australia','england','south africa','new zealand','pakistan',
                'sri lanka','bangladesh','west indies','afghanistan','ireland','zimbabwe',
                'netherlands','scotland','nepal','united arab emirates','oman','namibia',
                'canada','united states of america','usa','papua new guinea','italy',
                'hong kong','kenya','uganda','jersey','singapore','malaysia','bermuda'])
      )
    )
    or coalesce(m->>'name', '') ~* '(indian premier league|\mipl\M|women''?s premier league|\mwpl\M|big bash|\mbbl\M|pakistan super league|\mpsl\M|\msa20\M|the hundred|caribbean premier league|\mcpl\M|lanka premier league|\mlpl\M|bangladesh premier league|\mbpl\M|international league t20|\milt20\M|major league cricket|\mmlc\M)'
$$;

-- ── How long the saved answer stays fresh (mirrors logic.ts: ttlFor) ────────
-- Free CricAPI allows ~100 calls/day, so refresh often only when something we
-- show is live (8 min) or about to start (10 min); otherwise hourly.
create or replace function public.cricapi_ttl_seconds(d jsonb)
returns int
language sql
stable
as $$
  select case
    when exists (
      select 1 from jsonb_array_elements(d) m
      where public.cricapi_wanted(m)
        and coalesce((m->>'matchStarted')::boolean, false)
        and not coalesce((m->>'matchEnded')::boolean, false)
    ) then 480
    when exists (
      select 1 from jsonb_array_elements(d) m
      where public.cricapi_wanted(m)
        and not coalesce((m->>'matchStarted')::boolean, false)
        and m->>'dateTimeGMT' is not null
        and (regexp_replace(m->>'dateTimeGMT', 'Z$', '') || 'Z')::timestamptz - now() <  interval '2 hours'
        and (regexp_replace(m->>'dateTimeGMT', 'Z$', '') || 'Z')::timestamptz - now() > interval '-1 hour'
    ) then 600
    else 3600
  end
$$;

-- ── The job: collect a finished request, then start a new one if due ────────
-- pg_net is asynchronous, so this runs every minute: one step collects the
-- reply to the previous request, the other starts a request when the saved
-- answer has gone stale. Most runs do nothing.
create or replace function public.refresh_cricapi()
returns text
language plpgsql
security definer
set search_path = public, net, vault
as $$
declare
  r public.cricapi_raw%rowtype;
  resp record;
  body jsonb;
  k text;
  ttl int;
  rid bigint;
begin
  select * into r from public.cricapi_raw where id = 1 for update;

  -- 1. collect the reply to the previous request
  if r.pending_request_id is not null then
    select * into resp from net._http_response where id = r.pending_request_id;
    if found then
      begin
        body := resp.content::jsonb;
      exception when others then
        body := null;
      end;
      if resp.status_code = 200 and body is not null and body->>'status' = 'success' and jsonb_typeof(body->'data') = 'array' then
        update public.cricapi_raw set
          data = body->'data', fetched_at = now(),
          hits_today = (body#>>'{info,hitsToday}')::int, hits_limit = (body#>>'{info,hitsLimit}')::int,
          pending_request_id = null, pending_since = null, last_error = null
        where id = 1;
      else
        update public.cricapi_raw set
          pending_request_id = null, pending_since = null,
          last_error = left(regexp_replace(coalesce(resp.error_msg, 'HTTP ' || coalesce(resp.status_code::text, '?') || ' ' || coalesce(body->>'reason', left(resp.content, 100), '')), 'apikey=[^&\s)]+', 'apikey=***', 'gi'), 200)
        where id = 1;
      end if;
    elsif r.pending_since < now() - interval '2 minutes' then
      update public.cricapi_raw set pending_request_id = null, pending_since = null, last_error = 'request timed out' where id = 1;
    else
      return 'waiting';
    end if;
    select * into r from public.cricapi_raw where id = 1;
  end if;

  -- 2. start a new request when the saved answer is stale
  select decrypted_secret into k from vault.decrypted_secrets where name = 'cricapi_key';
  if k is null then return 'no key'; end if;

  ttl := case when r.fetched_at is null then 0 else public.cricapi_ttl_seconds(r.data) end;
  if r.fetched_at is not null and extract(epoch from now() - r.fetched_at) < ttl then return 'fresh'; end if;

  -- back off for 2 minutes after any attempt, so a failure is not retried every minute
  if r.last_attempt is not null and now() - r.last_attempt < interval '2 minutes' then return 'backing off'; end if;

  -- stay clear of the provider's daily limit (counted per UTC day)
  if r.hits_limit is not null and r.hits_today is not null and r.fetched_at is not null
     and (r.fetched_at at time zone 'utc')::date = (now() at time zone 'utc')::date
     and r.hits_today >= r.hits_limit - 3 then
    return 'daily limit nearly reached';
  end if;

  rid := net.http_get(
    url := 'https://api.cricapi.com/v1/currentMatches?apikey=' || k || '&offset=0',
    timeout_milliseconds := 15000
  );
  update public.cricapi_raw set pending_request_id = rid, pending_since = now(), last_attempt = now() where id = 1;
  return 'requested';
end;
$$;

revoke all on function public.refresh_cricapi() from public, anon, authenticated;

-- ── Run it every minute ─────────────────────────────────────────────────────
select cron.unschedule('refresh-cricapi') where exists (select 1 from cron.job where jobname = 'refresh-cricapi');
select cron.schedule('refresh-cricapi', '* * * * *', 'select public.refresh_cricapi()');
