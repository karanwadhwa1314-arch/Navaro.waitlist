import { ObjectId } from 'mongodb'
import { getCrmLeads } from '@/lib/crm/mongo'

/**
 * Mirrors a waitlist signup into the Navaro CRM's `leads` collection, so it
 * shows up in the CRM's pipeline. This is a SECOND destination — Neon stays
 * the primary store and this must never be able to fail a signup or sync.
 *
 * Documents are written with the native driver, so Mongoose's defaults are
 * replicated here to match the CRM's models/Lead.ts exactly. Only fields the
 * CRM schema already defines are used; no CRM code, enum or index changes.
 *
 * Source mapping (CRM LEAD_SOURCES has no waitlist/meta value):
 *   website  -> 'website'        sourceDetails 'Waitlist – Website'
 *   meta_ads -> 'advertisement'  sourceDetails 'Waitlist – Meta Lead Ads'
 *
 * Dedupe: one active CRM lead per email (same rule as the CRM's CSV import).
 * The write is an upsert with $setOnInsert, so re-running the backfill, the
 * webhook/backfill overlap, or a repeat website signup never creates or
 * modifies a second lead. No index is created: the CRM's sync-indexes script
 * drops any index not defined in its schema.
 */

export type CrmLeadInput = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  source: 'website' | 'meta_ads'
  createdAt: Date
  metaLeadId?: string | null
}

export type PushLeadOutcome = 'created' | 'exists' | 'skipped' | 'error'

function clip(value: string, max: number): string {
  return value.trim().slice(0, max)
}

export async function pushLeadToCrm(input: CrmLeadInput): Promise<PushLeadOutcome> {
  const email = input.email.trim().toLowerCase()
  if (!email) return 'skipped'

  const firstName = clip(input.firstName, 50) || clip(email.split('@')[0], 50)
  // CRM requires a non-empty lastName; Meta forms may omit it.
  const lastName = clip(input.lastName, 50) || '-'
  const isMeta = input.source === 'meta_ads'
  const sourceDetails = isMeta ? 'Waitlist – Meta Lead Ads' : 'Waitlist – Website'
  const now = new Date()

  const doc = {
    firstName,
    lastName,
    email,
    ...(input.phone ? { phone: clip(input.phone, 50) } : {}),
    // CRM requires company; same fallback as the CRM's CSV import.
    company: clip(`${firstName} ${lastName === '-' ? '' : lastName}`, 120),
    source: isMeta ? 'advertisement' : 'website',
    sourceDetails,
    stage: 'new',
    stageHistory: [{ stage: 'new', changedAt: input.createdAt }],
    tags: ['waitlist'],
    priority: 'medium',
    isActive: true,
    activities: [
      {
        _id: new ObjectId(),
        type: 'note',
        description: `Added from Navaro waitlist (${sourceDetails.replace('Waitlist – ', '')})`,
        ...(input.metaLeadId ? { metadata: { metaLeadId: input.metaLeadId } } : {}),
        createdAt: now,
      },
    ],
    createdAt: input.createdAt,
    updatedAt: now,
    __v: 0,
  }

  try {
    const leads = await getCrmLeads()
    const res = await leads.updateOne({ email, isActive: true }, { $setOnInsert: doc }, { upsert: true })
    return res.upsertedCount > 0 ? 'created' : 'exists'
  } catch (error) {
    console.error('CRM lead push failed:', email, error)
    return 'error'
  }
}
