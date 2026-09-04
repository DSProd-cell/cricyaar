// Pure logic for send-push, kept separate from index.ts (which wires this
// up to Deno.serve + real env vars/secrets) so it can be unit tested without
// needing real Firebase/Supabase credentials.

export function base64url(bytes: Uint8Array): string {
  let str = btoa(String.fromCharCode(...bytes))
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function base64urlJSON(obj: unknown): string {
  return base64url(new TextEncoder().encode(JSON.stringify(obj)))
}

export function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

export function buildUnsignedJwt(clientEmail: string, nowSeconds: number): string {
  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  }
  return `${base64urlJSON(header)}.${base64urlJSON(claims)}`
}

export type GroundsWebhookPayload = {
  type: string
  table: string
  record?: { status?: string; owner_id?: string; name?: string; id?: string }
  old_record?: { status?: string }
}

export type Notification = { userId: string; title: string; body: string; data: Record<string, string> }

/** Given a Database Webhook payload from the `grounds` table, decide what
 * (if anything) to notify about. Returns null when there's nothing to send —
 * e.g. an update that isn't a status change, or a table this function
 * doesn't know how to handle. */
export function notificationForGroundsChange(payload: GroundsWebhookPayload): Notification | null {
  const rec = payload.record
  const old = payload.old_record
  if (payload.table !== 'grounds' || payload.type !== 'UPDATE' || !rec || !old) return null
  if (rec.status === 'approved' && old.status !== 'approved') {
    return {
      userId: rec.owner_id!,
      title: 'Ground approved! 🎉',
      body: `"${rec.name}" is now live and visible to players.`,
      data: { type: 'ground_approved', groundId: rec.id! },
    }
  }
  if (rec.status === 'rejected' && old.status !== 'rejected') {
    return {
      userId: rec.owner_id!,
      title: 'Ground listing needs changes',
      body: `"${rec.name}" wasn't approved — check it in My Ground.`,
      data: { type: 'ground_rejected', groundId: rec.id! },
    }
  }
  return null
}
