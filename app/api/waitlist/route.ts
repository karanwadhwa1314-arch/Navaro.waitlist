import { after, NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { addEntry } from '@/lib/waitlist/store'

// Uses Node APIs (fs for PDF attachment via Resend helper).
export const runtime = 'nodejs'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// E.164: leading +, then 7–15 digits (country code + national number).
const E164_PHONE_PATTERN = /^\+[1-9]\d{6,14}$/

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

  if (!firstName || !lastName || !email || !phone) {
    return NextResponse.json(
      { success: false, error: 'First name, last name, email and phone are required' },
      { status: 400 },
    )
  }
  if (!E164_PHONE_PATTERN.test(phone)) {
    return NextResponse.json(
      { success: false, error: 'Please enter a valid phone number with country code' },
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
    const { entry, duplicate } = await addEntry({ firstName, lastName, email, phone })

    // Send welcome email after the response so signup latency is not blocked by Resend.
    // after() keeps the serverless invocation alive on Vercel until this finishes.
    if (!duplicate) {
      const entryId = entry.id
      after(async () => {
        try {
          const sent = await sendWelcomeEmail(firstName, email)
          if (!sent) return

          const supabase = getSupabaseAdmin()
          const { error: stampError } = await supabase
            .from('waitlist_signups')
            .update({ welcome_email_sent_at: new Date().toISOString() })
            .eq('id', entryId)

          if (stampError) {
            console.error('Failed to set welcome_email_sent_at:', stampError)
          }
        } catch (error) {
          console.error('Welcome email after-response task failed:', error)
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Waitlist submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Could not save your details. Please try again.' },
      { status: 500 },
    )
  }
}
