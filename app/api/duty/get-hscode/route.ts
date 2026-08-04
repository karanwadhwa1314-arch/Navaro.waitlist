import { NextRequest, NextResponse } from 'next/server'

const SIMPLYDUTY_BASE_URL = process.env.SIMPLYDUTY_BASE_URL?.trim()?.replace(/\/$/, '') || ''
const SIMPLYDUTY_API_KEY = process.env.SIMPLYDUTY_API_KEY?.trim() || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      FullDescription,
      OriginCountryCode,
      DestinationCountryCode,
      GetDuty = true,
      CategoryID,
      TempTariff = false,
    } = body

    // Basic validation
    if (!FullDescription || !OriginCountryCode || !DestinationCountryCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Required fields missing',
        },
        { status: 400 }
      )
    }

    if (!SIMPLYDUTY_BASE_URL || !SIMPLYDUTY_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'SimplyDuty API is not configured',
        },
        { status: 500 }
      )
    }

    const payload = {
      FullDescription,
      OriginCountryCode,
      DestinationCountryCode,
      GetDuty: true,
      ...(CategoryID && { CategoryID }),
      TempTariff,
    }

    // Call SimplyDuty API
    const response = await fetch(`${SIMPLYDUTY_BASE_URL}/duty/gethscode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-api-key': SIMPLYDUTY_API_KEY,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'SimplyDuty service error' }))
      return NextResponse.json(
        {
          success: false,
          error: errorData,
        },
        { status: response.status }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      data: {
        HSCode: result.HSCode,
        TotalDutyPercentage: result?.Duty?.DutyRate ?? 0,
        DutyType: result?.Duty?.DutyType ?? null,
      },
    })
  } catch (error: any) {
    console.error('HS Code lookup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'SimplyDuty service unreachable',
      },
      { status: 400 }
    )
  }
}
