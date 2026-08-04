import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, parseBackendError } from '@/lib/auth/backend'

const FORGOT_PASSWORD_PATH = '/api/v1/auth/forgot-password'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 },
      )
    }

    const backendUrl = `${getBackendApiUrl()}${FORGOT_PASSWORD_PATH}`
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: parseBackendError(data, 'Failed to send reset email'),
        },
        { status: res.status },
      )
    }

    const message =
      typeof (data as { message?: string }).message === 'string'
        ? (data as { message: string }).message
        : 'If an account exists for that email, a password reset link has been sent.'

    return NextResponse.json({ success: true, message, data })
  } catch (error) {
    console.error('Forgot password proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Unable to reach the server. Is the backend running?' },
      { status: 502 },
    )
  }
}
