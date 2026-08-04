import { refreshAccessToken } from '@/lib/auth/refresh'
import { getAccessToken } from '@/lib/auth/storage'

export type CargoRfqPayload = {
  policyType: 'marine-open' | 'specific-marine'
  pospDetails?: string
  insuredName: string
  communicationAddress: string
  gst: string
  businessDescription: string
  businessType: string
  riskStartDate: string
  isRollover: string
  transitType: string
  totalProjectedTurnover?: string
  initialSumInsured: string
  perSendingLimit?: string
  perLocationLimit?: string
  packaging: string
  voyageFrom: string
  voyageTo: string
  conveyance: string
  safetyMeasures: string
  lossHistory: string
  newBusiness: string
  selfInsuredHistory: string
  previousLossDetails?: string
  pastStats?: string
  additionalNotes?: string
}

export type CargoRfqDocumentType =
  | 'INVOICE_COPY'
  | 'GST_CERTIFICATE'
  | 'PREVIOUS_POLICY'
  | 'TURNOVER_STATEMENT'
  | 'CLAIM_STATEMENT'
  | 'NO_CLAIM_DECLARATION'
  | 'COMPANY_PROFILE'
  | 'SUPPORTING_DOCUMENT'
  | 'OTHER'

export type CargoRfqDocumentPayload = {
  documentType: CargoRfqDocumentType
  file: File
}

export type CargoRfq = {
  id: string
  userId: string
  status: string
  policyType: 'marine-open' | 'specific-marine'
  pospDetails: string
  insuredName: string
  communicationAddress: string
  gst: string
  businessDescription: string
  businessType: string
  riskStartDate: string
  isRollover: string
  transitType: string
  totalProjectedTurnover: string
  initialSumInsured: string
  perSendingLimit: string
  perLocationLimit: string
  packaging: string
  voyageFrom: string
  voyageTo: string
  conveyance: string
  safetyMeasures: string
  lossHistory: string
  newBusiness: string
  selfInsuredHistory: string
  previousLossDetails: string
  pastStats: string
  additionalNotes: string
  adminComment: string
  documents: CargoRfqDocument[]
  sentToInsurerAt?: string
  createdAt: string
  updatedAt: string
}

export type CargoRfqDocument = {
  id: string
  cargoRfqId?: string
  uploadedBy?: string
  documentType: string
  fileUrl: string
  fileName: string
  fileSize?: number
  mimeType?: string
  createdAt?: string
}

export type CargoRfqQuote = {
  id: string
  cargoRfqId: string
  createdBy: string
  status: string
  insurerName: string
  premiumAmount: string
  premiumCurrency: string
  coverageDetails: string
  termsAndConditions: string
  validUntil: string
  remarks: string
  quoteDocumentUrl: string
  quoteDocumentFileName: string
  quoteDocumentFileSize?: number
  quoteDocumentMimeType: string
  createdAt: string
  updatedAt: string
}

export type CargoRfqPaymentDetails = {
  cargoRfqId: string
  rfqStatus: string
  quoteId: string
  quoteStatus: string
  amount: number
  currency: string
  paymentRequired: boolean
}

export type CargoRfqPaymentInitiation = {
  transactionId: string
  orderId: string
  paymentUrl: string
  encRequest: string
  accessCode: string
}

export type CargoRfqResult =
  | { success: true; data: CargoRfq }
  | { success: false; error: string; status?: number }

export type CargoRfqDocumentResult =
  | { success: true; data: CargoRfqDocument }
  | { success: false; error: string; status?: number }

export type CargoRfqDetailResult =
  | { success: true; data: { rfq: CargoRfq; documents: CargoRfqDocument[] } }
  | { success: false; error: string; status?: number }

export type CargoRfqListResult =
  | { success: true; data: { rfqs: CargoRfq[]; total: number } }
  | { success: false; error: string; status?: number }

export type CargoRfqQuotesResult =
  | { success: true; data: { quotes: CargoRfqQuote[] } }
  | { success: false; error: string; status?: number }

