'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import {
  type CargoRfq,
  formatCargoRfqStatus,
  getCargoRfqStatusBadgeClass,
  getUserCargoRFQs,
  normalizeCargoRfqStatus,
} from '@/lib/navfinance/cargo-rfq'
import { openUserDocument } from '@/lib/navfinance/user-document-download'

const displayFont = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const bodyFont = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

const statusFilters = [
  ['', 'All statuses'],
  ['SUBMITTED', 'Submitted'],
  ['UNDER_REVIEW', 'Under Review'],
  ['DOCUMENT_PENDING', 'Improvement Requested'],
  ['RESUBMITTED', 'Resubmitted'],
  ['QUOTE_RECEIVED', 'Quote Received'],
  ['QUOTE_ACCEPTED', 'Quote Accepted'],
  ['PAYMENT_PENDING', 'Payment Pending'],
  ['PAYMENT_DONE', 'Payment Done'],
  ['POLICY_ISSUED', 'Policy Issued'],
] as const

function formatDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatPolicyType(value: string) {
  return value === 'specific-marine' ? 'Specific Marine' : 'Marine Open'
}

export default function CargoRfqsPage() {
  const [rfqs, setRfqs] = useState<CargoRfq[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function openRfqDocument(fileUrl: string, fileName?: string, mode: 'view' | 'download' = 'view') {
    void openUserDocument(fileUrl, fileName, mode).then((result) => {
      if (!result.success) setError(result.error)
    })
  }

  useEffect(() => {
    let cancelled = false

    async function loadRfqs() {
      setLoading(true)
      setError(null)
      const result = await getUserCargoRFQs({ status: status || undefined })
      if (cancelled) return

      if (!result.success) {
        setError(result.error)
        setRfqs([])
        setLoading(false)
        return
      }

      setRfqs(result.data.rfqs)
      setLoading(false)
    }

    void loadRfqs()
    return () => {
      cancelled = true
    }
  }, [status])

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-8 text-[#00433E] md:px-10 md:py-10">
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl" style={displayFont}>
              My Cargo/Marine RFQs
            </h1>
            <p className="mt-2 text-sm text-[#6D7B77]" style={bodyFont}>
              Open an RFQ to view details or submit improvements requested by admin.
            </p>
          </div>
          <label className="block min-w-[220px]">
            <span className="mb-1.5 block text-xs font-semibold text-[#666]" style={bodyFont}>
              Status filter
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-[9px] border border-[#ddd] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00433E]"
              style={bodyFont}
            >
              {statusFilters.map(([value, label]) => (
                <option key={value || 'all'} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="rounded-[18px] border border-[#e8e8e8] bg-white p-4 shadow-sm md:p-5">
          {loading && (
            <p className="py-10 text-center text-sm text-[#888]" style={bodyFont}>
              Loading RFQs...
            </p>
          )}

          {!loading && error && (
            <p className="py-10 text-center text-sm text-red-600" style={bodyFont}>
              {error}
            </p>
          )}

          {!loading && !error && rfqs.length === 0 && (
            <p className="py-10 text-center text-sm text-[#888]" style={bodyFont}>
              No Cargo/Marine RFQs found.
            </p>
          )}

          {!loading && !error && rfqs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-[#8E8E8E]" style={bodyFont}>
                    <th className="border-b border-[#eee] px-3 py-3">Insured</th>
                    <th className="border-b border-[#eee] px-3 py-3">Policy</th>
                    <th className="border-b border-[#eee] px-3 py-3">Transit</th>
                    <th className="border-b border-[#eee] px-3 py-3">Status</th>
                    <th className="border-b border-[#eee] px-3 py-3">Documents</th>
                    <th className="border-b border-[#eee] px-3 py-3">Created</th>
                    <th className="border-b border-[#eee] px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map((rfq) => (
                    <tr key={rfq.id} className="text-sm text-[#1a1a1a]" style={bodyFont}>
                      <td className="border-b border-[#f1f1f1] px-3 py-4 font-semibold">{rfq.insuredName || '-'}</td>
                      <td className="border-b border-[#f1f1f1] px-3 py-4">{formatPolicyType(rfq.policyType)}</td>
                      <td className="border-b border-[#f1f1f1] px-3 py-4">{rfq.transitType || '-'}</td>
                      <td className="border-b border-[#f1f1f1] px-3 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCargoRfqStatusBadgeClass(rfq.status)}`}>
                          {formatCargoRfqStatus(rfq.status)}
                        </span>
                      </td>
                      <td className="border-b border-[#f1f1f1] px-3 py-4">
                        {rfq.documents.length === 0 ? (
                          <span className="text-xs text-[#888]">No documents</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {rfq.documents.map((document) => (
                              <span key={document.id} className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openRfqDocument(document.fileUrl, document.fileName)}
                                  className="text-xs font-semibold text-[#00433E] underline-offset-4 hover:underline"
                                >
                                  {document.fileName || document.documentType}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openRfqDocument(document.fileUrl, document.fileName, 'download')}
                                  className="text-xs font-semibold text-[#00433E] underline-offset-4 hover:underline"
                                >
                                  Download
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="border-b border-[#f1f1f1] px-3 py-4">{formatDate(rfq.createdAt)}</td>
                      <td className="border-b border-[#f1f1f1] px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/dashboard/cargo-rfqs/${encodeURIComponent(rfq.id)}`}
                            className="font-semibold text-[#00433E] underline-offset-4 hover:underline"
                          >
                            View
                          </Link>
                          {normalizeCargoRfqStatus(rfq.status) === 'DOCUMENT_PENDING' && (
                            <Link
                              href={`/dashboard/cargo-rfqs/${encodeURIComponent(rfq.id)}`}
                              className="font-semibold text-[#00433E] underline-offset-4 hover:underline"
                            >
                              Improve/Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
