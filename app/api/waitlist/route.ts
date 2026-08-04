import { NextRequest, NextResponse } from 'next/server'
import { addEntry } from '@/lib/waitlist/store'

// Reads and writes the data directory, so it needs the Node runtime.
export const runtime = 'nodejs'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MAX_FIELD_LENGTH = 200

function asField(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LENGTH) : ''
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const firstName = asField((body as Record<string, unknown>).first_name)
  const lastName = asField((body as Record<string, unknown>).last_name)
  const email = asField((body as Record<string, unknown>).email)
  const phone = asField((body as Record<string, unknown>).phone)

  if (!firstName || !lastName || !email) {
    return NextResponse.json(
      { success: false, error: 'First name, last name, and email are required' },
      { status: 400 },
    )
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { success: false, error: 'Please enter a valid email address' },
      { status: 400 },
    )
  }

  try {
    await addEntry({ firstName, lastName, email, phone })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Waitlist submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Could not save your details. Please try again.' },
      { status: 500 },
    )
  }
}