export type CargoRfqQuoteAcceptResult =
  | { success: true; data: { rfq: { id: string; status: string }; quote: { id: string; status: string } } }
  | { success: false; error: string; status?: number }

export type CargoRfqPaymentDetailsResult =
  | { success: true; data: CargoRfqPaymentDetails }
  | { success: false; error: string; status?: number }

export type CargoRfqPaymentInitiationResult =
  | { success: true; data: CargoRfqPaymentInitiation }
  | { success: false; error: string; status?: number }

export const CARGO_RFQ_API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
  ''
).replace(/\/$/, '')

const CARGO_RFQ_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  SENT_TO_INSURER: 'Under Review',
  DOCUMENT_PENDING: 'Improvement Requested',
  RESUBMITTED: 'Resubmitted',
  QUOTE_RECEIVED: 'Quote Received',
  QUOTE_ACCEPTED: 'Quote Accepted',
  ACCEPTED: 'Accepted',
  PAYMENT_PENDING: 'Payment Pending',
  PAYMENT_PROCESSING: 'Payment Processing',
  PAYMENT_DONE: 'Payment Done',
  POLICY_ISSUED: 'Policy Issued',
}

const CARGO_RFQ_STATUS_BADGES: Record<string, string> = {
  SUBMITTED: 'bg-[#E8F0EE] text-[#00433E]',
  UNDER_REVIEW: 'bg-blue-50 text-blue-700',
  SENT_TO_INSURER: 'bg-blue-50 text-blue-700',
  DOCUMENT_PENDING: 'bg-amber-50 text-amber-700',
  RESUBMITTED: 'bg-purple-50 text-purple-700',
  QUOTE_RECEIVED: 'bg-emerald-50 text-emerald-700',
  QUOTE_ACCEPTED: 'bg-emerald-100 text-emerald-800',
  ACCEPTED: 'bg-emerald-100 text-emerald-800',
  PAYMENT_PENDING: 'bg-orange-50 text-orange-700',
  PAYMENT_PROCESSING: 'bg-orange-50 text-orange-700',
  PAYMENT_DONE: 'bg-green-50 text-green-700',
  POLICY_ISSUED: 'bg-[#E8F0EE] text-[#00433E]',
}

export function normalizeCargoRfqStatus(status?: string) {
  return status?.trim().toUpperCase() ?? ''
}

export function formatCargoRfqStatus(status?: string) {
  const normalized = normalizeCargoRfqStatus(status)
  return CARGO_RFQ_STATUS_LABELS[normalized] ?? status ?? '-'
}

export function getCargoRfqStatusBadgeClass(status?: string) {
  const normalized = normalizeCargoRfqStatus(status)
  return CARGO_RFQ_STATUS_BADGES[normalized] ?? 'bg-[#E8F0EE] text-[#00433E]'
}

function getCargoRfqApiBase() {
  return CARGO_RFQ_API_BASE_URL
}

function missingCargoRfqApiBaseResult(): { success: false; error: string; status?: number } {
  return {
    success: false,
    error: 'Cargo RFQ API URL is not configured',
    status: 500,
  }
}

async function getUsableAccessToken() {
  const accessToken = getAccessToken()
  if (accessToken) return accessToken

  const refreshed = await refreshAccessToken()
  return refreshed?.access_token ?? null
}

function readString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') return value
  }
  return ''
}

function readNumber(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number') return value
  }
  return undefined
}

function readArray(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) return value
  }
  return []
}

function isInvalidRfqId(rfqId: string) {
  return !rfqId || rfqId.includes('<') || rfqId.includes('>')
}

function invalidRfqIdResult(): { success: false; error: string; status?: number } {
  return { success: false, error: 'Invalid RFQ ID' }
}

function isInvalidQuoteId(quoteId: string) {
  return !quoteId || quoteId.includes('<') || quoteId.includes('>')
}

function invalidRfqOrQuoteIdResult(): { success: false; error: string; status?: number } {
  return { success: false, error: 'Invalid RFQ or quote ID' }
}

function logCargoRfqResponse(url: string, status: number) {
  console.log(`[Cargo RFQ API] ${url} -> ${status}`)
}

