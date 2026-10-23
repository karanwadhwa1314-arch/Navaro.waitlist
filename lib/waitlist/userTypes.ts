/**
 * Answers to "Which best describes you?" — mirrors the Meta Lead Ads form
 * question exactly. The label text is what we store (Neon + CRM), so it stays
 * human-readable. Shared by the client form and server code: keep it free of
 * server-only imports.
 */
export const USER_TYPES = [
  'I already import or export',
  'I have an IEC / planning to start soon',
  'I run a small business and want to start',
  'I want to learn import-export',
  'CHA / customs broker',
  'Freight forwarder / logistics professional',
  'Other',
] as const

export type UserType = (typeof USER_TYPES)[number]

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

/**
 * Maps a raw answer to its canonical label. Meta may send either the visible
 * text or a generated key (e.g. "i_already_import_or_export"), and the form
 * can truncate long labels, so match on the slug and on a slug prefix.
 * Returns null when nothing matches.
 */
export function matchUserType(raw: string): UserType | null {
  const s = slug(raw)
  if (!s) return null
  const exact = USER_TYPES.find((label) => slug(label) === s)
  if (exact) return exact
  // Prefix either way: Meta's label may be longer or shorter than ours.
  const prefix = USER_TYPES.find((label) => {
    const l = slug(label)
    return s.length >= 8 && (l.startsWith(s) || s.startsWith(l))
  })
  return prefix ?? null
}
