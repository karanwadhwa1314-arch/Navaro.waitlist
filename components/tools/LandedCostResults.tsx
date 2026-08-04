'use client'

import { useMemo, type ReactNode } from 'react'

export type CalculatedRow = {
  id: string
  productCode: string
  description: string
  unitType: string
  quantity: number
  buyPrice: number
  buyPriceEur: number
  amount: number
  dutyRate: number
  dutyAmount: number
  freightCosts: number
  importCosts: number
  landedCostPerUnit: number
  totalLandedCost: number
  totalTax: number
  margin: string
  markup: string
  sellPricePerUnit: number
  totalSellPrice: number
  profitPerUnit: number
  totalProfit: number
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function ResultCell({
  value,
  highlight = false,
  className = '',
}: {
  value: string
  highlight?: boolean
  className?: string
}) {
  return (
    <td
      className={`whitespace-nowrap border-b border-navaro-forest/8 px-2 py-2.5 text-xs font-medium text-navaro-forest first:pl-3 last:pr-3 ${
        highlight ? 'bg-[#D4E4C8]/70' : ''
      } ${className}`}
    >
      {value}
    </td>
  )
}

function ResultHead({ children, highlight = false }: { children: ReactNode; highlight?: boolean }) {
  return (
    <th
      className={`whitespace-nowrap px-2 py-3 text-xs font-semibold text-navaro-forest first:pl-3 last:pr-3 ${
        highlight ? 'bg-[#D4E4C8]/90' : ''
      }`}
    >
      {children}
    </th>
  )
}

export function LandedCostResultsSection({
  rows,
  productBuyCurrency,
  finalLocalCurrency,
}: {
  rows: CalculatedRow[]
  productBuyCurrency: string
  finalLocalCurrency: string
}) {
  const totals = useMemo(
    () => ({
      totalLandedCost: rows.reduce((s, r) => s + r.totalLandedCost, 0),
      totalTax: rows.reduce((s, r) => s + r.totalTax, 0),
    }),
    [rows],
  )

  return (
    <section className="mt-8 rounded-2xl border border-navaro-forest/10 bg-[#FDF2B3]/90 p-4 sm:p-6">
      <h2 className="mb-4 text-base font-bold text-navaro-forest">Landed Cost</h2>
      <div className="overflow-x-auto rounded-xl border border-navaro-forest/10 bg-white/80">
        <table className="w-full min-w-[1200px] border-collapse text-left">
          <thead>
            <tr className="border-b border-navaro-forest/10">
              <ResultHead>Product Code</ResultHead>
              <ResultHead>Description of Goods</ResultHead>
              <ResultHead>Buy Price ({productBuyCurrency})</ResultHead>
              <ResultHead>Buy Price ({finalLocalCurrency})</ResultHead>
              <ResultHead>Freight Costs ({finalLocalCurrency})</ResultHead>
              <ResultHead>Import Costs ({finalLocalCurrency})</ResultHead>
              <ResultHead>Duty Amount ({finalLocalCurrency})</ResultHead>
              <ResultHead highlight>Landed Cost</ResultHead>
              <ResultHead highlight>Unit Type</ResultHead>
              <ResultHead>Quantity</ResultHead>
              <ResultHead>Total Landed Cost</ResultHead>
              <ResultHead>Total Tax ({finalLocalCurrency})</ResultHead>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <ResultCell value={row.productCode || '—'} />
                <ResultCell value={row.description || '—'} />
                <ResultCell value={formatMoney(row.buyPrice)} />
                <ResultCell value={formatMoney(row.buyPriceEur)} />
                <ResultCell value={formatMoney(row.freightCosts)} />
                <ResultCell value={formatMoney(row.importCosts)} />
                <ResultCell value={formatMoney(row.dutyAmount)} />
                <ResultCell value={formatMoney(row.landedCostPerUnit)} highlight />
                <ResultCell value={row.unitType || '—'} highlight />
                <ResultCell value={row.quantity > 0 ? String(row.quantity) : '—'} />
                <ResultCell value={formatMoney(row.totalLandedCost)} />
                <ResultCell value={row.totalTax > 0 ? formatMoney(row.totalTax) : '$'} />
              </tr>
            ))}
            <tr className="bg-white/60 font-bold">
              <td colSpan={10} className="px-3 py-2.5 text-xs text-navaro-forest">
                Total
              </td>
              <td className="whitespace-nowrap px-2 py-2.5 text-xs font-bold text-navaro-forest">
                {formatMoney(totals.totalLandedCost)}
              </td>
              <td className="whitespace-nowrap px-2 py-2.5 text-xs font-bold text-navaro-forest">
                {totals.totalTax > 0 ? formatMoney(totals.totalTax) : '$'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function SellPriceProfitSection({
  rows,
  pricingMode,
  finalLocalCurrency,
  onPricingModeChange,
  onMarginChange,
  onMarkupChange,
}: {
  rows: CalculatedRow[]
  pricingMode: 'margin' | 'markup'
  finalLocalCurrency: string
  onPricingModeChange: (mode: 'margin' | 'markup') => void
  onMarginChange: (id: string, value: string) => void
  onMarkupChange: (id: string, value: string) => void
}) {
  const totals = useMemo(
    () => ({
      totalSellPrice: rows.reduce((s, r) => s + r.totalSellPrice, 0),
      totalProfit: rows.reduce((s, r) => s + r.totalProfit, 0),
      avgLanded:
        rows.length > 0 ? rows.reduce((s, r) => s + r.landedCostPerUnit, 0) / rows.length : 0,
    }),
    [rows],
  )

  const inputResultClass =
    'w-full min-w-[56px] rounded-md border border-navaro-forest/15 bg-white px-2 py-1.5 text-xs text-navaro-forest outline-none focus:border-navaro-purple-cta/50 focus:ring-1 focus:ring-navaro-purple-cta/25'

  return (
    <section className="mt-6 rounded-2xl border border-navaro-forest/10 bg-[#FDF2B3]/90 p-4 sm:p-6">
      <h2 className="mb-4 text-base font-bold text-navaro-forest">Sell Price &amp; Profit</h2>
      <div className="overflow-x-auto rounded-xl border border-navaro-forest/10 bg-white/80">
        <table className="w-full min-w-[1200px] border-collapse text-left">
          <thead>
            <tr className="border-b border-navaro-forest/10">
              <ResultHead>Product Code</ResultHead>
              <ResultHead>Description of Goods</ResultHead>
              <ResultHead highlight>Landed Cost ({finalLocalCurrency})</ResultHead>
              <ResultHead highlight>Unit Type</ResultHead>
              <ResultHead>
                <label className="flex cursor-pointer items-center justify-center gap-1.5">
                  <input
                    type="radio"
                    name="pricing-mode"
                    checked={pricingMode === 'margin'}
                    onChange={() => onPricingModeChange('margin')}
                    className="accent-navaro-forest"
                  />
                  Margin (%)
                </label>
              </ResultHead>
              <ResultHead>
                <label className="flex cursor-pointer items-center justify-center gap-1.5">
                  <input
                    type="radio"
                    name="pricing-mode"
                    checked={pricingMode === 'markup'}
                    onChange={() => onPricingModeChange('markup')}
                    className="accent-navaro-forest"
                  />
                  Markup (%)
                </label>
              </ResultHead>
              <ResultHead highlight>Sell Price/Unit ({finalLocalCurrency})</ResultHead>
              <ResultHead highlight>Unit Type</ResultHead>
              <ResultHead>Total Sell Price</ResultHead>
              <ResultHead>Profit/Unit ({finalLocalCurrency})</ResultHead>
              <ResultHead>Total Profit ({finalLocalCurrency})</ResultHead>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <ResultCell value={row.productCode || '—'} />
                <ResultCell value={row.description || '—'} />
                <ResultCell value={formatMoney(row.landedCostPerUnit)} highlight />
                <ResultCell value={row.unitType || '—'} highlight />
                <td className="border-b border-navaro-forest/8 px-2 py-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    className={inputResultClass}
                    value={row.margin}
                    onChange={(e) => onMarginChange(row.id, e.target.value)}
                    disabled={pricingMode !== 'margin'}
                  />
                </td>
                <td className="border-b border-navaro-forest/8 px-2 py-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    className={inputResultClass}
                    value={row.markup}
                    onChange={(e) => onMarkupChange(row.id, e.target.value)}
                    disabled={pricingMode !== 'markup'}
                  />
                </td>
                <ResultCell value={formatMoney(row.sellPricePerUnit)} highlight />
                <ResultCell value={row.unitType || '—'} highlight />
                <ResultCell value={formatMoney(row.totalSellPrice)} />
                <ResultCell value={row.profitPerUnit > 0 ? formatMoney(row.profitPerUnit) : '$'} />
                <ResultCell value={formatMoney(row.totalProfit)} />
              </tr>
            ))}
            <tr className="bg-white/60 font-bold">
              <td colSpan={2} className="px-3 py-2.5 text-xs text-navaro-forest" />
              <td className="px-2 py-2.5 text-xs text-navaro-forest/70">
                Average
                <span className="mt-0.5 block font-bold text-navaro-forest">{formatMoney(totals.avgLanded)}</span>
              </td>
              <td className="px-2 py-2.5" />
              <td className="px-2 py-2.5 text-xs text-navaro-forest">%</td>
              <td className="px-2 py-2.5 text-xs text-navaro-forest">%</td>
              <td className="px-2 py-2.5" />
              <td className="px-2 py-2.5 text-xs text-navaro-forest">Total</td>
              <td className="whitespace-nowrap px-2 py-2.5 text-xs font-bold text-navaro-forest">
                {formatMoney(totals.totalSellPrice)}
              </td>
              <td className="px-2 py-2.5 text-xs text-navaro-forest">$</td>
              <td className="whitespace-nowrap px-2 py-2.5 text-xs font-bold text-navaro-forest">
                {formatMoney(totals.totalProfit)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-center text-xs text-navaro-forest/45">
        Disclaimer: This Calculator is to be used as a guide only — it is your responsibility to check the accuracy of
        your Landed Cost
      </p>
    </section>
  )
}
