import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { syncOneLead } from '@/lib/meta/syncLead'
import type { MetaLead } from '@/lib/meta/normalizeLead'

export const runtime = 'nodejs'

const GRAPH_VERSION = 'v21.0'

/**
 * Meta calls this once, synchronously, when you save the webhook
 * subscription in the App Dashboard. It must echo back hub.challenge
 * if hub.verify_token matches what we configured, or Meta refuses to
 * save the subscription.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && challenge && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

/**
 * Real lead notifications land here. Meta sends a lightweight payload
 * containing only leadgen_id(s) — the full lead data is fetched
 * separately via the Graph API, same as the backfill does.
 */
export async function POST(request: NextRequest) {
  // Read as raw text FIRST — the signature is computed over the exact raw
  // bytes Meta sent. Parsing to JSON and re-stringifying would produce a
  // different byte sequence and break signature verification.
  const rawBody = await request.text()

  if (!isValidSignature(rawBody, request.headers.get('x-hub-signature-256'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: {
    entry?: { changes?: { field?: string; value?: { leadgen_id?: string } }[] }[]
  }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const leadgenIds: string[] = []
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field === 'leadgen' && change.value?.leadgen_id) {
        leadgenIds.push(change.value.leadgen_id)
      }
    }
  }

  const accessToken = process.env.META_PAGE_ACCESS_TOKEN!

  for (const leadgenId of leadgenIds) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/${leadgenId}` +
          `?fields=id,created_time,field_data&access_token=${accessToken}`,
      )
      const lead: MetaLead = await res.json()
      if (!res.ok) {
        console.error('Failed to fetch lead from webhook notification:', leadgenId, lead)
        continue
      }
      await syncOneLead(lead)
    } catch (err) {
      console.error('Failed to sync lead from webhook:', leadgenId, err)
      // Do not throw — one bad lead must not affect others in the same
      // payload, and must not turn into a 500 that makes Meta retry the
      // whole batch.
    }
  }

  // Meta expects a fast 200 acknowledging receipt. Processing is done
  // inline above since volume is low (one Page, one form) — if that
  // changes, move the loop body to a background job/queue and return
  // this response immediately after just enqueueing the ids.
  return NextResponse.json({ received: true })
}

function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false
  const [algo, signature] = signatureHeader.split('=')
  if (algo !== 'sha256' || !signature) return false

  const expected = createHmac('sha256', process.env.META_APP_SECRET!).update(rawBody).digest('hex')

  const expectedBuf = Buffer.from(expected, 'hex')
  const actualBuf = Buffer.from(signature, 'hex')
  if (expectedBuf.length !== actualBuf.length) return false
  return timingSafeEqual(expectedBuf, actualBuf)
}
