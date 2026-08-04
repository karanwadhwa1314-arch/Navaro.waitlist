import type { AuthUser } from '@/lib/auth/storage'
import { normalizeAuthUser } from '@/lib/auth/normalize-user'

export const GOOGLE_AUTH_START_PATH = '/api/auth/google'

export type GoogleOAuthParams = {
  access_token: string | null
  user: AuthUser | null
  error: string | null
}

function parseUserParam(raw: string | null): AuthUser | null {
  if (!raw) return null
  try {
    const decoded = decodeURIComponent(raw)
    const parsed = JSON.parse(decoded) as unknown
    return normalizeAuthUser(parsed)
  } catch {
    return null
  }
}

export function parseGoogleOAuthParams(searchParams: URLSearchParams): GoogleOAuthParams {
  const access_token =
    searchParams.get('access_token') ?? searchParams.get('accessToken')
  const error =
    searchParams.get('error') ??
    searchParams.get('message') ??
    (searchParams.get('status') === 'false' ? 'Google sign-in failed' : null)

  const user =
    parseUserParam(searchParams.get('user')) ??
    parseUserParam(searchParams.get('user_data'))

  return { access_token, user, error }
}

export function hasGoogleOAuthTokens(params: GoogleOAuthParams): boolean {
  return !!params.access_token && !params.error
}

export function startGoogleOAuth(): void {
  if (typeof window === 'undefined') return
  window.location.assign(GOOGLE_AUTH_START_PATH)
}
