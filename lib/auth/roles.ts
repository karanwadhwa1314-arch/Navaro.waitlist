export type UserRole = 'user'

export const ROLES = {
  USER: 'user',
} as const

const LEGACY_PLATFORM_ROLES = new Set(['student', 'instructor'])

export const VALID_USER_ROLES = new Set<UserRole>([ROLES.USER])

export function normalizeUserRole(role: unknown): UserRole | null {
  if (typeof role !== 'string') return null

  const normalized = role.trim().toLowerCase()
  if (normalized === ROLES.USER) return ROLES.USER
  if (LEGACY_PLATFORM_ROLES.has(normalized)) return ROLES.USER

  return null
}

export function isPlatformUserRole(role: unknown): role is UserRole {
  return normalizeUserRole(role) === ROLES.USER
}