function buildQuery(params?: { page?: number; limit?: number; status?: string }) {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  if (params.page !== undefined) searchParams.set('page', String(params.page))
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
  if (params.status) searchParams.set('status', params.status)
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

function normalizeCargoRfqUpdateError(message: string) {
  return message
}

function getErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object') return fallback

  const record = data as Record<string, unknown>

  const errors = record.errors
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object') {
      const message = readString(first as Record<string, unknown>, 'message', 'error', 'msg')
      if (message) return message
    }
  }

  return (
    readString(record, 'message', 'error', 'msg') ||
    (record.data && typeof record.data === 'object'
      ? readString(record.data as Record<string, unknown>, 'message', 'error', 'msg')
      : '') ||
    fallback
  )
}

function withStatus(message: string, status: number) {
  return message === 'Failed to submit RFQ' ? `${message} (status ${status})` : message
}

function normalizeCargoRfq(data: unknown): CargoRfq | null {
  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const nested =
    record.rfq && typeof record.rfq === 'object'
      ? (record.rfq as Record<string, unknown>)
      : record.data && typeof record.data === 'object'
        ? (record.data as Record<string, unknown>)
        : record

  const id = readString(nested, 'id', 'rfqId', 'rfq_id')
  if (!id) return null

  return {
    id,
    userId: readString(nested, 'userId', 'user_id'),
    status: readString(nested, 'status'),
    policyType: readString(nested, 'policyType', 'policy_type') === 'specific-marine' ? 'specific-marine' : 'marine-open',
    pospDetails: readString(nested, 'pospDetails', 'posp_details'),
    insuredName: readString(nested, 'insuredName', 'insured_name'),
    communicationAddress: readString(nested, 'communicationAddress', 'communication_address'),
    gst: readString(nested, 'gst'),
    businessDescription: readString(nested, 'businessDescription', 'business_description'),
    businessType: readString(nested, 'businessType', 'business_type'),
    riskStartDate: readString(nested, 'riskStartDate', 'risk_start_date'),
    isRollover: readString(nested, 'isRollover', 'is_rollover'),
    transitType: readString(nested, 'transitType', 'transit_type'),
    totalProjectedTurnover: readString(nested, 'totalProjectedTurnover', 'total_projected_turnover'),
    initialSumInsured: readString(nested, 'initialSumInsured', 'initial_sum_insured'),
    perSendingLimit: readString(nested, 'perSendingLimit', 'per_sending_limit'),
    perLocationLimit: readString(nested, 'perLocationLimit', 'per_location_limit'),
    packaging: readString(nested, 'packaging'),
    voyageFrom: readString(nested, 'voyageFrom', 'voyage_from'),
    voyageTo: readString(nested, 'voyageTo', 'voyage_to'),
    conveyance: readString(nested, 'conveyance'),
    safetyMeasures: readString(nested, 'safetyMeasures', 'safety_measures'),
    lossHistory: readString(nested, 'lossHistory', 'loss_history'),
    newBusiness: readString(nested, 'newBusiness', 'new_business'),
    selfInsuredHistory: readString(nested, 'selfInsuredHistory', 'self_insured_history'),
    previousLossDetails: readString(nested, 'previousLossDetails', 'previous_loss_details'),
    pastStats: readString(nested, 'pastStats', 'past_stats'),
    additionalNotes: readString(nested, 'additionalNotes', 'additional_notes'),
    adminComment: readString(nested, 'adminComment', 'admin_comment'),
    documents: readArray(nested, 'documents')
      .map((item) => normalizeCargoRfqDocument(item))
      .filter((item): item is CargoRfqDocument => item !== null),
    sentToInsurerAt: readString(nested, 'sentToInsurerAt', 'sent_to_insurer_at') || undefined,
    createdAt: readString(nested, 'createdAt', 'created_at'),
    updatedAt: readString(nested, 'updatedAt', 'updated_at'),
  }
}

