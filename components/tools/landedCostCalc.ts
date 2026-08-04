import type { CalculatedRow } from '@/components/tools/LandedCostResults'

export type ProductLineInput = {
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

function parseNum(v: string) {
  const n = parseFloat(v.replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

function sellFromMargin(landed: number, marginPct: number) {
  if (marginPct <= 0 || marginPct >= 100) return landed
  return landed / (1 - marginPct / 100)
}

function sellFromMarkup(landed: number, markupPct: number) {
  if (markupPct <= 0) return landed
  return landed * (1 + markupPct / 100)
}

export function computeLandedCostRows(
  lines: ProductLineInput[],
  opts: {
    /** International freight in the same currency as localImportCosts (converted from USD when applicable). */
    internationalFreight: number
    localImportCosts: number
    exchangeRate: number
    vatGstPercent: number
    pricingMode: 'margin' | 'markup'
    margins: Record<string, string>
    markups: Record<string, string>
  },
): CalculatedRow[] {
  const rate = opts.exchangeRate > 0 ? opts.exchangeRate : 1
  const activeLines = lines.filter(
    (l) =>
      l.productCode.trim() ||
      l.description.trim() ||
      parseNum(l.quantity) > 0 ||
      parseNum(l.buyPrice) > 0,
  )
  const calcLines = activeLines.length > 0 ? activeLines : lines

  const amounts = calcLines.map((l) => {
    const qty = parseNum(l.quantity)
    const buy = parseNum(l.buyPrice)
    return qty * buy
  })
  const totalAmount = amounts.reduce((s, a) => s + a, 0) || 1

  return calcLines.map((line, i) => {
    const qty = parseNum(line.quantity)
    const buy = parseNum(line.buyPrice)
    const amount = amounts[i]
    const share = amount / totalAmount
    const dutyRate = parseNum(line.dutyRate)
    const importCosts = share * opts.localImportCosts/qty
    const freightCosts = ((share * opts.internationalFreight)+(share * opts.localImportCosts))/qty-importCosts
    
    const dutyAmount = ((buy*rate)+(freightCosts))*dutyRate/100

    const landedCostPerUnit = ((buy*rate)+(freightCosts))+(importCosts)+dutyAmount

    const totalLandedCost = landedCostPerUnit*qty
    const totalTax = totalLandedCost * (opts.vatGstPercent / 100)
    const buyPriceEur = buy * rate
    

    const margin = parseNum(opts.margins[line.id] ?? '')
    const markup = parseNum(opts.markups[line.id] ?? '')
    const sellPricePerUnit = opts.pricingMode === 'margin' ? sellFromMargin(landedCostPerUnit, margin)
  : sellFromMarkup(landedCostPerUnit, markup)
    const profitPerUnit = sellPricePerUnit - landedCostPerUnit
    const totalSellPrice = sellPricePerUnit * (qty || 1)
    const totalProfit = profitPerUnit * (qty || 1)

    return {
      id: line.id,
      productCode: line.productCode,
      description: line.description,
      unitType: line.unitType,
      quantity: qty,
      buyPrice: buy,
      buyPriceEur,
      amount,
      dutyRate,
      dutyAmount,
      freightCosts,
      importCosts,
      landedCostPerUnit,
      totalLandedCost,
      totalTax,
      margin: opts.margins[line.id] ?? '',
      markup: opts.markups[line.id] ?? '',
      sellPricePerUnit,
      totalSellPrice,
      profitPerUnit,
      totalProfit,
    }
  })
}

export function parseNumInput(v: string) {
  return parseNum(v)
}
