import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, parseBackendError } from '@/lib/auth/backend'

const VERIFY_EMAIL_PATH = '/api/v1/auth/verify-email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email?.trim() || !otp) {
      return NextResponse.json(
        { status: false, message: 'Email and OTP are required' },
        { status: 400 },
      )
    }

    const backendUrl = `${getBackendApiUrl()}${VERIFY_EMAIL_PATH}`
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        otp: String(otp).trim(),
      }),
    })

    const data = await res.json().catch(() => ({}))

    const status = (data as { status?: boolean }).status === true
    const message =
      typeof (data as { message?: string }).message === 'string'
        ? (data as { message: string }).message
        : parseBackendError(data, 'Verification failed')

    return NextResponse.json({ status, message }, { status: res.ok ? 200 : res.status })
  } catch (error) {
    console.error('Verify email proxy error:', error)
    return NextResponse.json(
      { status: false, message: 'Unable to reach the server. Is the backend running?' },
      { status: 502 },
    )
  }
}