function normalizeCargoRfqDocument(data: unknown): CargoRfqDocument | null {
  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const nested =
    record.document && typeof record.document === 'object'
      ? (record.document as Record<string, unknown>)
      : record.data && typeof record.data === 'object'
        ? (record.data as Record<string, unknown>)
        : record

  const id = readString(nested, 'id', 'documentId', 'document_id')
  const documentType = readString(nested, 'documentType', 'document_type')
  const fileUrl = readString(nested, 'fileUrl', 'file_url')
  const fileName = readString(nested, 'fileName', 'file_name')

  if (!id) return null

  return {
    id,
    cargoRfqId: readString(nested, 'cargoRfqId', 'cargo_rfq_id', 'rfqId', 'rfq_id'),
    uploadedBy: readString(nested, 'uploadedBy', 'uploaded_by'),
    documentType,
    fileUrl,
    fileName,
    fileSize: readNumber(nested, 'fileSize', 'file_size'),
    mimeType: readString(nested, 'mimeType', 'mime_type'),
    createdAt: readString(nested, 'createdAt', 'created_at'),
  }
}

function normalizeCargoRfqQuote(data: unknown): CargoRfqQuote | null {
  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const nested =
    record.quote && typeof record.quote === 'object'
      ? (record.quote as Record<string, unknown>)
      : record.data && typeof record.data === 'object'
        ? (record.data as Record<string, unknown>)
        : record

  const id = readString(nested, 'id', 'quoteId', 'quote_id')
  if (!id) return null

  const premiumValue = nested.premiumAmount ?? nested.premium_amount

  return {
    id,
    cargoRfqId: readString(nested, 'cargoRfqId', 'cargo_rfq_id'),
    createdBy: readString(nested, 'createdBy', 'created_by'),
    status: readString(nested, 'status'),
    insurerName: readString(nested, 'insurerName', 'insurer_name'),
    premiumAmount:
      typeof premiumValue === 'number' ? String(premiumValue) : readString(nested, 'premiumAmount', 'premium_amount'),
    premiumCurrency: readString(nested, 'premiumCurrency', 'premium_currency'),
    coverageDetails: readString(nested, 'coverageDetails', 'coverage_details'),
    termsAndConditions: readString(nested, 'termsAndConditions', 'terms_and_conditions'),
    validUntil: readString(nested, 'validUntil', 'valid_until'),
    remarks: readString(nested, 'remarks'),
    quoteDocumentUrl: readString(nested, 'quoteDocumentUrl', 'quote_document_url'),
    quoteDocumentFileName: readString(nested, 'quoteDocumentFileName', 'quote_document_file_name'),
    quoteDocumentFileSize: readNumber(nested, 'quoteDocumentFileSize', 'quote_document_file_size'),
    quoteDocumentMimeType: readString(nested, 'quoteDocumentMimeType', 'quote_document_mime_type'),
    createdAt: readString(nested, 'createdAt', 'created_at'),
    updatedAt: readString(nested, 'updatedAt', 'updated_at'),
  }
}

function normalizeCargoRfqDetail(data: unknown): { rfq: CargoRfq; documents: CargoRfqDocument[] } | null {
  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const nestedData = record.data && typeof record.data === 'object'
    ? (record.data as Record<string, unknown>)
    : null
  const rfq = normalizeCargoRfq(record.rfq ?? nestedData?.rfq ?? record.data ?? data)
  if (!rfq) return null

  const responseDocuments = readArray(record, 'documents')
    .concat(nestedData ? readArray(nestedData, 'documents') : [])
    .map((item) => normalizeCargoRfqDocument(item))
    .filter((item): item is CargoRfqDocument => item !== null)
  const documents = responseDocuments.length > 0 ? responseDocuments : rfq.documents

  return { rfq, documents }
}

function normalizeCargoRfqList(data: unknown): { rfqs: CargoRfq[]; total: number } | null {
  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const nestedData = record.data && typeof record.data === 'object'
    ? (record.data as Record<string, unknown>)
    : null
  const rawRfqs = readArray(record, 'rfqs', 'items')
  const nestedRfqs = nestedData ? readArray(nestedData, 'rfqs', 'items') : []
  const dataRfqs = Array.isArray(record.data) ? record.data : []
  const rfqs = [...rawRfqs, ...nestedRfqs, ...dataRfqs]
    .map((item) => normalizeCargoRfq(item))
    .filter((item): item is CargoRfq => item !== null)

  return {
    rfqs,
    total: readNumber(record, 'total', 'count') ?? (nestedData ? readNumber(nestedData, 'total', 'count') : undefined) ?? rfqs.length,
  }
}

