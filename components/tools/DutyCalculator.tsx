'use client'

import { useState } from 'react'
import { COUNTRY_OPTIONS } from '@/lib/countries'

interface SimplyDutyResponse {
  HsCode?: string
  HSCode?: string
  Duty?: number
  VAT?: number
  Total?: number
  TotalFOBValue?: number
  TotalCIFValue?: number
  AssessableValueINR?: number
  BCD?: number
  SWS?: number
  IGST?: number
  ValueForIGST?: number
  DutyRate?: number
  VatRate?: number
  VATRate?: number
  ExchangeRate?: number
  CurrencyTypeDestination?: string
  CurrencyTypeOrigin?: string
  AmountPerUnit?: number
  [key: string]: any
}

interface DutyCalculationResults {
  hsCode: string
  duty: number
  vat: number
  total: number
  totalCIF?: number
  totalFOB?: number
  assessableValueINR?: number
  bcd?: number
  sws?: number
  igst?: number
  valueForIGST?: number
  dutyRate?: number
  vatRate?: number
  ExchangeRate?: number
  currency: string
  currencyOrigin: string
  productValue: number
  shipping: number
  insurance: number
  quantity: number
  originCountry: string
  destinationCountry: string
  rawData?: SimplyDutyResponse
}

export default function DutyCalculator() {
  // HS Code Finder state
  const [hsCodeFinder, setHsCodeFinder] = useState({
    productDescription: '',
    originCountry: 'US',
    destinationCountry: 'UK',
  })

  // Duty Calculation state (Amount per Unit â€“ FOB/CIF structure from newnew)
  const [dutyCalculation, setDutyCalculation] = useState({
    originCountry: 'US',
    destinationCountry: 'IN',
    hsCode: '',
    quantity: '1',
    amountPerUnit: '1000',
    shipping: '0',
    insurance: '0',
  })

  const [hsCodeLoading, setHsCodeLoading] = useState(false)
  const [dutyLoading, setDutyLoading] = useState(false)
  const [error, setError] = useState('')
  const [hsCodeResult, setHsCodeResult] = useState<string | null>(null)
  const [dutyResults, setDutyResults] = useState<DutyCalculationResults | null>(null)

  const findHSCode = async () => {
    if (!hsCodeFinder.productDescription.trim()) {
      setError('Please enter a product description')
      return
    }

    setHsCodeLoading(true)
    setError('')
    setHsCodeResult(null)

    try {
      const response = await fetch('/api/duty/get-hscode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FullDescription: hsCodeFinder.productDescription,
          OriginCountryCode: hsCodeFinder.originCountry,
          DestinationCountryCode: hsCodeFinder.destinationCountry,
          GetDuty: true,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        const errorMessage = result.error?.message || result.error || 'Failed to find HS code. Please try again.'
        setError(errorMessage)
        setHsCodeLoading(false)
        return
      }

      const hsCode = result.data.HSCode || result.data.HsCode
      if (hsCode) {
        setHsCodeResult(hsCode)
        // Auto-fill HS Code and origin country in duty calculation
        setDutyCalculation({ ...dutyCalculation, hsCode, originCountry: hsCodeFinder.originCountry })
      } else {
        setError('HS Code not found. Please try a different description.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while finding HS code. Please try again.')
    } finally {
      setHsCodeLoading(false)
    }
  }

  const calculateDuty = async () => {
    const amountPerUnit = parseFloat(dutyCalculation.amountPerUnit)
    const quantity = parseFloat(dutyCalculation.quantity)
    const shipping = parseFloat(dutyCalculation.shipping) || 0
    const insurance = parseFloat(dutyCalculation.insurance) || 0
    const hsCode = dutyCalculation.hsCode.trim()

    setError('')
    if (amountPerUnit == null || isNaN(amountPerUnit) || amountPerUnit < 0) {
      setError('Please enter a valid amount per unit')
      return
    }
    if (!hsCode) {
      setError('Please enter an HS code')
      return
    }
    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    setDutyLoading(true)

    try {
      const payload = {
        OriginCountryCode: dutyCalculation.originCountry,
        DestinationCountryCode: dutyCalculation.destinationCountry,
        HSCode: hsCode,
        Quantity: quantity,
        AmountPerUnit: amountPerUnit,
        Shipping: shipping,
        Insurance: insurance,
      }

      const response = await fetch('/api/duty/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!result.success) {
        const errorMessage = result.error?.message || result.error || 'Failed to calculate duty. Please try again.'
        setError(errorMessage)
        setDutyLoading(false)
        return
      }

      const dutyData: SimplyDutyResponse = result.data
      const calculationResults: DutyCalculationResults = {
        hsCode: dutyData.HsCode || dutyData.HSCode || hsCode,
        duty: dutyData.Duty ?? 0,
        vat: dutyData.VAT ?? 0,
        total: dutyData.Total ?? 0,
        totalCIF: dutyData.TotalCIFValue ?? 0,
        totalFOB: dutyData.TotalFOBValue ?? 0,
        assessableValueINR: dutyData.AssessableValueINR ?? 0,
        bcd: dutyData.BCD ?? 0,
        sws: dutyData.SWS ?? 0,
        igst: dutyData.IGST ?? 0,
        valueForIGST: dutyData.ValueForIGST ?? 0,
        dutyRate: dutyData.DutyRate ?? dutyData.dutyRate,
        vatRate: dutyData.VatRate ?? dutyData.vatRate ?? dutyData.VATRate,
        ExchangeRate: dutyData.ExchangeRate ?? 0,
        currency: dutyData.CurrencyTypeDestination || 'INR',
        currencyOrigin: dutyData.CurrencyTypeOrigin || 'USD',
        productValue: dutyData.AmountPerUnit ?? amountPerUnit,
        shipping,
        insurance,
        quantity,
        originCountry: dutyCalculation.originCountry,
        destinationCountry: dutyCalculation.destinationCountry,
        rawData: dutyData,
      }

      setDutyResults(calculationResults)
    } catch (err: any) {
      setError(err.message || 'An error occurred while calculating duty. Please try again.')
    } finally {
      setDutyLoading(false)
    }
  }

  const resetCalculator = () => {
    setDutyResults(null)
    setHsCodeResult(null)
    setError('')
    setDutyCalculation({
      originCountry: 'US',
      destinationCountry: 'IN',
      hsCode: '',
      quantity: '1',
      amountPerUnit: '1000',
      shipping: '0',
      insurance: '0',
    })
    setHsCodeFinder({
      productDescription: '',
      originCountry: 'US',
      destinationCountry: 'IN',
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    const code = currency || 'USD'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const fieldLabelClass =
    'block text-xs font-bold uppercase tracking-wide text-[#1B4332] mb-2'
  const fieldInputClass =
    'w-full rounded-xl border border-[#1B4332]/20 bg-[#FFFBF7] px-4 py-3 text-[#1B4332] outline-none transition placeholder:text-[#1B4332]/35 focus:border-[#C384F2] focus:ring-2 focus:ring-[#C384F2]/35'
  const resultCardClass =
    'rounded-xl border border-[#1B4332]/12 bg-[#FFFBF7] py-4 pl-5 pr-4 shadow-sm border-l-[6px] border-l-[#1B4332]'

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFF9EC] py-10 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, #C384F2 0, transparent 45%), radial-gradient(circle at 80% 0%, #1B4332 0, transparent 40%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#1B4332]/70">Import tools</p>
          <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-[#1B4332] sm:text-4xl">
            Duty calculator
          </h1>
          <p className="mt-2 text-base text-[#1B4332]/75">Find HS codes and calculate import duties.</p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-300/80 bg-red-50 px-5 py-4 text-center text-sm font-semibold text-red-800"
          >
            {error}
          </div>
        )}

        <div className="space-y-6">
          <section className="rounded-2xl border border-[#1B4332]/10 bg-[#FDF2B3]/90 p-6 shadow-md backdrop-blur-sm sm:p-8">
            <h2 className="mb-6 text-lg font-extrabold uppercase tracking-wide text-[#1B4332]">HS Code Finder</h2>

            <div className="space-y-5">
              <div>
                <label className={fieldLabelClass}>Product description</label>
                <input
                  type="text"
                  value={hsCodeFinder.productDescription}
                  onChange={(e) => setHsCodeFinder({ ...hsCodeFinder, productDescription: e.target.value })}
                  placeholder="Describe your product (e.g. vitamin C tablets)"
                  className={fieldInputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={fieldLabelClass}>Origin country</label>
                  <select
                    value={hsCodeFinder.originCountry}
                    onChange={(e) => {
                      const code = e.target.value.toUpperCase()
                      setHsCodeFinder({ ...hsCodeFinder, originCountry: code })
                    }}
                    className={`${fieldInputClass} cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231B4332'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    }}
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={fieldLabelClass}>Destination country</label>
                  <input
                    type="text"
                    value={'IN'}
                    disabled
                    onChange={(e) => setHsCodeFinder({ ...hsCodeFinder, destinationCountry: e.target.value.toUpperCase() })}
                    placeholder="e.g. IN"
                    maxLength={2}
                    className={`${fieldInputClass} cursor-not-allowed opacity-80`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={findHSCode}
                disabled={hsCodeLoading}
                className="w-full rounded-xl bg-[#C384F2] py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-[#b06ee8] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {hsCodeLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Finding HS codeâ€¦
                  </span>
                ) : (
                  'Find HS code'
                )}
              </button>

              {hsCodeResult && (
                <div className="rounded-xl border border-[#1B4332]/25 bg-[#C9DAB1]/50 px-4 py-3 text-[#1B4332]">
                  <p className="text-sm font-bold">
                    HS code found: <span className="text-lg font-extrabold tracking-tight">{hsCodeResult}</span>
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#1B4332]/10 bg-[#FDF2B3]/90 p-6 shadow-md backdrop-blur-sm sm:p-8">
            <h2 className="mb-6 text-lg font-extrabold uppercase tracking-wide text-[#1B4332]">Duty calculation</h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={fieldLabelClass}>Origin country</label>
                  <div
                    className={`${fieldInputClass} flex cursor-default items-center font-medium uppercase tracking-wide text-[#1B4332]/90`}
                  >
                    {COUNTRY_OPTIONS.find((c) => c.code === dutyCalculation.originCountry)?.name ?? dutyCalculation.originCountry}{' '}
                    ({dutyCalculation.originCountry})
                  </div>
                  <p className="mt-1.5 text-xs text-[#1B4332]/55">Updates when you find an HS code above.</p>
                </div>

                <div>
                  <label className={fieldLabelClass}>Destination country</label>
                  <input
                    type="text"
                    value="IN"
                    disabled
                    onChange={(e) => setDutyCalculation({ ...dutyCalculation, destinationCountry: e.target.value.toUpperCase() })}
                    placeholder="e.g. IN"
                    maxLength={2}
                    className={`${fieldInputClass} cursor-not-allowed opacity-80`}
                  />
                </div>
              </div>

              <div>
                <label className={fieldLabelClass}>HS code</label>
                <input
                  type="text"
                  value={dutyCalculation.hsCode}
                  onChange={(e) => setDutyCalculation({ ...dutyCalculation, hsCode: e.target.value })}
                  placeholder="e.g. 3809.99.1000 (auto-filled after lookup)"
                  className={fieldInputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={fieldLabelClass}>Quantity</label>
                  <input
                    type="number"
                    value={dutyCalculation.quantity}
                    onChange={(e) => setDutyCalculation({ ...dutyCalculation, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    min="1"
                    step="1"
                    className={fieldInputClass}
                  />
                </div>

                <div>
                  <label className={fieldLabelClass}>Amount per unit</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#1B4332]/45">
                      $
                    </span>
                    <input
                      type="number"
                      value={dutyCalculation.amountPerUnit}
                      onChange={(e) =>
                        setDutyCalculation({
                          ...dutyCalculation,
                          amountPerUnit: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`${fieldInputClass} pl-9`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={fieldLabelClass}>Shipping</label>
                  <input
                    type="number"
                    value={dutyCalculation.shipping}
                    onChange={(e) => setDutyCalculation({ ...dutyCalculation, shipping: e.target.value })}
                    placeholder="Enter shipping amount"
                    min="0"
                    step="0.01"
                    className={fieldInputClass}
                  />
                </div>

                <div>
                  <label className={fieldLabelClass}>Insurance</label>
                  <input
                    type="number"
                    value={dutyCalculation.insurance}
                    onChange={(e) => setDutyCalculation({ ...dutyCalculation, insurance: e.target.value })}
                    placeholder="Enter insurance amount"
                    min="0"
                    step="0.01"
                    className={fieldInputClass}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={calculateDuty}
                disabled={dutyLoading}
                className="w-full rounded-xl bg-[#C384F2] py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-[#b06ee8] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {dutyLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Calculating dutyâ€¦
                  </span>
                ) : (
                  'Calculate duty'
                )}
              </button>
            </div>
          </section>
        </div>

        {dutyResults && (
          <section className="mt-8 rounded-2xl border border-[#1B4332]/10 bg-[#FFFBF2] p-6 shadow-lg sm:p-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#1B4332] sm:text-3xl">
                  Calculation results
                </h2>
                <p className="mt-2 text-sm text-[#1B4332]/70">
                  HS code: {dutyResults.hsCode} | {dutyResults.originCountry} â†’ {dutyResults.destinationCountry}
                </p>
                <p className="mt-1 text-sm text-[#1B4332]/70">
                  <span className="font-semibold text-[#1B4332]">Duty rate:</span> {dutyResults.dutyRate ?? 0}%
                </p>
              </div>
              <button
                type="button"
                onClick={resetCalculator}
                className="shrink-0 self-start rounded-xl bg-[#C384F2] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#b06ee8] sm:self-center"
              >
                New calculation
              </button>
            </div>

            {/* Step-by-step breakdown */}
            {/* <div className="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-sm">
              <h3 className="font-black text-gray-900 mb-3">Step-by-step import duty</h3>
              <div>
                <span className="text-gray-600 font-semibold">1) Product value (FOB)</span>
                <p className="text-gray-900 font-medium">
                  {dutyResults.quantity} Ã— {formatCurrency(dutyResults.productValue, dutyResults.currencyOrigin)} = {formatCurrency(dutyResults.totalFOB ?? 0, dutyResults.currencyOrigin)}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">2) CIF (FOB + Shipping + Insurance)</span>
                <p className="text-gray-900 font-medium">
                  {formatCurrency(dutyResults.totalFOB ?? 0, dutyResults.currencyOrigin)} + {formatCurrency(dutyResults.shipping, dutyResults.currencyOrigin)} + {formatCurrency(dutyResults.insurance, dutyResults.currencyOrigin)} = {formatCurrency(dutyResults.totalCIF ?? 0, dutyResults.currencyOrigin)}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">3) Convert to {dutyResults.currency} (Assessable value)</span>
                <p className="text-gray-900 font-medium">
                  {formatCurrency(dutyResults.totalCIF ?? 0, dutyResults.currencyOrigin)} Ã— {dutyResults.ExchangeRate ?? 0} = {formatCurrency(dutyResults.assessableValueINR ?? 0, dutyResults.currency)}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">4) Basic Customs Duty (BCD) â€” {dutyResults.dutyRate ?? 0}%</span>
                <p className="text-gray-900 font-medium">
                  {formatCurrency(dutyResults.bcd ?? 0, dutyResults.currency)}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">5) Social Welfare Surcharge (10% of BCD)</span>
                <p className="text-gray-900 font-medium">
                  {formatCurrency(dutyResults.sws ?? 0, dutyResults.currency)}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">6) Value for IGST</span>
                <p className="text-gray-900 font-medium">
                  Assessable value + BCD + SWS = {formatCurrency(dutyResults.valueForIGST ?? 0, dutyResults.currency)}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">7) IGST â€” {dutyResults.vatRate ?? 0}%</span>
                <p className="text-gray-900 font-medium">
                  {formatCurrency(dutyResults.igst ?? dutyResults.vat ?? 0, dutyResults.currency)}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-300">
                <span className="text-gray-600 font-semibold">Total duty (BCD + SWS + IGST)</span>
                <p className="text-gray-900 font-bold text-lg">
                  {formatCurrency(dutyResults.duty, dutyResults.currency)}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-300">
                <span className="text-gray-600 font-semibold">Final landed cost</span>
                <p className="text-gray-900 font-bold text-lg">
                  {formatCurrency(dutyResults.total, dutyResults.currency)}
                </p>
              </div>
            </div> */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className={resultCardClass}>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#1B4332]">Total landed cost</div>
                <div className="mt-1 text-xl font-semibold text-neutral-900 sm:text-2xl">
                  {formatCurrency(dutyResults.total, dutyResults.currency)}
                </div>
              </div>
              <div className={resultCardClass}>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#1B4332]">
                  Total duty (BCD + SWS + IGST)
                </div>
                <div className="mt-1 text-xl font-semibold text-neutral-900 sm:text-2xl">
                  {formatCurrency(dutyResults.duty, dutyResults.currency)}
                </div>
              </div>
              <div className={resultCardClass}>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#1B4332]">BCD</div>
                <div className="mt-1 text-xl font-semibold text-neutral-900 sm:text-2xl">
                  {formatCurrency(dutyResults.bcd ?? 0, dutyResults.currency)}
                </div>
              </div>
              <div className={resultCardClass}>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#1B4332]">SWS</div>
                <div className="mt-1 text-xl font-semibold text-neutral-900 sm:text-2xl">
                  {formatCurrency(dutyResults.sws ?? 0, dutyResults.currency)}
                </div>
              </div>
              <div className={resultCardClass}>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#1B4332]">IGST</div>
                <div className="mt-1 text-xl font-semibold text-neutral-900 sm:text-2xl">
                  {formatCurrency(dutyResults.igst ?? dutyResults.vat ?? 0, dutyResults.currency)}
                </div>
              </div>
              <div className={resultCardClass}>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#1B4332]">Amount per unit</div>
                <div className="mt-1 text-xl font-semibold text-neutral-900 sm:text-2xl">
                  {formatCurrency(dutyResults.productValue, dutyResults.currencyOrigin)}
                </div>
              </div>
              <div className={resultCardClass}>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#1B4332]">Total FOB value</div>
                <div className="mt-1 text-xl font-semibold text-neutral-900 sm:text-2xl">
                  {formatCurrency(dutyResults.totalFOB ?? 0, dutyResults.currencyOrigin)}
                </div>
              </div>
              <div className={resultCardClass}>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#1B4332]">Total CIF value</div>
                <div className="mt-1 text-xl font-semibold text-neutral-900 sm:text-2xl">
                  {formatCurrency(dutyResults.totalCIF ?? 0, dutyResults.currencyOrigin)}
                </div>
              </div>
              <div className={resultCardClass}>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#1B4332]">
                  Assessable value ({dutyResults.currency})
                </div>
                <div className="mt-1 text-xl font-semibold text-neutral-900 sm:text-2xl">
                  {formatCurrency(dutyResults.assessableValueINR ?? 0, dutyResults.currency)}
                </div>
              </div>
              <div className={resultCardClass}>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#1B4332]">Exchange rate</div>
                <div className="mt-1 text-xl font-semibold text-neutral-900 sm:text-2xl">
                  {dutyResults.ExchangeRate ?? 0}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#1B4332]/10 pt-6 text-sm text-[#1B4332]/80 sm:grid-cols-3">
              <div>
                <span className="font-semibold text-[#1B4332]">Quantity:</span> {dutyResults.quantity}
              </div>
              <div>
                <span className="font-semibold text-[#1B4332]">Shipping:</span>{' '}
                {formatCurrency(dutyResults.shipping, dutyResults.currencyOrigin)}
              </div>
              <div>
                <span className="font-semibold text-[#1B4332]">Insurance:</span>{' '}
                {formatCurrency(dutyResults.insurance, dutyResults.currencyOrigin)}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
