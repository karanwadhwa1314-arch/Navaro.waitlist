import { NextRequest, NextResponse } from 'next/server'
import { BackendAuthError, uploadBackendProfileAvatar } from '@/lib/auth/backend'
import { validateAvatarFile } from '@/lib/user/avatar'

export async function POST(request: NextRequest) {
  const header = request.headers.get('authorization') ?? ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  const accessToken = match?.[1]?.trim()

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: 'Authorization token is required' },
      { status: 401 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid upload payload' },
      { status: 400 },
    )
  }

  const file = formData.get('avatar')
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { success: false, error: 'Avatar image file is required' },
      { status: 400 },
    )
  }

  const validationError = validateAvatarFile(file)
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 400 })
  }

  try {
    const avatar = await uploadBackendProfileAvatar(accessToken, file, file.name)
    return NextResponse.json({ success: true, avatar })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to upload profile avatar'
    const status = error instanceof BackendAuthError ? error.status : 502
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
