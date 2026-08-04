import { createHash, createHmac, timingSafeEqual } from 'crypto'

/**
 * Password gate for /admin/waitlist.
 *
 * A single shared password guards personal data, so: constant-time comparison,
 * a signed httpOnly cookie rather than storing the password client-side, and a
 * per-IP attempt limit to make guessing impractical.
 */

export const ADMIN_COOKIE = 'navaro_waitlist_admin'

const SESSION_MS = 8 * 60 * 60 * 1000 // 8 hours
const MAX_ATTEMPTS = 5
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000 // per 10 minutes

export function getAdminPassword(): string | null {
  const password = process.env.WAITLIST_ADMIN_PASSWORD
  return password && password.length > 0 ? password : null
}

function sha256(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest()
}

/**
 * Signing key is derived from the password, so changing the password
 * immediately invalidates every existing session.
 */
function sessionKey(password: string): Buffer {
  return sha256(`${password}::navaro-waitlist-admin-session`)
}

export function verifyPassword(candidate: string, password: string): boolean {
  // Hash both sides first: equal-length buffers, so no length is leaked.
  return timingSafeEqual(sha256(candidate), sha256(password))
}

export function createSessionCookie(password: string): { value: string; maxAge: number } {
  const expiresAt = Date.now() + SESSION_MS
  const signature = createHmac('sha256', sessionKey(password)).update(String(expiresAt)).digest('hex')
  return { value: `${expiresAt}.${signature}`, maxAge: Math.floor(SESSION_MS / 1000) }
}

export function verifySessionCookie(cookieValue: string | undefined, password: string): boolean {
  if (!cookieValue) return false

  const separator = cookieValue.lastIndexOf('.')
  if (separator === -1) return false

  const expiresAt = Number(cookieValue.slice(0, separator))
  const signature = cookieValue.slice(separator + 1)
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false

  const expected = createHmac('sha256', sessionKey(password)).update(String(expiresAt)).digest('hex')
  if (signature.length !== expected.length) return false

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

/** True when the request carries a valid admin session. */
export function isAdminRequest(cookieValue: string | undefined): boolean {
  const password = getAdminPassword()
  if (!password) return false
  return verifySessionCookie(cookieValue, password)
}

const attempts = new Map<string, { count: number; resetAt: number }>()

export function isLoginRateLimited(clientId: string): boolean {
  const now = Date.now()

  Array.from(attempts.entries()).forEach(([key, entry]) => {
    if (entry.resetAt <= now) attempts.delete(key)
  })

  const entry = attempts.get(clientId)
  if (!entry) {
    attempts.set(clientId, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS })
    return false
  }
  if (entry.count >= MAX_ATTEMPTS) return true

  entry.count++
  return false
}

export function clearLoginAttempts(clientId: string): void {
  attempts.delete(clientId)
}
