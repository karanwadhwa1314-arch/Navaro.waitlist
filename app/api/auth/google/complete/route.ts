import { NextResponse } from 'next/server'

/** Kept for old clients; refresh cookies are owned by the backend. */
export async function POST() {
  return NextResponse.json({ success: true })
}
