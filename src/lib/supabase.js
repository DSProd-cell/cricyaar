import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Fails loudly at startup instead of a confusing runtime error deep in a screen
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Add them to .env.local (see .env.example).'
  )
}

export const supabase = createClient(url, anonKey)

/** E.164 for Supabase Auth ("+91 9876543210" -> "+919876543210"). */
export const toE164 = (phone) => (phone || '').replace(/\s+/g, '')
