import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, parseBackendError } from '@/lib/auth/backend'

const RESEND_VERIFICATION_PATH = '/api/v1/auth/resend-verification'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 },
      )
    }

    const backendUrl = `${getBackendApiUrl()}${RESEND_VERIFICATION_PATH}`
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
          message: parseBackendError(data, 'Failed to resend verification code'),
        },
        { status: res.status },
      )
    }

    const message =
      typeof (data as { message?: string }).message === 'string'
        ? (data as { message: string }).message
        : 'If a pending registration or unverified account exists for that email, a new verification code has been sent.'

    return NextResponse.json({ success: true, message, data })
  } catch (error) {
    console.error('Resend verification proxy error:', error)
    return NextResponse.json(
      { success: false, message: 'Unable to reach the server. Is the backend running?' },
      { status: 502 },
    )
  }
}
