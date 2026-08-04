import { NextRequest, NextResponse } from 'next/server'
import {
  BackendAuthError,
  fetchBackendCargoInsuranceDocument,
  updateBackendCargoInsuranceDocument,
} from '@/lib/auth/backend'
import {
  validateCargoInsuranceDocument,
  validateCargoInsuranceDocumentDescription,
  validateCargoInsuranceDocumentTitle,
} from '@/lib/navfinance/cargo-insurance-document'

type RouteContext = {
  params: Promise<{ id: string }>
}

async function parseDocumentForm(request: NextRequest) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return { error: NextResponse.json({ success: false, error: 'Invalid upload payload' }, { status: 400 }) }
  }

  const titleValue = formData.get('title')
  const descriptionValue = formData.get('description')
  const title = typeof titleValue === 'string' ? titleValue : ''
  const description = typeof descriptionValue === 'string' ? descriptionValue : ''
  const file = formData.get('document')

  const titleError = validateCargoInsuranceDocumentTitle(title ?? '')
  if (titleError) {
    return { error: NextResponse.json({ success: false, error: titleError }, { status: 400 }) }
  }

  const descriptionError = validateCargoInsuranceDocumentDescription(description ?? '')
  if (descriptionError) {
    return { error: NextResponse.json({ success: false, error: descriptionError }, { status: 400 }) }
  }

  if (!(file instanceof File) || file.size === 0) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Cargo insurance document file is required' },
        { status: 400 },
      ),
    }
  }

  const validationError = validateCargoInsuranceDocument(file)
  if (validationError) {
    return { error: NextResponse.json({ success: false, error: validationError }, { status: 400 }) }
  }

  return {
    payload: {
      file,
      filename: file.name,
      title: title ?? '',
      description: description ?? undefined,
    },
  }
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
    const document = await fetchBackendCargoInsuranceDocument(accessToken, id.trim())
    return NextResponse.json({ success: true, document })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load cargo insurance document'
    const status = error instanceof BackendAuthError ? error.status : 502
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
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

  const parsed = await parseDocumentForm(request)
  if ('error' in parsed && parsed.error) {
    return parsed.error
  }

  if (!parsed.payload) {
    return NextResponse.json({ success: false, error: 'Invalid upload payload' }, { status: 400 })
  }

  try {
    const document = await updateBackendCargoInsuranceDocument(accessToken, id.trim(), parsed.payload)
    return NextResponse.json({ success: true, document })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update cargo insurance document'
    const status = error instanceof BackendAuthError ? error.status : 502
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
