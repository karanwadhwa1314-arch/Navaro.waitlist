'use client'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import CargoRfqPaymentSection from '@/components/navfinance/CargoRfqPaymentSection'

import {
  type CargoRfq,
  type CargoRfqDocument,
  type CargoRfqDocumentType,
  type CargoRfqPayload,
  type CargoRfqQuote,
  acceptUserCargoRFQQuote,
  formatCargoRfqStatus,
  getCargoRfqStatusBadgeClass,
  getUserCargoRFQById,
  getUserCargoRFQQuotes,
  normalizeCargoRfqStatus,
  updateUserCargoRFQ,
  uploadUserCargoRFQDocument,
} from '@/lib/navfinance/cargo-rfq'
import { openUserDocument } from '@/lib/navfinance/user-document-download'

const displayFont = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const bodyFont = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

const documentTypes: CargoRfqDocumentType[] = [
  'INVOICE_COPY',
  'PREVIOUS_POLICY',
  'SUPPORTING_DOCUMENT',
  'GST_CERTIFICATE',
  'TURNOVER_STATEMENT',
  'CLAIM_STATEMENT',
  'NO_CLAIM_DECLARATION',
  'COMPANY_PROFILE',
  'OTHER',
]

type PendingDocument = {
  id: string
  file: File
  documentType: CargoRfqDocumentType
}

const fields: Array<{ key: keyof CargoRfqPayload; label: string; textarea?: boolean }> = [
  { key: 'pospDetails', label: 'Partner POSP Code / Name and Email' },
  { key: 'insuredName', label: 'Insured Name' },
  { key: 'communicationAddress', label: 'Communication Address', textarea: true },
  { key: 'gst', label: 'GST' },
  { key: 'businessDescription', label: 'Business Description', textarea: true },
  { key: 'businessType', label: 'Business Type' },
  { key: 'riskStartDate', label: 'Risk Start Date' },
  { key: 'isRollover', label: 'Is Rollover' },
  { key: 'transitType', label: 'Transit Type' },
  { key: 'totalProjectedTurnover', label: 'Total Projected Turnover' },
  { key: 'initialSumInsured', label: 'Initial Sum Insured' },
  { key: 'perSendingLimit', label: 'Per Sending Limit' },
  { key: 'perLocationLimit', label: 'Per Location Limit' },
  { key: 'packaging', label: 'Packaging' },
  { key: 'voyageFrom', label: 'Voyage From' },
  { key: 'voyageTo', label: 'Voyage To' },
  { key: 'conveyance', label: 'Conveyance' },
  { key: 'safetyMeasures', label: 'Safety Measures', textarea: true },
  { key: 'lossHistory', label: 'Loss History', textarea: true },
  { key: 'newBusiness', label: 'New Business' },
  { key: 'selfInsuredHistory', label: 'Self Insured History', textarea: true },
  { key: 'previousLossDetails', label: 'Previous Loss Details', textarea: true },
  { key: 'pastStats', label: 'Past Stats', textarea: true },
  { key: 'additionalNotes', label: 'Additional Notes', textarea: true },
]

function formatDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatPremium(amount: string, currency: string) {
  const parsedAmount = Number(amount)
  if (!amount) return '-'
  if (Number.isNaN(parsedAmount)) return `${amount}${currency ? ` ${currency}` : ''}`
  return `${new Intl.NumberFormat('en-IN').format(parsedAmount)}${currency ? ` ${currency}` : ''}`
}

