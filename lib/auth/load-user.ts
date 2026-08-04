import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
  setAuthSession,
  type AuthUser,
} from '@/lib/auth/storage'
import { refreshAccessToken } from '@/lib/auth/refresh'
import { normalizeAuthUser } from '@/lib/auth/normalize-user'

let resolveInFlight: Promise<AuthUser | null> | null = null

async function fetchCurrentUser(accessToken: string): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })
    const data = await res.json().catch(() => ({}))

    if (res.ok && data.success && data.user) {
      const existing = getStoredUser()
      const user = normalizeAuthUser(data.user, existing)
      if (!user) {
        clearAuthSession()
        return null
      }
      setAuthSession({ access_token: accessToken, user })
      return user
    }

    if (res.status === 401) {
      return null
    }
  } catch {
    // fall through
  }

  return null
}

async function resolveAuthUserInternal(): Promise<AuthUser | null> {
  const accessToken = getAccessToken()

  if (accessToken) {
    const user = await fetchCurrentUser(accessToken)
    if (user) return user
  }

  const refreshed = await refreshAccessToken()
  if (refreshed?.user) return refreshed.user
  if (refreshed?.access_token) {
    const user = await fetchCurrentUser(refreshed.access_token)
    if (user) return user
  }

  const cached = getStoredUser()
  if (cached && getAccessToken()) {
    return cached
  }

  clearAuthSession()
  return null
}

export async function resolveAuthUser(): Promise<AuthUser | null> {
  if (resolveInFlight) return resolveInFlight

  resolveInFlight = resolveAuthUserInternal().finally(() => {
    resolveInFlight = null
  })

  return resolveInFlight
}
