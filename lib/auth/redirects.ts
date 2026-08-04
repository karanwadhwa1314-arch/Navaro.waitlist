export const POST_LOGIN_PATH = '/dashboard'

export function getAppOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    ''
  return raw.replace(/\/$/, '')
}

export function getPostLoginPath(): string {
  return POST_LOGIN_PATH
}

export function getPostLogoutPath(): string {
  return POST_LOGIN_PATH
}

export function getPostLoginUrl(): string {
  return `${getAppOrigin()}${POST_LOGIN_PATH}`
}

/** Only allow same-origin relative paths (blocks open redirects). */
export function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback: string = POST_LOGIN_PATH,
): string {
  if (!candidate) return fallback

  const trimmed = candidate.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback
  }

  return trimmed
}
