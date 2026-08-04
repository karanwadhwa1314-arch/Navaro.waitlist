import { normalizeStoredUser } from '@/lib/auth/normalize-user'
import type { UserRole } from '@/lib/auth/roles'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  is_active: boolean
  email_verified: boolean
}

const ACCESS_TOKEN_KEY = 'navaro_access_token'
const USER_KEY = 'navaro_user'

/** Legacy key — cleared on login; refresh token lives in HttpOnly cookie only. */
const LEGACY_REFRESH_TOKEN_KEY = 'navaro_refresh_token'

export function setAuthSession(payload: { access_token: string; user: AuthUser }): void {
  if (typeof window === 'undefined') return
  const user = normalizeStoredUser(payload.user)
  if (!user) return
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY)
}

export function setAccessToken(accessToken: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY)
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getAccessToken() && !!getStoredUser()
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return normalizeStoredUser(JSON.parse(raw) as AuthUser)
  } catch {
    return null
  }
}

export function formatDisplayName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

/** Clears client-only auth state. The backend owns the HttpOnly refresh cookie. */
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY)
}
