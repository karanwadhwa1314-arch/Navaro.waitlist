import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

/**
 * Server-only Neon Postgres client (HTTP driver, serverless-friendly).
 * Lazily created so the build never constructs it at module-eval time, and
 * a missing env var surfaces as a clear runtime error rather than a build
 * crash. NEVER import into a 'use client' component — DATABASE_URL is a secret.
 */
let db: ReturnType<typeof drizzle> | undefined

export function getDb() {
  if (db) return db
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('Missing DATABASE_URL — cannot connect to the database')
  }
  db = drizzle(neon(url), { schema })
  return db
}
