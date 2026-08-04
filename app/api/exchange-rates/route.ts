import { NextResponse } from 'next/server'

const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY
const API_BASE = 'https://v6.exchangerate-api.com/v6'

export const revalidate = 3600

export async function GET() {
  if (!EXCHANGE_RATE_API_KEY) {
    return NextResponse.json(
      { error: 'Exchange rate API key is not configured. Set EXCHANGE_RATE_API_KEY in your environment.' },
      { status: 500 },
    )
  }

  try {
    const res = await fetch(`${API_BASE}/${EXCHANGE_RATE_API_KEY}/latest/USD`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: res.status })
    }

    const data = (await res.json()) as {
      result?: string
      base_code?: string
      conversion_rates?: Record<string, number>
      time_last_update_utc?: string
    }

    if (data.result !== 'success' || !data.conversion_rates) {
      return NextResponse.json({ error: 'Invalid exchange rate response' }, { status: 502 })
    }

    return NextResponse.json({
      base: data.base_code ?? 'USD',
      rates: data.conversion_rates,
      updatedAt: data.time_last_update_utc ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 500 })
  }
}
