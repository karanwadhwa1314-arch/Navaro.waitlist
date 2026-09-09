import { desc } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { waitlistSignups } from '@/lib/db/schema'
import type { NormalizedMetaLead } from '@/lib/meta/normalizeLead'

/**
 * Waitlist signups, stored in Neon Postgres via Drizzle.
 */

export type WaitlistEntry = {
  id: string
  createdAt: string
  firstName: string
  lastName: string
  email: string
  phone: string
  welcomeEmailSentAt: string | null
  metaLeadId?: string | null
}

export type NewWaitlistEntry = Omit<WaitlistEntry, 'id' | 'createdAt' | 'welcomeEmailSentAt'>

function toEntry(row: typeof waitlistSignups.$inferSelect): WaitlistEntry {
  return {
    id: row.id,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone ?? '',
    welcomeEmailSentAt:
      row.welcomeEmailSentAt instanceof Date
        ? row.welcomeEmailSentAt.toISOString()
        : row.welcomeEmailSentAt,
    metaLeadId: row.metaLeadId,
  }
}

export async function readEntries(): Promise<WaitlistEntry[]> {
  const db = getDb()
  const rows = await db.select().from(waitlistSignups).orderBy(desc(waitlistSignups.createdAt))
  return rows.map(toEntry)
}

/**
 * Inserts a waitlist signup. Every submission creates a new row — repeat
 * submissions with the same email are allowed and each get their own record.
 */
export async function addEntry(input: NewWaitlistEntry): Promise<WaitlistEntry> {
  const db = getDb()
  const email = input.email.toLowerCase()
  const [row] = await db
    .insert(waitlistSignups)
    .values({
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      phone: input.phone || null,
    })
    .returning()
  if (!row) throw new Error('Failed to insert waitlist signup')
  return toEntry(row)
}

/**
 * Inserts a Meta-sourced lead. Idempotent: safe to call repeatedly with the
 * same meta_lead_id — duplicates are silently skipped via the unique
 * constraint on meta_lead_id. Returns the inserted row, or null if it
 * already existed (already-synced lead).
 */
export async function upsertMetaLead(lead: NormalizedMetaLead) {
  const db = getDb()
  const [row] = await db
    .insert(waitlistSignups)
    .values({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone || null,
      metaLeadId: lead.metaLeadId,
      createdAt: new Date(lead.createdAt),
    })
    .onConflictDoNothing({ target: waitlistSignups.metaLeadId })
    .returning()
  return row ?? null
}

function csvCell(value: string): string {
  // Guard against spreadsheet formula injection from user-supplied fields.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

export function toCsv(entries: WaitlistEntry[]): string {
  const header = ['Date', 'First Name', 'Last Name', 'Email', 'Phone', 'Welcome Email Sent']
  const rows = entries.map((entry) =>
    [
      entry.createdAt,
      entry.firstName,
      entry.lastName,
      entry.email,
      entry.phone,
      entry.welcomeEmailSentAt ?? '',
    ]
      .map(csvCell)
      .join(','),
  )
  // BOM so Excel opens UTF-8 names correctly.
  return `﻿${header.map(csvCell).join(',')}\n${rows.join('\n')}\n`
}
