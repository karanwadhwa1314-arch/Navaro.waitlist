import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, isAdminRequest } from '@/lib/waitlist/admin-auth'
import { readEntries, toCsv } from '@/lib/waitlist/store'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const entries = await readEntries()
    const stamp = new Date().toISOString().slice(0, 10)

    return new NextResponse(toCsv(entries), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="navaro-waitlist-${stamp}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Waitlist export error:', error)
    return NextResponse.json({ success: false, error: 'Could not build the export' }, { status: 500 })
  }
}
