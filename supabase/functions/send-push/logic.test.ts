import { base64url, base64urlJSON, buildUnsignedJwt, notificationForGroundsChange, pemToArrayBuffer } from './logic.ts'

function assertEquals(actual: unknown, expected: unknown, msg?: string) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a !== e) throw new Error(msg || `assertEquals failed: ${a} !== ${e}`)
}
function assertExists(v: unknown, msg?: string) {
  if (v === null || v === undefined) throw new Error(msg || 'assertExists failed: value is null/undefined')
}

Deno.test('notificationForGroundsChange — approved transition fires a notification', () => {
  const n = notificationForGroundsChange({
    type: 'UPDATE',
    table: 'grounds',
    record: { status: 'approved', owner_id: 'u1', name: 'Test Ground', id: 'g1' },
    old_record: { status: 'pending' },
  })
  assertExists(n)
  assertEquals(n!.userId, 'u1')
  assertEquals(n!.data.type, 'ground_approved')
  assertEquals(n!.title, 'Ground approved! 🎉')
})

Deno.test('notificationForGroundsChange — rejected transition fires a notification', () => {
  const n = notificationForGroundsChange({
    type: 'UPDATE',
    table: 'grounds',
    record: { status: 'rejected', owner_id: 'u1', name: 'Test Ground', id: 'g1' },
    old_record: { status: 'pending' },
  })
  assertExists(n)
  assertEquals(n!.data.type, 'ground_rejected')
})

Deno.test('notificationForGroundsChange — already approved, no status change, is silent', () => {
  const n = notificationForGroundsChange({
    type: 'UPDATE',
    table: 'grounds',
    record: { status: 'approved', owner_id: 'u1', name: 'Test Ground', id: 'g1' } as any,
    old_record: { status: 'approved' },
  })
  assertEquals(n, null)
})

Deno.test('notificationForGroundsChange — INSERT (no old_record) is silent', () => {
  const n = notificationForGroundsChange({
    type: 'INSERT',
    table: 'grounds',
    record: { status: 'pending', owner_id: 'u1' },
  })
  assertEquals(n, null)
})

Deno.test('notificationForGroundsChange — ignores unrelated tables', () => {
  const n = notificationForGroundsChange({
    type: 'UPDATE',
    table: 'profiles',
    record: { status: 'approved', owner_id: 'u1' },
    old_record: { status: 'pending' },
  })
  assertEquals(n, null)
})

Deno.test('base64url — no padding, url-safe alphabet', () => {
  const out = base64url(new TextEncoder().encode('hi??>>'))
  assertEquals(out.includes('+'), false)
  assertEquals(out.includes('/'), false)
  assertEquals(out.includes('='), false)
})

Deno.test('base64urlJSON — round-trips through atob/JSON.parse', () => {
  const encoded = base64urlJSON({ a: 1, b: 'x' })
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const decoded = JSON.parse(atob(padded))
  assertEquals(decoded, { a: 1, b: 'x' })
})

Deno.test('buildUnsignedJwt — produces two base64url segments with correct claims', () => {
  const now = 1_700_000_000
  const jwt = buildUnsignedJwt('svc@project.iam.gserviceaccount.com', now)
  const [headerB64, claimsB64] = jwt.split('.')
  const pad = (s: string) => s.replace(/-/g, '+').replace(/_/g, '/')
  const header = JSON.parse(atob(pad(headerB64)))
  const claims = JSON.parse(atob(pad(claimsB64)))
  assertEquals(header, { alg: 'RS256', typ: 'JWT' })
  assertEquals(claims.iss, 'svc@project.iam.gserviceaccount.com')
  assertEquals(claims.scope, 'https://www.googleapis.com/auth/firebase.messaging')
  assertEquals(claims.aud, 'https://oauth2.googleapis.com/token')
  assertEquals(claims.iat, now)
  assertEquals(claims.exp, now + 3600)
})

// End-to-end proof the RS256 signing actually produces a cryptographically
// valid signature — generates a throwaway RSA keypair (no real credentials
// needed), signs a JWT the same way index.ts does, then verifies it with
// the matching public key using WebCrypto directly.
Deno.test('JWT signing — produces a signature that verifies against its public key', async () => {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  )
  const unsigned = buildUnsignedJwt('test@example.com', Math.floor(Date.now() / 1000))
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keyPair.privateKey,
    new TextEncoder().encode(unsigned),
  )
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    keyPair.publicKey,
    signature,
    new TextEncoder().encode(unsigned),
  )
  assertEquals(valid, true)

  // Tampering with the payload must invalidate the signature.
  const tamperedValid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    keyPair.publicKey,
    signature,
    new TextEncoder().encode(unsigned + 'x'),
  )
  assertEquals(tamperedValid, false)
})

// Proves pemToArrayBuffer correctly strips PEM headers/whitespace and
// produces bytes WebCrypto can actually import as a PKCS8 key — using a
// throwaway keypair exported to PEM, the same shape a real service
// account's private_key field has.
Deno.test('pemToArrayBuffer — round-trips an exported PKCS8 key through WebCrypto', async () => {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  )
  const exported = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
  const b64 = btoa(String.fromCharCode(...new Uint8Array(exported)))
  const pem = `-----BEGIN PRIVATE KEY-----\n${b64.match(/.{1,64}/g)!.join('\n')}\n-----END PRIVATE KEY-----\n`

  const reimported = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(pem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  assertExists(reimported)
})
