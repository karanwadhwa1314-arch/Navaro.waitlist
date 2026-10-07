import { findEntriesByEmail, markWelcomeEmailSent, upsertMetaLead } from '@/lib/waitlist/store'
import { normalizeMetaLead, type MetaLead } from '@/lib/meta/normalizeLead'
import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail'
import { pushLeadToCrm } from '@/lib/crm/pushLead'

export type SyncOutcome = 'inserted_and_emailed' | 'emailed_existing' | 'already_welcomed'

/**
 * Handles a single raw Meta lead end to end: decides whether it's a new
 * person, an existing-but-never-emailed person, or an already-welcomed
 * person, and acts accordingly. Shared by the backfill route and the
 * webhook receiver — do not fork this logic between the two.
 */
export async function syncOneLead(rawLead: MetaLead): Promise<SyncOutcome> {
  const lead = normalizeMetaLead(rawLead)

  // Mirror into the CRM for EVERY lead seen, independent of the Neon outcome
  // below. Idempotent, so each backfill run also retries any earlier CRM
  // failure. Never throws — Neon/email flow must not depend on it.
  await pushLeadToCrm({
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    source: 'meta_ads',
    createdAt: new Date(lead.createdAt),
    metaLeadId: lead.metaLeadId,
  })

  const existing = await findEntriesByEmail(lead.email)
  const alreadyWelcomed = existing.some((entry) => entry.welcomeEmailSentAt !== null)

  if (alreadyWelcomed) {
    return 'already_welcomed'
  }

  if (existing.length > 0) {
    const sent = await sendWelcomeEmail(existing[0].firstName, lead.email)
    if (sent) await markWelcomeEmailSent(existing[0].id)
    return 'emailed_existing'
  }

  const row = await upsertMetaLead(lead)
  if (!row) {
    // Race: meta_lead_id already existed. Nothing to do.
    return 'already_welcomed'
  }
  const sent = await sendWelcomeEmail(row.firstName, row.email)
  if (sent) await markWelcomeEmailSent(row.id)
  return 'inserted_and_emailed'
}
