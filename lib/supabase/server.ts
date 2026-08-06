import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client using the service role key (bypasses RLS).
 *
 * MUST ONLY be imported into server-side code (API routes, server components,
 * server-only lib modules). NEVER import this into any 'use client' component —
 * the service role key must never be exposed to the browser.
 */

let client: SupabaseClient | null = null

/**
 * Accepts the project URL only (https://<ref>.supabase.co).
 * Strips accidental /rest/v1 (or trailing slash) that cause PostgREST PGRST125.
 */
function normalizeSupabaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/^["']|["']$/g, '')
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not a valid URL — use https://<project-ref>.supabase.co',
    )
  }

  // Collapse /rest/v1 (with or without trailing slash) back to the project origin.
  parsed.pathname = parsed.pathname.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '') || '/'
  if (parsed.pathname !== '/') {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL must be the project origin only (got path "${parsed.pathname}"). ` +
        'Use https://<project-ref>.supabase.co — do not include /rest/v1.',
    )
  }

  return parsed.origin
}

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — cannot create Supabase admin client',
    )
  }

  client = createClient(normalizeSupabaseUrl(url), serviceRoleKey.trim(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return client
}
