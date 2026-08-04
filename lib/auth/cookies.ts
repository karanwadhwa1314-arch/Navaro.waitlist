import { NextResponse } from 'next/server'

/** Backend-owned HttpOnly refresh cookie. The frontend never reads or sends its value. */
export const REFRESH_TOKEN_COOKIE = 'refresh_token'

/** Old app-owned cookie name; only cleared for migration/logout cleanup. */
const LEGACY_REFRESH_TOKEN_COOKIE = 'navaro_refresh_token'

const OAUTH_STATE_COOKIE = 'oauth_state'

function clearCookie(response: NextResponse, name: string): void {
  response.cookies.delete(name)
  response.cookies.set(name, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  })
}

export function clearRefreshTokenCookie(response: NextResponse): void {
  clearAllAuthCookies(response)
}

export function clearAllAuthCookies(response: NextResponse): void {
  clearCookie(response, REFRESH_TOKEN_COOKIE)
  clearCookie(response, LEGACY_REFRESH_TOKEN_COOKIE)
  clearCookie(response, OAUTH_STATE_COOKIE)
}
