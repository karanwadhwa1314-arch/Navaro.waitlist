type MetaFieldDatum = { name: string; values: string[] }
export type MetaLead = { id: string; created_time: string; field_data: MetaFieldDatum[] }

export type NormalizedMetaLead = {
  metaLeadId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: string
}

function pick(fields: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) if (fields[k]) return fields[k]
  return ''
}

export function normalizeMetaLead(lead: MetaLead): NormalizedMetaLead {
  const fields: Record<string, string> = {}
  for (const f of lead.field_data) fields[f.name] = f.values[0] ?? ''

  return {
    metaLeadId: lead.id,
    firstName: pick(fields, 'first_name'),
    lastName: pick(fields, 'last_name'),
    email: pick(fields, 'email').toLowerCase().trim(),
    phone: pick(fields, 'phone_number'),
    createdAt: lead.created_time,
  }
}
