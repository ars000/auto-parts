import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

const PORT = Number(process.env.PORT) || 8080
const API_KEY = process.env.FAVORIT_API_KEY
const UPSTREAM = process.env.FAVORIT_UPSTREAM || 'http://api.favorit-parts.ru/hs/hsprice/'

const app = express()

app.disable('x-powered-by')

app.get('/api/hsprice', async (req, res) => {
  if (!API_KEY) {
    res.status(500).json({
      error: 'На сервере не задан FAVORIT_API_KEY (см. deploy/env.server.example).',
    })
    return
  }

  const target = new URL(UPSTREAM)
  target.searchParams.set('key', API_KEY)

  for (const [name, value] of Object.entries(req.query)) {
    if (name === 'key') continue
    if (value == null || value === '') continue
    target.searchParams.set(name, String(value))
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: { Accept: 'application/json' },
    })

    const body = await upstream.text()
    const contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8'

    res.status(upstream.status).type(contentType).send(body)
  } catch {
    res.status(502).json({
      error: 'Не удалось связаться с API Favorit Parts.',
    })
  }
})

app.use(express.static(distDir, { index: false }))

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    next()
    return
  }
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) next(err)
  })
})

app.listen(PORT, () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`)
})
