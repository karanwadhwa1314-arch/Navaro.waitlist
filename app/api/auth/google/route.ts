import { NextResponse } from 'next/server'
import { getBackendApiUrl } from '@/lib/auth/backend'

const GOOGLE_AUTH_PATH = '/api/v1/auth/google'

export async function GET() {
  return NextResponse.redirect(`${getBackendApiUrl()}${GOOGLE_AUTH_PATH}`)
}
