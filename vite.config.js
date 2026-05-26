import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ── v3: Anthropic API proxy ────────────────────────────────────────────────
// Runs server-side in Vite dev server — no CORS issues, API key never exposed.
const anthropicProxy = {
  name: 'anthropic-proxy',
  configureServer(server) {
    server.middlewares.use('/api/ground-assistant', (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405; res.end('Method Not Allowed'); return
      }
      const chunks = []
      req.on('data', c => chunks.push(c))
      req.on('end', async () => {
        try {
          const body   = JSON.parse(Buffer.concat(chunks).toString())
          const apiKey = process.env.ANTHROPIC_API_KEY

          // Demo-mode fallback when key not configured
          if (!apiKey || apiKey === 'your-key-here') {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ demo: true }))
            return
          }

          const r = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-5',
              max_tokens: 1000,
              system: [
                'You are a helpful cricket ground finder for Cricmate, an Indian cricket management app.',
                'Answer ONLY questions about finding cricket grounds in India.',
                'Ground database:',
                JSON.stringify(body.groundContext || []),
                'Keep responses under 120 words. Bold ground names using **Name**.',
                'If asked anything unrelated to cricket grounds, respond exactly: "I can only help with finding grounds on Cricmate."',
              ].join('\n'),
              messages: body.messages,
            }),
          })
          const data = await r.json()
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        } catch (e) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: e.message }))
        }
      })
    })
  },
}

export default defineConfig({
  plugins: [react(), anthropicProxy],
  server: { port: 3092, host: true },
})
