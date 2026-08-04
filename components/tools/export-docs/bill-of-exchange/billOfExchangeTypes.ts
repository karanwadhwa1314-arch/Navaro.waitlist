import {
  emptyContact,
  type BolContact,
  type BolSignature,
} from '@/components/tools/export-docs/bill-of-lading/billOfLadingTypes'

export type BillOfExchangeState = {
  reference: string
  currency: string
  amount: string
  blDate: string
  placeOfIssue: string
  dateOfIssue: string
  at: string
  payToOrderOf: BolContact
  amountInWords: string
  drawnUnder: string
  drawnDate: string
  issuedBy: BolContact
  drawee: BolContact
  drawer: BolContact
  draweeFirstName: string
  draweeLastName: string
  drawerFirstName: string
  drawerLastName: string
  draweeSignature: BolSignature | null
  drawerSignature: BolSignature | null
}

export const BOE_CURRENCIES = [
  'USD',
  'CAD',
  'EUR',
  'AED',
  'AFN',
  'ALL',
  'AMD',
  'ARS',
  'AUD',
  'AZN',
  'BAM',
  'BDT',
  'BGN',
  'BHD',
  'BIF',
  'BND',
  'BOB',
  'BRL',
  'BWP',
  'BYN',
  'BZD',
  'CDF',
  'CHF',
  'CLP',
  'CNY',
  'COP',
  'CRC',
  'CVE',
  'CZK',
  'DJF',
  'DKK',
  'DOP',
  'DZD',
  'EGP',
  'ERN',
  'ETB',
  'GBP',
  'GEL',
  'GHS',
  'GNF',
  'GTQ',
  'HKD',
  'HNL',
  'HRK',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'IQD',
  'IRR',
  'ISK',
  'JMD',
  'JOD',
  'JPY',
  'KES',
  'KHR',
  'KMF',
  'KRW',
  'KWD',
  'KZT',
  'LBP',
  'LKR',
  'MAD',
  'MDL',
  'MGA',
  'MKD',
  'MMK',
  'MOP',
  'MUR',
  'MXN',
  'MYR',
  'MZN',
  'NAD',
  'NGN',
  'NIO',
  'NOK',
  'NPR',
  'NZD',
  'OMR',
  'PAB',
  'PEN',
  'PHP',
  'PKR',
  'PLN',
  'PYG',
  'QAR',
  'RON',
  'RSD',
  'RUB',
  'RWF',
  'SAR',
  'SDG',
  'SEK',
  'SGD',
  'SOS',
  'SYP',
  'THB',
  'TND',
  'TOP',
  'TRY',
  'TTD',
  'TWD',
  'TZS',
  'UAH',
  'UGX',
  'UYU',
  'UZS',
  'VND',
  'XAF',
  'XOF',
  'YER',
  'ZAR',
  'XCD',
  'AOA',
  'ANG',
  'BBD',
  'BMD',
  'BSD',
  'CUP',
  'FJD',
  'FKP',
  'GIP',
  'GMD',
  'GYD',
  'HTG',
  'KGS',
  'KPW',
  'KYD',
  'LAK',
  'LRD',
  'LSL',
  'MNT',
  'MRU',
  'MVR',
  'MWK',
  'XPF',
  'PGK',
  'SBD',
  'SCR',
  'SLE',
  'SRD',
  'STN',
  'SVC',
  'SZL',
  'TJS',
  'TMT',
  'VUV',
  'WST',
  'ZWG',
] as const

function todayIso() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function defaultBillOfExchangeState(): BillOfExchangeState {
  return {
    reference: '',
    currency: 'USD',
    amount: '0.00',
    blDate: '',
    placeOfIssue: '',
    dateOfIssue: todayIso(),
    at: '',
    payToOrderOf: emptyContact(),
    amountInWords: '',
    drawnUnder: '',
    drawnDate: '',
    issuedBy: emptyContact(),
    drawee: emptyContact(),
    drawer: emptyContact(),
    draweeFirstName: '',
    draweeLastName: '',
    drawerFirstName: '',
    drawerLastName: '',
    draweeSignature: null,
    drawerSignature: null,
  }
}

export function parseBoeAmount(v: string) {
  const n = parseFloat(v.replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

/** Strips non-numeric input; allows digits and at most one decimal (max 2 fraction digits). */
export function sanitizeBoeAmountInput(raw: string): string {
  const s = raw.replace(/,/g, '').replace(/[^\d.]/g, '')
  const dotIndex = s.indexOf('.')
  if (dotIndex === -1) return s
  const intPart = s.slice(0, dotIndex)
  const fracPart = s.slice(dotIndex + 1).replace(/\./g, '').slice(0, 2)
  return `${intPart}.${fracPart}`
}

export function formatBoeAmount(n: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

/** ISO currency code → display symbol (e.g. USD → $, EUR → €). */
export function currencySymbol(currency: string): string {
  const code = (currency || 'USD').trim().toUpperCase() || 'USD'
  try {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0)
    const part = parts.find((p) => p.type === 'currency')
    return part?.value?.trim() || code
  } catch {
    return code
  }
}

/** Formatted amount with currency symbol prefix (e.g. "$ 1,234.56"). */
export function formatBoeAmountWithSymbol(amount: string, currency: string): string {
  const sym = currencySymbol(currency)
  return `${sym} ${formatBoeAmount(parseBoeAmount(amount))}`
}

/** Converts a numeric amount to words (USD-style). */
export function amountToWords(num: number, currency = 'USD') {
  if (!Number.isFinite(num) || num < 0) return ''
  const whole = Math.floor(num)
  const cents = Math.round((num - whole) * 100)

  const a = [
    '',
    'one ',
    'two ',
    'three ',
    'four ',
    'five ',
    'six ',
    'seven ',
    'eight ',
    'nine ',
    'ten ',
    'eleven ',
    'twelve ',
    'thirteen ',
    'fourteen ',
    'fifteen ',
    'sixteen ',
    'seventeen ',
    'eighteen ',
    'nineteen ',
  ]
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

  function chunkToWords(n: number): string {
    if (n === 0) return ''
    if (n < 20) return a[n]
    if (n < 100) return `${b[Math.floor(n / 10)]}${n % 10 ? ' ' + a[n % 10] : ''}`.trim() + ' '
    const h = Math.floor(n / 100)
    const rest = n % 100
    return `${a[h]}hundred ${chunkToWords(rest)}`.trim() + ' '
  }

  if (whole > 999_999_999) return 'Amount too large'

  const millions = Math.floor(whole / 1_000_000)
  const thousands = Math.floor((whole % 1_000_000) / 1000)
  const hundreds = whole % 1000

  let str = ''
  if (millions) str += `${chunkToWords(millions)}million `
  if (thousands) str += `${chunkToWords(thousands)}thousand `
  if (hundreds) str += chunkToWords(hundreds)
  str = str.trim() || 'zero'

  const unit = currency === 'USD' ? 'dollars' : currency.toLowerCase()
  let result = `${str} ${unit}`
  if (cents > 0) {
    const centWords = cents < 20 ? a[cents].trim() : `${b[Math.floor(cents / 10)]} ${a[cents % 10]}`.trim()
    result += ` and ${centWords} cents`
  } else {
    result += ' only'
  }

  return result.charAt(0).toUpperCase() + result.slice(1)
}
