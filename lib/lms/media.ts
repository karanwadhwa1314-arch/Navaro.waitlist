import { legacyMediaUrl } from '@/lib/media'

export {
  courseThumbnailSrc,
  legacyMediaUrl,
  lessonThumbnailSrc,
  lessonVideoSrc,
} from '@/lib/media'

/** @deprecated Use lessonVideoSrc or courseThumbnailSrc instead */
export function getMediaBase() {
  const mediaUrlEnv = process.env.NEXT_PUBLIC_MEDIA_URL?.trim()
  if (mediaUrlEnv) return mediaUrlEnv.replace(/\/$/, '')

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
    ''

  if (apiUrl) {
    return apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '')
  }

  return 'http://localhost:8081'
}

/** @deprecated Use courseThumbnailSrc, lessonThumbnailSrc, or lessonVideoSrc */
export function mediaUrl(assetPath?: string | null) {
  return legacyMediaUrl(assetPath || undefined)
}
