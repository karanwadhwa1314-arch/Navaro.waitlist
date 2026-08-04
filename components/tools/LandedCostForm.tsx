'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { computeLandedCostRows } from '@/components/tools/landedCostCalc'
import {
  convertUsdToCurrency,
  formatRate,
  rateBetweenCurrencies,
  type UsdBasedRates,
} from '@/lib/exchangeRates'
import {
  LandedCostResultsSection,
  SellPriceProfitSection,
  type CalculatedRow,
} from '@/components/tools/LandedCostResults'
import { COUNTRY_OPTIONS } from '@/lib/countries'

const INCOTERMS = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'] as const
const CURRENCIES = ['CAD', 'USD', 'EUR', 'GBP', 'INR', 'AUD'] as const

type ProductLine = {
  id: string
  productCode: string
  description: string
  unitType: string
  quantity: string
  buyPrice: string
  dutyRate: string
  cubicPerUnit: string
  weightPerUnit: string
}

function newLine(): ProductLine {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `line-${Date.now()}-${Math.random()}`
  return {
    id,
    productCode: '',
    description: '',
    unitType: '',
    quantity: '',
    buyPrice: '',
    dutyRate: '',
    cubicPerUnit: '',
    weightPerUnit: '',
  }
}

function parseNum(v: string) {
  const n = parseFloat(v.replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

const labelClass = 'mb-1.5 block text-xs font-semibold text-navaro-forest/70'
const inputClass =
  'w-full rounded-lg border border-navaro-forest/15 bg-white px-3 py-2.5 text-sm text-navaro-forest outline-none transition placeholder:text-navaro-forest/30 focus:border-navaro-purple-cta/50 focus:ring-2 focus:ring-navaro-purple-cta/20'
const selectClass = `${inputClass} appearance-none pr-9`
const sectionTitle = 'mb-4 text-base font-bold text-navaro-forest'

function SelectChevron() {
  return (
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navaro-accent" aria-hidden>
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  )
}

export default function LandedCostForm({ onClose }: { onClose: () => void }) {
  const [lines, setLines] = useState<ProductLine[]>(() => [newLine(), newLine()])
  const [internationalFreight, setInternationalFreight] = useState('')
  const [localImportCosts, setLocalImportCosts] = useState('')
  const [productBuyCurrency, setProductBuyCurrency] = useState('CAD')
  const [finalLocalCurrency, setFinalLocalCurrency] = useState('CAD')
  const [exchangeRate, setExchangeRate] = useState('1.00')
  const [vatGst, setVatGst] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [calculatedRows, setCalculatedRows] = useState<CalculatedRow[]>([])
  const [pricingMode, setPricingMode] = useState<'margin' | 'markup'>('margin')
  const [margins, setMargins] = useState<Record<string, string>>({})
  const [markups, setMarkups] = useState<Record<string, string>>({})
  const [conversionRates, setConversionRates] = useState<UsdBasedRates | null>(null)
  const [ratesStatus, setRatesStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [exchangeRateManual, setExchangeRateManual] = useState(false)
  const [countryOfOrigin, setCountryOfOrigin] = useState('')

  useEffect(() => {
    let cancelled = false
    setRatesStatus('loading')
    fetch('/api/exchange-rates')
      .then((res) => res.json())
      .then((data: { rates?: UsdBasedRates; error?: string }) => {
        if (cancelled) return
        if (data.rates && typeof data.rates === 'object') {
          setConversionRates(data.rates)
          setRatesStatus('ready')
        } else {
          setRatesStatus('error')
        }
      })
      .catch(() => {
        if (!cancelled) setRatesStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setExchangeRateManual(false)
  }, [productBuyCurrency, finalLocalCurrency])

  useEffect(() => {
    if (!conversionRates || exchangeRateManual) return
    const cross = rateBetweenCurrencies(productBuyCurrency, finalLocalCurrency, conversionRates)
    if (cross != null) setExchangeRate(formatRate(cross))
  }, [productBuyCurrency, finalLocalCurrency, conversionRates, exchangeRateManual])

  const usdToLocalRate = useMemo(() => {
    if (finalLocalCurrency === 'USD') return 1
    if (!conversionRates) return null
    const r = conversionRates[finalLocalCurrency]
    return r && r > 0 ? r : null
  }, [finalLocalCurrency, conversionRates])

  const internationalFreightLocal = useMemo(() => {
    const usd = parseNum(internationalFreight)
    if (usd <= 0) return 0
    if (finalLocalCurrency === 'USD') return usd
    if (!conversionRates) return 0
    return convertUsdToCurrency(usd, finalLocalCurrency, conversionRates)
  }, [internationalFreight, finalLocalCurrency, conversionRates])

  const lineCalcs = useMemo(
    () =>
      lines.map((line) => {
        const qty = parseNum(line.quantity)
        const buy = parseNum(line.buyPrice)
        const cubic = parseNum(line.cubicPerUnit)
        const weight = parseNum(line.weightPerUnit)
        return {
          amount: qty * buy,
          cubicTotal: qty * cubic,
          totalWeight: qty * weight,
        }
      }),
    [lines],
  )

  const summary = useMemo(() => {
    const typeCount = lines.filter((l) => l.productCode.trim() || l.description.trim()).length
    const amountTotal = lineCalcs.reduce((s, c) => s + c.amount, 0)
    const cubicTotal = lineCalcs.reduce((s, c) => s + c.cubicTotal, 0)
    const weightTotal = lineCalcs.reduce((s, c) => s + c.totalWeight, 0)
    return { typeCount, amountTotal, cubicTotal, weightTotal }
  }, [lines, lineCalcs])

  const freightTotal = useMemo(() => {
    const localCosts = parseNum(localImportCosts)
    const intlLocal =
      finalLocalCurrency === 'USD'
        ? parseNum(internationalFreight)
        : ratesStatus === 'ready'
          ? internationalFreightLocal
          : 0
    return intlLocal + localCosts
  }, [internationalFreight, internationalFreightLocal, localImportCosts, finalLocalCurrency, ratesStatus])

  const updateLine = useCallback((id: string, patch: Partial<ProductLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }, [])

  const addLine = () => setLines((prev) => [...prev, newLine()])

  const internationalFreightForCalc = useMemo(() => {
    if (finalLocalCurrency === 'USD') return parseNum(internationalFreight)
    if (ratesStatus === 'ready') return internationalFreightLocal
    return parseNum(internationalFreight)
  }, [internationalFreight, internationalFreightLocal, finalLocalCurrency, ratesStatus])

  const runCalculation = useCallback(() => {
    const rows = computeLandedCostRows(lines, {
      internationalFreight: internationalFreightForCalc,
      localImportCosts: parseNum(localImportCosts),
      exchangeRate: parseNum(exchangeRate) || 1,
      vatGstPercent: parseNum(vatGst),
      pricingMode,
      margins,
      markups,
    })
    setCalculatedRows(rows)
    setShowResults(true)
  }, [
    lines,
    internationalFreightForCalc,
    localImportCosts,
    exchangeRate,
    vatGst,
    pricingMode,
    margins,
    markups,
  ])

  const recalcSellPrices = useCallback(
    (nextMargins: Record<string, string>, nextMarkups: Record<string, string>, mode: 'margin' | 'markup') => {
      const rows = computeLandedCostRows(lines, {
        internationalFreight: internationalFreightForCalc,
        localImportCosts: parseNum(localImportCosts),
        exchangeRate: parseNum(exchangeRate) || 1,
        vatGstPercent: parseNum(vatGst),
        pricingMode: mode,
        margins: nextMargins,
        markups: nextMarkups,
      })
      setCalculatedRows(rows)
    },
    [lines, internationalFreightForCalc, localImportCosts, exchangeRate, vatGst],
  )

  useEffect(() => {
    if (!showResults) return
    const rows = computeLandedCostRows(lines, {
      internationalFreight: internationalFreightForCalc,
      localImportCosts: parseNum(localImportCosts),
      exchangeRate: parseNum(exchangeRate) || 1,
      vatGstPercent: parseNum(vatGst),
      pricingMode,
      margins,
      markups,
    })
    setCalculatedRows(rows)
  }, [showResults, internationalFreightForCalc, localImportCosts, exchangeRate, vatGst, pricingMode, margins, markups, lines])

  const handleMarginChange = (id: string, value: string) => {
    const next = { ...margins, [id]: value }
    setMargins(next)
    if (showResults) recalcSellPrices(next, markups, pricingMode)
  }

  const handleMarkupChange = (id: string, value: string) => {
    const next = { ...markups, [id]: value }
    setMarkups(next)
    if (showResults) recalcSellPrices(margins, next, pricingMode)
  }

  const handlePricingModeChange = (mode: 'margin' | 'markup') => {
    setPricingMode(mode)
    if (showResults) recalcSellPrices(margins, markups, mode)
  }

  return (
    <div className="overflow-hidden rounded-[1rem] border border-navaro-forest/10 bg-navaro-cream shadow-[0_2px_12px_rgba(0,45,45,0.06)]">
      <header className="flex items-center justify-between gap-4 border-b border-navaro-forest/10 bg-navaro-cream px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-navaro-forest/50 transition hover:bg-white hover:text-navaro-forest"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="h-6 w-px shrink-0 bg-navaro-forest/15" aria-hidden />
          <h1 className="truncate text-lg font-semibold text-navaro-forest/80 sm:text-xl">Landed Cost</h1>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full bg-[#C9B0E8] px-5 py-2.5 text-sm font-semibold text-navaro-forest shadow-sm transition hover:brightness-105"
        >
          Save Changes
        </button>
      </header>

      <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
        <section className="mb-8">
          <h2 className={sectionTitle}>Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reference">
              <input type="text" className={inputClass} />
            </Field>
            <Field label="Date">
              <input type="date" className={inputClass} />
            </Field>
            <Field label="Country of Origin">
              <div className="relative">
                <select
                  className={selectClass}
                  value={countryOfOrigin}
                  onChange={(e) => setCountryOfOrigin(e.target.value)}
                >
                  <option value="" disabled>
                    Select country
                  </option>
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </Field>
            <Field label="Country of Destination">
              <input 
              type="text"
              placeholder='India'
              disabled={true}
              className={inputClass} />
            </Field>
            <Field label="GST Percentage (%)" className="sm:col-span-1">
              <input
                type="text"
                placeholder="18%"
                disabled={true}
                inputMode="decimal"
                className={inputClass}
                value={vatGst}
                // onChange={(e) => setVatGst(e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Description</label>
            <textarea rows={4} className={`${inputClass} resize-y min-h-[100px]`} />
          </div>
        </section>

        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className={sectionTitle}>Transaction Details</h2>
            <div className="space-y-4">
              <Field label="Incoterms">
                <div className="relative">
                  <select className={selectClass} defaultValue="">
                    <option value="" disabled>
                      Select
                    </option>
                    {INCOTERMS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </Field>
              <Field label="Product Buy Currency">
                <div className="relative">
                  <select
                    className={selectClass}
                    value={productBuyCurrency}
                    onChange={(e) => setProductBuyCurrency(e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </Field>
              <Field label="Final Local Currency">
                <div className="relative">
                  <select
                    className={selectClass}
                    value={finalLocalCurrency}
                    onChange={(e) => setFinalLocalCurrency(e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </Field>
              <Field label={`Exchange Rate (${productBuyCurrency} → ${finalLocalCurrency})`}>
                <input
                  type="text"
                  inputMode="decimal"
                  className={inputClass}
                  placeholder="1.00"
                  value={exchangeRate}
                  onChange={(e) => {
                    setExchangeRateManual(true)
                    setExchangeRate(e.target.value)
                  }}
                />
                {ratesStatus === 'loading' && (
                  <p className="mt-1 text-[11px] text-navaro-forest/50">Loading live rates…</p>
                )}
                {ratesStatus === 'error' && (
                  <p className="mt-1 text-[11px] text-red-600/80">Could not load rates. Enter rate manually.</p>
                )}
              </Field>
            </div>
          </section>

          <section>
            <h2 className={sectionTitle}>Freight &amp; Import Costs</h2>
            <div className="space-y-4">
              <Field label="International Freight (USD)">
                <input
                  type="text"
                  inputMode="decimal"
                  className={inputClass}
                  value={internationalFreight}
                  onChange={(e) => setInternationalFreight(e.target.value)}
                />
                {parseNum(internationalFreight) > 0 && finalLocalCurrency !== 'USD' && (
                  <p className="mt-1 text-[11px] text-navaro-forest/55">
                    {ratesStatus === 'loading' && 'Converting to local currency…'}
                    {ratesStatus === 'error' && 'Rates unavailable — total may be incomplete.'}
                    {ratesStatus === 'ready' && usdToLocalRate != null && (
                      <>
                        1 USD = {formatRate(usdToLocalRate)} {finalLocalCurrency} →{' '}
                        <span className="font-semibold text-navaro-forest">
                          {formatMoney(internationalFreightLocal)} {finalLocalCurrency}
                        </span>
                      </>
                    )}
                  </p>
                )}
              </Field>
              <Field label={`Local Import Costs (${finalLocalCurrency})`}>
                <input
                  type="text"
                  inputMode="decimal"
                  className={inputClass}
                  value={localImportCosts}
                  onChange={(e) => setLocalImportCosts(e.target.value)}
                />
              </Field>
              <Field label={`Total (${finalLocalCurrency})`}>
                <input
                  type="text"
                  readOnly
                  className={`${inputClass} bg-navaro-cream/80`}
                  value={
                    ratesStatus === 'loading' && parseNum(internationalFreight) > 0 && finalLocalCurrency !== 'USD'
                      ? 'Loading rates…'
                      : freightTotal > 0
                        ? formatMoney(freightTotal)
                        : ''
                  }
                />
                {freightTotal > 0 && finalLocalCurrency !== 'USD' && ratesStatus === 'ready' && (
                  <p className="mt-1 text-[11px] text-navaro-forest/50">
                    {formatMoney(internationalFreightLocal)} converted freight +{' '}
                    {formatMoney(parseNum(localImportCosts))} local import
                  </p>
                )}
              </Field>
            </div>
          </section>
        </div>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-navaro-forest">Product Details</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#C9B0E8] px-4 py-2 text-sm font-semibold text-navaro-forest shadow-sm transition hover:brightness-105"
              >
                <span aria-hidden>+</span> Add Line
              </button>
              <button
                type="button"
                className="rounded-full border border-navaro-forest/20 bg-white px-4 py-2 text-sm font-semibold text-navaro-forest shadow-sm transition hover:bg-navaro-cream"
              >
                Use CBM Calculator
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-navaro-forest/10 bg-white/60">
            <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-navaro-forest/10 bg-white">
                  {[
                    'Product Code',
                    'Description of Goods',
                    'Unit Type',
                    'Quantity',
                    `Buy Price / Unit (${productBuyCurrency})`,
                    `Amount (${productBuyCurrency})`,
                    'Duty Rate (%)',
                    'Cubic(m) Per Unit',
                    'Cubic Total',
                    'Weight (Kg) Per Unit',
                    'Total Weight (Kg)',
                  ].map((col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap px-2 py-3 font-semibold text-navaro-forest/75 first:pl-3 last:pr-3"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={line.id} className="border-b border-navaro-forest/8 last:border-0">
                    <td className="p-2 first:pl-3">
                      <div className="relative min-w-[88px]">
                        <input
                          type="text"
                          className={selectClass}
                          value={line.productCode}
                          onChange={(e) => updateLine(line.id, { productCode: e.target.value })}
                        />
                        <SelectChevron />
                      </div>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        className={`${inputClass} min-w-[120px]`}
                        value={line.description}
                        onChange={(e) => updateLine(line.id, { description: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        className={`${inputClass} min-w-[72px]`}
                        value={line.unitType}
                        onChange={(e) => updateLine(line.id, { unitType: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        className={`${inputClass} min-w-[64px]`}
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, { quantity: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        className={`${inputClass} min-w-[80px]`}
                        value={line.buyPrice}
                        onChange={(e) => updateLine(line.id, { buyPrice: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        readOnly
                        className={`${inputClass} min-w-[80px] bg-navaro-cream/50`}
                        value={lineCalcs[i].amount > 0 ? formatMoney(lineCalcs[i].amount) : ''}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        className={`${inputClass} min-w-[64px]`}
                        value={line.dutyRate}
                        onChange={(e) => updateLine(line.id, { dutyRate: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        className={`${inputClass} min-w-[72px]`}
                        value={line.cubicPerUnit}
                        onChange={(e) => updateLine(line.id, { cubicPerUnit: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        readOnly
                        className={`${inputClass} min-w-[72px] bg-navaro-cream/50`}
                        value={lineCalcs[i].cubicTotal > 0 ? formatMoney(lineCalcs[i].cubicTotal) : ''}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        className={`${inputClass} min-w-[72px]`}
                        value={line.weightPerUnit}
                        onChange={(e) => updateLine(line.id, { weightPerUnit: e.target.value })}
                      />
                    </td>
                    <td className="p-2 last:pr-3">
                      <input
                        type="text"
                        readOnly
                        className={`${inputClass} min-w-[80px] bg-navaro-cream/50`}
                        value={lineCalcs[i].totalWeight > 0 ? formatMoney(lineCalcs[i].totalWeight) : ''}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center gap-6 rounded-xl border border-navaro-forest/12 bg-white px-4 py-3 text-sm font-semibold text-navaro-forest">
            <span className="text-navaro-forest/60">
              Type <span className="ml-2 text-navaro-forest">{summary.typeCount || '—'}</span>
            </span>
            <span className="text-navaro-forest/60">
              $ <span className="ml-2 text-navaro-forest">{summary.amountTotal > 0 ? formatMoney(summary.amountTotal) : '—'}</span>
            </span>
            <span className="ml-auto text-navaro-forest/60">
              <span className="text-navaro-forest">{summary.cubicTotal > 0 ? formatMoney(summary.cubicTotal) : '—'}</span>
            </span>
            <span className="text-navaro-forest/60">
              <span className="text-navaro-forest">{summary.weightTotal > 0 ? formatMoney(summary.weightTotal) : '—'}</span>
            </span>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={runCalculation}
              className="rounded-full bg-[#C9B0E8] px-8 py-3 text-sm font-semibold text-navaro-forest shadow-sm transition hover:brightness-105"
            >
              Calculate
            </button>
          </div>

          {showResults && calculatedRows.length > 0 && (
            <>
              <LandedCostResultsSection
                rows={calculatedRows}
                productBuyCurrency={productBuyCurrency}
                finalLocalCurrency={finalLocalCurrency}
              />
              <SellPriceProfitSection
                rows={calculatedRows}
                pricingMode={pricingMode}
                finalLocalCurrency={finalLocalCurrency}
                onPricingModeChange={handlePricingModeChange}
                onMarginChange={handleMarginChange}
                onMarkupChange={handleMarkupChange}
              />
            </>
          )}
        </section>
      </div>
    </div>
  )
}

