'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import {
  type CargoInsuranceDocument,
  fetchCargoInsuranceDocuments,
  formatCargoInsuranceDocumentDate,
} from '@/lib/navfinance/cargo-insurance-document'
import {
  bodyFont,
  CargoInsuranceStatusPill,
  displayFont,
} from '@/lib/navfinance/cargo-insurance-ui'

function documentInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean)
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'CI'
}

const AVATAR_COLORS = [
  'bg-[#00433E]',
  'bg-[#2E7D32]',
  'bg-[#1565C0]',
  'bg-[#E65100]',
  'bg-[#00838F]',
  'bg-[#6A1B9A]',
  'bg-[#00695C]',
  'bg-[#C62828]',
]

function avatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i)) % AVATAR_COLORS.length
  }
  return AVATAR_COLORS[hash] ?? AVATAR_COLORS[0]
}

function DocumentCard({
  document,
  getDocumentHref,
}: {
  document: CargoInsuranceDocument
  getDocumentHref: (id: string) => string
}) {
  const href = getDocumentHref(document.id)

  return (
    <Link
      href={href}
      className="group block rounded-[14px] border border-[#e8e8e8] bg-white p-4 no-underline transition hover:border-[#00433E]/20 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white ${avatarColor(document.id)}`}
        >
          {documentInitials(document.title)}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-[13px] font-semibold text-[#1a1a1a] group-hover:text-[#00433E]"
            style={bodyFont}
          >
            {document.title}
          </p>
          <p className="text-[11px] text-[#999]" style={bodyFont}>
            Cargo Insurance
          </p>
        </div>
        <CargoInsuranceStatusPill status={document.status} />
      </div>
      <div
        className="mb-3 flex items-center justify-between text-xs text-[#aaa]"
        style={bodyFont}
      >
        <span>{formatCargoInsuranceDocumentDate(document.createdAt)}</span>
        <span className="text-[11px] font-medium text-[#00433E]">View details →</span>
      </div>
      <span
        className="inline-flex w-full items-center justify-center rounded-[9px] bg-[#00433E] px-4 py-2.5 text-[13px] font-medium text-white transition group-hover:opacity-90"
        style={bodyFont}
      >
        View details
      </span>
    </Link>
  )
}

export default function CargoInsuranceMyDocuments({
  backHref,
  getDocumentHref,
  onReupload,
  ready = true,
}: {
  backHref: string
  getDocumentHref: (id: string) => string
  onReupload: () => void
  ready?: boolean
}) {
  const [documents, setDocuments] = useState<CargoInsuranceDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchCargoInsuranceDocuments()

    if (!result.success) {
      setDocuments([])
      setError(result.error)
      setLoading(false)
      return
    }

    setDocuments(result.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!ready) {
      setLoading(true)
      return
    }
    void loadDocuments()
  }, [loadDocuments, ready])

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[19px] font-bold text-[#00433E] md:text-xl" style={displayFont}>
            My Applications
          </h1>
          <p className="mt-0.5 text-[13px] text-[#888]" style={bodyFont}>
            Upload documents and track your submissions
          </p>
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
          Loading your documents...
        </p>
      )}

      {!loading && error && (
        <div className="rounded-[14px] border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-4 text-center">
          <p className="text-sm text-[#B91C1C]" style={bodyFont}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => void loadDocuments()}
            className="mt-3 text-sm font-medium text-[#00433E] underline"
            style={bodyFont}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="rounded-[14px] border border-[#e8e8e8] bg-white px-6 py-12 text-center">
          <p className="text-4xl opacity-40" aria-hidden>
            📄
          </p>
          <p className="mt-2 text-[13px] text-[#aaa]" style={bodyFont}>
            No applications yet. Upload a cargo invoice to get started.
          </p>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              getDocumentHref={getDocumentHref}
            />
          ))}
        </div>
      )}
    </div>
  )
}
