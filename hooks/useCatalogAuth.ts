'use client'

import { useCallback, useEffect, useState } from 'react'

import { resolveAuthUser } from '@/lib/auth/load-user'
import { getAccessToken, isAuthenticated } from '@/lib/auth/storage'

export function useCatalogAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken())
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated())
  const [authVersion, setAuthVersion] = useState(0)

  const refreshAuth = useCallback(async () => {
    const user = await resolveAuthUser()
    setIsLoggedIn(!!user)
    setAccessToken(getAccessToken())
    setAuthVersion((value) => value + 1)
  }, [])

  useEffect(() => {
    void refreshAuth()
  }, [refreshAuth])

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === 'navaro_access_token' || event.key === 'navaro_user') {
        void refreshAuth()
      }
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', refreshAuth)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', refreshAuth)
    }
  }, [refreshAuth])

  return {
    accessToken,
    isLoggedIn,
    authVersion,
    refreshAuth,
  }
}
