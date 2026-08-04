import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, parseBackendError } from '@/lib/auth/backend'
import { normalizeAuthUser } from '@/lib/auth/normalize-user'

const REFRESH_PATH = '/api/v1/auth/refresh'

function forwardSetCookie(from: Response, to: NextResponse): void {
  const getSetCookie = (from.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie
  const cookies = getSetCookie?.() ?? []
  const fallback = from.headers.get('set-cookie')

  for (const cookie of cookies.length > 0 ? cookies : fallback ? [fallback] : []) {
    to.headers.append('Set-Cookie', cookie)
  }
}

export async function POST(request: NextRequest) {
  try {
    const backendUrl = `${getBackendApiUrl()}${REFRESH_PATH}`
    const cookie = request.headers.get('cookie')
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
      },
      credentials: 'include',
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: parseBackendError(data, 'Failed to refresh session'),
        },
        { status: res.status },
      )
    }

    const access_token = (data as { access_token?: string }).access_token
    const rawUser = (data as { user?: unknown }).user
    const user = rawUser ? normalizeAuthUser(rawUser) : null

    if (!access_token) {
      return NextResponse.json(
        { success: false, error: 'Invalid response from authentication server' },
        { status: 502 },
      )
    }

    const response = NextResponse.json({
      success: true,
      access_token,
      ...(user ? { user } : {}),
    })

    forwardSetCookie(res, response)

    return response
  } catch (error) {
    console.error('Refresh proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Unable to reach the server. Is the backend running?' },
      { status: 502 },
    )
  }
}