function normalizeCargoRfqQuotes(data: unknown): { quotes: CargoRfqQuote[] } | null {
  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const nestedData = record.data && typeof record.data === 'object'
    ? (record.data as Record<string, unknown>)
    : null
  const rawQuotes = readArray(record, 'quotes', 'items')
  const nestedQuotes = nestedData ? readArray(nestedData, 'quotes', 'items') : []
  const dataQuotes = Array.isArray(record.data) ? record.data : []
  const quotes = [...rawQuotes, ...nestedQuotes, ...dataQuotes]
    .map((item) => normalizeCargoRfqQuote(item))
    .filter((item): item is CargoRfqQuote => item !== null)

  return { quotes }
}

function normalizeCargoRfqQuoteAccept(data: unknown) {
  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const nestedData = record.data && typeof record.data === 'object'
    ? (record.data as Record<string, unknown>)
    : null
  const rfqRecord =
    record.rfq && typeof record.rfq === 'object'
      ? (record.rfq as Record<string, unknown>)
      : nestedData?.rfq && typeof nestedData.rfq === 'object'
        ? (nestedData.rfq as Record<string, unknown>)
        : null
  const quoteRecord =
    record.quote && typeof record.quote === 'object'
      ? (record.quote as Record<string, unknown>)
      : nestedData?.quote && typeof nestedData.quote === 'object'
        ? (nestedData.quote as Record<string, unknown>)
        : null

  if (!rfqRecord || !quoteRecord) return null

  const rfqId = readString(rfqRecord, 'id', 'rfqId', 'rfq_id')
  const quoteId = readString(quoteRecord, 'id', 'quoteId', 'quote_id')

  if (!rfqId || !quoteId) return null

  return {
    rfq: {
      id: rfqId,
      status: readString(rfqRecord, 'status'),
    },
    quote: {
      id: quoteId,
      status: readString(quoteRecord, 'status'),
    },
  }
}

function normalizeCargoRfqPaymentDetails(data: unknown): CargoRfqPaymentDetails | null {
  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const nested =
    record.payment && typeof record.payment === 'object'
      ? (record.payment as Record<string, unknown>)
      : record.data && typeof record.data === 'object'
        ? (record.data as Record<string, unknown>)
        : record

  const cargoRfqId = readString(nested, 'cargoRfqId', 'cargo_rfq_id')
  if (!cargoRfqId) return null

  return {
    cargoRfqId,
    rfqStatus: readString(nested, 'rfqStatus', 'rfq_status'),
    quoteId: readString(nested, 'quoteId', 'quote_id'),
    quoteStatus: readString(nested, 'quoteStatus', 'quote_status'),
    amount: readNumber(nested, 'amount') ?? 0,
    currency: readString(nested, 'currency'),
    paymentRequired: nested.paymentRequired === true || nested.payment_required === true,
  }
}

function normalizeCargoRfqPaymentInitiation(data: unknown): CargoRfqPaymentInitiation | null {
  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const nested =
    record.payment && typeof record.payment === 'object'
      ? (record.payment as Record<string, unknown>)
      : record.data && typeof record.data === 'object'
        ? (record.data as Record<string, unknown>)
        : record

  const paymentUrl = readString(nested, 'paymentUrl', 'payment_url')
  const encRequest = readString(nested, 'encRequest', 'enc_request')
  const accessCode = readString(nested, 'accessCode', 'access_code')

  if (!paymentUrl || !encRequest || !accessCode) return null

  return {
    transactionId: readString(nested, 'transactionId', 'transaction_id'),
    orderId: readString(nested, 'orderId', 'order_id'),
    paymentUrl,
    encRequest,
    accessCode,
  }
}

