import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, parseBackendError } from '@/lib/auth/backend'
import { clearAllAuthCookies } from '@/lib/auth/cookies'

const LOGOUT_PATH = '/api/v1/auth/logout'

export async function POST(request: NextRequest) {
  try {
    const backendUrl = `${getBackendApiUrl()}${LOGOUT_PATH}`
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
      const response = NextResponse.json(
        {
          success: false,
          error: parseBackendError(data, 'Logout failed'),
        },
        { status: res.status },
      )
      clearAllAuthCookies(response)
      return response
    }

    const response = NextResponse.json({ success: true })
    clearAllAuthCookies(response)
    return response
  } catch (error) {
    console.error('Logout proxy error:', error)
    const response = NextResponse.json(
      { success: false, error: 'Unable to reach the server. Is the backend running?' },
      { status: 502 },
    )
    clearAllAuthCookies(response)
    return response
  }
}
