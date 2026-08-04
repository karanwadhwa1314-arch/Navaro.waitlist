import { refreshAccessToken } from '@/lib/auth/refresh'
import { getAccessToken } from '@/lib/auth/storage'

import { getPaymentsApiBase } from '@/lib/payments/config'
import type {
  CargoRFQPaymentDetails,
  CoursePaymentDetails,
  InitiatePaymentResponse,
} from '@/lib/payments/types'

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

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

async function getErrorMessage(res: Response, fallback: string) {
  const data = await res.json().catch(() => ({}))
  if (!data || typeof data !== 'object') return fallback
  const record = data as Record<string, unknown>
  const errors = record.errors
  if (Array.isArray(errors) && typeof errors[0] === 'string') return errors[0]
  return readString(record, 'message', 'error', 'msg') || fallback
}

async function resolveToken(token?: string | null) {
  if (token) return token
  const stored = getAccessToken()
  if (stored) return stored
  const refreshed = await refreshAccessToken()
  return refreshed?.access_token ?? null
}

async function userFetch<T>(
  path: string,
  options: RequestInit,
  fallbackError: string,
  token?: string | null,
): Promise<T> {
  const apiBase = getPaymentsApiBase()
  const accessToken = await resolveToken(token)
  if (!accessToken) throw new Error('Please sign in to continue')

  async function run(bearer: string) {
    return fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        ...authHeaders(bearer),
        ...(options.headers as Record<string, string> | undefined),
      },
      credentials: 'include',
      cache: 'no-store',
    })
  }

  let res = await run(accessToken)
  if (res.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed?.access_token) res = await run(refreshed.access_token)
  }

  if (!res.ok) throw new Error(await getErrorMessage(res, fallbackError))
  return res.json() as Promise<T>
}

function normalizeInitiatePayment(data: unknown): InitiatePaymentResponse {
  if (!data || typeof data !== 'object') throw new Error('Invalid payment response')
  const record = data as Record<string, unknown>
  const nested =
    record.payment && typeof record.payment === 'object'
      ? (record.payment as Record<string, unknown>)
      : record.data && typeof record.data === 'object'
        ? (record.data as Record<string, unknown>)
        : record

  const transactionId = readString(nested, 'transactionId', 'transaction_id')
  const orderId = readString(nested, 'orderId', 'order_id')
  const paymentUrl = readString(nested, 'paymentUrl', 'payment_url')
  if (!transactionId || !orderId || !paymentUrl) throw new Error('Invalid payment response')

  const payableType = readString(nested, 'payableType', 'payable_type').toUpperCase()
  const encRequest = readString(nested, 'encRequest', 'enc_request')
  const accessCode = readString(nested, 'accessCode', 'access_code')
  const mockCompleteUrl = readString(nested, 'mockCompleteUrl', 'mock_complete_url')

  return {
    transactionId,
    orderId,
    payableType: payableType === 'CARGO_RFQ' ? 'CARGO_RFQ' : 'COURSE',
    courseSlug: readString(nested, 'courseSlug', 'course_slug') || undefined,
    cargoRfqId: readString(nested, 'cargoRfqId', 'cargo_rfq_id') || undefined,
    paymentUrl,
    mockMode: readBoolean(nested, 'mockMode', 'mock_mode'),
    encRequest: encRequest || undefined,
    accessCode: accessCode || undefined,
    mockCompleteUrl: mockCompleteUrl || undefined,
  }
}

function normalizeCoursePaymentDetails(data: unknown): CoursePaymentDetails {
  if (!data || typeof data !== 'object') throw new Error('Invalid payment details')
  const record = data as Record<string, unknown>
  const nested =
    record.payment && typeof record.payment === 'object'
      ? (record.payment as Record<string, unknown>)
      : record

  const courseId = readString(nested, 'courseId', 'course_id')
  if (!courseId) throw new Error('Invalid payment details')

  return {
    courseId,
    courseTitle: readString(nested, 'courseTitle', 'course_title'),
    courseSlug: readString(nested, 'courseSlug', 'course_slug'),
    amount: readNumber(nested, 'amount') ?? 0,
    currency: readString(nested, 'currency') || 'INR',
    paymentRequired: readBoolean(nested, 'paymentRequired', 'payment_required'),
    isEnrolled: readBoolean(nested, 'isEnrolled', 'is_enrolled'),
  }
}

function normalizeCargoRfqPaymentDetails(data: unknown): CargoRFQPaymentDetails {
  if (!data || typeof data !== 'object') throw new Error('Invalid payment details')
  const record = data as Record<string, unknown>
  const nested =
    record.payment && typeof record.payment === 'object'
      ? (record.payment as Record<string, unknown>)
      : record.data && typeof record.data === 'object'
        ? (record.data as Record<string, unknown>)
        : record

  const cargoRfqId = readString(nested, 'cargoRfqId', 'cargo_rfq_id')
  if (!cargoRfqId) throw new Error('Invalid payment details')

  const quoteId = readString(nested, 'quoteId', 'quote_id')

  return {
    cargoRfqId,
    rfqStatus: readString(nested, 'rfqStatus', 'rfq_status'),
    quoteId: quoteId || undefined,
    quoteStatus: readString(nested, 'quoteStatus', 'quote_status') || undefined,
    amount: readNumber(nested, 'amount') ?? 0,
    currency: readString(nested, 'currency') || 'INR',
    paymentRequired: readBoolean(nested, 'paymentRequired', 'payment_required'),
  }
}

export async function getCoursePaymentDetails(token: string, courseId: string) {
  const data = await userFetch<unknown>(
    `/user/courses/${encodeURIComponent(courseId)}/payment`,
    { method: 'GET' },
    'Failed to load payment details',
    token,
  )
  return normalizeCoursePaymentDetails(data)
}

export async function initiateCoursePayment(token: string, courseId: string) {
  const data = await userFetch<unknown>(
    `/user/courses/${encodeURIComponent(courseId)}/payments/initiate`,
    { method: 'POST' },
    'Failed to initiate payment',
    token,
  )
  return normalizeInitiatePayment(data)
}

export async function getCargoRFQPaymentDetails(token: string, rfqId: string) {
  const data = await userFetch<unknown>(
    `/user/cargo-rfqs/${encodeURIComponent(rfqId)}/payment`,
    { method: 'GET' },
    'Failed to load payment details',
    token,
  )
  return normalizeCargoRfqPaymentDetails(data)
}

export async function initiateCargoRFQPayment(token: string, rfqId: string) {
  const data = await userFetch<unknown>(
    `/user/cargo-rfqs/${encodeURIComponent(rfqId)}/payments/initiate`,
    { method: 'POST' },
    'Failed to initiate payment',
    token,
  )
  return normalizeInitiatePayment(data)
}
