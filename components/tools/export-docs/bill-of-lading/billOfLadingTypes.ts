export type BolContactType = 'Customer' | 'Supplier' | 'Forwarding Agent' | 'Other'

export type BolContact = {
  /** Display label in search field (usually company name) */
  name: string
  companyName: string
  contactType: BolContactType
  firstName: string
  lastName: string
  email: string
  line1: string
  line2: string
  line3: string
  city: string
  region: string
  postal: string
  country: string
  phone: string
  fax: string
  /** Company logo as PNG/JPEG data URL */
  logoDataUrl: string
}

export function contactDisplayName(c: BolContact) {
  return (c.companyName || c.name).trim()
}

export function contactPreviewLines(
  c: BolContact,
  options?: { omitCompanyWhenLogo?: boolean },
): string[] {
  const lines: string[] = []
  const company = contactDisplayName(c)
  const hasLogo = Boolean(c.logoDataUrl?.trim())
  if (company && !(options?.omitCompanyWhenLogo && hasLogo)) lines.push(company)
  const person = [c.firstName, c.lastName].filter(Boolean).join(' ').trim()
  if (person) lines.push(person)
  for (const line of [c.line1, c.line2, c.line3]) {
    if (line.trim()) lines.push(line.trim())
  }
  const locality = [c.city, c.region, c.postal].filter(Boolean).join(', ')
  const locLine = [locality, c.country].filter(Boolean).join(' ')
  if (locLine.trim()) lines.push(locLine.trim())
  if (c.email.trim()) lines.push(c.email.trim())
  if (c.phone.trim()) lines.push(`Tel: ${c.phone.trim()}`)
  if (c.fax.trim()) lines.push(`Fax: ${c.fax.trim()}`)
  return lines
}

export type BolGoodsLine = {
  id: string
  marks: string
  packages: string
  description: string
  netWeight: string
  grossWeight: string
  measurements: string
}

export type BolContainerLine = {
  id: string
  containerNo: string
  sealNo: string
  containerType: string
}

export type BolSignatureMode = 'draw' | 'type' | 'upload'

export type BolSignatureFontId =
  | 'cedarville'
  | 'homemade-apple'
  | 'italianno'
  | 'marck-script'
  | 'satisfy'
  | 'yellowtail'

export type BolSignature = {
  mode: BolSignatureMode
  typedText: string
  fontId: BolSignatureFontId
  /** PNG data URL for draw, upload, or rendered typed signature */
  imageDataUrl: string
}

export const BOL_SIGNATURE_FONTS: { id: BolSignatureFontId; label: string; family: string }[] = [
  { id: 'cedarville', label: 'Cedarville Cursive', family: "'Cedarville Cursive', cursive" },
  { id: 'homemade-apple', label: 'Homemade Apple', family: "'Homemade Apple', cursive" },
  { id: 'italianno', label: 'Italianno', family: "'Italianno', cursive" },
  { id: 'marck-script', label: 'Marck Script', family: "'Marck Script', cursive" },
  { id: 'satisfy', label: 'Satisfy', family: "'Satisfy', cursive" },
  { id: 'yellowtail', label: 'Yellowtail', family: "'Yellowtail', cursive" },
]

export const BOL_SAVED_SIGNATURE_KEY = 'navarro-bol-saved-signature'

export function emptySignature(): BolSignature {
  return {
    mode: 'type',
    typedText: '',
    fontId: 'cedarville',
    imageDataUrl: '',
  }
}

export function signatureDefaultName(first: string, last: string) {
  return [first, last].filter(Boolean).join(' ').trim()
}

export type BillOfLadingState = {
  pages: string
  shippersReference: string
  carriersReference: string
  bolNumber: string
  consignmentReference: string
  shipper: BolContact
  consignee: BolContact
  carrier: BolContact
  notifyParty: BolContact
  additionalNotifyParty: BolContact
  precarriageBy: string
  placeOfReceipt: string
  vessel: string
  voyage: string
  portOfLoading: string
  additionalInformation: string
  portOfDischarge: string
  placeOfDelivery: string
  finalDestination: string
  goodsLines: BolGoodsLine[]
  containerLines: BolContainerLine[]
  numberOfContainers: string
  numberOfOriginalBol: string
  incoterms: string
  payableAt: string
  freightCharges: string
  shippedOnBoardDate: string
  termsAndConditions: string
  declarationPlace: string
  declarationDate: string
  declarationCompanyName: string
  declarationFirstName: string
  declarationLastName: string
  signature: BolSignature | null
}

export function newBolLineId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function emptyContact(): BolContact {
  return {
    name: '',
    companyName: '',
    contactType: 'Customer',
    firstName: '',
    lastName: '',
    email: '',
    line1: '',
    line2: '',
    line3: '',
    city: '',
    region: '',
    postal: '',
    country: '',
    phone: '',
    fax: '',
    logoDataUrl: '',
  }
}

export function newGoodsLine(): BolGoodsLine {
  return {
    id: newBolLineId(),
    marks: '',
    packages: '',
    description: '',
    netWeight: '',
    grossWeight: '',
    measurements: '',
  }
}

export function newContainerLine(): BolContainerLine {
  return {
    id: newBolLineId(),
    containerNo: '',
    sealNo: '',
    containerType: '',
  }
}

export function defaultBillOfLadingState(): BillOfLadingState {
  return {
    pages: '1 of 1',
    shippersReference: '',
    carriersReference: '',
    bolNumber: '',
    consignmentReference: '',
    shipper: emptyContact(),
    consignee: emptyContact(),
    carrier: emptyContact(),
    notifyParty: emptyContact(),
    additionalNotifyParty: emptyContact(),
    precarriageBy: '',
    placeOfReceipt: '',
    vessel: '',
    voyage: '',
    portOfLoading: '',
    additionalInformation: '',
    portOfDischarge: '',
    placeOfDelivery: '',
    finalDestination: '',
    goodsLines: [newGoodsLine()],
    containerLines: [newContainerLine()],
    numberOfContainers: '',
    numberOfOriginalBol: '',
    incoterms: '',
    payableAt: '',
    freightCharges: '',
    shippedOnBoardDate: '',
    termsAndConditions: '',
    declarationPlace: '',
    declarationDate: '',
    declarationCompanyName: '',
    declarationFirstName: '',
    declarationLastName: '',
    signature: null,
  }
}

export function parseBolNum(v: string) {
  const n = parseFloat(v.replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function formatBolTotal(n: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(n)
}
