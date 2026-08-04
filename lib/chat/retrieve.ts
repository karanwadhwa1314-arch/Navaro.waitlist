/**
 * Load knowledge base (with embeddings if available) and retrieve chunks
 * by embedding similarity. Optimized for token usage: only relevant chunks
 * are passed to the LLM.
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import {
  SIMILARITY_THRESHOLD,
  TOP_K_CHUNKS,
  MAX_CONTEXT_CHARS,
} from './config'

export type KnowledgeChunk = {
  id: string
  text: string
  source: string
  embedding?: number[]
}

let cachedChunks: KnowledgeChunk[] | null = null

function loadKnowledgeBase(): KnowledgeChunk[] {
  if (cachedChunks) return cachedChunks
  const root = process.cwd()
  const embeddingsPath = join(root, 'data', 'knowledge-embeddings.json')
  const knowledgePath = join(root, 'data', 'knowledge.json')
  try {
    if (existsSync(embeddingsPath)) {
      const raw = readFileSync(embeddingsPath, 'utf-8')
      const data = JSON.parse(raw) as { chunks: KnowledgeChunk[] }
      cachedChunks = data.chunks
      return cachedChunks!
    }
  } catch (_) {
    // fallback
  }
  try {
    const raw = readFileSync(knowledgePath, 'utf-8')
    const data = JSON.parse(raw) as { chunks: { id: string; text: string; source: string }[] }
    cachedChunks = data.chunks.map((c) => ({ ...c }))
    return cachedChunks!
  } catch (e) {
    console.error('Failed to load knowledge base:', e)
    cachedChunks = []
    return []
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

/**
 * Returns chunks that have embeddings and have similarity >= threshold,
 * sorted by score descending, limited to TOP_K and MAX_CONTEXT_CHARS.
 */
export function getRelevantChunks(
  queryEmbedding: number[],
  options: {
    threshold?: number
    topK?: number
    maxChars?: number
  } = {}
): { text: string; source: string }[] {
  const threshold = options.threshold ?? SIMILARITY_THRESHOLD
  const topK = options.topK ?? TOP_K_CHUNKS
  const maxChars = options.maxChars ?? MAX_CONTEXT_CHARS
  const chunks = loadKnowledgeBase()
  const withEmbeddings = chunks.filter((c): c is KnowledgeChunk & { embedding: number[] } =>
    Array.isArray(c.embedding) && c.embedding.length > 0
  )
  if (withEmbeddings.length === 0) return []

  const scored = withEmbeddings.map((c) => ({
    ...c,
    score: cosineSimilarity(c.embedding, queryEmbedding),
  }))
  const above = scored.filter((s) => s.score >= threshold).sort((a, b) => b.score - a.score)
  const selected = above.slice(0, topK)
  let totalChars = 0
  const out: { text: string; source: string }[] = []
  for (const s of selected) {
    if (totalChars + s.text.length > maxChars) break
    out.push({ text: s.text, source: s.source })
    totalChars += s.text.length
  }
  return out
}

/**
 * Build a single context string from retrieved chunks for the system prompt.
 */
export function buildContextFromChunks(
  chunks: { text: string; source: string }[]
): string {
  return chunks
    .map((c) => `[${c.source}]\n${c.text}`)
    .join('\n\n')
}

export function hasEmbeddings(): boolean {
  const chunks = loadKnowledgeBase()
  return chunks.some((c) => Array.isArray(c.embedding) && c.embedding.length > 0)
}

const TOOL_LISTING_PATTERN =
  /\b(tools?|calculators?|features|services|offerings|what do you (have|offer)|what can you help|navaro tools)\b/i
const LANDED_COST_PATTERN =
  /\b(landed\s*cost|landed\s*price|sell\s*price|import\s*cost|margin|markup|freight\s*allocation)\b/i

/** Keyword fallback when embeddings file is missing or similarity returns nothing. */
export function getRelevantChunksByKeywords(
  query: string,
  options: { topK?: number; maxChars?: number } = {}
): { text: string; source: string }[] {
  const topK = options.topK ?? TOP_K_CHUNKS
  const maxChars = options.maxChars ?? MAX_CONTEXT_CHARS
  const chunks = loadKnowledgeBase()
  if (chunks.length === 0) return []

  const q = query.toLowerCase()
  const words = q.split(/\W+/).filter((w) => w.length > 2)
  const toolListing = TOOL_LISTING_PATTERN.test(query)
  const landedFocus = LANDED_COST_PATTERN.test(query)

  const scored = chunks.map((c) => {
    let score = 0
    const text = c.text.toLowerCase()
    const id = c.id.toLowerCase()
    for (const w of words) {
      if (text.includes(w)) score += 2
      if (id.includes(w)) score += 4
    }
    if (toolListing) {
      if (id.startsWith('tools-') || id === 'tools-intro' || id === 'home-featured-tools') score += 6
    }
    if (landedFocus && id.includes('landed')) score += 12
    return { chunk: c, score }
  })

  let selected = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.chunk)

  if (selected.length === 0 && (toolListing || landedFocus)) {
    const priorityIds = landedFocus
      ? ['tools-landed-cost', 'tools-landed-cost-access', 'tools-intro', 'home-featured-tools']
      : ['tools-intro', 'home-featured-tools', 'tools-landed-cost', 'tools-cbm', 'tools-duty']
    selected = chunks.filter((c) => priorityIds.includes(c.id))
  }

  const out: { text: string; source: string }[] = []
  let totalChars = 0
  for (const c of selected.slice(0, topK)) {
    if (totalChars + c.text.length > maxChars) break
    out.push({ text: c.text, source: c.source })
    totalChars += c.text.length
  }
  return out
}

/** Embeddings when available; otherwise keyword search over knowledge.json. */
export function getContextChunks(
  queryEmbedding: number[] | null,
  queryText: string
): { text: string; source: string }[] {
  if (queryEmbedding && hasEmbeddings()) {
    const fromEmbed = getRelevantChunks(queryEmbedding)
    if (fromEmbed.length > 0) return fromEmbed
  }
  return getRelevantChunksByKeywords(queryText)
}
