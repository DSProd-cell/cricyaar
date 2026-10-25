// international-matches — Supabase Edge Function
//
// Serves live / upcoming / recent international and league cricket matches to
// the app. It does NOT call the cricket provider: CricAPI resets connections
// from Edge Function servers, so a scheduled database job (see
// supabase/migrations/add_cricapi_pipeline.sql) fetches the data and saves the
// raw answer in `cricapi_raw`. This function reads that row, filters and
// reshapes it (logic.ts) and returns it. No provider key is needed here.
//
// Deployed WITH JWT verification (the default), so only signed-in users of the
// app can call it. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are provided
// automatically to every Edge Function.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { pickInternational, type ProviderMatch } from './logic.ts'

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const { data: row } = await admin
    .from('cricapi_raw').select('data, fetched_at').eq('id', 1).maybeSingle()

  // Nothing fetched yet (no key stored, or the first fetch has not finished)
  if (!row?.fetched_at) return json({ configured: false, matches: [] })

  return json({
    configured: true,
    matches: pickInternational((row.data ?? []) as ProviderMatch[]),
    fetchedAt: row.fetched_at,
  })
})
