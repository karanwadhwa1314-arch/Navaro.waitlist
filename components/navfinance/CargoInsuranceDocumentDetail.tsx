'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import {
  type CargoInsuranceDocument,
  type CargoInsuranceActivityItem,
  type CargoInsuranceDocumentComments,
  fetchCargoInsuranceDocument,
  fetchCargoInsuranceDocumentActivity,
  fetchCargoInsuranceDocumentComments,
  formatCargoInsuranceDocumentDate,
} from '@/lib/navfinance/cargo-insurance-document'
import {
  bodyFont,
  CargoInsuranceActivityPanel,
  CargoInsuranceFileRow,
  CargoInsuranceNotice,
  CargoInsuranceProgressTimeline,
  CargoInsuranceStatusPill,
  displayFont,
  formatCargoInsuranceFileSize,
  isCargoInsuranceRejected,
} from '@/lib/navfinance/cargo-insurance-ui'
import { openUserDocument } from '@/lib/navfinance/user-document-download'

function CorrectionPanel({
  comments,
  commentsLoading,
  commentsError,
  onRetry,
  onReupload,
  onOpenDocument,
  onDownloadDocument,
}: {
  comments: CargoInsuranceDocumentComments | null
  commentsLoading: boolean
  commentsError: string | null
  onRetry: () => void
  onReupload: () => void
  onOpenDocument: (fileUrl: string, fileName?: string) => void
  onDownloadDocument: (fileUrl: string, fileName?: string) => void
}) {
  return (
    <div className="rounded-[14px] border border-[#e8e8e8] bg-white p-4 md:p-5">
      <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1a1a1a]" style={bodyFont}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2" aria-hidden>
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        Re-upload corrected documents
      </p>

      {commentsLoading && (
        <p className="text-sm text-[#888]" style={bodyFont}>
          Loading admin feedback...
        </p>
      )}

      {!commentsLoading && commentsError && (
        <div>
          <p className="text-sm text-[#B91C1C]" style={bodyFont}>
            {commentsError}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-[#C2410C] underline"
            style={bodyFont}
          >
            Try again
          </button>
        </div>
      )}

      {!commentsLoading && !commentsError && comments && (
        <>
          {comments.requiredDetails.trim() && (
            <CargoInsuranceNotice variant="warn">{comments.requiredDetails}</CargoInsuranceNotice>
          )}

          {comments.adminDocuments.length > 0 && (
            <div className="mt-4">
              <p
                className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#aaa]"
                style={bodyFont}
              >
                Documents from admin
              </p>
              <div className="flex flex-col gap-1.5">
                {comments.adminDocuments.map((adminDoc) => (
                  <CargoInsuranceFileRow
                    key={adminDoc.id}
                    fileName={adminDoc.title || adminDoc.fileName}
                    fileSize={formatCargoInsuranceFileSize(adminDoc.fileSize)}
                    meta={adminDoc.fileName !== adminDoc.title ? adminDoc.fileName : undefined}
                    badge={{ label: 'From admin', className: 'bg-[#FFF3E0] text-[#E65100]' }}
                    onView={() => onOpenDocument(adminDoc.fileUrl, adminDoc.fileName || adminDoc.title)}
                    onDownload={() => onDownloadDocument(adminDoc.fileUrl, adminDoc.fileName || adminDoc.title)}
                  />
                ))}
              </div>
            </div>
          )}

          <p
            className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-[#aaa]"
            style={bodyFont}
          >
            Your corrected documents
          </p>
          <p className="mb-4 text-xs text-[#888]" style={bodyFont}>
            Upload a new invoice to address the admin feedback.
          </p>

          <button
            type="button"
            onClick={onReupload}
            className="flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#E65100] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#BF360C]"
            style={bodyFont}
          >
            Re-submit documents
          </button>
        </>
      )}
    </div>
  )
}

export default function CargoInsuranceDocumentDetail({
  documentId,
  backHref,
  onReupload,
}: {
  documentId: string
  backHref: string
  onReupload: () => void
}) {
  const [document, setDocument] = useState<CargoInsuranceDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comments, setComments] = useState<CargoInsuranceDocumentComments | null>(null)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [activity, setActivity] = useState<CargoInsuranceActivityItem[]>([])
  const [activityLoading, setActivityLoading] = useState(true)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [notice, setNotice] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  const loadDocument = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchCargoInsuranceDocument(documentId)

    if (!result.success) {
      setDocument(null)
      setError(result.error)
      setLoading(false)
      return
    }

    setDocument(result.data)
    setLoading(false)
  }, [documentId])

  const loadComments = useCallback(async () => {
    setCommentsLoading(true)
    setCommentsError(null)

    const result = await fetchCargoInsuranceDocumentComments(documentId)

    if (!result.success) {
      setComments(null)
      setCommentsError(result.error)
      setCommentsLoading(false)
      return
    }

    setComments(result.data)
    setCommentsLoading(false)
  }, [documentId])

  const loadActivity = useCallback(async () => {
    setActivityLoading(true)
    setActivityError(null)

    const result = await fetchCargoInsuranceDocumentActivity(documentId)

    if (!result.success) {
      setActivity([])
      setActivityError(result.error)
      setActivityLoading(false)
      return
    }

    setActivity(result.data)
    setActivityLoading(false)
  }, [documentId])

  useEffect(() => {
    void loadDocument()
  }, [loadDocument])

  useEffect(() => {
    if (!document || document.status.trim().toUpperCase() !== 'CHANGES_REQUIRED') return
    void loadComments()
  }, [document, loadComments])

  const status = document?.status?.trim().toUpperCase() ?? ''
  const rejected = isCargoInsuranceRejected(status)

  const handleOpenDocument = useCallback((fileUrl: string, fileName?: string) => {
    void openUserDocument(fileUrl, fileName).then((result) => {
      if (!result.success) {
        setNotice({ type: 'error', message: result.error })
      }
    })
  }, [])

  const handleDownloadDocument = useCallback((fileUrl: string, fileName?: string) => {
    void openUserDocument(fileUrl, fileName, 'download').then((result) => {
      if (!result.success) {
        setNotice({ type: 'error', message: result.error })
      }
    })
  }, [])

  const renderActionPanel = () => {
    if (!document) return null

    if (rejected) {
      return (
        <div className="rounded-[14px] border border-[#EF9A9A] bg-[#FBE9E7] p-7 text-center">
          <p className="text-4xl" aria-hidden>
            ⛔
          </p>
          <p className="mt-2 text-base font-bold text-[#B71C1C]" style={displayFont}>
            Application rejected
          </p>
          <p className="mt-2 text-[13px] text-[#888]" style={bodyFont}>
            {document.reviewComments?.trim() ||
              'Please contact support or start a new application.'}
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center justify-center rounded-[9px] border border-[#ddd] bg-white px-4 py-2 text-[13px] font-medium text-[#333] no-underline"
            style={bodyFont}
          >
            Contact support
          </Link>
        </div>
      )
    }

    if (status === 'APPROVED') {
      return (
        <div className="rounded-[14px] border border-[#A5D6A7] bg-[#f0faf2] p-7 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#A5D6A7] bg-[#E8F5E9] text-3xl text-[#2E7D32]">
            ✓
          </div>
          <p className="text-base font-bold text-[#1B5E20]" style={displayFont}>
            Document approved
          </p>
          <p className="mt-2 text-[13px] text-[#388E3C]" style={bodyFont}>
            Your cargo insurance document has been approved.
          </p>
        </div>
      )
    }

    if (status === 'CHANGES_REQUIRED') {
      return (
        <CorrectionPanel
          comments={comments}
          commentsLoading={commentsLoading}
          commentsError={commentsError}
          onRetry={() => void loadComments()}
          onReupload={onReupload}
          onOpenDocument={handleOpenDocument}
          onDownloadDocument={handleDownloadDocument}
        />
      )
    }

    if (status === 'PAYMENT_REQUIRED' || status === 'PAYMENT_PROCESSING') {
      return (
        <div className="rounded-[14px] border border-[#e8e8e8] bg-white p-4 md:p-5">
          <CargoInsuranceNotice variant="info">
            Document payment is no longer handled here. Please contact support if you need assistance.
          </CargoInsuranceNotice>
        </div>
      )
    }

    if (status === 'UNDER_REVIEW') {
      return (
        <div className="rounded-[14px] border border-[#e8e8e8] bg-white p-4 md:p-5">
          <CargoInsuranceNotice variant="info">
            Documents submitted — awaiting admin review.
          </CargoInsuranceNotice>
        </div>
      )
    }

    if (status === 'PENDING') {
      return (
        <div className="rounded-[14px] border border-[#e8e8e8] bg-white p-4 md:p-5">
          <p className="mb-3 text-sm font-semibold text-[#1a1a1a]" style={bodyFont}>
            Submitted document
          </p>
          <CargoInsuranceFileRow
            fileName={document.fileName || document.title}
            fileSize={formatCargoInsuranceFileSize(document.fileSize)}
            meta={formatCargoInsuranceDocumentDate(document.createdAt)}
            badge={{ label: 'Submitted', className: 'bg-[#E3F2FD] text-[#1565C0]' }}
            onView={() => handleOpenDocument(document.fileUrl, document.fileName || document.title)}
            onDownload={() => handleDownloadDocument(document.fileUrl, document.fileName || document.title)}
          />
          <CargoInsuranceNotice variant="info">
            Your document is pending review. We will notify you when the status changes.
          </CargoInsuranceNotice>
        </div>
      )
    }

    return null
  }

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <div className="mb-6 flex items-center justify-between gap-4 md:mb-8">
        <div>
          <p className="text-[13px] text-[#888]" style={bodyFont}>
            Track your submission and upload documents
          </p>
          <h1
            className="mt-1 text-[19px] font-bold text-[#00433E] md:text-xl"
            style={displayFont}
          >
            {loading ? 'Loading...' : document?.title ?? 'Document'}
          </h1>
        </div>
        <Link
          href={backHref}
          className="shrink-0 rounded-[9px] border border-[#ddd] bg-white px-4 py-2 text-[13px] font-medium text-[#333] no-underline transition hover:bg-[#f5f5f7]"
          style={bodyFont}
        >
          Back
        </Link>
      </div>

      {loading && (
        <p className="text-center text-sm text-[#888]" style={bodyFont}>
          Loading document...
        </p>
      )}

      {!loading && error && (
        <div className="rounded-[14px] border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-4 text-center">
          <p className="text-sm text-[#B91C1C]" style={bodyFont}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => void loadDocument()}
            className="mt-3 text-sm font-medium text-[#00433E] underline"
            style={bodyFont}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && document && (
        <>
          {notice && (
            <div
              className={`mb-5 rounded-[10px] border px-4 py-3 ${
                notice.type === 'success'
                  ? 'border-[#86EFAC] bg-[#F0FDF4] text-[#166534]'
                  : notice.type === 'error'
                    ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]'
                    : 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF]'
              }`}
            >
              <p className="text-sm" style={bodyFont}>
                {notice.message}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[320px_1fr]">
            <div className="flex min-w-0 flex-col gap-3.5">
              <div className="rounded-[14px] border border-[#e8e8e8] bg-white p-4 md:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#1a1a1a]" style={bodyFont}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#00433E" strokeWidth="2" aria-hidden>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    Application info
                  </p>
                  <CargoInsuranceStatusPill status={document.status} />
                </div>
                <div className="space-y-1 text-[13px] leading-8 text-[#555]" style={bodyFont}>
                  <div>
                    <b>Title:</b> {document.title}
                  </div>
                  <div>
                    <b>Uploaded:</b> {formatCargoInsuranceDocumentDate(document.createdAt)}
                  </div>
                  {document.description?.trim() && (
                    <div>
                      <b>Note:</b> {document.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[14px] border border-[#e8e8e8] bg-white p-4 md:p-5">
                <p className="mb-3.5 flex items-center gap-2 text-sm font-semibold text-[#1a1a1a]" style={bodyFont}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#00433E" strokeWidth="2" aria-hidden>
                    <circle cx="6" cy="6" r="2" />
                    <circle cx="18" cy="18" r="2" />
                    <path d="M8 6h5a4 4 0 014 4v5" />
                  </svg>
                  Progress
                </p>
                <CargoInsuranceProgressTimeline status={document.status} />
              </div>

              <CargoInsuranceActivityPanel
                items={activity}
                loading={activityLoading}
                error={activityError}
                onOpen={() => void loadActivity()}
                onRetry={() => void loadActivity()}
              />
            </div>

            <div className="flex flex-col gap-3.5">{renderActionPanel()}</div>
          </div>
        </>
      )}
    </div>
  )
}
