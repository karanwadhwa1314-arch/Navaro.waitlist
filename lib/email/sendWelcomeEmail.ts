import { readFile } from 'fs/promises'
import path from 'path'
import { Resend } from 'resend'

function buildWelcomeHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family: 'Utendo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #222; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px; font-weight: 600;">

  <p>Hi ${escapeHtml(firstName)},</p>

  <p>You're in.</p>

  <p>We can't tell you everything yet. But we can tell you this:</p>

  <p>The shipment never left</p>

  <p>There's a shipment that exists only in someone's head.</p>

  <p>It belongs to an ambitious importer exporter in Haryana. Or Maharashtra. Or Delhi. He got his IEC three years ago. He knows his product. He's priced it. Some nights, he opens his laptop and researches ports, buyers, duties until the tabs blur.</p>

  <p>The shipment never ships. Not because he can't afford it. Because every search answers one question and raises five.</p>

  <p>There are lakhs more like him. Ambition, fully loaded, going nowhere.</p>

  <p>We've spent years watching that happen. Then we spent years building the answer.</p>

  <p>On August 15, you'll see it. Independence Day felt right, because that's what this is. Independence from guesswork. From gatekeepers. From figuring it out alone.</p>

  <p>Until then, once a week, we'll send you one email that makes import-export a little clearer.</p>

  <p>Something big is coming. You're already ahead of everyone who'll hear about it later.</p>

  <p>We make import export easy.<br>
  — Navaro</p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />

  <p style="font-size: 12px; color: #666;">You're receiving this because you joined the Navaro waitlist. No spam, ever.</p>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Sends the waitlist welcome email (with the first-shipment guide attached when present).
 * Never throws — returns false on any failure so signup success is unaffected.
 */
const GUIDE_FILENAME = 'Navaro — Your First Shipment Guide.pdf'
const GUIDE_PATH = path.join(process.cwd(), 'public', 'guides', GUIDE_FILENAME)

/** Cached per warm serverless instance so repeat sends skip disk I/O. */
let cachedGuidePdf: Buffer | null | undefined

async function loadGuideAttachment(): Promise<{ filename: string; content: Buffer } | null> {
  if (cachedGuidePdf === null) return null
  if (cachedGuidePdf) {
    return { filename: GUIDE_FILENAME, content: cachedGuidePdf }
  }

  try {
    cachedGuidePdf = await readFile(GUIDE_PATH)
    return { filename: GUIDE_FILENAME, content: cachedGuidePdf }
  } catch {
    cachedGuidePdf = null
    console.warn(
      `Welcome email: guide not found at ${GUIDE_PATH} — sending without attachment`,
    )
    return null
  }
}

export async function sendWelcomeEmail(firstName: string, email: string): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set — cannot send welcome email')
      return false
    }

    const resend = new Resend(apiKey)
    const guide = await loadGuideAttachment()
    const attachments = guide ? [guide] : []

    const { error } = await resend.emails.send({
      from: 'Navaro <hello@navaro.co.in>',
      to: email,
      subject: "You're on the list. Here's what that means.",
      html: buildWelcomeHtml(firstName),
      ...(attachments.length > 0 ? { attachments } : {}),
    })

    if (error) {
      console.error('Welcome email Resend error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Welcome email send failed:', error)
    return false
  }
}
