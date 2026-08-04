import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-next-pathname', pathname)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    '/',
    '/((?!_next/static|_next/image|favicon.ico|templates/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|html)$).*)',
  ],
}
