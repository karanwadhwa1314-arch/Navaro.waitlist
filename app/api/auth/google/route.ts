import { NextResponse } from 'next/server'
import { getBackendApiUrl } from '@/lib/auth/backend'

export const dynamic = 'force-dynamic'

const GOOGLE_AUTH_PATH = '/api/v1/auth/google'

export async function GET() {
  const base = getBackendApiUrl()

  if (!base) {
    return NextResponse.json(
      { error: 'Backend API URL is not configured' },
      { status: 503 },
    )
  }

  return NextResponse.redirect(`${base}${GOOGLE_AUTH_PATH}`)
}
