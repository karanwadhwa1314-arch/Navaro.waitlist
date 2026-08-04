/** Rates from ExchangeRate-API with base USD (1 USD = rates[CODE] units of CODE). */
export type UsdBasedRates = Record<string, number>

export function convertUsdToCurrency(amountUsd: number, targetCurrency: string, rates: UsdBasedRates): number {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) return 0
  if (targetCurrency === 'USD') return amountUsd
  const rate = rates[targetCurrency]
  if (!rate || rate <= 0) return amountUsd
  return amountUsd * rate
}

/** How many `to` units equal 1 `from` unit, using USD-based conversion table. */
export function rateBetweenCurrencies(from: string, to: string, rates: UsdBasedRates): number | null {
  if (from === to) return 1
  const fromPerUsd = from === 'USD' ? 1 : rates[from]
  const toPerUsd = to === 'USD' ? 1 : rates[to]
  if (!fromPerUsd || fromPerUsd <= 0 || !toPerUsd || toPerUsd <= 0) return null
  return toPerUsd / fromPerUsd
}

export function formatRate(n: number) {
  if (n >= 100) return n.toFixed(2)
  if (n >= 1) return n.toFixed(4)
  return n.toFixed(6)
}
