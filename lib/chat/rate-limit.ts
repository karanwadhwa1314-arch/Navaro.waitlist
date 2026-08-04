/**
 * In-memory rate limiters for chat and document-extract APIs.
 * For multi-instance production, replace with Redis or Vercel KV.
 */

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 4 // chat

const DOCUMENT_WINDOW_MS = 60 * 1000 // 1 minute
const DOCUMENT_MAX_PER_WINDOW = 2 // document extraction (e.g. 2 per comparison × 15 runs/min)

const store = new Map<string, { count: number; resetAt: number }>()
const documentStore = new Map<string, { count: number; resetAt: number }>()

function prune(map: Map<string, { count: number; resetAt: number }>): void {
  const now = Date.now()
  Array.from(map.entries()).forEach(([key, entry]) => {
    if (entry.resetAt <= now) map.delete(key)
  })
}

function checkLimit(
  map: Map<string, { count: number; resetAt: number }>,
  key: string,
  windowMs: number,
  maxPerWindow: number
): boolean {
  prune(map)
  const now = Date.now()
  let entry = map.get(key)
  if (!entry) {
    map.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  if (entry.resetAt <= now) {
    entry = { count: 1, resetAt: now + windowMs }
    map.set(key, entry)
    return false
  }
  if (entry.count >= maxPerWindow) return true
  entry.count++
  return false
}

/** Chat: returns true if rate limited. */
export function isRateLimited(key: string): boolean {
  return checkLimit(store, key, WINDOW_MS, MAX_REQUESTS_PER_WINDOW)
}

/** Chat: seconds until window resets (for Retry-After). */
export function getRetryAfterSeconds(key: string): number {
  const entry = store.get(key)
  if (!entry || entry.resetAt <= Date.now()) return 60
  return Math.ceil((entry.resetAt - Date.now()) / 1000)
}

/** Document extraction: returns true if rate limited. */
export function isDocumentRateLimited(key: string): boolean {
  return checkLimit(documentStore, key, DOCUMENT_WINDOW_MS, DOCUMENT_MAX_PER_WINDOW)
}

/** Document extraction: seconds until window resets (for Retry-After). */
export function getDocumentRetryAfterSeconds(key: string): number {
  const entry = documentStore.get(key)
  if (!entry || entry.resetAt <= Date.now()) return 60
  return Math.ceil((entry.resetAt - Date.now()) / 1000)
}

export function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}
