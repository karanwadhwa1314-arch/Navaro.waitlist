import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, isAdminRequest, isCronRequest } from '@/lib/waitlist/admin-auth'
import type { MetaLead } from '@/lib/meta/normalizeLead'
import { syncOneLead, type SyncOutcome } from '@/lib/meta/syncLead'

export const runtime = 'nodejs'

const GRAPH_VERSION = 'v21.0'

type LeadgenFormsResponse = { data?: { id: string }[]; error?: unknown }
type LeadsResponse = { data?: MetaLead[]; paging?: { next?: string }; error?: unknown }

type Outcome = SyncOutcome | 'error'

export async function POST(request: NextRequest) {
  const isAdmin = isAdminRequest(request.cookies.get(ADMIN_COOKIE)?.value)
  const isCron = isCronRequest(request)
  if (!isAdmin && !isCron) {
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
            const outcome = await syncOneLead(lead)
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
