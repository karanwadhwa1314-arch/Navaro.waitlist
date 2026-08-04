function getBackendPublicUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim()
  return (raw || '').replace(/\/$/, '')
}

export function getAvatarImageUrl(
  avatar: string | null | undefined,
  cacheKey?: string | number,
): string | null {
  if (!avatar?.trim()) return null

  const trimmed = avatar.trim()

  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed
  }

  let imageUrl: string
  if (/^https?:\/\//i.test(trimmed)) {
    imageUrl = trimmed
  } else {
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    imageUrl = `${getBackendPublicUrl()}${path}`
  }

  if (cacheKey != null) {
    const separator = imageUrl.includes('?') ? '&' : '?'
    imageUrl = `${imageUrl}${separator}v=${encodeURIComponent(String(cacheKey))}`
  }

  return imageUrl
}
