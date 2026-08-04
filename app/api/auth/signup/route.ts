import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiUrl, parseBackendError } from '@/lib/auth/backend'

const REGISTER_PATH = '/api/v1/auth/register'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, confirm_password } = body

    if (!name?.trim() || !email?.trim() || !password || !confirm_password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password, and confirm password are required' },
        { status: 400 },
      )
    }

    if (password !== confirm_password) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 },
      )
    }

    const backendUrl = `${getBackendApiUrl()}${REGISTER_PATH}`
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
        confirm_password,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: parseBackendError(data, 'Registration failed'),
        },
        { status: res.status },
      )
    }

    const message =
      typeof (data as { message?: string }).message === 'string'
        ? (data as { message: string }).message
        : undefined

    return NextResponse.json({ success: true, message, data })
  } catch (error) {
    console.error('Signup proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Unable to reach the server. Is the backend running?' },
      { status: 502 },
    )
  }
}
