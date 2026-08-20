import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Per-IP rate limiter for the public waitlist signup endpoint, backed by
 * Upstash Redis so the limit is global and persistent across serverless
 * instances and cold starts (unlike the previous in-memory version).
 * Policy: 5 submissions per IP per 10 minutes.
 */

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

const ratelimit = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      prefix: 'waitlist_ratelimit',
    })
  : null

export function getClientId(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Returns true if the client is over the limit. Async now (Redis call).
 * Fail-open: if Upstash is unreachable, allow the request rather than block
 * a real signup on infra downtime.
 */
export async function isWaitlistRateLimited(clientId: string): Promise<boolean> {
  if (!ratelimit) return false
  try {
    const { success } = await ratelimit.limit(clientId)
    return !success
  } catch (error) {
    console.error('Rate limit check failed (allowing request):', error)
    return false
  }
}
