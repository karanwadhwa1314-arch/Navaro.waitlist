import { refreshAccessToken } from '@/lib/auth/refresh'
import { getAccessToken } from '@/lib/auth/storage'

import { getCatalogApiBase } from '@/lib/lms/catalog-helpers'
import type {
  CategoryListResponse,
  CourseDetail,
  CourseListParams,
  CourseListResponse,
  LessonOutline,
  ModuleOutline,
} from '@/lib/lms/catalog-types'

type ApiSuccess<T> = { success: true; data: T }
type ApiFailure = { success: false; error: string; status?: number }
export type CatalogApiResult<T> = ApiSuccess<T> | ApiFailure

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

function readArray(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) return value
  }
  return []
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

function normalizeLesson(data: unknown): LessonOutline | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const id = readString(record, 'id')
  if (!id) return null

  const contentType = readString(record, 'contentType', 'content_type').toUpperCase()
  const isLocked = readBoolean(record, 'isLocked', 'is_locked')
  const normalizedType =
    contentType === 'PDF' || contentType === 'TEXT' || contentType === 'HTML' ? contentType : 'VIDEO'
  const lesson: LessonOutline = {
    id,
    title: readString(record, 'title'),
    contentType: normalizedType as LessonOutline['contentType'],
    durationSeconds: readNumber(record, 'durationSeconds', 'duration_seconds') ?? 0,
    sortOrder: readNumber(record, 'sortOrder', 'sort_order') ?? 0,
    isPreview: readBoolean(record, 'isPreview', 'is_preview'),
    isLocked,
  }

  const description = readString(record, 'description')
  if (description) lesson.description = description

  const contentText = readString(record, 'contentText', 'content_text')
  const videoUrl = readString(record, 'videoUrl', 'video_url')
  const videoS3Key = readString(record, 'videoS3Key', 'video_s3_key')
  const videoFileName = readString(record, 'videoFileName', 'video_file_name')
  const thumbnailUrl = readString(record, 'thumbnailUrl', 'thumbnail_url')
  const thumbnailS3Key = readString(record, 'thumbnailS3Key', 'thumbnail_s3_key')
  if (contentText) lesson.contentText = contentText
  if (!isLocked && videoUrl) lesson.videoUrl = videoUrl
  if (!isLocked && videoS3Key) lesson.videoS3Key = videoS3Key
  if (videoFileName) lesson.videoFileName = videoFileName
  if (thumbnailUrl) lesson.thumbnailUrl = thumbnailUrl
  if (thumbnailS3Key) lesson.thumbnailS3Key = thumbnailS3Key

  return lesson
}

function normalizeModule(data: unknown): ModuleOutline | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const id = readString(record, 'id')
  if (!id) return null

  const lessons = readArray(record, 'lessons')
    .map((item) => normalizeLesson(item))
    .filter((item): item is LessonOutline => item !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return {
    id,
    title: readString(record, 'title'),
    description: readString(record, 'description'),
    sortOrder: readNumber(record, 'sortOrder', 'sort_order') ?? 0,
    lessons,
  }
}

function normalizeCourseListItem(data: unknown) {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const id = readString(record, 'id')
  const slug = readString(record, 'slug')
  if (!id || !slug) return null

  const category = normalizeCategorySummary(record.category)
  if (!category) return null

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

function normalizeCourseList(data: unknown): CourseListResponse | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const courses = readArray(record, 'courses')
    .map((item) => normalizeCourseListItem(item))
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return {
    courses,
    total: readNumber(record, 'total') ?? courses.length,
    page: readNumber(record, 'page') ?? 1,
    limit: readNumber(record, 'limit') ?? 20,
  }
}