async function requestCreateCargoRfq(
  accessToken: string,
  payload: CargoRfqPayload,
): Promise<CargoRfqResult> {
  const apiBase = getCargoRfqApiBase()
  if (!apiBase) return missingCargoRfqApiBaseResult()

  const res = await fetch(`${apiBase}/api/v1/user/cargo-rfqs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))

  if (res.ok) {
    const rfq = normalizeCargoRfq(data)
    if (rfq) return { success: true, data: rfq }
    return { success: false, error: 'Invalid RFQ response from server', status: 502 }
  }

  return {
    success: false,
    error: withStatus(getErrorMessage(data, 'Failed to submit RFQ'), res.status),
    status: res.status,
  }
}

export async function createCargoRfq(payload: CargoRfqPayload): Promise<CargoRfqResult> {
  const accessToken = await getUsableAccessToken()
  if (!accessToken) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  const result = await requestCreateCargoRfq(accessToken, payload)
  if (result.success || result.status !== 401) {
    return result
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestCreateCargoRfq(refreshed.access_token, payload)
}

async function requestCargoRfqs(
  accessToken: string,
  params?: { page?: number; limit?: number; status?: string },
): Promise<CargoRfqListResult> {
  const apiBase = getCargoRfqApiBase()
  if (!apiBase) return missingCargoRfqApiBaseResult()

  const url = `${apiBase}/api/v1/user/cargo-rfqs${buildQuery(params)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    cache: 'no-store',
  })
  logCargoRfqResponse(url, res.status)

  const data = await res.json().catch(() => ({}))

  if (res.ok) {
    const list = normalizeCargoRfqList(data)
    if (list) return { success: true, data: list }
    return { success: false, error: 'Invalid RFQ list response from server', status: 502 }
  }

  return {
    success: false,
    error: getErrorMessage(data, 'Failed to load RFQs'),
    status: res.status,
  }
}

