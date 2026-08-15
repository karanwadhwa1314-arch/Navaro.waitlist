import type { NextRequest } from 'next/server'

/**
 * Lightweight per-IP rate limiter for the public waitlist signup endpoint.
 *
 * In-memory only — resets on cold start and is scoped to a single warm
 * serverless instance, so this is a deterrent against a single scripted
 * source, not a guarantee against a distributed attack. Mirrors the pattern
 * already used for admin login (lib/waitlist/admin-auth.ts), kept as its own
 * module so that file stays untouched.
 */

const MAX_SUBMISSIONS = 5
const WINDOW_MS = 10 * 60 * 1000 // 10 minutes

const submissions = new Map<string, { count: number; resetAt: number }>()

/** Derive a rate-limit key from the request IP. */
export function getClientId(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function isWaitlistRateLimited(clientId: string): boolean {
  const now = Date.now()

  Array.from(submissions.entries()).forEach(([key, entry]) => {
    if (entry.resetAt <= now) submissions.delete(key)
  })

  const entry = submissions.get(clientId)
  if (!entry) {
    submissions.set(clientId, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  if (entry.count >= MAX_SUBMISSIONS) return true

  entry.count++
  return false
}
