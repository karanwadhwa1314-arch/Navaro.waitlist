import { normalizeUserRole, ROLES } from '@/lib/auth/roles'
import type { AuthUser } from '@/lib/auth/storage'

function readBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value
  return undefined
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function resolveIsActive(record: Record<string, unknown>): boolean {
  const isActive = readBoolean(record.is_active)
  if (isActive !== undefined) return isActive

  const status = readString(record.status).toLowerCase()
  if (status) return status === 'active'

  return true
}

function resolveEmailVerified(record: Record<string, unknown>): boolean {
  const emailVerified = readBoolean(record.email_verified)
  if (emailVerified !== undefined) return emailVerified

  const camelVerified = readBoolean(record.emailVerified)
  if (camelVerified !== undefined) return camelVerified

  return false
}

export function normalizeAuthUser(raw: unknown, fallback?: AuthUser | null): AuthUser | null {
  if (!raw || typeof raw !== 'object') {
    return fallback ? normalizeStoredUser(fallback) : null
  }

  const record = raw as Record<string, unknown>
  const id = readString(record.id) || fallback?.id || ''
  const email = readString(record.email) || fallback?.email || ''

  if (!id || !email) {
    return fallback ? normalizeStoredUser(fallback) : null
  }

  const role =
    normalizeUserRole(record.role) ??
    normalizeUserRole(fallback?.role) ??
    ROLES.USER

  return {
    id,
    name: readString(record.name) || fallback?.name || '',
    email,
    role,
    is_active: resolveIsActive(record),
    email_verified: resolveEmailVerified(record),
  }
}

export function normalizeStoredUser(user: AuthUser | null): AuthUser | null {
  if (!user) return null
  return normalizeAuthUser(user, user)
}
