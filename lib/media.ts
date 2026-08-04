type ThumbnailFields = {
  thumbnailUrl?: string
  thumbnailS3Key?: string
}

type VideoFields = {
  videoUrl?: string
  videoS3Key?: string
  isLocked?: boolean
}

export function legacyMediaUrl(path?: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const base =
    process.env.NEXT_PUBLIC_MEDIA_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/api\/v1\/?$/, '') ||
    'http://localhost:8081'

  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

export function courseThumbnailSrc(course: ThumbnailFields): string {
  if (course.thumbnailUrl) return course.thumbnailUrl
  return legacyMediaUrl(course.thumbnailS3Key)
}

export function lessonThumbnailSrc(lesson: ThumbnailFields): string {
  if (lesson.thumbnailUrl) return lesson.thumbnailUrl
  return legacyMediaUrl(lesson.thumbnailS3Key)
}

export function lessonVideoSrc(lesson: VideoFields): string {
  if (lesson.isLocked) return ''
  if (lesson.videoUrl) return lesson.videoUrl
  return legacyMediaUrl(lesson.videoS3Key)
}
