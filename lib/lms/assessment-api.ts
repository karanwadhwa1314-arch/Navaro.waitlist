import { refreshAccessToken } from '@/lib/auth/refresh'
import { getAccessToken } from '@/lib/auth/storage'

import { getCatalogApiBase } from '@/lib/lms/catalog-helpers'
import type {
  AssignmentSubmission,
  StartQuizResponse,
  SubmitQuizRequest,
  SubmitQuizResponse,
  UserAssessmentListItem,
  UserAssessmentListResponse,
  UserAssignmentDetailResponse,
  UserQuizDetailResponse,
} from '@/lib/lms/assessment-types'

type ApiSuccess<T> = { success: true; data: T }
type ApiFailure = { success: false; error: string; status?: number }
export type AssessmentApiResult<T> = ApiSuccess<T> | ApiFailure

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
  if (Array.isArray(errors) && typeof errors[0] === 'string') return errors[0]
  return readString(record, 'message', 'error', 'msg') || fallback
}

function normalizeQuizOption(data: unknown) {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const id = readString(record, 'id')
  if (!id) return null
  return {
    id,
    optionText: readString(record, 'optionText', 'option_text'),
    sortOrder: readNumber(record, 'sortOrder', 'sort_order') ?? 0,
  }
}

function normalizeQuizQuestion(data: unknown) {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const id = readString(record, 'id')
  if (!id) return null
  const questionType = readString(record, 'questionType', 'question_type').toUpperCase()
  const options = readArray(record, 'options')
    .map((item) => normalizeQuizOption(item))
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return {
    id,
    questionText: readString(record, 'questionText', 'question_text'),
    questionType: (questionType === 'TRUE_FALSE' ? 'TRUE_FALSE' : 'MCQ') as 'MCQ' | 'TRUE_FALSE',
    points: readNumber(record, 'points') ?? 0,
    sortOrder: readNumber(record, 'sortOrder', 'sort_order') ?? 0,
    options,
  }
}

function normalizeAssessmentListItem(data: unknown): UserAssessmentListItem | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const id = readString(record, 'id')
  const type = readString(record, 'type').toUpperCase()
  if (!id || (type !== 'QUIZ' && type !== 'ASSIGNMENT')) return null

  const moduleId = readString(record, 'moduleId', 'module_id') || null
  const lessonId = readString(record, 'lessonId', 'lesson_id') || null
  const dueAt = readString(record, 'dueAt', 'due_at') || null
  const bestScore = readNumber(record, 'bestScore', 'best_score')

  return {
    id,
    type: type as UserAssessmentListItem['type'],
    title: readString(record, 'title'),
    description: readString(record, 'description'),
    moduleId: moduleId || null,
    lessonId: lessonId || null,
    passingScorePercent: readNumber(record, 'passingScorePercent', 'passing_score_percent'),
    maxAttempts: readNumber(record, 'maxAttempts', 'max_attempts'),
    maxScore: readNumber(record, 'maxScore', 'max_score') ?? 100,
    dueAt,
    isRequired: readBoolean(record, 'isRequired', 'is_required'),
    isLocked: readBoolean(record, 'isLocked', 'is_locked'),
    attemptCount: readNumber(record, 'attemptCount', 'attempt_count') ?? 0,
    bestScore: bestScore ?? null,
    passed: readBoolean(record, 'passed'),
  }
}

function normalizeAssessmentList(data: unknown): UserAssessmentListResponse | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const assessments = readArray(record, 'assessments')
    .map((item) => normalizeAssessmentListItem(item))
    .filter((item): item is UserAssessmentListItem => item !== null)

  return {
    assessments,
    total: readNumber(record, 'total') ?? assessments.length,
  }
}

function normalizeQuizDetail(data: unknown): UserQuizDetailResponse | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const id = readString(record, 'id')
  if (!id) return null

  const questions = readArray(record, 'questions')
    .map((item) => normalizeQuizQuestion(item))
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return {
    id,
    title: readString(record, 'title'),
    instructions: readString(record, 'instructions'),
    passingScorePercent: readNumber(record, 'passingScorePercent', 'passing_score_percent') ?? 70,
    maxAttempts: readNumber(record, 'maxAttempts', 'max_attempts') ?? 0,
    maxScore: readNumber(record, 'maxScore', 'max_score') ?? 100,
    attemptCount: readNumber(record, 'attemptCount', 'attempt_count') ?? 0,
    questions,
  }
}

function normalizeStartQuiz(data: unknown): StartQuizResponse | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const attemptId = readString(record, 'attemptId', 'attempt_id')
  const startedAt = readString(record, 'startedAt', 'started_at')
  if (!attemptId || !startedAt) return null
  return { attemptId, startedAt }
}

function normalizeSubmitQuiz(data: unknown): SubmitQuizResponse | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const attemptId = readString(record, 'attemptId', 'attempt_id')
  const submittedAt = readString(record, 'submittedAt', 'submitted_at')
  if (!attemptId || !submittedAt) return null
  return {
    attemptId,
    score: readNumber(record, 'score') ?? 0,
    maxScore: readNumber(record, 'maxScore', 'max_score') ?? 100,
    passed: readBoolean(record, 'passed'),
    submittedAt,
  }
}

