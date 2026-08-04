import { NextRequest, NextResponse } from 'next/server'
import {
  BackendAuthError,
  fetchBackendCargoInsuranceDocuments,
  uploadBackendCargoInsuranceDocument,
} from '@/lib/auth/backend'
import {
  extractCargoInsuranceDocumentList,
  validateCargoInsuranceDocument,
  validateCargoInsuranceDocumentDescription,
  validateCargoInsuranceDocumentTitle,
} from '@/lib/navfinance/cargo-insurance-document'

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
    const payload = await fetchBackendCargoInsuranceDocuments(accessToken)
    const documents = extractCargoInsuranceDocumentList(payload)
    return NextResponse.json({ success: true, documents })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load cargo insurance documents'
    const status = error instanceof BackendAuthError ? error.status : 502
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

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

  const titleValue = formData.get('title')
  const descriptionValue = formData.get('description')
  const title = typeof titleValue === 'string' ? titleValue : ''
  const description = typeof descriptionValue === 'string' ? descriptionValue : ''
  const file = formData.get('document')

  const titleError = validateCargoInsuranceDocumentTitle(title ?? '')
  if (titleError) {
    return NextResponse.json({ success: false, error: titleError }, { status: 400 })
  }

  const descriptionError = validateCargoInsuranceDocumentDescription(description ?? '')
  if (descriptionError) {
    return NextResponse.json({ success: false, error: descriptionError }, { status: 400 })
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { success: false, error: 'Cargo insurance document file is required' },
      { status: 400 },
    )
  }

  const validationError = validateCargoInsuranceDocument(file)
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 400 })
  }

  try {
    const document = await uploadBackendCargoInsuranceDocument(accessToken, {
      file,
      filename: file.name,
      title: title ?? '',
      description: description ?? undefined,
    })
    return NextResponse.json({ success: true, document })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to upload cargo insurance document'
    const status = error instanceof BackendAuthError ? error.status : 502
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
