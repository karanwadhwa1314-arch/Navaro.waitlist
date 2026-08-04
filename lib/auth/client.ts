export const BACKEND_API_URL = (
  process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
  process.env.BACKEND_API_URL?.trim() ||
  ''
).replace(/\/$/, '')

export const BACKEND_AUTH_BASE_URL = `${BACKEND_API_URL}/api/v1/auth`

export function backendAuthUrl(path: string): string {
  return `${BACKEND_AUTH_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

