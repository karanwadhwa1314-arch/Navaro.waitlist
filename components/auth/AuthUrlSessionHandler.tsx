'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { parseGoogleOAuthParams } from '@/lib/auth/google'
import { getPostLoginPath } from '@/lib/auth/redirects'
import { setAuthSession } from '@/lib/auth/storage'

/**
 * Applies access_token + user from URL (Google OAuth) then strips query params.
 */
export default function AuthUrlSessionHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const params = parseGoogleOAuthParams(searchParams)
    if (!params.access_token || !params.user || params.error) return

    setAuthSession({
      access_token: params.access_token,
      user: params.user,
    })

    router.replace(getPostLoginPath())
  }, [router, searchParams])

  return null
}
