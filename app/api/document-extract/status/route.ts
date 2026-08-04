import { NextResponse } from 'next/server'

function getApiKey(): string | undefined {
  let key =
    process.env.DOCUMENT_EXTRACTION_API_KEY ?? process.env.OPENAI_API_KEY
  if (!key) return undefined
  key = key.trim()
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim()
  }
  return key || undefined
}

export async function GET() {
  return NextResponse.json({ configured: !!getApiKey() })
}
