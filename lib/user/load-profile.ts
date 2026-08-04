import { refreshAccessToken } from '@/lib/auth/refresh'
import type { UpdateProfilePayload, UserProfile } from '@/lib/auth/backend'
import { getAccessToken } from '@/lib/auth/storage'

export type UpdateProfileResult =
  | { success: true; profile: UserProfile }
  | { success: false; error: string; status?: number }

export type UploadAvatarResult =
  | { success: true; avatar: string }
  | { success: false; error: string; status?: number }

async function requestProfile(accessToken: string): Promise<UserProfile | null> {
  const res = await fetch('/api/user/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))

  if (res.ok && data.success && data.profile) {
    return data.profile as UserProfile
  }

  if (res.status === 401) {
    return null
  }

  return null
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
  let accessToken = getAccessToken()

  if (accessToken) {
    const profile = await requestProfile(accessToken)
    if (profile) return profile
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) return null

  return requestProfile(refreshed.access_token)
}

async function requestProfileUpdate(
  accessToken: string,
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResult> {
  const res = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))

  if (res.ok && data.success && data.profile) {
    return { success: true, profile: data.profile as UserProfile }
  }

  return {
    success: false,
    error: typeof data.error === 'string' ? data.error : 'Failed to update profile',
    status: res.status,
  }
}

export async function updateUserProfile(
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResult> {
  let accessToken = getAccessToken()

  if (accessToken) {
    const result = await requestProfileUpdate(accessToken, payload)
    if (result.success || result.status !== 401) {
      return result
    }
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestProfileUpdate(refreshed.access_token, payload)
}

async function requestAvatarUpload(
  accessToken: string,
  file: File,
): Promise<UploadAvatarResult> {
  const formData = new FormData()
  formData.append('avatar', file, file.name)

  const res = await fetch('/api/user/profile/avatar', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))

  if (res.ok && data.success && typeof data.avatar === 'string') {
    return { success: true, avatar: data.avatar }
  }

  return {
    success: false,
    error: typeof data.error === 'string' ? data.error : 'Failed to upload avatar',
    status: res.status,
  }
}

export async function uploadUserProfileAvatar(file: File): Promise<UploadAvatarResult> {
  let accessToken = getAccessToken()

  if (accessToken) {
    const result = await requestAvatarUpload(accessToken, file)
    if (result.success || result.status !== 401) {
      return result
    }
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestAvatarUpload(refreshed.access_token, file)
}
