import { courseThumbnailSrc, legacyMediaUrl } from '@/lib/media'

export function getCatalogApiBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
    ''
  ).replace(/\/$/, '')
}

export function getCatalogAssetUrl(course: { thumbnailUrl?: string; thumbnailS3Key?: string }) {
  const src = courseThumbnailSrc(course)
  return src || null
}

/** @deprecated Use getCatalogAssetUrl with course object or courseThumbnailSrc */
export function getCatalogAssetUrlFromPath(path?: string | null) {
  const url = legacyMediaUrl(path || undefined)
  return url || null
}

export function formatCatalogLevel(level?: string) {
  const normalized = level?.trim().toUpperCase()
  if (normalized === 'BEGINNER') return 'Beginner'
  if (normalized === 'INTERMEDIATE') return 'Intermediate'
  if (normalized === 'ADVANCED') return 'Advanced'
  return level || '-'
}

export function formatCatalogDurationMinutes(minutes?: number | null) {
  if (!minutes || minutes <= 0) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
  if (hours > 0) return `${hours}h`
  return `${mins} min`
}

export function formatCatalogDurationSeconds(seconds?: number | null) {
  if (seconds == null || seconds < 0) return '-'
  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const mins = Math.floor((total % 3600) / 60)
  const secs = total % 60
  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export function formatCatalogPrice(price?: number | null, currency = 'INR') {
  if (!price || price === 0) return 'Free'
  if (currency === 'INR') return `₹${price.toLocaleString('en-IN')}`
  return `${currency} ${price.toLocaleString('en-IN')}`
}

export function buildLoginHref(returnTo: string) {
  return `/login?next=${encodeURIComponent(returnTo)}`
}

export function getLessonHref(slug: string, lessonId: string) {
  return `/courses/${encodeURIComponent(slug)}/learn/lesson/${encodeURIComponent(lessonId)}`
}

export function getLearnHref(slug: string) {
  return `/courses/${encodeURIComponent(slug)}/learn`
}

export type FlatLesson = {
  id: string
  title: string
  description?: string
  contentType: 'VIDEO' | 'PDF' | 'TEXT' | 'HTML'
  durationSeconds: number
  sortOrder: number
  isPreview: boolean
  isLocked: boolean
  contentText?: string
  videoS3Key?: string
  videoUrl?: string
  videoFileName?: string
  thumbnailS3Key?: string
  thumbnailUrl?: string
  moduleId: string
  moduleTitle: string
}

export function getFlatLessons(
  course: { modules: { id: string; title: string; lessons: Omit<FlatLesson, 'moduleId' | 'moduleTitle'>[] }[] },
): FlatLesson[] {
  const flat: FlatLesson[] = []
  for (const courseModule of course.modules) {
    for (const lesson of courseModule.lessons) {
      flat.push({
        ...lesson,
        moduleId: courseModule.id,
        moduleTitle: courseModule.title,
      })
    }
  }
  return flat
}

export function findFirstUnlockedLesson(course: { modules: { lessons: { id: string; isLocked: boolean }[] }[] }) {
  for (const courseModule of course.modules) {
    for (const lesson of courseModule.lessons) {
      if (!lesson.isLocked) return lesson.id
    }
  }
  return null
}

import type { LessonOutline } from '@/lib/lms/catalog-types'

export function findLessonInCourse(
  course: { modules: { lessons: LessonOutline[] }[] },
  lessonId: string,
): LessonOutline | null {
  for (const courseModule of course.modules) {
    const lesson = courseModule.lessons.find((item) => item.id === lessonId)
    if (lesson) return lesson
  }
  return null
}

export function getQuizHref(slug: string, assessmentId: string) {
  return `/courses/${encodeURIComponent(slug)}/assessments/quiz/${encodeURIComponent(assessmentId)}`
}

export function getAssignmentHref(slug: string, assessmentId: string) {
  return `/courses/${encodeURIComponent(slug)}/assessments/assignment/${encodeURIComponent(assessmentId)}`
}

export function getQuizAttemptStorageKey(assessmentId: string) {
  return `quiz-attempt-${assessmentId}`
}

export function getAdjacentLessons(
  course: { modules: { lessons: { id: string; isLocked: boolean; title: string; description?: string; contentType: 'VIDEO' | 'PDF' | 'TEXT' | 'HTML'; durationSeconds: number; sortOrder: number; isPreview: boolean }[] }[] },
  lessonId: string,
) {
  const flat: typeof course.modules[0]['lessons'] = []
  for (const courseModule of course.modules) {
    for (const lesson of courseModule.lessons) {
      flat.push(lesson)
    }
  }
  const idx = flat.findIndex((l) => l.id === lessonId)
  if (idx < 0) return { previous: null, next: null }
  return {
    previous: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  }
}

export function canAccessLesson(lesson: { isLocked: boolean }) {
  return !lesson.isLocked
}

export function isFreeCourse(price?: number | null) {
  return !price || price === 0
}

export function getEnrollmentErrorMessage(status?: number, fallback?: string) {
  switch (status) {
    case 401:
      return 'Please sign in to continue'
    case 402:
      return 'This is a paid course. Please complete payment to enroll.'
    case 404:
      return 'Course not found'
    case 409:
      return 'You are already enrolled'
    default:
      return fallback || 'Something went wrong. Please try again.'
  }
}
