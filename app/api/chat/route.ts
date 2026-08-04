import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { REGRET_MESSAGE, buildSystemPrompt } from '@/lib/chat/config'
import {
  buildContextFromChunks,
  getContextChunks,
  hasEmbeddings,
} from '@/lib/chat/retrieve'
import {
  isRateLimited,
  getRetryAfterSeconds,
  getClientId,
} from '@/lib/chat/rate-limit'

const OPENAI_RETRY_ATTEMPTS = 3
const OPENAI_RETRY_DELAY_MS = 1000

/** Use API key as-is: trim whitespace/newlines and optional surrounding quotes from .env. */
function getOpenAIApiKey(): string | undefined {
  let raw = process.env.OPENAI_API_KEY
  if (raw == null || raw === '') return undefined
  raw = raw.trim()
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1).trim()
  }
  return raw || undefined
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Call OpenAI with retry on 429 (rate limit) and 503. */
async function openaiWithRetry<T>(
  fn: () => Promise<T>,
  attempt = 1
): Promise<T> {
  try {
    return await fn()
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status
    const isRetryable = status === 429 || status === 503
    if (isRetryable && attempt < OPENAI_RETRY_ATTEMPTS) {
      const delay = OPENAI_RETRY_DELAY_MS * Math.pow(2, attempt - 1)
      await sleep(delay)
      return openaiWithRetry(fn, attempt + 1)
    }
    throw err
  }
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request)
  if (isRateLimited(clientId)) {
    const retryAfter = getRetryAfterSeconds(clientId)
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
        },
      }
    )
  }

  try {
    const apiKey = getOpenAIApiKey()
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({ apiKey })

    const body = await request.json()
    const { message, history = [] } = body as {
      message?: string
      history?: { role: 'user' | 'assistant'; content: string }[]
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    let context: string | null = null
    let queryEmbedding: number[] | null = null

    if (hasEmbeddings()) {
      const embedRes = await openaiWithRetry(() =>
        openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: message.trim().slice(0, 8000),
        })
      )
      queryEmbedding = embedRes.data[0].embedding
    }

    const chunks = getContextChunks(queryEmbedding, message.trim())
    if (chunks.length > 0) {
      context = buildContextFromChunks(chunks)
    }

    const systemContent = buildSystemPrompt(context)

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemContent },
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    const completion = await openaiWithRetry(() =>
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 512,
      })
    )

    let response =
      completion.choices[0]?.message?.content?.trim() ?? 'No response generated.'

    if (
      response.toLowerCase().includes("i can only help with questions about navaro") &&
      (response.toLowerCase().includes("for anything else") || response.toLowerCase().includes("contact@navaro.com"))
    ) {
      response = REGRET_MESSAGE
    }

    return NextResponse.json({ response })
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    const status = (error as { status?: number })?.status
    const isRateLimit = status === 429
    const message =
      isRateLimit
        ? 'Service is busy. Please try again in a moment.'
        : error instanceof Error
          ? error.message
          : 'Unknown error'
    return NextResponse.json(
      { error: message },
      { status: isRateLimit ? 429 : 500 }
    )
  }
}
