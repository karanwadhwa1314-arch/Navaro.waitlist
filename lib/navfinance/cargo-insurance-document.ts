import { refreshAccessToken } from '@/lib/auth/refresh'
import { getAccessToken } from '@/lib/auth/storage'

export const CARGO_INVOICE_ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png,.webp'
export const CARGO_INVOICE_MAX_FILE_SIZE_MB = 10
export const CARGO_INVOICE_TITLE_MIN_LENGTH = 2
export const CARGO_INVOICE_TITLE_MAX_LENGTH = 200
export const CARGO_INVOICE_DESCRIPTION_MAX_LENGTH = 2000

export type CargoInsuranceDocumentStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUIRED'
  | 'PAYMENT_REQUIRED'
  | 'PAYMENT_PROCESSING'
  | 'APPROVED'
  | 'REJECTED'
  | string

export type CargoInsuranceDocument = {
  id: string
  userId: string
  title: string
  description: string
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  status: CargoInsuranceDocumentStatus
  reviewComments?: string
  paymentUrl?: string
  createdAt: string
  updatedAt: string
}

export type UploadCargoInsuranceDocumentPayload = {
  file: File
  title: string
  description?: string
}

export type UploadCargoInsuranceDocumentResult =
  | { success: true; data: CargoInsuranceDocument }
  | { success: false; error: string; status?: number }

export type UpdateCargoInsuranceDocumentResult = UploadCargoInsuranceDocumentResult

export function buildCargoInsuranceDocumentTitle(file: File): string {
  const withoutExtension = file.name.replace(/\.[^.]+$/, '').trim()

  if (withoutExtension.length >= CARGO_INVOICE_TITLE_MIN_LENGTH) {
    return withoutExtension.slice(0, CARGO_INVOICE_TITLE_MAX_LENGTH)
  }

  return 'Cargo Insurance Invoice'
}

export function validateCargoInsuranceDocumentTitle(title: string): string | null {
  const trimmed = title.trim()

  if (trimmed.length < CARGO_INVOICE_TITLE_MIN_LENGTH) {
    return `Title must be at least ${CARGO_INVOICE_TITLE_MIN_LENGTH} characters.`
  }

  if (trimmed.length > CARGO_INVOICE_TITLE_MAX_LENGTH) {
    return `Title must be ${CARGO_INVOICE_TITLE_MAX_LENGTH} characters or fewer.`
  }

  return null
}

export function validateCargoInsuranceDocumentDescription(description: string): string | null {
  if (description.length > CARGO_INVOICE_DESCRIPTION_MAX_LENGTH) {
    return `Description must be ${CARGO_INVOICE_DESCRIPTION_MAX_LENGTH} characters or fewer.`
  }

  return null
}

