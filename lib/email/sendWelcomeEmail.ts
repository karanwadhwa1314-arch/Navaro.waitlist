import { readFile } from 'fs/promises'
import path from 'path'
import { Resend } from 'resend'

function buildWelcomeHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family: 'Utendo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #222; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px; font-weight: 600;">

  <p>Hi ${escapeHtml(firstName)},</p>

  <p>You're on the Navaro waitlist. Your spot is safe. Nothing else to do.</p>

  <p>One thing before you go.</p>

  <p>You signed up because somewhere in your head, you stopped thinking small. There was a business you promised yourself you'd build.</p>

  <p>Now everyone's going to tell you to be realistic. That exporting is complicated. Documentation, customs, classification, freight, compliance, payment terms, a hundred things you've never done, any one of which can cost you a container.</p>

  <p>They're right about the complexity.</p>

  <p>They're wrong about whose problem it is.</p>

  <p>That part is ours. The learning, the paperwork, the tools, the moment something goes wrong at port and you don't know who to call.</p>

  <p>Yours is the part nobody can do for you: deciding what the world should be buying from you.</p>

  <p>The world is open. That was never the problem.</p>

  <p>The map isn't. We're building the map.</p>

  <p>We're releasing Navaro in pieces, and each piece lands on social first:</p>

  <p>
    <a href="https://www.linkedin.com/company/navaro-group/" style="color: #0a66c2; text-decoration: underline;">LinkedIn</a>
    &nbsp;·&nbsp;
    <a href="https://www.instagram.com/navaro.co.in/" style="color: #0a66c2; text-decoration: underline;">Instagram</a>
  </p>

  <p style="margin-top: 32px;">P.S. What are you exporting, and where to? Hit reply, I read every one myself.</p>

  <p>
    Karan<br />
    Co-founder, Navaro<br />
    Making import–export easy.
  </p>

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
      from: 'Navaro <karan@navaro.co.in>',
      to: email,
      subject: "You're on the list! Here's what that means.",
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
