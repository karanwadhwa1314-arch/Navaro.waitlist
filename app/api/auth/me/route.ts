import { NextRequest, NextResponse } from 'next/server'
import { BackendAuthError, fetchBackendCurrentUser } from '@/lib/auth/backend'

export async function GET(request: NextRequest) {
  const header = request.headers.get('authorization') ?? ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  const accessToken = match?.[1]?.trim()

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: 'Authorization token is required' },
      { status: 401 },
    )
  }

  try {
    const user = await fetchBackendCurrentUser(accessToken)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      )
    }
    return NextResponse.json({ success: true, user })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load current user'
    const status = error instanceof BackendAuthError ? error.status : 502
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
