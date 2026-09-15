import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, isAdminRequest } from '@/lib/waitlist/admin-auth'
import { getUnbroadcastedRecipients, markSecondBroadcastSent } from '@/lib/waitlist/store'
import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail'

export const runtime = 'nodejs'
export const maxDuration = 300

// Deliberately awkward string, not just `true` — makes an accidental
// trigger (e.g. a stray automated request) extremely unlikely to match.
const CONFIRM_VALUE = 'yes-send-to-everyone'

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { confirm?: string } = {}
  try {
    body = await request.json()
  } catch {
    // No body / invalid JSON — treated as dry run below.
  }

  const recipients = await getUnbroadcastedRecipients()

  if (body.confirm !== CONFIRM_VALUE) {
    // Dry run: report who WOULD be emailed, send nothing.
    return NextResponse.json({
      success: true,
      dryRun: true,
      wouldSend: recipients.length,
      message: `Dry run only. Re-send with { "confirm": "${CONFIRM_VALUE}" } in the request body to actually send.`,
    })
  }

  let sent = 0
  let failed = 0

  for (const recipient of recipients) {
    try {
      const ok = await sendWelcomeEmail(recipient.firstName, recipient.email)
      if (ok) {
        await markSecondBroadcastSent(recipient.email)
        sent++
      } else {
        failed++
      }
    } catch (err) {
      console.error('Broadcast send failed for', recipient.email, err)
      failed++
    }
    // Small delay between sends to stay comfortably under Resend's rate limits.
    await new Promise((resolve) => setTimeout(resolve, 400))
  }

  return NextResponse.json({ success: true, dryRun: false, sent, failed })
}
