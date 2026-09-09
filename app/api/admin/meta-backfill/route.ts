import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, isAdminRequest } from '@/lib/waitlist/admin-auth'
import { normalizeMetaLead, type MetaLead } from '@/lib/meta/normalizeLead'
import { upsertMetaLead } from '@/lib/waitlist/store'

export const runtime = 'nodejs'

const GRAPH_VERSION = 'v21.0'

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const pageId = process.env.META_PAGE_ID
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN
  if (!pageId || !accessToken) {
    return NextResponse.json({ error: 'Missing META_PAGE_ID or META_PAGE_ACCESS_TOKEN' }, { status: 500 })
  }

  const formsRes = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/leadgen_forms?access_token=${accessToken}`,
  )
  const formsJson = await formsRes.json()
  if (!formsRes.ok) {
    return NextResponse.json({ error: formsJson }, { status: 500 })
  }

  let inserted = 0
  let skipped = 0

  for (const form of (formsJson.data ?? []) as { id: string }[]) {
    let url: string | null =
      `https://graph.facebook.com/${GRAPH_VERSION}/${form.id}/leads?fields=id,created_time,field_data&limit=100&access_token=${accessToken}`

    while (url) {
      const res: Response = await fetch(url)
      const json: { data?: MetaLead[]; paging?: { next?: string | null } } = await res.json()
      if (!res.ok) {
        return NextResponse.json({ error: json, partial: { inserted, skipped } }, { status: 500 })
      }

      for (const lead of json.data ?? []) {
        const row = await upsertMetaLead(normalizeMetaLead(lead))
        row ? inserted++ : skipped++
      }

      url = json.paging?.next ?? null
    }
  }

  return NextResponse.json({ status: 'done', inserted, skipped })
}
