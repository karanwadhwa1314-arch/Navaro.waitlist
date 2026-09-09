import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { normalizeMetaLead, type MetaLead } from '@/lib/meta/normalizeLead'
import { upsertMetaLead } from '@/lib/waitlist/store'

export const runtime = 'nodejs'

const GRAPH_VERSION = 'v21.0'

// --- Handshake: Meta calls this once when you register the webhook URL ---
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

// --- Real lead events ---
export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // Verify the request actually came from Meta before trusting it.
  const signature = request.headers.get('x-hub-signature-256')
  const appSecret = process.env.META_APP_SECRET
  if (!signature || !appSecret) {
    return NextResponse.json({ error: 'Missing signature or app secret' }, { status: 401 })
  }
  const expected =
    'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')
  const signatureBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expected)
  if (signatureBuf.length !== expectedBuf.length) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  const valid = crypto.timingSafeEqual(signatureBuf, expectedBuf)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = JSON.parse(rawBody)
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'leadgen') continue
      const leadgenId = change.value?.leadgen_id
      if (!leadgenId) continue

      try {
        const leadRes = await fetch(
          `https://graph.facebook.com/${GRAPH_VERSION}/${leadgenId}?fields=id,created_time,field_data&access_token=${accessToken}`,
        )
        const lead = (await leadRes.json()) as MetaLead
        if (!leadRes.ok) {
          console.error('Failed to fetch lead detail:', lead)
          continue
        }
        await upsertMetaLead(normalizeMetaLead(lead))
      } catch (err) {
        console.error('Error processing leadgen webhook entry:', err)
        // Swallow — don't let one bad lead block Meta's ack or retry storm.
      }
    }
  }

  // Meta expects a fast 200 ack regardless of internal processing detail.
  return NextResponse.json({ received: true })
}
