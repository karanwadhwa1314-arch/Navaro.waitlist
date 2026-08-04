import { refreshAccessToken } from '@/lib/auth/refresh'
import { getAccessToken } from '@/lib/auth/storage'

import { getCatalogApiBase } from '@/lib/lms/catalog-helpers'
import type { CompleteMockPaymentResponse } from '@/lib/lms/catalog-types'
import { initiateCoursePayment as initiateCoursePaymentApi } from '@/lib/payments/api'
import { startPayment } from '@/lib/payments/handlePayment'
import type { InitiatePaymentResponse } from '@/lib/payments/types'

type ApiSuccess<T> = { success: true; data: T }
type ApiFailure = { success: false; error: string; status?: number }
export type PaymentApiResult<T> = ApiSuccess<T> | ApiFailure

function readString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') return value
  }
  return ''
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

function normalizeCompleteMockPayment(data: unknown): CompleteMockPaymentResponse | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const orderId = readString(record, 'orderId', 'order_id')
  const orderStatus = readString(record, 'orderStatus', 'order_status')
  const courseId = readString(record, 'courseId', 'course_id')
  const enrollmentId = readString(record, 'enrollmentId', 'enrollment_id')
  const enrollmentStatus = readString(record, 'enrollmentStatus', 'enrollment_status')
  const paymentStatus = readString(record, 'paymentStatus', 'payment_status')
  if (!orderId) return null

  return {
    orderId,
    orderStatus: orderStatus || 'Unknown',
    courseId,
    enrollmentId,
    enrollmentStatus,
    paymentStatus,
  }
}

async function resolveAccessToken(accessToken?: string | null) {
  if (accessToken) return accessToken
  const stored = getAccessToken()
  if (stored) return stored
  const refreshed = await refreshAccessToken()
  return refreshed?.access_token ?? null
}

async function paymentFetch<T>(
  path: string,
  options: RequestInit,
  normalize: (data: unknown) => T | null,
  fallbackError: string,
  accessToken?: string | null,
): Promise<PaymentApiResult<T>> {
  const apiBase = getCatalogApiBase()
  if (!apiBase) {
    return { success: false, error: 'API URL is not configured', status: 500 }
  }

  async function run(token: string): Promise<PaymentApiResult<T>> {
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

export async function initiateCoursePayment(
  courseId: string,
  accessToken?: string | null,
): Promise<PaymentApiResult<InitiatePaymentResponse>> {
  if (!courseId?.trim()) {
    return { success: false, error: 'Course not found', status: 404 }
  }

  const token = await resolveAccessToken(accessToken)
  if (!token) {
    return { success: false, error: 'Please sign in to continue', status: 401 }
  }

  try {
    const data = await initiateCoursePaymentApi(token, courseId)
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate payment',
      status: 400,
    }
  }
}

export async function completeMockPayment(
  orderId: string,
  success: boolean,
  accessToken?: string | null,
): Promise<PaymentApiResult<CompleteMockPaymentResponse>> {
  if (!orderId?.trim()) {
    return { success: false, error: 'Order not found', status: 400 }
  }

  return paymentFetch(
    '/api/v1/payments/mock/complete',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, success }),
    },
    normalizeCompleteMockPayment,
    'Failed to complete payment',
    accessToken,
  )
}

export async function handleCoursePurchase(
  courseId: string,
  accessToken?: string | null,
): Promise<PaymentApiResult<InitiatePaymentResponse>> {
  const result = await initiateCoursePayment(courseId, accessToken)
  if (!result.success) return result

  try {
    startPayment(result.data)
    return result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start payment',
      status: 502,
    }
  }
}

export async function handleBuyNow(
  course: { id: string },
  accessToken?: string | null,
): Promise<PaymentApiResult<InitiatePaymentResponse>> {
  return handleCoursePurchase(course.id, accessToken)
}

export const paymentApi = {
  initiateCoursePayment,
  completeMockPayment,
  handleCoursePurchase,
  handleBuyNow,
}
