import type { AuthUser } from '@/lib/auth/storage'
import { normalizeAuthUser } from '@/lib/auth/normalize-user'
import { ROLES } from '@/lib/auth/roles'

const USER_PROFILE_PATH = '/api/v1/user/profile'
const USER_ME_PATH = '/api/v1/user/me'
const USER_PROFILE_AVATAR_PATH = '/api/v1/user/profile/avatar'
const CARGO_INSURANCE_DOCUMENTS_PATH = '/api/v1/user/cargo_insurance_documents'
const PAYMENTS_INITIATE_PATH = '/api/v1/user/payments/initiate'

export type UserProfile = {
  id: string
  user_id: string
  name: string
  email: string
  phone: string
  country: string
  avatar: string
  bio: string
}

export type UpdateProfilePayload = {
  phone: string
  country: string
  bio: string
}

export function getBackendApiUrl(): string {
  const raw = process.env.BACKEND_API_URL?.trim() || process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim()
  return (raw || '').replace(/\/$/, '')
}

export function resolveBackendAssetUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed
  }

  const base = getBackendApiUrl()
  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`
}

export class BackendAuthError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'BackendAuthError'
    this.status = status
  }
}

export function parseBackendError(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback
  const obj = data as Record<string, unknown>
  if (typeof obj.message === 'string' && obj.message) return obj.message
  if (typeof obj.error === 'string' && obj.error) return obj.error
  if (Array.isArray(obj.errors) && obj.errors.length > 0) {
    const first = obj.errors[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object' && 'message' in first) {
      const msg = (first as { message?: unknown }).message
      if (typeof msg === 'string') return msg
    }
  }
  return fallback
}

function unwrapProfilePayload(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data
  const obj = data as Record<string, unknown>
  return obj.profile ?? obj.data ?? obj.user ?? data
}

export function normalizeUserProfile(value: unknown): UserProfile | null {
  const raw = unwrapProfilePayload(value)
  if (!raw || typeof raw !== 'object') return null

  const profile = raw as Record<string, unknown>
  const email = typeof profile.email === 'string' ? profile.email : ''
  if (!email) return null

  const userId =
    typeof profile.user_id === 'string'
      ? profile.user_id
      : typeof profile.id === 'string'
        ? profile.id
        : ''

  return {
    id: typeof profile.id === 'string' ? profile.id : userId,
    user_id: userId,
    name: typeof profile.name === 'string' ? profile.name : '',
    email,
    phone: typeof profile.phone === 'string' ? profile.phone : '',
    country: typeof profile.country === 'string' ? profile.country : '',
    avatar: typeof profile.avatar === 'string' ? profile.avatar : '',
    bio: typeof profile.bio === 'string' ? profile.bio : '',
  }
}

function profileToAuthUser(profile: UserProfile, existing?: AuthUser | null): AuthUser {
  return {
    id: profile.user_id || profile.id,
    name: profile.name,
    email: profile.email,
    role: existing?.role ?? ROLES.USER,
    is_active: existing?.is_active ?? true,
    email_verified: existing?.email_verified ?? false,
  }
}

export async function fetchBackendCurrentUser(
  accessToken: string,
  existing?: AuthUser | null,
): Promise<AuthUser | null> {
  const backendUrl = `${getBackendApiUrl()}${USER_ME_PATH}`
  const res = await fetch(backendUrl, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) return null
    throw new BackendAuthError(parseBackendError(data, 'Failed to load current user'), res.status)
  }

  const payload = (data as { user?: unknown }).user ?? data
  return normalizeAuthUser(payload, existing)
}

export async function fetchBackendProfile(accessToken: string): Promise<UserProfile | null> {
  const backendUrl = `${getBackendApiUrl()}${USER_PROFILE_PATH}`
  const res = await fetch(backendUrl, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new BackendAuthError(parseBackendError(data, 'Failed to load user profile'), res.status)
  }

  return normalizeUserProfile(data)
}

export async function updateBackendProfile(
  accessToken: string,
  payload: UpdateProfilePayload,
): Promise<UserProfile | null> {
  const backendUrl = `${getBackendApiUrl()}${USER_PROFILE_PATH}`
  const res = await fetch(backendUrl, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new BackendAuthError(parseBackendError(data, 'Failed to update user profile'), res.status)
  }

  return normalizeUserProfile(data)
}

function extractAvatarUrl(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const obj = data as Record<string, unknown>
  const unwrapped = unwrapProfilePayload(data)
  if (unwrapped && typeof unwrapped === 'object') {
    const record = unwrapped as Record<string, unknown>
    if (typeof record.avatar === 'string' && record.avatar) {
      return record.avatar
    }
  }
  if (typeof obj.avatar === 'string' && obj.avatar) {
    return obj.avatar
  }
  return null
}

export async function uploadBackendProfileAvatar(
  accessToken: string,
  file: Blob,
  filename: string,
): Promise<string> {
  const backendUrl = `${getBackendApiUrl()}${USER_PROFILE_AVATAR_PATH}`
  const formData = new FormData()
  formData.append('avatar', file, filename)

  const res = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new BackendAuthError(parseBackendError(data, 'Failed to upload profile avatar'), res.status)
  }

  const avatarUrl = extractAvatarUrl(data)
  if (!avatarUrl) {
    throw new BackendAuthError('Invalid avatar upload response', 502)
  }

  return avatarUrl
}

export async function uploadBackendCargoInsuranceDocument(
  accessToken: string,
  payload: {
    file: Blob
    filename: string
    title: string
    description?: string
  },
): Promise<unknown> {
  const backendUrl = `${getBackendApiUrl()}${CARGO_INSURANCE_DOCUMENTS_PATH}`
  const formData = new FormData()
  formData.append('title', payload.title.trim())
  if (payload.description?.trim()) {
    formData.append('description', payload.description.trim())
  }
  formData.append('document', payload.file, payload.filename)

  const res = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new BackendAuthError(
      parseBackendError(data, 'Failed to upload cargo insurance document'),
      res.status,
    )
  }

  return data
}

export async function updateBackendCargoInsuranceDocument(
  accessToken: string,
  documentId: string,
  payload: {
    file: Blob
    filename: string
    title: string
    description?: string
  },
): Promise<unknown> {
  const backendUrl = `${getBackendApiUrl()}${CARGO_INSURANCE_DOCUMENTS_PATH}/${encodeURIComponent(documentId)}`
  const formData = new FormData()
  formData.append('title', payload.title.trim())
  if (payload.description?.trim()) {
    formData.append('description', payload.description.trim())
  }
  formData.append('document', payload.file, payload.filename)

  const res = await fetch(backendUrl, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new BackendAuthError(
      parseBackendError(data, 'Failed to update cargo insurance document'),
      res.status,
    )
  }

  return data
}

export async function fetchBackendCargoInsuranceDocument(
  accessToken: string,
  documentId: string,
): Promise<unknown> {
  const backendUrl = `${getBackendApiUrl()}${CARGO_INSURANCE_DOCUMENTS_PATH}/${encodeURIComponent(documentId)}`
  const res = await fetch(backendUrl, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new BackendAuthError(
      parseBackendError(data, 'Failed to load cargo insurance document'),
      res.status,
    )
  }

  return data
}

export async function fetchBackendCargoInsuranceDocumentComments(
  accessToken: string,
  documentId: string,
): Promise<unknown> {
  const backendUrl = `${getBackendApiUrl()}${CARGO_INSURANCE_DOCUMENTS_PATH}/${encodeURIComponent(documentId)}/comments`
  const res = await fetch(backendUrl, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new BackendAuthError(
      parseBackendError(data, 'Failed to load document comments'),
      res.status,
    )
  }

  return data
}

export async function fetchBackendCargoInsuranceDocumentPayment(
  accessToken: string,
  documentId: string,
): Promise<unknown> {
  const backendUrl = `${getBackendApiUrl()}${CARGO_INSURANCE_DOCUMENTS_PATH}/${encodeURIComponent(documentId)}/payment`
  const res = await fetch(backendUrl, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new BackendAuthError(
      parseBackendError(data, 'Failed to load payment details'),
      res.status,
    )
  }

  return data
}

export async function fetchBackendCargoInsuranceDocumentActivity(
  accessToken: string,
  documentId: string,
): Promise<unknown> {
  const backendUrl = `${getBackendApiUrl()}${CARGO_INSURANCE_DOCUMENTS_PATH}/${encodeURIComponent(documentId)}/activity`
  const res = await fetch(backendUrl, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new BackendAuthError(
      parseBackendError(data, 'Failed to load document activity'),
      res.status,
    )
  }

  return data
}

export async function initiateBackendPayment(
  accessToken: string,
  documentId: string,
): Promise<unknown> {
  const backendUrl = `${getBackendApiUrl()}${PAYMENTS_INITIATE_PATH}`
  const res = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ documentId }),
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new BackendAuthError(parseBackendError(data, 'Failed to initiate payment'), res.status)
  }

  return data
}

export async function fetchBackendCargoInsuranceDocuments(
  accessToken: string,
): Promise<unknown> {
  const backendUrl = `${getBackendApiUrl()}${CARGO_INSURANCE_DOCUMENTS_PATH}`
  const res = await fetch(backendUrl, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new BackendAuthError(
      parseBackendError(data, 'Failed to load cargo insurance documents'),
      res.status,
    )
  }

  return data
}

export async function fetchBackendUser(
  accessToken: string,
  existing?: AuthUser | null,
): Promise<AuthUser | null> {
  const currentUser = await fetchBackendCurrentUser(accessToken, existing)
  if (currentUser) return currentUser

  const profile = await fetchBackendProfile(accessToken)
  if (!profile) return null
  return profileToAuthUser(profile, existing)
}
