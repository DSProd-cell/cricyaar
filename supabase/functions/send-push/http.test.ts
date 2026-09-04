// Integration-level test of index.ts's HTTP handling (auth/secret check,
// missing-config handling) — run as a subprocess so env vars are isolated
// per test case, hitting the real Deno.serve() over localhost.

function assertEquals(actual: unknown, expected: unknown, msg?: string) {
  if (actual !== expected) throw new Error(msg || `assertEquals failed: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`)
}

async function runServer(env: Record<string, string>, requestFn: (port: number) => Promise<void>) {
  const port = 8700 + Math.floor(Math.random() * 200)
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ['run', '--allow-net', '--allow-env', '--no-check', 'index.ts'],
    env: { ...env, DENO_SERVE_PORT: String(port) },
    stdout: 'piped',
    stderr: 'piped',
  })
  // index.ts uses Deno.serve() with no explicit port — Supabase's runtime
  // picks the port via convention; for a bare `deno run` it defaults to
  // 8000. Override via the --port-less API isn't available without editing
  // the file, so this test starts it directly and assumes port 8000,
  // retrying briefly until it's up.
  const child = cmd.spawn()
  try {
    let up = false
    for (let i = 0; i < 40 && !up; i++) {
      await new Promise((r) => setTimeout(r, 100))
      try {
        await fetch('http://localhost:8000/', { method: 'POST', body: '{}' })
        up = true
      } catch {
        // not up yet
      }
    }
    if (!up) throw new Error('server did not start in time')
    await requestFn(8000)
  } finally {
    child.kill()
    await child.status
  }
}

Deno.test('missing FIREBASE_SERVICE_ACCOUNT secret → 500 with a clear error', async () => {
  await runServer(
    { SUPABASE_URL: 'http://example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'x' },
    async () => {
      const res = await fetch('http://localhost:8000/', { method: 'POST', body: '{}' })
      assertEquals(res.status, 500)
      const json = await res.json()
      assertEquals(json.error, 'FIREBASE_SERVICE_ACCOUNT secret not set')
    },
  )
})

Deno.test('wrong x-push-trigger-secret header → 401', async () => {
  await runServer(
    {
      SUPABASE_URL: 'http://example.invalid',
      SUPABASE_SERVICE_ROLE_KEY: 'x',
      FIREBASE_SERVICE_ACCOUNT: '{"project_id":"p","client_email":"e","private_key":"k"}',
      PUSH_TRIGGER_SECRET: 'the-real-secret',
    },
    async () => {
      const res = await fetch('http://localhost:8000/', {
        method: 'POST',
        headers: { 'x-push-trigger-secret': 'wrong-guess' },
        body: '{}',
      })
      assertEquals(res.status, 401)
    },
  )
})

Deno.test('correct secret + irrelevant grounds change → 200 skipped:true, no crash', async () => {
  await runServer(
    {
      SUPABASE_URL: 'http://example.invalid',
      SUPABASE_SERVICE_ROLE_KEY: 'x',
      FIREBASE_SERVICE_ACCOUNT: '{"project_id":"p","client_email":"e","private_key":"k"}',
      PUSH_TRIGGER_SECRET: 'the-real-secret',
    },
    async () => {
      const res = await fetch('http://localhost:8000/', {
        method: 'POST',
        headers: { 'x-push-trigger-secret': 'the-real-secret', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'UPDATE',
          table: 'grounds',
          record: { status: 'pending', owner_id: 'u1' },
          old_record: { status: 'pending' },
        }),
      })
      assertEquals(res.status, 200)
      const json = await res.json()
      assertEquals(json.skipped, true)
    },
  )
})

Deno.test('approved transition reaches DB lookup and fails gracefully (not a crash)', async () => {
  await runServer(
    {
      SUPABASE_URL: 'http://127.0.0.1:1',
      SUPABASE_SERVICE_ROLE_KEY: 'x',
      FIREBASE_SERVICE_ACCOUNT: '{"project_id":"p","client_email":"e","private_key":"k"}',
      PUSH_TRIGGER_SECRET: 'the-real-secret',
    },
    async () => {
      const res = await fetch('http://localhost:8000/', {
        method: 'POST',
        headers: { 'x-push-trigger-secret': 'the-real-secret', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'UPDATE',
          table: 'grounds',
          record: { status: 'approved', owner_id: 'u1', name: 'Test Ground', id: 'g1' },
          old_record: { status: 'pending' },
        }),
      })
      // Unreachable Supabase URL -> the function should still respond with
      // a clean 500 + error message, never hang or crash the process.
      assertEquals(res.status, 500)
      const json = await res.json()
      assertEquals(typeof json.error, 'string')
    },
  )
})
