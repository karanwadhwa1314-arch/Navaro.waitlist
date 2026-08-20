import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Per-IP rate limiter for the public waitlist signup endpoint, backed by
 * Upstash Redis so the limit is global and persistent across serverless
 * instances and cold starts. Policy: 5 submissions per IP per 10 minutes.
 *
 * The limiter is created lazily on first use (not at module load) so that
 * `next build`'s page-data collection never constructs the Redis client —
 * that previously crashed the build when the Upstash env vars weren't present
 * in the build environment. If the vars are missing at runtime, we fail open
 * (rate limiting disabled) rather than block signups.
 */

// undefined = not yet initialised; null = initialised but unavailable
let cached: Ratelimit | null | undefined

function getRateLimiter(): Ratelimit | null {
  if (cached !== undefined) return cached

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    cached = null
    return null
  }

  try {
    cached = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      prefix: 'waitlist_ratelimit',
    })
  } catch (error) {
    console.error('Failed to initialise rate limiter (allowing requests):', error)
    cached = null
  }

  return cached
}

export function getClientId(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Returns true if the client is over the limit. Fail-open: if Upstash is
 * unconfigured or unreachable, allow the request rather than block a real
 * signup on infra issues.
 */
export async function isWaitlistRateLimited(clientId: string): Promise<boolean> {
  const ratelimit = getRateLimiter()
  if (!ratelimit) return false

  try {
    const { success } = await ratelimit.limit(clientId)
    return !success
  } catch (error) {
    console.error('Rate limit check failed (allowing request):', error)
    return false
  }
}
