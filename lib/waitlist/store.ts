import { randomUUID } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase/server'

/**
 * Waitlist signups, stored in the Supabase `waitlist_signups` table.
 * All access goes through the service-role client (RLS deny-all for anon).
 */

export type WaitlistEntry = {
  id: string
  createdAt: string
  firstName: string
  lastName: string
  email: string
  phone: string
  welcomeEmailSentAt: string | null
}

export type NewWaitlistEntry = Omit<WaitlistEntry, 'id' | 'createdAt' | 'welcomeEmailSentAt'>

type WaitlistRow = {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  welcome_email_sent_at: string | null
}

function mapRow(row: WaitlistRow): WaitlistEntry {
  return {
    id: row.id,
    createdAt: row.created_at,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone ?? '',
    welcomeEmailSentAt: row.welcome_email_sent_at,
  }
}

export async function readEntries(): Promise<WaitlistEntry[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('waitlist_signups')
    .select('id, created_at, first_name, last_name, email, phone, welcome_email_sent_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as WaitlistRow[]).map(mapRow)
}

export type AddResult = { entry: WaitlistEntry; duplicate: boolean }

/**
 * Appends a signup. Repeat signups with an email already on the list are
 * treated as success without adding a second row.
 *
 * Uses a client-generated id and skips SELECT/RETURNING so the hot path is a
 * single insert round-trip (latency-sensitive on the waitlist API).
 */
export async function addEntry(input: NewWaitlistEntry): Promise<AddResult> {
  const supabase = getSupabaseAdmin()
  const email = input.email.toLowerCase()
  const id = randomUUID()

  const { error } = await supabase.from('waitlist_signups').insert({
    id,
    first_name: input.firstName,
    last_name: input.lastName,
    email,
    phone: input.phone || null,
  })

  if (!error) {
    return {
      entry: {
        id,
        createdAt: new Date().toISOString(),
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        phone: input.phone,
        welcomeEmailSentAt: null,
      },
      duplicate: false,
    }
  }

  // Unique email constraint — soft success (already signed up). No re-fetch:
  // callers only need duplicate=true to skip the welcome email.
  if (error?.code === '23505') {
    return {
      entry: {
        id: '',
        createdAt: '',
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        phone: input.phone,
        welcomeEmailSentAt: null,
      },
      duplicate: true,
    }
  }

  throw error ?? new Error('Failed to insert waitlist signup')
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
