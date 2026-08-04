import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  clearLoginAttempts,
  createSessionCookie,
  getAdminPassword,
  isLoginRateLimited,
  verifyPassword,
} from '@/lib/waitlist/admin-auth'

export const runtime = 'nodejs'

/** Derive a rate-limit key from the request IP. */
function getClientId(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  const password = getAdminPassword()
  if (!password) {
    return NextResponse.json(
      { success: false, error: 'Admin access is not configured. Set WAITLIST_ADMIN_PASSWORD.' },
      { status: 503 },
    )
  }

  const clientId = getClientId(request)
  if (isLoginRateLimited(clientId)) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Try again in a few minutes.' },
      { status: 429 },
    )
  }

  const body = await request.json().catch(() => null)
  const candidate =
    body && typeof (body as Record<string, unknown>).password === 'string'
      ? ((body as Record<string, unknown>).password as string)
      : ''

  if (!candidate || !verifyPassword(candidate, password)) {
    return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 })
  }

  clearLoginAttempts(clientId)

  const session = createSessionCookie(password)
  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: session.maxAge,
  })
  return response
}
