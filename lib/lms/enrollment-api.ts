import { refreshAccessToken } from '@/lib/auth/refresh'
import { getAccessToken } from '@/lib/auth/storage'

import { getCatalogApiBase, getEnrollmentErrorMessage } from '@/lib/lms/catalog-helpers'
import type {
  CourseListItem,
  EnrolledCourseItem,
  EnrolledCourseListResponse,
  EnrollmentResponse,
} from '@/lib/lms/catalog-types'

type ApiSuccess<T> = { success: true; data: T }
type ApiFailure = { success: false; error: string; status?: number }
export type EnrollmentApiResult<T> = ApiSuccess<T> | ApiFailure

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
  if (Array.isArray(errors) && typeof errors[0] === 'string') {
    return errors[0]
  }
  return readString(record, 'message', 'error', 'msg') || fallback
}

function normalizeCategorySummary(data: unknown) {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const id = readString(record, 'id')
  if (!id) return null
  return {
    id,
    name: readString(record, 'name'),
    slug: readString(record, 'slug'),
  }
}

function normalizeCourseListItem(data: unknown): CourseListItem | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const id = readString(record, 'id')
  const slug = readString(record, 'slug')
  if (!id || !slug) return null

  const category = normalizeCategorySummary(record.category) || {
    id: 'uncategorized',
    name: 'Uncategorized',
    slug: 'uncategorized',
  }

  return {
    id,
    slug,
    title: readString(record, 'title'),
    subtitle: readString(record, 'subtitle'),
    shortDescription: readString(record, 'shortDescription', 'short_description'),
    level: readString(record, 'level') || 'BEGINNER',
    language: readString(record, 'language') || 'English',
    thumbnailS3Key: readString(record, 'thumbnailS3Key', 'thumbnail_s3_key') || undefined,
    thumbnailUrl: readString(record, 'thumbnailUrl', 'thumbnail_url') || undefined,
    price: readNumber(record, 'price') ?? 0,
    currency: readString(record, 'currency') || 'INR',
    durationMinutes: readNumber(record, 'durationMinutes', 'duration_minutes') ?? 0,
    category,
    isEnrolled: readBoolean(record, 'isEnrolled', 'is_enrolled'),
    publishedAt: readString(record, 'publishedAt', 'published_at') || undefined,
  }
}

function normalizeEnrollmentResponse(data: unknown): EnrollmentResponse | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const id = readString(record, 'id')
  const courseId = readString(record, 'courseId', 'course_id')
  const status = readString(record, 'status') as EnrollmentResponse['status']
  const enrolledAt = readString(record, 'enrolledAt', 'enrolled_at')
  if (!id || !courseId || !enrolledAt) return null

  const completedAt = readString(record, 'completedAt', 'completed_at')
  return {
    id,
    courseId,
    status: status || 'ACTIVE',
    enrolledAt,
    completedAt: completedAt || undefined,
  }
}

function normalizeEnrolledCourseItem(data: unknown): EnrolledCourseItem | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const enrollmentId = readString(record, 'enrollmentId', 'enrollment_id', 'id')
  const enrolledAt = readString(record, 'enrolledAt', 'enrolled_at')
  const status = readString(record, 'status')
  const course = normalizeCourseListItem(record.course)
  if (!enrollmentId || !enrolledAt || !course) return null

  return {
    enrollmentId,
    enrolledAt,
    status: status || 'ACTIVE',
    course,
  }
}

function normalizeEnrolledCourseList(data: unknown): EnrolledCourseListResponse | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const enrollments = (Array.isArray(record.enrollments) ? record.enrollments : [])
    .map((item) => normalizeEnrolledCourseItem(item))
    .filter((item): item is EnrolledCourseItem => item !== null)

  return {
    enrollments,
    total: readNumber(record, 'total') ?? enrollments.length,
    page: readNumber(record, 'page') ?? 1,
    limit: readNumber(record, 'limit') ?? 20,
  }
}

async function resolveAccessToken(accessToken?: string | null) {
  if (accessToken) return accessToken
  const stored = getAccessToken()
  if (stored) return stored
  const refreshed = await refreshAccessToken()
  return refreshed?.access_token ?? null
}

async function userFetch<T>(
  path: string,
  options: RequestInit,
  normalize: (data: unknown) => T | null,
  fallbackError: string,
  accessToken?: string | null,
): Promise<EnrollmentApiResult<T>> {
  const apiBase = getCatalogApiBase()
  if (!apiBase) {
    return { success: false, error: 'API URL is not configured', status: 500 }
  }

  async function run(token: string): Promise<EnrollmentApiResult<T>> {
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
      error: getEnrollmentErrorMessage(res.status, getErrorMessage(data, fallbackError)),
      status: res.status,
    }
  }

  const token = await resolveAccessToken(accessToken)
  if (!token) {
    return { success: false, error: getEnrollmentErrorMessage(401), status: 401 }
  }

  const first = await run(token)
  if (first.success || first.status !== 401) return first

  const refreshed = await refreshAccessToken()
  if (!refreshed?.access_token) return first

  return run(refreshed.access_token)
}

export async function enrollInCourse(
  courseId: string,
  accessToken?: string | null,
): Promise<EnrollmentApiResult<EnrollmentResponse>> {
  if (!courseId?.trim()) {
    return { success: false, error: 'Course not found', status: 404 }
  }

  return userFetch(
    `/api/v1/user/courses/${encodeURIComponent(courseId)}/enroll`,
    { method: 'POST' },
    normalizeEnrollmentResponse,
    'Failed to enroll in course',
    accessToken,
  )
}

export async function getMyEnrolledCourses(
  page = 1,
  limit = 20,
  accessToken?: string | null,
): Promise<EnrollmentApiResult<EnrolledCourseListResponse>> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  return userFetch(
    `/api/v1/user/courses/enrolled?${query.toString()}`,
    { method: 'GET' },
    normalizeEnrolledCourseList,
    'Failed to load enrolled courses',
    accessToken,
  )
}

export const enrollmentApi = {
  enrollInCourse,
  getMyEnrolledCourses,
}
