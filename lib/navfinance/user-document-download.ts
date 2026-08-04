import { refreshAccessToken } from '@/lib/auth/refresh'
import { getAccessToken } from '@/lib/auth/storage'

export type UserDocumentOpenMode = 'view' | 'download'

type OpenUserDocumentResult =
  | { success: true }
  | { success: false; error: string; status?: number }

function getBackendApiBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
    ''
  ).replace(/\/$/, '')
}

export function resolveUserDocumentUrl(fileUrl: string): string {
  const trimmed = fileUrl.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed
  }

  const base = getBackendApiBase()
  if (!base) return trimmed

  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`
}

function isBackendRelativeUrl(fileUrl: string) {
  const trimmed = fileUrl.trim()
  return Boolean(trimmed) && !/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('blob:') && !trimmed.startsWith('data:')
}

function getContentDispositionFileName(header: string | null) {
  if (!header) return ''

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].replace(/"/g, '').trim())

  const plainMatch = /filename="?([^";]+)"?/i.exec(header)
  return plainMatch?.[1]?.trim() ?? ''
}

async function getDocumentAccessToken(refresh = false) {
  if (refresh) {
    const refreshed = await refreshAccessToken()
    return refreshed?.access_token ?? null
  }

  const accessToken = getAccessToken()
  if (accessToken) return accessToken

  const refreshed = await refreshAccessToken()
  return refreshed?.access_token ?? null
}

function openResolvedUrl(url: string, fileName: string | undefined, mode: UserDocumentOpenMode) {
  if (mode === 'download') {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName || 'document'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}

async function fetchDocument(url: string, accessToken: string | null) {
  const headers = new Headers()
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  return fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store',
  })
}

export async function openUserDocument(
  fileUrl: string,
  fileName = 'document',
  mode: UserDocumentOpenMode = 'view',
): Promise<OpenUserDocumentResult> {
  const resolvedUrl = resolveUserDocumentUrl(fileUrl)
  if (!resolvedUrl) return { success: false, error: 'Document URL is missing' }

  if (!isBackendRelativeUrl(fileUrl)) {
    openResolvedUrl(resolvedUrl, fileName, mode)
    return { success: true }
  }

  if (!getBackendApiBase()) {
    return { success: false, error: 'Backend API URL is not configured' }
  }

  const previewWindow = mode === 'download' ? null : window.open('', '_blank')

  try {
    if (previewWindow) {
      previewWindow.document.write('Loading document...')
    }

    const token = await getDocumentAccessToken()
    let res = await fetchDocument(resolvedUrl, token)

    if (res.status === 401) {
      const refreshedToken = await getDocumentAccessToken(true)
      if (refreshedToken) {
        res = await fetchDocument(resolvedUrl, refreshedToken)
      }
    }

    if (!res.ok) {
      previewWindow?.close()
      return {
        success: false,
        error: `Failed to open document${res.status ? ` (status ${res.status})` : ''}`,
        status: res.status,
      }
    }

    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const resolvedFileName = fileName || getContentDispositionFileName(res.headers.get('content-disposition'))

    if (mode === 'download') {
      openResolvedUrl(blobUrl, resolvedFileName, 'download')
    } else if (previewWindow) {
      previewWindow.location.href = blobUrl
    } else {
      openResolvedUrl(blobUrl, resolvedFileName, 'view')
    }

    window.setTimeout(() => URL.revokeObjectURL(blobUrl), mode === 'download' ? 1_000 : 60_000)
  } catch {
    previewWindow?.close()
    return { success: false, error: 'Failed to open document' }
  }

  return { success: true }
}