function normalizeSubmission(data: unknown): AssignmentSubmission | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const id = readString(record, 'id')
  const assessmentId = readString(record, 'assessmentId', 'assessment_id')
  const submittedAt = readString(record, 'submittedAt', 'submitted_at')
  if (!id || !assessmentId || !submittedAt) return null

  const status = readString(record, 'status').toUpperCase()
  const gradedAt = readString(record, 'gradedAt', 'graded_at')
  const feedback = readString(record, 'feedback')

  return {
    id,
    assessmentId,
    contentText: readString(record, 'contentText', 'content_text'),
    status: (status === 'GRADED' ? 'GRADED' : 'SUBMITTED') as AssignmentSubmission['status'],
    score: readNumber(record, 'score') ?? null,
    maxScore: readNumber(record, 'maxScore', 'max_score') ?? 100,
    feedback: feedback || undefined,
    submittedAt,
    gradedAt: gradedAt || null,
  }
}

function normalizeAssignmentDetail(data: unknown): UserAssignmentDetailResponse | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const id = readString(record, 'id')
  if (!id) return null

  const dueAt = readString(record, 'dueAt', 'due_at') || null
  const submissionRaw = record.submission
  const submission =
    submissionRaw && typeof submissionRaw === 'object' ? normalizeSubmission(submissionRaw) : null

  return {
    id,
    title: readString(record, 'title'),
    instructions: readString(record, 'instructions'),
    maxScore: readNumber(record, 'maxScore', 'max_score') ?? 100,
    dueAt,
    submission: submission || undefined,
  }
}

async function resolveAccessToken(accessToken?: string | null) {
  if (accessToken) return accessToken
  const stored = getAccessToken()
  if (stored) return stored
  const refreshed = await refreshAccessToken()
  return refreshed?.access_token ?? null
}

async function assessmentFetch<T>(
  path: string,
  options: RequestInit,
  normalize: (data: unknown) => T | null,
  fallbackError: string,
  accessToken?: string | null,
): Promise<AssessmentApiResult<T>> {
  const apiBase = getCatalogApiBase()
  if (!apiBase) {
    return { success: false, error: 'API URL is not configured', status: 500 }
  }

  async function run(token: string): Promise<AssessmentApiResult<T>> {
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

export async function listAssessments(
  slug: string,
  accessToken?: string | null,
): Promise<AssessmentApiResult<UserAssessmentListResponse>> {
  return assessmentFetch(
    `/api/v1/user/courses/by-slug/${encodeURIComponent(slug)}/assessments`,
    { method: 'GET' },
    normalizeAssessmentList,
    'Failed to load assessments',
    accessToken,
  )
}

export async function getQuiz(
  assessmentId: string,
  accessToken?: string | null,
): Promise<AssessmentApiResult<UserQuizDetailResponse>> {
  return assessmentFetch(
    `/api/v1/user/assessments/${encodeURIComponent(assessmentId)}/quiz`,
    { method: 'GET' },
    normalizeQuizDetail,
    'Failed to load quiz',
    accessToken,
  )
}

export async function startQuiz(
  assessmentId: string,
  accessToken?: string | null,
): Promise<AssessmentApiResult<StartQuizResponse>> {
  return assessmentFetch(
    `/api/v1/user/assessments/${encodeURIComponent(assessmentId)}/quiz/start`,
    { method: 'POST' },
    normalizeStartQuiz,
    'Failed to start quiz',
    accessToken,
  )
}

export async function submitQuiz(
  assessmentId: string,
  body: SubmitQuizRequest,
  accessToken?: string | null,
): Promise<AssessmentApiResult<SubmitQuizResponse>> {
  return assessmentFetch(
    `/api/v1/user/assessments/${encodeURIComponent(assessmentId)}/quiz/submit`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    normalizeSubmitQuiz,
    'Failed to submit quiz',
    accessToken,
  )
}

export async function getAssignment(
  assessmentId: string,
  accessToken?: string | null,
): Promise<AssessmentApiResult<UserAssignmentDetailResponse>> {
  return assessmentFetch(
    `/api/v1/user/assessments/${encodeURIComponent(assessmentId)}/assignment`,
    { method: 'GET' },
    normalizeAssignmentDetail,
    'Failed to load assignment',
    accessToken,
  )
}

export async function submitAssignment(
  assessmentId: string,
  contentText: string,
  accessToken?: string | null,
): Promise<AssessmentApiResult<AssignmentSubmission>> {
  return assessmentFetch(
    `/api/v1/user/assessments/${encodeURIComponent(assessmentId)}/assignment/submit`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentText }),
    },
    normalizeSubmission,
    'Failed to submit assignment',
    accessToken,
  )
}

export const assessmentApi = {
  listAssessments,
  getQuiz,
  startQuiz,
  submitQuiz,
  getAssignment,
  submitAssignment,
}
