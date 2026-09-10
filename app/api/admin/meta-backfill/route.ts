import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, isAdminRequest } from '@/lib/waitlist/admin-auth'
import { normalizeMetaLead, type MetaLead } from '@/lib/meta/normalizeLead'
import { findEntriesByEmail, markWelcomeEmailSent, upsertMetaLead } from '@/lib/waitlist/store'
import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail'

export const runtime = 'nodejs'

const GRAPH_VERSION = 'v21.0'

type LeadgenFormsResponse = { data?: { id: string }[]; error?: unknown }
type LeadsResponse = { data?: MetaLead[]; paging?: { next?: string }; error?: unknown }

type Outcome = 'inserted_and_emailed' | 'emailed_existing' | 'already_welcomed' | 'error'

/**
 * Handles a single normalized lead end to end: decides whether it's a new
 * person, an existing-but-never-emailed person, or an already-welcomed
 * person, and acts accordingly. See spec Section 5 for the decision tree.
 */
async function syncOneLead(lead: ReturnType<typeof normalizeMetaLead>): Promise<Outcome> {
  const existing = await findEntriesByEmail(lead.email)
  const alreadyWelcomed = existing.some((entry) => entry.welcomeEmailSentAt !== null)

  if (alreadyWelcomed) {
    return 'already_welcomed'
  }

  if (existing.length > 0) {
    // Row(s) exist (e.g. from the website form) but none were ever emailed.
    // Don't create a duplicate row — just send the email and stamp the most
    // recent existing row.
    const latest = existing[0]
    if (!latest) return 'error'
    const sent = await sendWelcomeEmail(latest.firstName, lead.email)
    if (sent) await markWelcomeEmailSent(latest.id)
    return 'emailed_existing'
  }

  // Genuinely new person.
  const row = await upsertMetaLead(lead)
  if (!row) {
    // Race: meta_lead_id already existed (backfill re-run). Nothing to do.
    return 'already_welcomed'
  }
  const sent = await sendWelcomeEmail(row.firstName, row.email)
  if (sent) await markWelcomeEmailSent(row.id)
  return 'inserted_and_emailed'
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const pageId = process.env.META_PAGE_ID
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN
  if (!pageId || !accessToken) {
    return NextResponse.json(
      { success: false, error: 'Missing META_PAGE_ID or META_PAGE_ACCESS_TOKEN' },
      { status: 500 },
    )
  }

  const counts: Record<Outcome, number> = {
    inserted_and_emailed: 0,
    emailed_existing: 0,
    already_welcomed: 0,
    error: 0,
  }

  try {
    const formsRes = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/leadgen_forms?access_token=${accessToken}`,
    )
    const formsJson: LeadgenFormsResponse = await formsRes.json()
    if (!formsRes.ok || formsJson.error) {
      return NextResponse.json({ success: false, error: formsJson.error ?? formsJson }, { status: 500 })
    }

    for (const form of formsJson.data ?? []) {
      let url: string | null =
        `https://graph.facebook.com/${GRAPH_VERSION}/${form.id}/leads` +
        `?fields=id,created_time,field_data&limit=100&access_token=${accessToken}`

      while (url) {
        const res = await fetch(url)
        const json: LeadsResponse = await res.json()
        if (!res.ok || json.error) {
          return NextResponse.json(
            { success: false, error: json.error ?? json, partial: counts },
            { status: 500 },
          )
        }

        for (const lead of json.data ?? []) {
          try {
            const outcome = await syncOneLead(normalizeMetaLead(lead))
            counts[outcome]++
          } catch (leadError) {
            console.error('Failed to sync one lead:', lead.id, leadError)
            counts.error++
          }
        }

        url = json.paging?.next ?? null
      }
    }

    return NextResponse.json({ success: true, ...counts })
  } catch (error) {
    console.error('Meta backfill error:', error)
    return NextResponse.json(
      { success: false, error: 'Backfill failed', partial: counts },
      { status: 500 },
    )
  }
}
