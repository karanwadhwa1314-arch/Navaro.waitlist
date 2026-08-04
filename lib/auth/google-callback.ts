import { NextRequest, NextResponse } from 'next/server'
import { fetchBackendUser } from '@/lib/auth/backend'
import { parseGoogleOAuthParams } from '@/lib/auth/google'
import { getPostLoginUrl } from '@/lib/auth/redirects'
import { normalizeAuthUser } from '@/lib/auth/normalize-user'
import type { AuthUser } from '@/lib/auth/storage'

function loginRedirect(request: NextRequest, params: Record<string, string>): NextResponse {
  const url = new URL('/login', request.url)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return NextResponse.redirect(url)
}

function dashboardRedirect(access_token: string, user: AuthUser): NextResponse {
  const url = new URL(getPostLoginUrl())
  url.searchParams.set('access_token', access_token)
  url.searchParams.set('user', JSON.stringify(user))
  return NextResponse.redirect(url)
}

export async function handleGoogleOAuthCallback(request: NextRequest): Promise<NextResponse> {
  const params = parseGoogleOAuthParams(request.nextUrl.searchParams)

  if (params.error) {
    return loginRedirect(request, { error: params.error })
  }

  if (!params.access_token) {
    return loginRedirect(request, {
      error: 'Google sign-in did not return an access token. Please try again.',
    })
  }

  let user = params.user
  if (!user) {
    try {
      user = await fetchBackendUser(params.access_token)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to reach the server. Is the backend running?'
      return loginRedirect(request, { error: message })
    }
  }

  if (!user) {
    return loginRedirect(request, {
      error: 'Could not load your profile after Google sign-in. Please try again.',
    })
  }

  const normalizedUser = normalizeAuthUser(user)
  if (!normalizedUser) {
    return loginRedirect(request, {
      error: 'Your account role is not supported on this app. Please contact support.',
    })
  }

  return dashboardRedirect(params.access_token, normalizedUser)
}
