import {
  clearAuthSession,
  getStoredUser,
  setAccessToken,
  setAuthSession,
  type AuthUser,
} from '@/lib/auth/storage'
import { backendAuthUrl } from '@/lib/auth/client'
import { normalizeAuthUser } from '@/lib/auth/normalize-user'

export const AUTH_REFRESH_PATH = backendAuthUrl('/refresh')

export type RefreshSession = {
  access_token: string
  user: AuthUser | null
}

let refreshInFlight: Promise<RefreshSession | null> | null = null

function clearFailedSession(): void {
  clearAuthSession()

  void fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {
    // Local auth state is already cleared; cookie cleanup is best-effort.
  })
}

export async function refreshAccessToken(): Promise<RefreshSession | null> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    try {
      const res = await fetch(AUTH_REFRESH_PATH, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.access_token) {
        clearFailedSession()
        return null
      }

      const existing = getStoredUser()
      const user =
        data.user && typeof data.user === 'object'
          ? normalizeAuthUser(data.user, existing) ?? existing
          : existing

      const session: RefreshSession = {
        access_token: data.access_token as string,
        user,
      }
      if (session.user) {
        setAuthSession({ access_token: session.access_token, user: session.user })
      } else {
        setAccessToken(session.access_token)
      }
      return session
    } catch {
      clearFailedSession()
      return null
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}
