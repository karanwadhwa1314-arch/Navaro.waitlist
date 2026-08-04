import { NextRequest, NextResponse } from 'next/server'
import { BackendAuthError, fetchBackendCargoInsuranceDocumentComments } from '@/lib/auth/backend'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const header = request.headers.get('authorization') ?? ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  const accessToken = match?.[1]?.trim()

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: 'Authorization token is required' },
      { status: 401 },
    )
  }

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Document id is required' }, { status: 400 })
  }

  try {
    const comments = await fetchBackendCargoInsuranceDocumentComments(accessToken, id.trim())
    return NextResponse.json({ success: true, comments })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load document comments'
    const status = error instanceof BackendAuthError ? error.status : 502
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