function normalizeCourseDetail(data: unknown): CourseDetail | null {
  const base = normalizeCourseListItem(data)
  if (!base) return null

  const record = data as Record<string, unknown>
  const modules = readArray(record, 'modules')
    .map((item) => normalizeModule(item))
    .filter((item): item is ModuleOutline => item !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return {
    ...base,
    description: readString(record, 'description'),
    learningOutcomes: readArray(record, 'learningOutcomes', 'learning_outcomes').filter(
      (item): item is string => typeof item === 'string',
    ),
    requirements: readArray(record, 'requirements').filter((item): item is string => typeof item === 'string'),
    targetAudience: readArray(record, 'targetAudience', 'target_audience').filter(
      (item): item is string => typeof item === 'string',
    ),
    modules,
  }
}

function normalizeCategoryList(data: unknown): CategoryListResponse | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>

  const categories = readArray(record, 'categories')
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const id = readString(row, 'id')
      if (!id) return null
      return {
        id,
        name: readString(row, 'name'),
        slug: readString(row, 'slug'),
        description: readString(row, 'description'),
        isActive: readBoolean(row, 'isActive', 'is_active'),
        createdAt: readString(row, 'createdAt', 'created_at'),
        updatedAt: readString(row, 'updatedAt', 'updated_at'),
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return {
    categories,
    total: readNumber(record, 'total') ?? categories.length,
  }
}

function buildQuery(params?: CourseListParams) {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  if (params.page !== undefined) searchParams.set('page', String(params.page))
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
  if (params.search) searchParams.set('search', params.search)
  if (params.categoryId) searchParams.set('categoryId', params.categoryId)
  if (params.level) searchParams.set('level', params.level)
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

async function resolveAccessToken(accessToken?: string | null, allowStored = true) {
  if (accessToken) return accessToken
  if (accessToken === null) return null
  if (!allowStored) return null
  const stored = getAccessToken()
  if (stored) return stored
  const refreshed = await refreshAccessToken()
  return refreshed?.access_token ?? null
}

async function catalogFetch<T>(
  path: string,
  normalize: (data: unknown) => T | null,
  fallbackError: string,
  accessToken?: string | null,
  options?: { allowStoredToken?: boolean },
): Promise<CatalogApiResult<T>> {
  const apiBase = getCatalogApiBase()
  if (!apiBase) {
    return { success: false, error: 'Catalog API URL is not configured', status: 500 }
  }

  async function run(token?: string | null): Promise<CatalogApiResult<T>> {
    const headers: HeadersInit = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(`${apiBase}/api/v1/catalog${path}`, {
      method: 'GET',
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

  const token = await resolveAccessToken(accessToken, options?.allowStoredToken !== false)
  if (!token) return run(null)

  const first = await run(token)
  if (first.success || first.status !== 401) return first

  const refreshed = await refreshAccessToken()
  if (!refreshed?.access_token) return first

  return run(refreshed.access_token)
}

export async function getCourses(
  params?: CourseListParams,
  accessToken?: string | null,
): Promise<CatalogApiResult<CourseListResponse>> {
  return catalogFetch(`/courses${buildQuery(params)}`, normalizeCourseList, 'Failed to load courses', accessToken)
}

export async function getCourseBySlug(
  slug: string,
  accessToken?: string | null,
): Promise<CatalogApiResult<CourseDetail>> {
  if (!slug?.trim()) {
    return { success: false, error: 'Course not found', status: 404 }
  }

  return catalogFetch(
    `/courses/${encodeURIComponent(slug)}`,
    normalizeCourseDetail,
    'Failed to load course',
    accessToken,
    { allowStoredToken: accessToken !== null },
  )
}

export async function getCategories(): Promise<CatalogApiResult<CategoryListResponse>> {
  return catalogFetch('/course-categories', normalizeCategoryList, 'Failed to load categories', null)
}

async function userApiFetch<T>(
  path: string,
  normalize: (data: unknown) => T | null,
  fallbackError: string,
  accessToken?: string | null,
): Promise<CatalogApiResult<T>> {
  const apiBase = getCatalogApiBase()
  if (!apiBase) {
    return { success: false, error: 'Catalog API URL is not configured', status: 500 }
  }

  async function run(token?: string | null): Promise<CatalogApiResult<T>> {
    const headers: HeadersInit = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(`${apiBase}${path}`, {
      method: 'GET',
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

  const token = await resolveAccessToken(accessToken, accessToken !== null)
  const first = await run(token)
  if (!token || first.success || first.status !== 401) return first

  const refreshed = await refreshAccessToken()
  if (!refreshed?.access_token) return first

  return run(refreshed.access_token)
}

export async function getUserCourseBySlug(
  slug: string,
  accessToken?: string | null,
): Promise<CatalogApiResult<CourseDetail>> {
  if (!slug?.trim()) {
    return { success: false, error: 'Course not found', status: 404 }
  }

  return userApiFetch(
    `/api/v1/user/courses/by-slug/${encodeURIComponent(slug)}`,
    normalizeCourseDetail,
    'Failed to load course',
    accessToken,
  )
}

export const catalogApi = {
  getCourses,
  getCourseBySlug,
  getUserCourseBySlug,
  getCategories,
}
