import { NextRequest, NextResponse } from 'next/server'

const SIMPLYDUTY_BASE_URL = process.env.SIMPLYDUTY_BASE_URL?.trim()?.replace(/\/$/, '') || ''
const SIMPLYDUTY_API_KEY = process.env.SIMPLYDUTY_API_KEY?.trim() || ''

// India: SWS = 10% of BCD (Social Welfare Surcharge)
const SWS_RATE_INDIA = 0.1

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      OriginCountryCode,
      DestinationCountryCode,
      HSCode,
      Quantity,
      AmountPerUnit,
      Shipping = 0,
      Insurance = 0,
      ExchangeRate: ExchangeRateInput,
      OriginCurrencyCode = 'USD',
      DestinationCurrencyCode = 'INR',
      ShipInsCalculationType,
      ContractInsuranceType,
      TempTariff,
      AdditionalFees,
    } = body

    // Basic validation (AmountPerUnit replaces Value)
    if (
      !OriginCountryCode ||
      !DestinationCountryCode ||
      !HSCode ||
      !Quantity ||
      AmountPerUnit == null ||
      AmountPerUnit === ''
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
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

    const qty = Number(Quantity)
    const amountPerUnit = Number(AmountPerUnit)
    const shipping = Number(Shipping) || 0
    const insurance = Number(Insurance) || 0

    // 1) Product value (FOB) = Quantity × Unit Price
    const TotalFOBValue = round2(qty * amountPerUnit)
    // 2) CIF = FOB + Shipping + Insurance
    const TotalCIFValue = round2(TotalFOBValue + shipping + insurance)

    const payload = {
      OriginCountryCode,
      DestinationCountryCode,
      HSCode,
      Quantity: qty,
      Value: TotalFOBValue,
      Shipping: shipping,
      Insurance: insurance,
      OriginCurrencyCode,
      DestinationCurrencyCode,
      ...(ShipInsCalculationType && { ShipInsCalculationType }),
      ...(ContractInsuranceType && { ContractInsuranceType }),
      ...(TempTariff !== undefined && { TempTariff }),
      ...(AdditionalFees !== undefined && { AdditionalFees }),
    }

    // Call SimplyDuty API for rates and metadata
    const response = await fetch(`${SIMPLYDUTY_BASE_URL}/duty/calculate`, {
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

    // Use exchange rate from API or request
    const exchangeRate = Number(result.ExchangeRate ?? ExchangeRateInput ?? 0)
    const dutyRate = Number(result.DutyRate ?? result.dutyRate ?? 0)
    const vatRate = Number(result.VatRate ?? result.vatRate ?? result.VATRate ?? 0)

    // 3) Assessable value in destination currency (INR) = CIF × Exchange rate
    const AssessableValueINR = round2(TotalCIFValue * exchangeRate)

    // 4) Basic Customs Duty (BCD) = DutyRate% × Assessable value
    const BCD = round2((dutyRate / 100) * AssessableValueINR)

    // 5) Social Welfare Surcharge (10% of BCD) for India
    const SWS = round2(SWS_RATE_INDIA * BCD)

    // 6) Value for IGST = Assessable value + BCD + SWS
    const ValueForIGST = round2(AssessableValueINR + BCD + SWS)

    // 7) IGST = VatRate% × Value for IGST
    const IGST = round2((vatRate / 100) * ValueForIGST)

    // Total duty = BCD + SWS + IGST
    const TotalDuty = round2(BCD + SWS + IGST)

    // Total landed cost (in destination currency) = Assessable value + Total duty
    const TotalLandedCost = round2(AssessableValueINR + TotalDuty)

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        // Normalize so response always reflects input totals (no doubling)
        Value: TotalFOBValue,
        Shipping: shipping,
        Insurance: insurance,
        Quantity: qty,
        AmountPerUnit: amountPerUnit,
        TotalFOBValue,
        TotalCIFValue,
        ExchangeRate: exchangeRate,
        CurrencyTypeOrigin: result.CurrencyTypeOrigin ?? OriginCurrencyCode,
        CurrencyTypeDestination: result.CurrencyTypeDestination ?? DestinationCurrencyCode,
        // Our computed values (Indian formula)
        AssessableValueINR,
        BCD,
        SWS,
        IGST,
        ValueForIGST,
        Duty: TotalDuty,
        VAT: IGST,
        Total: TotalLandedCost,
        DutyRate: dutyRate,
        VatRate: vatRate,
      },
    })
  } catch (error: any) {
    console.error('Duty calculation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'SimplyDuty service unreachable',
      },
      { status: 400 }
    )
  }
}
