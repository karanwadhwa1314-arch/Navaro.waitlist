/**
 * Normalizes a raw Meta Graph API lead object into the shape our DB expects.
 * Shared by both the backfill script and (later) the real-time webhook
 * handler, so the two paths can never drift apart on field mapping.
 *
 * Confirmed field names on the "Waitlist - 5/09" form (2002344743806823):
 * first_name, last_name, phone_number, email.
 */

type MetaFieldDatum = { name: string; values: string[] }

export type MetaLead = {
  id: string
  created_time: string
  field_data: MetaFieldDatum[]
}

export type NormalizedMetaLead = {
  metaLeadId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: string
}

function pick(fields: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (fields[key]) return fields[key]
  }
  return ''
}

export function normalizeMetaLead(lead: MetaLead): NormalizedMetaLead {
  const fields: Record<string, string> = {}
  for (const f of lead.field_data) {
    fields[f.name] = f.values[0] ?? ''
  }

  // full_name fallback kept for robustness if Meta ever adds a form using a
  // single combined name field instead of first_name/last_name.
  const fullName = pick(fields, 'full_name')
  const [firstFromFull, ...restFromFull] = fullName.split(' ')

  return {
    metaLeadId: lead.id,
    firstName: pick(fields, 'first_name') || firstFromFull || '',
    lastName: pick(fields, 'last_name') || restFromFull.join(' ') || '',
    email: pick(fields, 'email').toLowerCase(),
    phone: pick(fields, 'phone_number', 'phone'),
    createdAt: lead.created_time,
  }
}
