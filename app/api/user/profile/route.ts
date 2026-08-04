import { NextRequest, NextResponse } from 'next/server'
import {
  BackendAuthError,
  fetchBackendProfile,
  updateBackendProfile,
  type UpdateProfilePayload,
} from '@/lib/auth/backend'

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
    const profile = await fetchBackendProfile(accessToken)
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 },
      )
    }
    return NextResponse.json({ success: true, profile })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load user profile'
    const status = error instanceof BackendAuthError ? error.status : 502
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

function parseUpdatePayload(body: unknown): UpdateProfilePayload | null {
  if (!body || typeof body !== 'object') return null
  const obj = body as Record<string, unknown>
  return {
    phone: typeof obj.phone === 'string' ? obj.phone : '',
    country: typeof obj.country === 'string' ? obj.country : '',
    bio: typeof obj.bio === 'string' ? obj.bio : '',
  }
}

export async function PUT(request: NextRequest) {
  const header = request.headers.get('authorization') ?? ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  const accessToken = match?.[1]?.trim()

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: 'Authorization token is required' },
      { status: 401 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 },
    )
  }

  const payload = parseUpdatePayload(body)
  if (!payload) {
    return NextResponse.json(
      { success: false, error: 'Invalid profile update payload' },
      { status: 400 },
    )
  }

  try {
    const profile = await updateBackendProfile(accessToken, payload)
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 },
      )
    }
    return NextResponse.json({ success: true, profile })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update user profile'
    const status = error instanceof BackendAuthError ? error.status : 502
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
