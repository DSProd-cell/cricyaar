# international-matches

Feeds the **International** section on the Home screen with live, upcoming and
recent international matches. Until it is set up, the section simply does not
appear (the app never shows an error for it).

## One-time setup

1. **Get a CricAPI key** — sign up at https://cricketdata.org (free plan: about
   100 calls/day).
2. **Create the cache table** — run
   `supabase/migrations/add_international_matches_cache.sql` in the Supabase
   SQL editor.
3. **Set the key** (never put it in the app or in git):
   ```bash
   supabase secrets set CRICAPI_KEY=your-key-here --project-ref okqbagfyuizvahhpimuh
   ```
4. **Deploy** (keeps JWT verification on, so only signed-in app users can call it):
   ```bash
   supabase functions deploy international-matches --project-ref okqbagfyuizvahhpimuh
   ```

## Tuning

`INTL_CACHE_SECONDS` (default `900`) is how long one provider answer is reused.
The free plan's ~100 calls/day fits 15 minutes. On a paid plan set it lower
(for example `60`) for fresher live scores:

```bash
supabase secrets set INTL_CACHE_SECONDS=60 --project-ref okqbagfyuizvahhpimuh
```

If the provider is down or the daily quota is used up, the function serves the
last good answer instead of an error.

## Tests

The matching and reshaping logic is in `logic.ts` and is covered by
`logic.test.ts`:

```bash
node --test supabase/functions/international-matches/logic.test.ts
```
