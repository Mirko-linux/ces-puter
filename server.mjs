import express from 'express'
import { OpenAI } from 'openai'
import dotenv from 'dotenv'
import fs from 'fs'
import crypto from 'crypto'
import { RateLimiterMemory } from 'rate-limiter-flexible'

dotenv.config()

const app = express()
app.use(express.json())

// === Load config ===
let keys = {}
try {
  keys = JSON.parse(fs.readFileSync('./keys.json', 'utf-8'))
} catch {
  keys = {}
}
const MASTER_KEY = process.env.MASTER_KEY

// === /api/new-key (pubblico, va DEFINITO PRIMA del middleware) ===
app.post('/api/new-key', (req, res) => {
  const newKey = 'sk-' + crypto.randomBytes(8).toString('hex')
  keys[newKey] = true
  fs.writeFileSync('./keys.json', JSON.stringify(keys, null, 2))
  res.json({ apiKey: newKey })
})

// === Rate limiting ===
const limiter = new RateLimiterMemory({
  points: 100,
  duration: 60
})

// === Auth Middleware (solo dopo new-key)
app.use(async (req, res, next) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()

  if (!token || (!keys[token] && token !== MASTER_KEY)) {
    return res.status(401).json({ error: 'Missing or invalid API key' })
  }

  if (token !== MASTER_KEY) {
    try {
      await limiter.consume(token)
    } catch {
      return res.status(429).json({ error: 'Rate limit exceeded (100 per minute)' })
    }
  }

  req.apiKey = token
  next()
})

// === /api/chat (protetto) ===
app.post('/api/chat', async (req, res) => {
  const prompt = req.body.prompt
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
  })

  try {
    const response = await openai.chat.completions.create({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024
    })

    res.json({ response: response.choices[0].message.content })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error from model provider', details: err.message })
  }
})

// === Start server ===
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`✅ CES 360 ready at http://localhost:${port}/api/chat`)
})
