import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, parseBackendError } from '@/lib/auth/backend'
import { normalizeAuthUser } from '@/lib/auth/normalize-user'

const LOGIN_PATH = '/api/v1/auth/login'

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
    const body = await request.json()
    const { email, password } = body

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 },
      )
    }

    const backendUrl = `${getBackendApiUrl()}${LOGIN_PATH}`
    const res = await fetch(backendUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: parseBackendError(data, 'Login failed'),
        },
        { status: res.status },
      )
    }

    const access_token = (data as { access_token?: string }).access_token
    const rawUser = (data as { user?: unknown }).user
    const user = normalizeAuthUser(rawUser)

    if (!access_token || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid response from authentication server' },
        { status: 502 },
      )
    }

    const response = NextResponse.json({
      success: true,
      access_token,
      user,
    })
    forwardSetCookie(res, response)
    return response
  } catch (error) {
    console.error('Login proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Unable to reach the server. Is the backend running?' },
      { status: 502 },
    )
  }
}