function toPayload(rfq: CargoRfq): CargoRfqPayload {
  return {
    policyType: rfq.policyType,
    pospDetails: rfq.pospDetails,
    insuredName: rfq.insuredName,
    communicationAddress: rfq.communicationAddress,
    gst: rfq.gst,
    businessDescription: rfq.businessDescription,
    businessType: rfq.businessType,
    riskStartDate: rfq.riskStartDate,
    isRollover: rfq.isRollover,
    transitType: rfq.transitType,
    totalProjectedTurnover: rfq.totalProjectedTurnover,
    initialSumInsured: rfq.initialSumInsured,
    perSendingLimit: rfq.perSendingLimit,
    perLocationLimit: rfq.perLocationLimit,
    packaging: rfq.packaging,
    voyageFrom: rfq.voyageFrom,
    voyageTo: rfq.voyageTo,
    conveyance: rfq.conveyance,
    safetyMeasures: rfq.safetyMeasures,
    lossHistory: rfq.lossHistory,
    newBusiness: rfq.newBusiness,
    selfInsuredHistory: rfq.selfInsuredHistory,
    previousLossDetails: rfq.previousLossDetails,
    pastStats: rfq.pastStats,
    additionalNotes: rfq.additionalNotes,
  }
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[18px] border border-[#e8e8e8] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-[#00433E]" style={displayFont}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function InfoGrid({ items }: { items: Array<[string, string | undefined]> }) {
  return (
    <dl className="grid gap-3 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-[12px] bg-[#F8F6F1] p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#8E8E8E]" style={bodyFont}>
            {label}
          </dt>
          <dd className="mt-1 text-sm text-[#1a1a1a]" style={bodyFont}>
            {value || '-'}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function labelDocumentType(type: string) {
  if (type === 'ADMIN_REFERENCE') return 'Admin reference document'
  return type.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function CargoRfqCorrectionDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FDFBF7] px-4 py-10 text-center text-sm text-[#888]" style={bodyFont}>
          Loading RFQ details...
        </main>
      }
    >
      <CargoRfqDetailContent />
    </Suspense>
  )
}

function CargoRfqDetailContent() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentHandled = useRef(false)
  const id = params.id
  const [rfq, setRfq] = useState<CargoRfq | null>(null)
  const [documents, setDocuments] = useState<CargoRfqDocument[]>([])
  const [quotes, setQuotes] = useState<CargoRfqQuote[]>([])
  const [payload, setPayload] = useState<CargoRfqPayload | null>(null)
  const [documentType, setDocumentType] = useState<CargoRfqDocumentType>('SUPPORTING_DOCUMENT')
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([])
  const [showEdit, setShowEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [submittingAll, setSubmittingAll] = useState(false)
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null)
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [quotesError, setQuotesError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const invalidRfqId = !id || id.includes('<') || id.includes('>')

  const loadDetail = useCallback(async () => {
    if (invalidRfqId) {
      setError('Invalid RFQ ID')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const result = await getUserCargoRFQById(id)
    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    setRfq(result.data.rfq)
    setDocuments(result.data.documents)
    setPayload(toPayload(result.data.rfq))
    setLoading(false)
  }, [id, invalidRfqId])

  const loadQuotes = useCallback(async () => {
    if (invalidRfqId) {
      setQuotesError('Invalid RFQ ID')
      return
    }

    setQuotesLoading(true)
    setQuotesError(null)
    const result = await getUserCargoRFQQuotes(id)

    if (!result.success) {
      setQuotes([])
      setQuotesError(result.error)
      setQuotesLoading(false)
      return
    }

    setQuotes(result.data.quotes)
    setQuotesLoading(false)
  }, [id, invalidRfqId])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  useEffect(() => {
    void loadQuotes()
  }, [loadQuotes])

  useEffect(() => {
    const payment = searchParams.get('payment')
    if (!payment || paymentHandled.current) return

    paymentHandled.current = true

    if (payment === 'success') {
      setSuccess('Payment successful!')
      void Promise.all([loadDetail(), loadQuotes()])
    } else if (payment === 'failed') {
      setError('Payment failed. Please try again.')
    }

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams, loadDetail, loadQuotes])

  async function submitImprovement() {
    if (!payload) return
    if (invalidRfqId) {
      setError('Invalid RFQ ID')
      return
    }
    if (normalizeCargoRfqStatus(rfq?.status) !== 'DOCUMENT_PENDING') {
      setError('This RFQ can only be updated when improvement is requested.')
      return
    }

    setSubmittingAll(true)
    setError(null)
    setSuccess(null)

    const updateResult = await updateUserCargoRFQ(id, payload)
    if (!updateResult.success) {
      setSubmittingAll(false)
      setError(updateResult.error)
      return
    }

    if (pendingDocuments.length > 0) {
      setUploading(true)
      for (const document of pendingDocuments) {
        const uploadResult = await uploadUserCargoRFQDocument(id, document.file, document.documentType)

        if (!uploadResult.success) {
          setUploading(false)
          setSubmittingAll(false)
          setError('RFQ updated, but document upload failed. Please upload documents again.')
          await loadDetail()
          return
        }
      }
      setUploading(false)
      setPendingDocuments([])
    }

    setSuccess('RFQ improvement submitted successfully.')
    setSubmittingAll(false)
    setShowEdit(false)
    await loadDetail()
    window.setTimeout(() => {
      router.push('/dashboard/cargo-rfqs')
    }, 900)
  }

  async function acceptQuote(quoteId: string) {
    if (invalidRfqId || !quoteId || quoteId.includes('<') || quoteId.includes('>')) {
      setError('Invalid RFQ or quote ID')
      return
    }

    if (!window.confirm('Are you sure you want to accept this quote?')) return

    setAcceptingQuoteId(quoteId)
    setError(null)
    setSuccess(null)

    const result = await acceptUserCargoRFQQuote(id, quoteId)

    if (!result.success) {
      setAcceptingQuoteId(null)
      setError(result.error)
      return
    }

    setRfq((current) =>
      current && current.id === result.data.rfq.id
        ? { ...current, status: result.data.rfq.status }
        : current,
    )
    setQuotes((current) =>
      current.map((quote) =>
        quote.id === result.data.quote.id ? { ...quote, status: result.data.quote.status } : quote,
      ),
    )
    setSuccess('Quote accepted successfully.')
    setAcceptingQuoteId(null)
    await Promise.all([loadDetail(), loadQuotes()])
  }

  function openRfqDocument(fileUrl: string, fileName?: string, mode: 'view' | 'download' = 'view') {
    void openUserDocument(fileUrl, fileName, mode).then((result) => {
      if (!result.success) setError(result.error)
    })
  }

  function addPendingDocuments(files: FileList | null) {
    if (!files?.length) return

    const nextDocuments = Array.from(files).map((selectedFile) => ({
      id: `${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified}-${crypto.randomUUID()}`,
      file: selectedFile,
      documentType,
    }))

    setPendingDocuments((current) => [...current, ...nextDocuments])
  }

  function updatePendingDocumentType(idToUpdate: string, nextType: CargoRfqDocumentType) {
    setPendingDocuments((current) =>
      current.map((document) =>
        document.id === idToUpdate ? { ...document, documentType: nextType } : document,
      ),
    )
  }

  function removePendingDocument(idToRemove: string) {
    setPendingDocuments((current) => current.filter((document) => document.id !== idToRemove))
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] px-4 py-10 text-center text-sm text-[#888]" style={bodyFont}>
        Loading RFQ details...
      </main>
    )
  }

  if (error && !rfq) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] px-4 py-10 text-center text-sm text-red-600" style={bodyFont}>
        {error}
      </main>
    )
  }

  if (!rfq || !payload) return null

  const normalizedStatus = normalizeCargoRfqStatus(rfq.status)
  const isCorrectionRequired = normalizedStatus === 'DOCUMENT_PENDING'
  const isUnderReview = normalizedStatus === 'UNDER_REVIEW' || normalizedStatus === 'SENT_TO_INSURER'
  const hasQuoteReceived = normalizedStatus === 'QUOTE_RECEIVED'

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-8 text-[#00433E] md:px-10 md:py-10">
      <div className="mx-auto w-full max-w-[1100px] space-y-5">
        <div>
          <Link href="/dashboard/cargo-rfqs" className="text-sm font-semibold text-[#00433E] underline-offset-4 hover:underline" style={bodyFont}>
            Back to RFQs
          </Link>
          <h1 className="mt-3 text-2xl font-bold md:text-3xl" style={displayFont}>
            Cargo/Marine RFQ Details
          </h1>
        </div>

        {error && (
          <p className="rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700" style={bodyFont}>
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-[12px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700" style={bodyFont}>
            {success}
          </p>
        )}

        {isCorrectionRequired && (
          <Card title="Correction Required">
            <div className="space-y-4">
              <p className="rounded-[12px] bg-[#FFF7E8] px-4 py-3 text-sm text-[#6B4B00]" style={bodyFont}>
                {rfq.adminComment || 'Admin has requested corrections for this RFQ.'}
              </p>
              <button
                type="button"
                onClick={() => setShowEdit((value) => !value)}
                className="rounded-[10px] bg-[#00433E] px-4 py-2.5 text-sm font-semibold text-white"
                style={bodyFont}
              >
                {showEdit ? 'Close Edit RFQ Details' : 'Edit RFQ Details'}
              </button>
            </div>
          </Card>
        )}
        {!isCorrectionRequired && (
          <Card title="Improvement Update">
            <div className="space-y-4">
              <p className="rounded-[12px] bg-[#FFF7E8] px-4 py-3 text-sm text-[#6B4B00]" style={bodyFont}>
                This RFQ can only be updated when improvement is requested.
              </p>
              <button
                type="button"
                disabled
                className="rounded-[10px] bg-[#00433E] px-4 py-2.5 text-sm font-semibold text-white opacity-60"
                style={bodyFont}
              >
                Update RFQ
              </button>
            </div>
          </Card>
        )}

        {isUnderReview && (
          <Card title="Under Review">
            <div className="space-y-3">
              <p className="rounded-[12px] bg-blue-50 px-4 py-3 text-sm text-blue-700" style={bodyFont}>
                Your RFQ is under review. We will notify you once a quote is received.
              </p>
              {rfq.sentToInsurerAt && (
                <p className="text-sm text-[#6D7B77]" style={bodyFont}>
                  Submitted for review on {formatDate(rfq.sentToInsurerAt)}
                </p>
              )}
            </div>
          </Card>
        )}

        <Card title="RFQ Summary">
          <InfoGrid
            items={[
              ['Insured Name', rfq.insuredName],
              ['Status', formatCargoRfqStatus(rfq.status)],
              ['Policy Type', rfq.policyType === 'specific-marine' ? 'Specific Marine' : 'Marine Open'],
              ['GST', rfq.gst],
              ['Created At', formatDate(rfq.createdAt)],
              ['Updated At', formatDate(rfq.updatedAt)],
            ]}
          />
        </Card>

        <Card title="RFQ Details">
          <InfoGrid
            items={[
              ['Partner POSP Code / Name and Email', rfq.pospDetails],
              ['Communication Address', rfq.communicationAddress],
              ['Business Description', rfq.businessDescription],
              ['Business Type', rfq.businessType],
              ['Risk Start Date', rfq.riskStartDate],
              ['Is Rollover', rfq.isRollover],
              ['Transit Type', rfq.transitType],
              ['Total Projected Turnover', rfq.totalProjectedTurnover],
              ['Initial Sum Insured', rfq.initialSumInsured],
              ['Per Sending Limit', rfq.perSendingLimit],
              ['Per Location Limit', rfq.perLocationLimit],
              ['Packaging', rfq.packaging],
              ['Voyage From', rfq.voyageFrom],
              ['Voyage To', rfq.voyageTo],
              ['Conveyance', rfq.conveyance],
              ['Safety Measures', rfq.safetyMeasures],
              ['Loss History', rfq.lossHistory],
              ['New Business', rfq.newBusiness],
              ['Self Insured History', rfq.selfInsuredHistory],
              ['Previous Loss Details', rfq.previousLossDetails],
              ['Past Stats', rfq.pastStats],
              ['Additional Notes', rfq.additionalNotes],
              ['Admin Comment', rfq.adminComment],
            ]}
          />
        </Card>

        {(isCorrectionRequired ? showEdit : true) && (
          <Card title={isCorrectionRequired ? 'Edit RFQ Details' : 'RFQ Improvement Form'}>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-[#666]" style={bodyFont}>
                    Policy Type
                  </span>
                  <select
                    value={payload.policyType}
                    onChange={(event) => setPayload({ ...payload, policyType: event.target.value as CargoRfqPayload['policyType'] })}
                    disabled={!isCorrectionRequired}
                    className="w-full rounded-[9px] border border-[#ddd] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00433E]"
                    style={bodyFont}
                  >
                    <option value="marine-open">Marine Open</option>
                    <option value="specific-marine">Specific Marine</option>
                  </select>
                </label>

                {fields.map((field) => (
                  <label key={field.key} className={field.textarea ? 'block md:col-span-2' : 'block'}>
                    <span className="mb-1.5 block text-xs font-semibold text-[#666]" style={bodyFont}>
                      {field.label}
                    </span>
                    {field.textarea ? (
                      <textarea
                        rows={3}
                        value={String(payload[field.key] ?? '')}
                        onChange={(event) => setPayload({ ...payload, [field.key]: event.target.value })}
                        disabled={!isCorrectionRequired}
                        className="w-full rounded-[9px] border border-[#ddd] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00433E]"
                        style={bodyFont}
                      />
                    ) : (
                      <input
                        value={String(payload[field.key] ?? '')}
                        onChange={(event) => setPayload({ ...payload, [field.key]: event.target.value })}
                        disabled={!isCorrectionRequired}
                        className="w-full rounded-[9px] border border-[#ddd] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00433E]"
                        style={bodyFont}
                      />
                    )}
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void submitImprovement()}
                disabled={submittingAll || uploading || !isCorrectionRequired}
                className="rounded-[10px] bg-[#00433E] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                style={bodyFont}
              >
                {uploading ? 'Uploading documents...' : submittingAll ? 'Submitting...' : 'Submit Improvement'}
              </button>
            </div>
          </Card>
        )}

        {isCorrectionRequired && (
          <Card title="Upload Corrected Document">
            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#666]" style={bodyFont}>
                  Document Type
                </span>
                <select
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value as CargoRfqDocumentType)}
                  className="w-full rounded-[9px] border border-[#ddd] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00433E]"
                  style={bodyFont}
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {labelDocumentType(type)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#666]" style={bodyFont}>
                  Corrected / Additional Document
                </span>
                <input
                  type="file"
                  multiple
                  onChange={(event) => {
                    addPendingDocuments(event.target.files)
                    event.target.value = ''
                  }}
                  className="w-full rounded-[9px] border border-[#ddd] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00433E]"
                  style={bodyFont}
                />
              </label>
            </div>

            {pendingDocuments.length > 0 && (
              <div className="mt-4 space-y-3">
                {pendingDocuments.map((document) => (
                  <div key={document.id} className="grid gap-3 rounded-[12px] border border-[#eee] p-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center">
                    <p className="text-sm font-semibold text-[#1a1a1a]" style={bodyFont}>
                      {document.file.name}
                    </p>
                    <select
                      value={document.documentType}
                      onChange={(event) => updatePendingDocumentType(document.id, event.target.value as CargoRfqDocumentType)}
                      className="rounded-[9px] border border-[#ddd] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00433E]"
                      style={bodyFont}
                    >
                      {documentTypes.map((type) => (
                        <option key={type} value={type}>
                          {labelDocumentType(type)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removePendingDocument(document.id)}
                      className="rounded-[9px] bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                      style={bodyFont}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void submitImprovement()}
                disabled={submittingAll || uploading || !isCorrectionRequired}
                className="rounded-[10px] border border-[#00433E] px-5 py-2.5 text-sm font-semibold text-[#00433E] disabled:opacity-60"
                style={bodyFont}
              >
                {uploading ? 'Uploading documents...' : submittingAll ? 'Submitting...' : 'Submit Improvement'}
              </button>
            </div>
          </Card>
        )}

        <Card title="Documents">
          {documents.length === 0 ? (
            <p className="text-sm text-[#888]" style={bodyFont}>
              No documents uploaded.
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <div key={document.id} className="flex flex-col gap-3 rounded-[12px] border border-[#eee] p-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]" style={bodyFont}>
                      {document.fileName || '-'}
                    </p>
                    <p className="mt-1 text-xs text-[#888]" style={bodyFont}>
                      {labelDocumentType(document.documentType)} · {formatDate(document.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openRfqDocument(document.fileUrl, document.fileName)}
                      className="rounded-[9px] border border-[#00433E] px-3 py-2 text-center text-xs font-semibold text-[#00433E]"
                      style={bodyFont}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => openRfqDocument(document.fileUrl, document.fileName, 'download')}
                      className="rounded-[9px] border border-[#00433E] px-3 py-2 text-center text-xs font-semibold text-[#00433E]"
                      style={bodyFont}
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <CargoRfqPaymentSection
          rfqId={rfq.id}
          rfqStatus={rfq.status}
          onPaymentComplete={() => void loadDetail()}
        />

        <section className={`rounded-[18px] border bg-white p-5 shadow-sm ${hasQuoteReceived ? 'border-emerald-200 ring-2 ring-emerald-50' : 'border-[#e8e8e8]'}`}>
          <h2 className="mb-4 flex flex-wrap items-center gap-3 text-lg font-bold text-[#00433E]" style={displayFont}>
            Quotes
            {hasQuoteReceived && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCargoRfqStatusBadgeClass(rfq.status)}`} style={bodyFont}>
                {formatCargoRfqStatus(rfq.status)}
              </span>
            )}
          </h2>
          {quotesLoading && (
            <p className="text-sm text-[#888]" style={bodyFont}>
              Loading quotes...
            </p>
          )}

          {!quotesLoading && quotesError && (
            <p className="text-sm text-red-700" style={bodyFont}>
              {quotesError}
            </p>
          )}

          {!quotesLoading && !quotesError && quotes.length === 0 && (
            <p className="text-sm text-[#888]" style={bodyFont}>
              No quotes received yet.
            </p>
          )}

          {!quotesLoading && !quotesError && quotes.length > 0 && (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <article key={quote.id} className="rounded-[14px] border border-[#eee] p-4">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#00433E]" style={displayFont}>
                        {quote.insurerName || '-'}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-[#1a1a1a]" style={bodyFont}>
                        {formatPremium(quote.premiumAmount, quote.premiumCurrency)}
                      </p>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getCargoRfqStatusBadgeClass(quote.status)}`} style={bodyFont}>
                      {formatCargoRfqStatus(quote.status)}
                    </span>
                  </div>

                  <InfoGrid
                    items={[
                      ['Coverage Details', quote.coverageDetails],
                      ['Terms And Conditions', quote.termsAndConditions],
                      ['Valid Until', formatDate(quote.validUntil)],
                      ['Remarks', quote.remarks],
                      ['Created At', formatDate(quote.createdAt)],
                    ]}
                  />

                  {quote.quoteDocumentUrl && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openRfqDocument(quote.quoteDocumentUrl, quote.quoteDocumentFileName)}
                        className="inline-flex rounded-[9px] border border-[#00433E] px-3 py-2 text-xs font-semibold text-[#00433E]"
                        style={bodyFont}
                      >
                        View Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => openRfqDocument(quote.quoteDocumentUrl, quote.quoteDocumentFileName, 'download')}
                        className="inline-flex rounded-[9px] border border-[#00433E] px-3 py-2 text-xs font-semibold text-[#00433E]"
                        style={bodyFont}
                      >
                        Download Quote
                      </button>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {normalizeCargoRfqStatus(quote.status) === 'ACCEPTED' ? (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCargoRfqStatusBadgeClass('ACCEPTED')}`} style={bodyFont}>
                        Accepted
                      </span>
                    ) : hasQuoteReceived && normalizeCargoRfqStatus(quote.status) === 'RECEIVED' ? (
                      <button
                        type="button"
                        onClick={() => void acceptQuote(quote.id)}
                        disabled={acceptingQuoteId === quote.id}
                        className="rounded-[10px] bg-[#00433E] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                        style={bodyFont}
                      >
                        {acceptingQuoteId === quote.id ? 'Accepting...' : 'Accept Quote'}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
