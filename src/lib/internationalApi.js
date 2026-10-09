import { supabase } from './supabase'

/**
 * Live / upcoming / recent international matches, via the `international-matches`
 * Edge Function (the provider key stays on the server).
 *
 * Resolves to [] whenever there is nothing to show — function not deployed or
 * not configured yet, provider down, offline — so the UI can simply hide the
 * section instead of surfacing an error for an optional feature.
 */
export async function fetchInternationalMatches() {
  try {
    const { data, error } = await supabase.functions.invoke('international-matches')
    if (error || !data?.configured || !Array.isArray(data.matches)) return []
    return data.matches
  } catch {
    return []
  }
}
