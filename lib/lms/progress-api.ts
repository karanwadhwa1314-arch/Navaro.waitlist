import { refreshAccessToken } from '@/lib/auth/refresh'
import { getAccessToken } from '@/lib/auth/storage'

import { getCatalogApiBase } from '@/lib/lms/catalog-helpers'
import type { CompleteLessonResponse, CourseProgress } from '@/lib/lms/progress-types'

type ApiSuccess<T> = { success: true; data: T }
type ApiFailure = { success: false; error: string; status?: number }
export type ProgressApiResult<T> = ApiSuccess<T> | ApiFailure

function readString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') return value
  }
  return ''
}

function readNumber(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && !Number.isNaN(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return undefined
}

function readBoolean(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'boolean') return value
  }
  return false
}

function getErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object') return fallback
  const record = data as Record<string, unknown>
  const errors = record.errors
  if (Array.isArray(errors) && typeof errors[0] === 'string') return errors[0]
  return readString(record, 'message', 'error', 'msg') || fallback
}

function normalizeCourseProgress(data: unknown): CourseProgress | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const courseId = readString(record, 'courseId', 'course_id')
  if (!courseId) return null

  const lessonsRaw = record.lessons
  const lessons: Record<string, boolean> = {}
  if (lessonsRaw && typeof lessonsRaw === 'object' && !Array.isArray(lessonsRaw)) {
    for (const [key, value] of Object.entries(lessonsRaw)) {
      lessons[key] = value === true
    }
  }

  return {
    courseId,
    totalLessons: readNumber(record, 'totalLessons', 'total_lessons') ?? 0,
    completedLessons: readNumber(record, 'completedLessons', 'completed_lessons') ?? 0,
    progressPercent: readNumber(record, 'progressPercent', 'progress_percent') ?? 0,
    lessons,
  }
}

function normalizeCompleteLesson(data: unknown): CompleteLessonResponse | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const lessonId = readString(record, 'lessonId', 'lesson_id')
  const completedAt = readString(record, 'completedAt', 'completed_at')
  if (!lessonId || !completedAt) return null
  return {
    lessonId,
    isCompleted: readBoolean(record, 'isCompleted', 'is_completed') || true,
    completedAt,
  }
}

async function resolveAccessToken(accessToken?: string | null) {
  if (accessToken) return accessToken
  const stored = getAccessToken()
  if (stored) return stored
  const refreshed = await refreshAccessToken()
  return refreshed?.access_token ?? null
}

async function progressFetch<T>(
  path: string,
  options: RequestInit,
  normalize: (data: unknown) => T | null,
  fallbackError: string,
  accessToken?: string | null,
): Promise<ProgressApiResult<T>> {
  const apiBase = getCatalogApiBase()
  if (!apiBase) {
    return { success: false, error: 'API URL is not configured', status: 500 }
  }

  async function run(token: string): Promise<ProgressApiResult<T>> {
    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${token}`)

    const res = await fetch(`${apiBase}${path}`, {
      ...options,
      headers,
      credentials: 'include',
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      const normalized = normalize(data)
      if (normalized) return { success: true, data: normalized }
      return { success: false, error: 'Invalid response from server', status: 502 }
    }

    return {
      success: false,
      error: getErrorMessage(data, fallbackError),
      status: res.status,
    }
  }

  const token = await resolveAccessToken(accessToken)
  if (!token) {
    return { success: false, error: 'Please sign in to continue', status: 401 }
  }

  const first = await run(token)
  if (first.success || first.status !== 401) return first

  const refreshed = await refreshAccessToken()
  if (!refreshed?.access_token) return first

  return run(refreshed.access_token)
}

export async function getCourseProgress(
  slug: string,
  accessToken?: string | null,
): Promise<ProgressApiResult<CourseProgress>> {
  return progressFetch(
    `/api/v1/user/courses/by-slug/${encodeURIComponent(slug)}/progress`,
    { method: 'GET' },
    normalizeCourseProgress,
    'Failed to load progress',
    accessToken,
  )
}

export async function completeLesson(
  lessonId: string,
  accessToken?: string | null,
): Promise<ProgressApiResult<CompleteLessonResponse>> {
  return progressFetch(
    `/api/v1/user/lessons/${encodeURIComponent(lessonId)}/complete`,
    { method: 'POST' },
    normalizeCompleteLesson,
    'Failed to mark lesson complete',
    accessToken,
  )
}

export const progressApi = {
  getCourseProgress,
  completeLesson,
}
