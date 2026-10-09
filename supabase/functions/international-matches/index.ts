// international-matches — Supabase Edge Function
//
// Returns live / upcoming / recent INTERNATIONAL cricket matches for the app's
// "International" section. It calls CricAPI (cricketdata.org) with a key that
// stays on the server, and caches the answer in a table so a thousand app
// opens cost one provider call, not a thousand.
//
// Secrets (`supabase secrets set ...`) — see README.md:
//   CRICAPI_KEY          — your CricAPI key (required; without it the function
//                          answers { configured: false } and the app hides the
//                          section instead of showing an error)
//   INTL_CACHE_SECONDS   — optional, default 900 (15 min). CricAPI's free plan
//                          allows ~100 calls/day, so 900s fits; a paid plan can
//                          use a much shorter value for fresher scores.
//
// Deployed WITH JWT verification (the default), so only signed-in users of the
// app can call it. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are provided
// automatically to every Edge Function.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { pickInternational, type ProviderMatch } from './logic.ts'

const CRICAPI_KEY = Deno.env.get('CRICAPI_KEY')
const TTL_SECONDS = Number(Deno.env.get('INTL_CACHE_SECONDS') ?? '900')
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (!CRICAPI_KEY) return json({ configured: false, matches: [] })

  const { data: cached } = await admin
    .from('international_matches_cache').select('payload, fetched_at').eq('id', 1).maybeSingle()
  const ageSeconds = cached ? (Date.now() - Date.parse(cached.fetched_at)) / 1000 : Infinity
  if (cached && ageSeconds < TTL_SECONDS) {
    return json({ configured: true, matches: cached.payload, cached: true })
  }

  try {
    const res = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`)
    const body = await res.json()
    if (!res.ok || body.status !== 'success' || !Array.isArray(body.data)) {
      throw new Error(body.reason ?? `provider returned ${res.status}`)
    }
    const matches = pickInternational(body.data as ProviderMatch[])
    await admin.from('international_matches_cache')
      .upsert({ id: 1, payload: matches, fetched_at: new Date().toISOString() })
    return json({ configured: true, matches, cached: false })
  } catch (err) {
    // Provider down or quota used up: serve the last good answer rather than nothing
    if (cached) return json({ configured: true, matches: cached.payload, cached: true, stale: true })
    return json({ configured: true, matches: [], error: String(err instanceof Error ? err.message : err) }, 502)
  }
})