export async function getUserCargoRFQs(params?: {
  page?: number
  limit?: number
  status?: string
}): Promise<CargoRfqListResult> {
  const accessToken = await getUsableAccessToken()
  if (!accessToken) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  const result = await requestCargoRfqs(accessToken, params)
  if (result.success || result.status !== 401) {
    return result
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestCargoRfqs(refreshed.access_token, params)
}

export const getCargoRfqs = getUserCargoRFQs

async function requestCargoRfqDetail(accessToken: string, id: string): Promise<CargoRfqDetailResult> {
  const apiBase = getCargoRfqApiBase()
  if (!apiBase) return missingCargoRfqApiBaseResult()

  const url = `${apiBase}/api/v1/user/cargo-rfqs/${encodeURIComponent(id)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    cache: 'no-store',
  })
  logCargoRfqResponse(url, res.status)

  const data = await res.json().catch(() => ({}))

  if (res.ok) {
    const detail = normalizeCargoRfqDetail(data)
    if (detail) return { success: true, data: detail }
    return { success: false, error: 'Invalid RFQ detail response from server', status: 502 }
  }

  return {
    success: false,
    error: getErrorMessage(data, 'Failed to load RFQ details'),
    status: res.status,
  }
}

export async function getUserCargoRFQById(id: string): Promise<CargoRfqDetailResult> {
  if (isInvalidRfqId(id)) return invalidRfqIdResult()

  const accessToken = await getUsableAccessToken()
  if (!accessToken) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  const result = await requestCargoRfqDetail(accessToken, id)
  if (result.success || result.status !== 401) {
    return result
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestCargoRfqDetail(refreshed.access_token, id)
}

export const getCargoRfqById = getUserCargoRFQById

async function requestCargoRfqQuotes(accessToken: string, id: string): Promise<CargoRfqQuotesResult> {
  const apiBase = getCargoRfqApiBase()
  if (!apiBase) return missingCargoRfqApiBaseResult()

  const url = `${apiBase}/api/v1/user/cargo-rfqs/${encodeURIComponent(id)}/quotes`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    cache: 'no-store',
  })
  logCargoRfqResponse(url, res.status)

  const data = await res.json().catch(() => ({}))

  if (res.ok) {
    const quotes = normalizeCargoRfqQuotes(data)
    if (quotes) return { success: true, data: quotes }
    return { success: false, error: 'Invalid RFQ quotes response from server', status: 502 }
  }

  return {
    success: false,
    error: getErrorMessage(data, 'Failed to load RFQ quotes'),
    status: res.status,
  }
}

export async function getUserCargoRFQQuotes(id: string): Promise<CargoRfqQuotesResult> {
  if (isInvalidRfqId(id)) return invalidRfqIdResult()

  const accessToken = await getUsableAccessToken()
  if (!accessToken) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  const result = await requestCargoRfqQuotes(accessToken, id)
  if (result.success || result.status !== 401) {
    return result
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestCargoRfqQuotes(refreshed.access_token, id)
}

async function requestAcceptCargoRfqQuote(
  accessToken: string,
  rfqId: string,
  quoteId: string,
): Promise<CargoRfqQuoteAcceptResult> {
  const apiBase = getCargoRfqApiBase()
  if (!apiBase) return missingCargoRfqApiBaseResult()

  const url = `${apiBase}/api/v1/user/cargo-rfqs/${encodeURIComponent(rfqId)}/quotes/${encodeURIComponent(quoteId)}/accept`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  })
  logCargoRfqResponse(url, res.status)

  const data = await res.json().catch(() => ({}))

  if (res.ok) {
    const accepted = normalizeCargoRfqQuoteAccept(data)
    if (accepted) return { success: true, data: accepted }
    return { success: false, error: 'Invalid quote accept response from server', status: 502 }
  }

  return {
    success: false,
    error: getErrorMessage(data, 'Failed to accept quote'),
    status: res.status,
  }
}

export async function acceptUserCargoRFQQuote(
  rfqId: string,
  quoteId: string,
): Promise<CargoRfqQuoteAcceptResult> {
  if (isInvalidRfqId(rfqId) || isInvalidQuoteId(quoteId)) return invalidRfqOrQuoteIdResult()

  const accessToken = await getUsableAccessToken()
  if (!accessToken) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  const result = await requestAcceptCargoRfqQuote(accessToken, rfqId, quoteId)
  if (result.success || result.status !== 401) {
    return result
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestAcceptCargoRfqQuote(refreshed.access_token, rfqId, quoteId)
}

async function requestCargoRfqPaymentDetails(
  accessToken: string,
  rfqId: string,
): Promise<CargoRfqPaymentDetailsResult> {
  const apiBase = getCargoRfqApiBase()
  if (!apiBase) return missingCargoRfqApiBaseResult()

  const url = `${apiBase}/api/v1/user/cargo-rfqs/${encodeURIComponent(rfqId)}/payment`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    cache: 'no-store',
  })
  logCargoRfqResponse(url, res.status)

  const data = await res.json().catch(() => ({}))

  if (res.ok) {
    const payment = normalizeCargoRfqPaymentDetails(data)
    if (payment) return { success: true, data: payment }
    return { success: false, error: 'Invalid payment details response from server', status: 502 }
  }

  return {
    success: false,
    error: getErrorMessage(data, 'Failed to load payment details'),
    status: res.status,
  }
}

export async function getUserCargoRFQPaymentDetails(
  rfqId: string,
): Promise<CargoRfqPaymentDetailsResult> {
  if (isInvalidRfqId(rfqId)) return invalidRfqIdResult()

  const accessToken = await getUsableAccessToken()
  if (!accessToken) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  const result = await requestCargoRfqPaymentDetails(accessToken, rfqId)
  if (result.success || result.status !== 401) return result

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestCargoRfqPaymentDetails(refreshed.access_token, rfqId)
}

async function requestInitiateCargoRfqPayment(
  accessToken: string,
  rfqId: string,
): Promise<CargoRfqPaymentInitiationResult> {
  const apiBase = getCargoRfqApiBase()
  if (!apiBase) return missingCargoRfqApiBaseResult()

  const url = `${apiBase}/api/v1/user/cargo-rfqs/${encodeURIComponent(rfqId)}/payments/initiate`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  })
  logCargoRfqResponse(url, res.status)

  const data = await res.json().catch(() => ({}))

  if (res.ok) {
    const payment = normalizeCargoRfqPaymentInitiation(data)
    if (payment) return { success: true, data: payment }
    return { success: false, error: 'Invalid payment initiation response from server', status: 502 }
  }

  return {
    success: false,
    error: getErrorMessage(data, 'Failed to initiate payment'),
    status: res.status,
  }
}

export async function initiateUserCargoRFQPayment(
  rfqId: string,
): Promise<CargoRfqPaymentInitiationResult> {
  if (isInvalidRfqId(rfqId)) return invalidRfqIdResult()

  const accessToken = await getUsableAccessToken()
  if (!accessToken) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  const result = await requestInitiateCargoRfqPayment(accessToken, rfqId)
  if (result.success || result.status !== 401) return result

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestInitiateCargoRfqPayment(refreshed.access_token, rfqId)
}

async function requestUpdateCargoRfq(
  accessToken: string,
  id: string,
  payload: CargoRfqPayload,
): Promise<CargoRfqResult> {
  const apiBase = getCargoRfqApiBase()
  if (!apiBase) return missingCargoRfqApiBaseResult()

  const url = `${apiBase}/api/v1/user/cargo-rfqs/${encodeURIComponent(id)}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  logCargoRfqResponse(url, res.status)

  const data = await res.json().catch(() => ({}))

  if (res.ok) {
    const rfq = normalizeCargoRfq(data)
    if (rfq) return { success: true, data: rfq }
    return { success: false, error: 'Invalid RFQ response from server', status: 502 }
  }

  const message = getErrorMessage(data, 'Failed to update RFQ')

  return {
    success: false,
    error: normalizeCargoRfqUpdateError(message),
    status: res.status,
  }
}

export async function updateUserCargoRFQ(
  id: string,
  payload: CargoRfqPayload,
): Promise<CargoRfqResult> {
  if (isInvalidRfqId(id)) return invalidRfqIdResult()

  const accessToken = await getUsableAccessToken()
  if (!accessToken) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  const result = await requestUpdateCargoRfq(accessToken, id, payload)
  if (result.success || result.status !== 401) {
    return result
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestUpdateCargoRfq(refreshed.access_token, id, payload)
}

export const updateCargoRfq = updateUserCargoRFQ

async function requestUploadCargoRfqDocument(
  accessToken: string,
  rfqId: string,
  payload: CargoRfqDocumentPayload,
): Promise<CargoRfqDocumentResult> {
  const apiBase = getCargoRfqApiBase()
  if (!apiBase) return missingCargoRfqApiBaseResult()

  const formData = new FormData()
  formData.append('documentType', payload.documentType)
  formData.append('document', payload.file)

  const url = `${apiBase}/api/v1/user/cargo-rfqs/${encodeURIComponent(rfqId)}/documents`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: formData,
  })
  logCargoRfqResponse(url, res.status)

  const data = await res.json().catch(() => ({}))

  if (res.ok) {
    const document = normalizeCargoRfqDocument(data)
    if (document) return { success: true, data: document }
    return { success: false, error: 'Invalid RFQ document response from server' }
  }

  return {
    success: false,
    error: getErrorMessage(data, 'Failed to upload RFQ document'),
    status: res.status,
  }
}

export async function uploadUserCargoRFQDocument(
  rfqId: string,
  file: File,
  documentType: CargoRfqDocumentType,
): Promise<CargoRfqDocumentResult> {
  if (isInvalidRfqId(rfqId)) return invalidRfqIdResult()

  const accessToken = await getUsableAccessToken()
  if (!accessToken) {
    return { success: false, error: 'Not authenticated' }
  }

  const payload = { documentType, file }
  const result = await requestUploadCargoRfqDocument(accessToken, rfqId, payload)
  if (result.success || result.status !== 401) {
    return result
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated' }
  }

  return requestUploadCargoRfqDocument(refreshed.access_token, rfqId, payload)
}

export function uploadCargoRfqDocument(
  rfqId: string,
  payload: CargoRfqDocumentPayload,
): Promise<CargoRfqDocumentResult> {
  return uploadUserCargoRFQDocument(rfqId, payload.file, payload.documentType)
}
