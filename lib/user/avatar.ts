export const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024

export const AVATAR_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

const AVATAR_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

export function validateAvatarFile(file: Pick<File, 'name' | 'size' | 'type'>): string | null {
  if (file.size > AVATAR_MAX_SIZE_BYTES) {
    return 'Image must be 2 MB or smaller.'
  }

  const mimeOk = AVATAR_ALLOWED_MIME_TYPES.includes(
    file.type as (typeof AVATAR_ALLOWED_MIME_TYPES)[number],
  )
  const lowerName = file.name.toLowerCase()
  const extOk = AVATAR_ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))

  if (!mimeOk && !extOk) {
    return 'Only JPEG, PNG, WebP, and GIF images are allowed.'
  }

  return null
}