export function validateCargoInsuranceDocument(file: File): string | null {
  if (file.size > CARGO_INVOICE_MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File must be under ${CARGO_INVOICE_MAX_FILE_SIZE_MB} MB.`
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  const allowed = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp'])
  if (!allowed.has(extension)) {
    return 'Only PDF, JPG, PNG, and WebP files are supported.'
  }

  return null
}

export type FetchCargoInsuranceDocumentResult =
  | { success: true; data: CargoInsuranceDocument }
  | { success: false; error: string; status?: number }

export type CargoInsuranceAdminDocument = {
  id: string
  title: string
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  createdAt: string
}

export type CargoInsuranceDocumentComments = {
  documentId: string
  requiredDetails: string
  adminDocuments: CargoInsuranceAdminDocument[]
  status: CargoInsuranceDocumentStatus
  updatedAt: string
}

export type FetchCargoInsuranceDocumentCommentsResult =
  | { success: true; data: CargoInsuranceDocumentComments }
  | { success: false; error: string; status?: number }

export type CargoInsuranceActivityMetadata = {
  title: string
  fileName: string
  fileSize: number
  mimeType: string
  attachmentCount: number
  attachmentTitles: string[]
}

export type CargoInsuranceActivityItem = {
  id: string
  documentId: string
  action: string
  title: string
  description: string
  fromStatus: string
  toStatus: string
  actorId: string
  actorName: string
  actorRole: string
  metadata: CargoInsuranceActivityMetadata
  createdAt: string
}

export type FetchCargoInsuranceDocumentActivityResult =
  | { success: true; data: CargoInsuranceActivityItem[] }
  | { success: false; error: string; status?: number }

export type FetchCargoInsuranceDocumentsResult =
  | { success: true; data: CargoInsuranceDocument[] }
  | { success: false; error: string; status?: number }

function readString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') return value
  }
  return ''
}

function readNumber(record: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number') return value
  }
  return 0
}

function readBoolean(record: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'boolean') return value
  }
  return false
}

export function extractCargoInsuranceDocumentList(data: unknown): unknown {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []

  const record = data as Record<string, unknown>
  const topLevel = [
    record.documents,
    record.data,
    record.items,
    record.results,
    record.list,
    record.content,
    record.records,
  ]

  for (const candidate of topLevel) {
    if (Array.isArray(candidate)) return candidate
    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>
      const nestedCandidates = [
        nested.documents,
        nested.items,
        nested.data,
        nested.results,
        nested.list,
        nested.content,
        nested.records,
      ]
      for (const nestedList of nestedCandidates) {
        if (Array.isArray(nestedList)) return nestedList
      }
    }
  }

  return []
}

function normalizeDocumentRecord(raw: unknown): CargoInsuranceDocument | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Record<string, unknown>
  const id = readString(record, 'id', 'documentId', 'document_id')
  const title =
    readString(record, 'title') ||
    readString(record, 'fileName', 'file_name') ||
    'Cargo Insurance Document'

  if (!id) return null

  return {
    id,
    userId: readString(record, 'userId', 'user_id'),
    title,
    description: readString(record, 'description'),
    fileUrl: readString(record, 'fileUrl', 'file_url'),
    fileName: readString(record, 'fileName', 'file_name'),
    fileSize: readNumber(record, 'fileSize', 'file_size'),
    mimeType: readString(record, 'mimeType', 'mime_type'),
    status: readString(record, 'status') || 'PENDING',
    reviewComments: readString(record, 'reviewComments', 'review_comments', 'comments'),
    paymentUrl: readString(record, 'paymentUrl', 'payment_url'),
    createdAt: readString(record, 'createdAt', 'created_at'),
    updatedAt: readString(record, 'updatedAt', 'updated_at'),
  }
}

function normalizeDocumentList(data: unknown): CargoInsuranceDocument[] {
  const list = extractCargoInsuranceDocumentList(data)

  if (Array.isArray(list)) {
    return list
      .map((item) => normalizeDocumentRecord(item))
      .filter((item): item is CargoInsuranceDocument => item !== null)
  }

  const single = normalizeDocumentRecord(data)
  return single ? [single] : []
}

function normalizeDocumentResponse(data: unknown): CargoInsuranceDocument | null {
  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const nested =
    record.document && typeof record.document === 'object'
      ? record.document
      : record.data && typeof record.data === 'object'
        ? record.data
        : record

  return normalizeDocumentRecord(nested)
}

export function getCargoInsuranceDocumentFileUrl(fileUrl: string): string {
  const trimmed = fileUrl.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed
  }

  const base = process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim()?.replace(/\/$/, '') || ''
  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`
}

export function formatCargoInsuranceDocumentDate(value: string): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatCargoInsuranceActivityDate(value: string): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatCargoInsuranceActivityType(action: string): string {
  const key = action.trim().toUpperCase()
  const labels: Record<string, string> = {
    UPLOADED: 'Document uploaded',
    UPDATED: 'Document updated',
    REUPLOADED: 'Document re-submitted',
    DOCUMENT_UPLOADED: 'Document uploaded',
    DOCUMENT_UPDATED: 'Document updated',
    DOCUMENT_RESUBMITTED: 'Document re-submitted',
    REQUEST_CHANGES: 'Correction requested',
    STATUS_CHANGED: 'Status updated',
    UNDER_REVIEW: 'Under review',
    REVIEW_STARTED: 'Review started',
    CHANGES_REQUIRED: 'Correction requested',
    PAYMENT_REQUIRED: 'Payment required',
    PAYMENT_INITIATED: 'Payment started',
    PAYMENT_PROCESSING: 'Payment processing',
    PAYMENT_COMPLETED: 'Payment completed',
    PAYMENT_FAILED: 'Payment failed',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    COMMENT_ADDED: 'Admin feedback',
    ADMIN_REVIEW: 'Admin review',
  }

  if (labels[key]) return labels[key]

  return key
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function formatCargoInsuranceActivityStatusChange(
  fromStatus: string,
  toStatus: string,
): string {
  const from = fromStatus.trim()
  const to = toStatus.trim()
  if (!from && !to) return ''
  if (!from) {
    return getCargoInsuranceStatusConfig(to).label
  }
  if (!to || from === to) {
    return getCargoInsuranceStatusConfig(from).label
  }
  return `${getCargoInsuranceStatusConfig(from).label} → ${getCargoInsuranceStatusConfig(to).label}`
}

export function formatCargoInsuranceActivityActor(actorName: string, actorRole: string): string {
  const name = actorName.trim()
  const role = actorRole.trim()
  if (!name && !role) return ''
  if (!name) return role
  if (!role) return name
  return `${name} (${role})`
}

export function formatCargoInsuranceActivityFileSize(bytes: number): string {
  if (bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function buildCargoInsuranceActivityDetails(
  item: CargoInsuranceActivityItem,
): string[] {
  const lines: string[] = []
  const { metadata } = item

  if (metadata.title.trim()) {
    lines.push(`Title: ${metadata.title.trim()}`)
  }
  if (metadata.fileName.trim()) {
    const size = formatCargoInsuranceActivityFileSize(metadata.fileSize)
    lines.push(
      size
        ? `File: ${metadata.fileName.trim()} (${size})`
        : `File: ${metadata.fileName.trim()}`,
    )
  }
  if (metadata.mimeType.trim()) {
    lines.push(`Type: ${metadata.mimeType.trim()}`)
  }
  if (metadata.attachmentCount > 0) {
    lines.push(
      metadata.attachmentTitles.length > 0
        ? `Attachments (${metadata.attachmentCount}): ${metadata.attachmentTitles.join(', ')}`
        : `Attachments: ${metadata.attachmentCount}`,
    )
  } else if (metadata.attachmentTitles.length > 0) {
    lines.push(`Attachments: ${metadata.attachmentTitles.join(', ')}`)
  }

  return lines
}

export type CargoInsuranceStatusConfig = {
  label: string
  badgeClass: string
  actionLabel: string
  actionType: 'wait' | 'reupload' | 'pay' | 'done' | 'contact'
}

const STATUS_CONFIG: Record<string, CargoInsuranceStatusConfig> = {
  PENDING: {
    label: 'Pending upload',
    badgeClass: 'bg-[#FFF3E0] text-[#E65100]',
    actionLabel: 'Wait',
    actionType: 'wait',
  },
  UNDER_REVIEW: {
    label: 'Under review',
    badgeClass: 'bg-[#E3F2FD] text-[#1565C0]',
    actionLabel: 'Wait',
    actionType: 'wait',
  },
  CHANGES_REQUIRED: {
    label: 'Correction needed',
    badgeClass: 'bg-[#FBE9E7] text-[#BF360C]',
    actionLabel: 'Fix & Re-upload',
    actionType: 'reupload',
  },
  PAYMENT_REQUIRED: {
    label: 'Payment pending',
    badgeClass: 'bg-[#E8F5E9] text-[#1B5E20]',
    actionLabel: 'Contact support',
    actionType: 'contact',
  },
  PAYMENT_PROCESSING: {
    label: 'Payment processing',
    badgeClass: 'bg-[#DBEAFE] text-[#1E40AF]',
    actionLabel: 'Wait',
    actionType: 'wait',
  },
  APPROVED: {
    label: 'Approved',
    badgeClass: 'bg-[#DCFCE7] text-[#166534]',
    actionLabel: 'Done',
    actionType: 'done',
  },
  REJECTED: {
    label: 'Rejected',
    badgeClass: 'bg-[#FEE2E2] text-[#B91C1C]',
    actionLabel: 'Contact support',
    actionType: 'contact',
  },
}

export function getCargoInsuranceStatusConfig(
  status: CargoInsuranceDocumentStatus,
): CargoInsuranceStatusConfig {
  const key = status.trim().toUpperCase()
  return (
    STATUS_CONFIG[key] ?? {
      label: status.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
      badgeClass: 'bg-[#F0EEE8] text-[#00433E]',
      actionLabel: 'View status',
      actionType: 'wait',
    }
  )
}

async function requestDocumentsList(accessToken: string): Promise<FetchCargoInsuranceDocumentsResult> {
  const res = await fetch('/api/user/cargo-insurance-documents', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))

  if (res.ok && data.success) {
    return { success: true, data: normalizeDocumentList(data.documents ?? data) }
  }

  return {
    success: false,
    error: typeof data.error === 'string' ? data.error : 'Failed to load documents',
    status: res.status,
  }
}

export async function fetchCargoInsuranceDocuments(): Promise<FetchCargoInsuranceDocumentsResult> {
  let accessToken = getAccessToken()

  if (accessToken) {
    const result = await requestDocumentsList(accessToken)
    if (result.success || result.status !== 401) {
      return result
    }
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestDocumentsList(refreshed.access_token)
}

async function requestDocumentById(
  accessToken: string,
  documentId: string,
): Promise<FetchCargoInsuranceDocumentResult> {
  const res = await fetch(`/api/user/cargo-insurance-documents/${encodeURIComponent(documentId)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))

  if (res.ok && data.success) {
    const document = normalizeDocumentResponse(data)
    if (document) {
      return { success: true, data: document }
    }
    return { success: false, error: 'Invalid document response from server', status: 502 }
  }

  return {
    success: false,
    error: typeof data.error === 'string' ? data.error : 'Failed to load document',
    status: res.status,
  }
}

export async function fetchCargoInsuranceDocument(
  documentId: string,
): Promise<FetchCargoInsuranceDocumentResult> {
  if (!documentId.trim()) {
    return { success: false, error: 'Document id is required', status: 400 }
  }

  let accessToken = getAccessToken()

  if (accessToken) {
    const result = await requestDocumentById(accessToken, documentId)
    if (result.success || result.status !== 401) {
      return result
    }
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestDocumentById(refreshed.access_token, documentId)
}

function normalizeAdminDocument(raw: unknown): CargoInsuranceAdminDocument | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Record<string, unknown>
  const id = readString(record, 'id')
  if (!id) return null

  return {
    id,
    title:
      readString(record, 'title') ||
      readString(record, 'fileName', 'file_name') ||
      'Attached document',
    fileUrl: readString(record, 'fileUrl', 'file_url'),
    fileName: readString(record, 'fileName', 'file_name'),
    fileSize: readNumber(record, 'fileSize', 'file_size'),
    mimeType: readString(record, 'mimeType', 'mime_type'),
    createdAt: readString(record, 'createdAt', 'created_at'),
  }
}

function normalizeAdminDocuments(data: unknown): CargoInsuranceAdminDocument[] {
  if (!Array.isArray(data)) return []
  return data
    .map((item) => normalizeAdminDocument(item))
    .filter((item): item is CargoInsuranceAdminDocument => item !== null)
}

function normalizeDocumentComments(data: unknown): CargoInsuranceDocumentComments | null {
  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const nested =
    record.comments && typeof record.comments === 'object'
      ? (record.comments as Record<string, unknown>)
      : record.data && typeof record.data === 'object'
        ? (record.data as Record<string, unknown>)
        : record

  const documentId = readString(nested, 'documentId', 'document_id')
  const requiredDetails = readString(nested, 'requiredDetails', 'required_details')
  const adminDocuments = normalizeAdminDocuments(
    nested.adminDocuments ?? nested.admin_documents,
  )

  if (!documentId && !requiredDetails && adminDocuments.length === 0) return null

  return {
    documentId,
    requiredDetails,
    adminDocuments,
    status: readString(nested, 'status') || 'CHANGES_REQUIRED',
    updatedAt: readString(nested, 'updatedAt', 'updated_at'),
  }
}

async function requestDocumentComments(
  accessToken: string,
  documentId: string,
): Promise<FetchCargoInsuranceDocumentCommentsResult> {
  const res = await fetch(
    `/api/user/cargo-insurance-documents/${encodeURIComponent(documentId)}/comments`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  )
  const data = await res.json().catch(() => ({}))

  if (res.ok && data.success) {
    const comments = normalizeDocumentComments(data.comments ?? data)
    if (comments) {
      return { success: true, data: comments }
    }
    return { success: false, error: 'Invalid comments response from server', status: 502 }
  }

  return {
    success: false,
    error: typeof data.error === 'string' ? data.error : 'Failed to load comments',
    status: res.status,
  }
}

export async function fetchCargoInsuranceDocumentComments(
  documentId: string,
): Promise<FetchCargoInsuranceDocumentCommentsResult> {
  if (!documentId.trim()) {
    return { success: false, error: 'Document id is required', status: 400 }
  }

  let accessToken = getAccessToken()

  if (accessToken) {
    const result = await requestDocumentComments(accessToken, documentId)
    if (result.success || result.status !== 401) {
      return result
    }
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestDocumentComments(refreshed.access_token, documentId)
}

function extractActivityList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []

  const record = data as Record<string, unknown>
  const candidates = [
    record.activity,
    record.activities,
    record.items,
    record.data,
    record.events,
    record.history,
    record.list,
    record.content,
    record.records,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>
      const nestedCandidates = [
        nested.activity,
        nested.activities,
        nested.items,
        nested.data,
        nested.events,
        nested.history,
        nested.list,
      ]
      for (const nestedList of nestedCandidates) {
        if (Array.isArray(nestedList)) return nestedList
      }
    }
  }

  return []
}

function normalizeActivityMetadata(raw: unknown): CargoInsuranceActivityMetadata {
  if (!raw || typeof raw !== 'object') {
    return {
      title: '',
      fileName: '',
      fileSize: 0,
      mimeType: '',
      attachmentCount: 0,
      attachmentTitles: [],
    }
  }

  const record = raw as Record<string, unknown>
  const attachmentTitlesRaw = record.attachmentTitles ?? record.attachment_titles
  const attachmentTitles = Array.isArray(attachmentTitlesRaw)
    ? attachmentTitlesRaw.filter((value): value is string => typeof value === 'string')
    : []

  return {
    title: readString(record, 'title'),
    fileName: readString(record, 'fileName', 'file_name'),
    fileSize: readNumber(record, 'fileSize', 'file_size'),
    mimeType: readString(record, 'mimeType', 'mime_type'),
    attachmentCount: readNumber(record, 'attachmentCount', 'attachment_count'),
    attachmentTitles,
  }
}

function normalizeActivityItem(
  raw: unknown,
  fallbackDocumentId = '',
  index = 0,
): CargoInsuranceActivityItem | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Record<string, unknown>
  const action = readString(record, 'action', 'type', 'event', 'eventType', 'event_type')
  const documentId = readString(record, 'documentId', 'document_id') || fallbackDocumentId
  const fromStatus = readString(record, 'fromStatus', 'from_status')
  const toStatus = readString(record, 'toStatus', 'to_status', 'status', 'newStatus', 'new_status')
  const comment = readString(record, 'comment', 'description', 'message', 'details', 'remarks', 'note')
  const metadata = normalizeActivityMetadata(record.metadata)
  const actorName = readString(record, 'actorName', 'actor_name', 'actor', 'performedBy', 'performed_by')
  const actorRole = readString(record, 'actorRole', 'actor_role', 'role')
  const actorId = readString(record, 'actorId', 'actor_id')
  const createdAt = readString(record, 'createdAt', 'created_at', 'timestamp', 'occurredAt', 'occurred_at')
  const id = readString(record, 'id', 'activityId', 'activity_id')

  if (!action && !comment && !createdAt && !toStatus) return null

  const title = formatCargoInsuranceActivityType(action)
  const description = comment.trim() || buildCargoInsuranceActivityDetails({
    id: '',
    documentId,
    action,
    title,
    description: '',
    fromStatus,
    toStatus,
    actorId,
    actorName,
    actorRole,
    metadata,
    createdAt,
  }).join(' · ')

  return {
    id: id || `${documentId || 'activity'}-${createdAt || index}-${action || 'event'}`,
    documentId,
    action,
    title,
    description,
    fromStatus,
    toStatus,
    actorId,
    actorName,
    actorRole,
    metadata,
    createdAt,
  }
}

function normalizeActivityList(data: unknown, fallbackDocumentId = ''): CargoInsuranceActivityItem[] {
  return extractActivityList(data)
    .map((item, index) => normalizeActivityItem(item, fallbackDocumentId, index))
    .filter((item): item is CargoInsuranceActivityItem => item !== null)
    .sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime()
      const bTime = new Date(b.createdAt).getTime()
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0
      return bTime - aTime
    })
}

async function requestDocumentActivity(
  accessToken: string,
  documentId: string,
): Promise<FetchCargoInsuranceDocumentActivityResult> {
  const res = await fetch(
    `/api/user/cargo-insurance-documents/${encodeURIComponent(documentId)}/activity`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  )
  const data = await res.json().catch(() => ({}))

  if (res.ok && data.success) {
    const payload = data.activity ?? data
    return { success: true, data: normalizeActivityList(payload, documentId) }
  }

  return {
    success: false,
    error: typeof data.error === 'string' ? data.error : 'Failed to load activity',
    status: res.status,
  }
}

export async function fetchCargoInsuranceDocumentActivity(
  documentId: string,
): Promise<FetchCargoInsuranceDocumentActivityResult> {
  if (!documentId.trim()) {
    return { success: false, error: 'Document id is required', status: 400 }
  }

  let accessToken = getAccessToken()

  if (accessToken) {
    const result = await requestDocumentActivity(accessToken, documentId)
    if (result.success || result.status !== 401) {
      return result
    }
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestDocumentActivity(refreshed.access_token, documentId)
}

async function requestDocumentUpload(
  accessToken: string,
  payload: UploadCargoInsuranceDocumentPayload,
): Promise<UploadCargoInsuranceDocumentResult> {
  const formData = new FormData()
  formData.append('title', payload.title.trim())
  if (payload.description?.trim()) {
    formData.append('description', payload.description.trim())
  }
  formData.append('document', payload.file, payload.file.name)

  const res = await fetch('/api/user/cargo-insurance-documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))

  if (res.ok && data.success) {
    const document = normalizeDocumentResponse(data)
    if (document) {
      return { success: true, data: document }
    }
    return { success: false, error: 'Invalid upload response from server', status: 502 }
  }

  return {
    success: false,
    error: typeof data.error === 'string' ? data.error : 'Failed to upload document',
    status: res.status,
  }
}

export async function uploadCargoInsuranceDocument(
  payload: UploadCargoInsuranceDocumentPayload,
): Promise<UploadCargoInsuranceDocumentResult> {
  const validationError = validateUploadPayload(payload)
  if (validationError) return validationError

  let accessToken = getAccessToken()

  if (accessToken) {
    const result = await requestDocumentUpload(accessToken, payload)
    if (result.success || result.status !== 401) {
      return result
    }
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestDocumentUpload(refreshed.access_token, payload)
}

async function requestDocumentUpdate(
  accessToken: string,
  documentId: string,
  payload: UploadCargoInsuranceDocumentPayload,
): Promise<UpdateCargoInsuranceDocumentResult> {
  const formData = new FormData()
  formData.append('title', payload.title.trim())
  if (payload.description?.trim()) {
    formData.append('description', payload.description.trim())
  }
  formData.append('document', payload.file, payload.file.name)

  const res = await fetch(
    `/api/user/cargo-insurance-documents/${encodeURIComponent(documentId)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
      cache: 'no-store',
    },
  )
  const data = await res.json().catch(() => ({}))

  if (res.ok && data.success) {
    const document = normalizeDocumentResponse(data)
    if (document) {
      return { success: true, data: document }
    }
    return { success: false, error: 'Invalid update response from server', status: 502 }
  }

  return {
    success: false,
    error: typeof data.error === 'string' ? data.error : 'Failed to update document',
    status: res.status,
  }
}

function validateUploadPayload(
  payload: UploadCargoInsuranceDocumentPayload,
): UpdateCargoInsuranceDocumentResult | null {
  const fileError = validateCargoInsuranceDocument(payload.file)
  if (fileError) {
    return { success: false, error: fileError, status: 400 }
  }

  const titleError = validateCargoInsuranceDocumentTitle(payload.title)
  if (titleError) {
    return { success: false, error: titleError, status: 400 }
  }

  const descriptionError = validateCargoInsuranceDocumentDescription(payload.description ?? '')
  if (descriptionError) {
    return { success: false, error: descriptionError, status: 400 }
  }

  return null
}

export async function updateCargoInsuranceDocument(
  documentId: string,
  payload: UploadCargoInsuranceDocumentPayload,
): Promise<UpdateCargoInsuranceDocumentResult> {
  if (!documentId.trim()) {
    return { success: false, error: 'Document id is required', status: 400 }
  }

  const validationError = validateUploadPayload(payload)
  if (validationError) return validationError

  let accessToken = getAccessToken()

  if (accessToken) {
    const result = await requestDocumentUpdate(accessToken, documentId, payload)
    if (result.success || result.status !== 401) {
      return result
    }
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return { success: false, error: 'Not authenticated', status: 401 }
  }

  return requestDocumentUpdate(refreshed.access_token, documentId, payload)
}
