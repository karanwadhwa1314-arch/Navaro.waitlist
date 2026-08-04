import { randomUUID } from 'crypto'
import { mkdir, readFile, rename, writeFile } from 'fs/promises'
import path from 'path'

/**
 * Waitlist signups, stored as a JSON array on disk.
 *
 * Requires a persistent filesystem — this will lose data on serverless hosts
 * (Vercel, Netlify) where the filesystem is read-only and ephemeral.
 */

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'waitlist.json')

export type WaitlistEntry = {
  id: string
  createdAt: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type NewWaitlistEntry = Omit<WaitlistEntry, 'id' | 'createdAt'>

export async function readEntries(): Promise<WaitlistEntry[]> {
  let raw: string
  try {
    raw = await readFile(DATA_FILE, 'utf8')
  } catch (error) {
    // No signups yet.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }

  if (!raw.trim()) return []

  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) {
    throw new Error(`${DATA_FILE} is not a JSON array — refusing to use it`)
  }
  return parsed as WaitlistEntry[]
}

/**
 * Writes via a temp file + rename so a crash mid-write cannot truncate the
 * existing list.
 */
async function writeEntries(entries: WaitlistEntry[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  const tempFile = `${DATA_FILE}.${randomUUID()}.tmp`
  await writeFile(tempFile, JSON.stringify(entries, null, 2), 'utf8')
  await rename(tempFile, DATA_FILE)
}

/**
 * Serialises writes. Two signups arriving together would otherwise both read
 * the old list and the second would overwrite the first.
 */
let writeQueue: Promise<unknown> = Promise.resolve()

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task, task)
  writeQueue = result.catch(() => undefined)
  return result
}

export type AddResult = { entry: WaitlistEntry; duplicate: boolean }

/**
 * Appends a signup. Repeat signups with an email already on the list are
 * treated as success without adding a second row.
 */
export async function addEntry(input: NewWaitlistEntry): Promise<AddResult> {
  return enqueue(async () => {
    const entries = await readEntries()
    const email = input.email.toLowerCase()

    const existing = entries.find((entry) => entry.email.toLowerCase() === email)
    if (existing) return { entry: existing, duplicate: true }

    const entry: WaitlistEntry = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    }

    await writeEntries([...entries, entry])
    return { entry, duplicate: false }
  })
}

function csvCell(value: string): string {
  // Guard against spreadsheet formula injection from user-supplied fields.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

export function toCsv(entries: WaitlistEntry[]): string {
  const header = ['Date', 'First Name', 'Last Name', 'Email', 'Phone']
  const rows = entries.map((entry) =>
    [entry.createdAt, entry.firstName, entry.lastName, entry.email, entry.phone].map(csvCell).join(','),
  )
  // BOM so Excel opens UTF-8 names correctly.
  return `﻿${header.map(csvCell).join(',')}\n${rows.join('\n')}\n`
}
