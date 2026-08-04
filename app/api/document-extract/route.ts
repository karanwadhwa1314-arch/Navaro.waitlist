import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import {
  getClientId,
  isDocumentRateLimited,
  getDocumentRetryAfterSeconds,
} from '@/lib/chat/rate-limit'

const FIELD_KEYS = [
  'shipper',
  'consignee',
  'notify',
  'booking',
  'vessel',
  'pol',
  'pod',
  'container',
  'weight',
  'hs',
] as const

export type ExtractedFields = {
  shipper: string
  consignee: string
  notify: string
  booking: string
  vessel: string
  pol: string
  pod: string
  container: string
  weight: string
  hs: string
}

function getApiKey(): string | undefined {
  let key =
    process.env.DOCUMENT_EXTRACTION_API_KEY ?? process.env.OPENAI_API_KEY
  if (!key) return undefined
  key = key.trim()
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim()
  }
  return key || undefined
}

const SYSTEM_PROMPT = `You are a document parser for shipping documents (BL, SI, invoices). Extract the following fields from the given document text. Return ONLY a valid JSON object with exactly these keys (use empty string "" if not found): shipper, consignee, notify, booking, vessel, pol, pod, container, weight, hs. No markdown, no explanation.`

export async function POST(request: NextRequest) {
  const clientId = getClientId(request)
  if (isDocumentRateLimited(clientId)) {
    const retryAfter = getDocumentRetryAfterSeconds(clientId)
    return NextResponse.json(
      { error: 'Too many document extraction requests. Please try again in a minute.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    const apiKey = getApiKey()
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Document extraction API key is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const text =
      typeof body?.text === 'string' ? body.text.trim() : ''
    if (!text) {
      return NextResponse.json(
        { error: 'Request body must include "text" (extracted document text)' },
        { status: 400 }
      )
    }

    const openai = new OpenAI({ apiKey })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Document text:\n\n${text.slice(0, 12000)}`,
        },
      ],
      max_tokens: 1024,
      temperature: 0,
    })

    const raw =
      completion.choices[0]?.message?.content?.trim() ?? '{}'
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '')
    let parsed: Record<string, string>
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse extraction result' },
        { status: 500 }
      )
    }

    const result: ExtractedFields = {} as ExtractedFields
    for (const key of FIELD_KEYS) {
      const v = parsed[key]
      result[key] =
        typeof v === 'string' ? v.trim() : v != null ? String(v).trim() : ''
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Document extract API error:', error)
    const message =
      error instanceof Error ? error.message : 'Document extraction failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
