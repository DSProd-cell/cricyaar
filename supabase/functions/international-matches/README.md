# international-matches

Feeds the **Live Cricket** strip on the Home screens with live, upcoming and
recent international and league matches.

## How it works

CricAPI resets TLS connections coming from Edge Function servers, but accepts
them from the database. So the fetching is done by the database, and this
function only serves what was saved:

1. A `pg_cron` job (`refresh-cricapi`, every minute) runs `refresh_cricapi()`.
   Most runs do nothing; it asks CricAPI (through `pg_net`) only when the saved
   answer is stale, then saves the raw reply in `cricapi_raw`.
2. This function reads that row, filters and reshapes it with `logic.ts`, and
   returns it to signed-in app users. It needs no provider key.
3. The app shows nothing until the first fetch has been saved.

## Setup (one time)

1. Run `supabase/migrations/add_cricapi_pipeline.sql` (creates the table, the
   job and the schedule).
2. Store your CricAPI key encrypted in Vault. It is never in code or in git:
   ```sql
   select vault.create_secret('YOUR-CRICAPI-KEY', 'cricapi_key', 'CricAPI key');
   ```
   To replace it later: `select vault.update_secret(id, 'NEW-KEY') from vault.secrets where name = 'cricapi_key';`
3. Deploy this function:
   ```bash
   supabase functions deploy international-matches --project-ref okqbagfyuizvahhpimuh
   ```

## What it shows

International matches (full members and the regular associates, men's and
women's; A-teams and age-group sides are excluded) plus IPL, WPL, BBL, PSL,
SA20, The Hundred, CPL, LPL, BPL, ILT20 and MLC. League matches get a tag and
their own filter chip in the app.

## Staying inside the free plan

CricAPI's free plan allows about 100 calls a day and one fetch serves every
user. `cricapi_ttl_seconds()` sets how long the saved answer stays fresh: 8
minutes while something we show is live, 10 when one starts within 2 hours,
otherwise hourly. That is about 25 calls on a quiet day and about 85 on a full
8-hour IPL double-header day, and the job stops requesting when the provider
reports the limit is nearly reached. A failed fetch keeps serving the last good
answer; `cricapi_raw.last_error` says why (the key is masked).

Check on it:

```sql
select fetched_at, hits_today, hits_limit, last_error from public.cricapi_raw;
```

The SQL (`cricapi_wanted`, `cricapi_ttl_seconds`) mirrors `logic.ts`
(`isWanted`, `ttlFor`), so change both together.

## Tests

The matching and reshaping logic is in `logic.ts` and is covered by
`logic.test.ts`:

```bash
node --test supabase/functions/international-matches/logic.test.ts
```
