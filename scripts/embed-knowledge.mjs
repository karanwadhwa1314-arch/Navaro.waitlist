/**
 * One-time script: reads data/knowledge.json, embeds each chunk with OpenAI
 * text-embedding-3-small, writes data/knowledge-embeddings.json.
 * Run: OPENAI_API_KEY=xxx node scripts/embed-knowledge.mjs
 * Optional: add to build step so production has precomputed embeddings (saves runtime token usage).
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import OpenAI from 'openai'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const knowledgePath = join(root, 'data', 'knowledge.json')
const outPath = join(root, 'data', 'knowledge-embeddings.json')

function loadEnvFile() {
  const envPath = join(root, '.env')
  if (!existsSync(envPath)) return
  const raw = readFileSync(envPath, 'utf-8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (process.env[key] == null || process.env[key] === '') {
      process.env[key] = val
    }
  }
}

loadEnvFile()

const BATCH_SIZE = 100 // OpenAI allows up to 2048 inputs per request; we batch for safety

async function main() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('Set OPENAI_API_KEY to run this script.')
    process.exit(1)
  }

  const raw = readFileSync(knowledgePath, 'utf-8')
  const { chunks } = JSON.parse(raw)
  if (!Array.isArray(chunks) || chunks.length === 0) {
    console.error('No chunks in knowledge.json')
    process.exit(1)
  }

  const openai = new OpenAI({ apiKey })
  const embeddings = []

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)
    const texts = batch.map((c) => c.text)
    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    })
    for (let j = 0; j < batch.length; j++) {
      embeddings.push({
        id: batch[j].id,
        text: batch[j].text,
        source: batch[j].source,
        embedding: res.data[j].embedding,
      })
    }
    console.log(`Embedded ${Math.min(i + BATCH_SIZE, chunks.length)} / ${chunks.length}`)
  }

  writeFileSync(outPath, JSON.stringify({ chunks: embeddings }), 'utf-8')
  console.log(`Wrote ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
