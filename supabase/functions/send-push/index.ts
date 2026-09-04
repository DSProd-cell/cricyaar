// send-push — Supabase Edge Function
//
// Sends a real Android push notification (via Firebase Cloud Messaging's
// HTTP v1 API) to every device a user is registered on. Called two ways:
//
//   1. Directly, with a JSON body: { userId, title, body, data? }
//   2. As a Database Webhook target on `grounds` (UPDATE) — see
//      schema_notify_ground_approved.sql — in which case it figures out
//      the notification itself from the row change (ground just approved).
//
// Requires two secrets set on the project (`supabase secrets set ...`):
//   FIREBASE_SERVICE_ACCOUNT — the full JSON of a Firebase service account
//                              key (Firebase console → Project settings →
//                              Service accounts → Generate new private key)
//   PUSH_TRIGGER_SECRET      — shared secret the database trigger must send
//   (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically
//   to every Edge Function — no need to set those.)
//
// See README.md for the deploy steps. See logic.ts for the pure, unit-tested
// parts of this (message building, JWT construction, event detection).

import { createClient } from 'npm:@supabase/supabase-js@2'
import { base64url, pemToArrayBuffer, buildUnsignedJwt, notificationForGroundsChange } from './logic.ts'

const FIREBASE_SERVICE_ACCOUNT = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
// This function is deployed with --no-verify-jwt (so the plain database
// trigger can call it without signing a JWT) — this shared secret is the
// only thing stopping a stranger who finds the URL from sending arbitrary
// pushes. Must match the `push_trigger_secret` the trigger sends.
const PUSH_TRIGGER_SECRET = Deno.env.get('PUSH_TRIGGER_SECRET')

/** Exchanges the service account's private key for a short-lived OAuth2
 * access token scoped to sending FCM messages (the standard Google service
 * account JWT bearer flow). */
async function getAccessToken(serviceAccount: { client_email: string; private_key: string }): Promise<string> {
  const unsigned = buildUnsignedJwt(serviceAccount.client_email, Math.floor(Date.now() / 1000))
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned))
  const jwt = `${unsigned}.${base64url(new Uint8Array(signature))}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`)
  const { access_token } = await res.json()
  return access_token
}

async function sendToToken(accessToken: string, projectId: string, token: string, title: string, body: string, data?: Record<string, string>) {
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      message: {
        token,
        notification: { title, body },
        data,
        // High priority so Android delivers it immediately instead of
        // batching for later. Deliberately NOT setting a channel_id: the
        // app doesn't create any custom notification channels itself, and
        // referencing one that doesn't exist on the device causes Android
        // to silently drop the notification — worse than not specifying
        // one at all, which lets Firebase's own SDK fall back to its
        // built-in default channel.
        android: { priority: 'high', notification: { sound: 'default' } },
      },
    }),
  })
  const json = await res.json()
  return { ok: res.ok, status: res.status, json }
}

Deno.serve(async (req) => {
  try {
    if (!FIREBASE_SERVICE_ACCOUNT) {
      return new Response(JSON.stringify({ error: 'FIREBASE_SERVICE_ACCOUNT secret not set' }), { status: 500 })
    }
    if (PUSH_TRIGGER_SECRET && req.headers.get('x-push-trigger-secret') !== PUSH_TRIGGER_SECRET) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })
    }
    const body = await req.json()

    // Either a direct call ({ userId, title, body }) or a Database Webhook
    // payload ({ type, table, record, old_record }) — figure out which.
    const notification = body.userId
      ? { userId: body.userId, title: body.title, body: body.body, data: body.data || {} }
      : notificationForGroundsChange(body)

    if (!notification) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', notification.userId)
    if (error) throw error
    if (!tokens?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no registered devices' }), { status: 200 })
    }

    const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT)
    const accessToken = await getAccessToken(serviceAccount)

    const results = await Promise.all(
      tokens.map((t) => sendToToken(accessToken, serviceAccount.project_id, t.token, notification.title, notification.body, notification.data)),
    )
    const sent = results.filter((r) => r.ok).length
    return new Response(JSON.stringify({ sent, total: tokens.length, results }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
