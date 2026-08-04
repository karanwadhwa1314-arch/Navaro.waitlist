'use client'

import { useState, type ReactNode } from 'react'

import type {
  CargoInsuranceActivityItem,
  CargoInsuranceDocumentStatus,
} from '@/lib/navfinance/cargo-insurance-document'
import {
  buildCargoInsuranceActivityDetails,
  formatCargoInsuranceActivityActor,
  formatCargoInsuranceActivityDate,
  formatCargoInsuranceActivityStatusChange,
  formatCargoInsuranceActivityType,
  getCargoInsuranceStatusConfig,
} from '@/lib/navfinance/cargo-insurance-document'

export const bodyFont = { fontFamily: '"TASA Orbiter Deck", sans-serif' }
export const displayFont = { fontFamily: '"TASA Orbiter Display", sans-serif' }

export const CARGO_TIMELINE_STEPS = [
  { title: 'Upload documents', subtitle: 'Submit your cargo invoice' },
  { title: 'Admin review', subtitle: 'Team verifies your submission' },
  { title: 'Correction (if needed)', subtitle: 'Re-upload if changes are required' },
  { title: 'Payment', subtitle: 'Complete insurance payment' },
  { title: 'Approved', subtitle: 'Policy documents ready' },
] as const

export function formatCargoInsuranceFileSize(bytes: number): string {
  if (bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getFileTypeKind(fileName: string): 'pdf' | 'image' | 'doc' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'pdf'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image'
  if (['doc', 'docx'].includes(ext)) return 'doc'
  return 'other'
}

const FILE_ICON_STYLES: Record<ReturnType<typeof getFileTypeKind>, string> = {
  pdf: 'bg-[#FBE9E7] text-[#C62828]',
  image: 'bg-[#E8F5E9] text-[#2E7D32]',
  doc: 'bg-[#E3F2FD] text-[#1565C0]',
  other: 'bg-[#F0EEE8] text-[#00433E]',
}

export function getCargoInsuranceTimelineIndex(status: string): number {
  const key = status.trim().toUpperCase()
  if (key === 'PENDING') return 0
  if (key === 'UNDER_REVIEW') return 1
  if (key === 'CHANGES_REQUIRED') return 2
  if (key === 'PAYMENT_REQUIRED' || key === 'PAYMENT_PROCESSING') return 3
  if (key === 'APPROVED') return 4
  return 0
}

export function isCargoInsuranceRejected(status: string): boolean {
  return status.trim().toUpperCase() === 'REJECTED'
}

export function CargoInsuranceStatusPill({ status }: { status: string }) {
  const config = getCargoInsuranceStatusConfig(status as CargoInsuranceDocumentStatus)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold md:text-xs ${config.badgeClass}`}
      style={bodyFont}
    >
      {config.label}
    </span>
  )
}

function TimelineIcon({ step, state }: { step: number; state: 'done' | 'active' | 'todo' | 'rejected' }) {
  const icons = [
    <path key="u" d="M11 15V4M11 4L7 8M11 4L15 8M4 14V16C4 17.1 4.9 18 6 18H16C17.1 18 18 17.1 18 16V14" />,
    <><circle key="e-c" cx="12" cy="12" r="3" /><path key="e-p" d="M12 5V3M12 21v-2M5 12H3M21 12h-2" /></>,
    <path key="c" d="M14 3l7 7-10 10H4v-7L14 3z" />,
    <rect key="p" x="3" y="6" width="18" height="12" rx="2" />,
    <path key="a" d="M5 12l4 4L19 6" />,
  ]

  const cls =
    state === 'done'
      ? 'bg-[#E8F5E9] text-[#2E7D32]'
      : state === 'active'
        ? 'bg-[#E8F0EE] text-[#00433E] shadow-[0_0_0_3px_rgba(0,67,62,0.12)]'
        : state === 'rejected'
          ? 'bg-[#FBE9E7] text-[#C62828]'
          : 'bg-[#f0f0f0] text-[#aaa]'

  return (
    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cls}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        {icons[step]}
      </svg>
    </div>
  )
}

export function CargoInsuranceProgressTimeline({ status }: { status: string }) {
  const rejected = isCargoInsuranceRejected(status)
  const activeIndex = getCargoInsuranceTimelineIndex(status)

  if (rejected) {
    return (
      <div className="flex gap-3">
        <TimelineIcon step={4} state="rejected" />
        <div>
          <p className="text-sm font-semibold text-[#C62828]" style={bodyFont}>
            Application rejected
          </p>
          <p className="mt-0.5 text-xs text-[#888]" style={bodyFont}>
            Please contact support for next steps.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {CARGO_TIMELINE_STEPS.map((step, index) => {
        const state =
          index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'todo'

        return (
          <div key={step.title} className="flex gap-3">
            <div className="flex w-7 flex-col items-center">
              <TimelineIcon step={index} state={state} />
              {index < CARGO_TIMELINE_STEPS.length - 1 && (
                <div className="my-1 w-px flex-1 bg-[#e8e8e8] min-h-[10px]" />
              )}
            </div>
            <div className="pb-3.5 pt-0.5">
              <p className="text-[13px] font-semibold text-[#1a1a1a]" style={bodyFont}>
                {step.title}
              </p>
              <p className="mt-0.5 text-xs text-[#888]" style={bodyFont}>
                {step.subtitle}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getActivityDotClass(action: string, toStatus: string): string {
  const key = `${action} ${toStatus}`.trim().toUpperCase()

  if (key.includes('REJECT') || key.includes('FAIL')) return 'bg-[#EF5350]'
  if (key.includes('APPROV') || key.includes('COMPLETE') || key.includes('SUCCESS')) {
    return 'bg-[#2E7D32]'
  }
  if (key.includes('PAYMENT') || key.includes('PAY')) return 'bg-[#1B5E20]'
  if (key.includes('CHANGE') || key.includes('CORRECT') || key.includes('REQUEST')) {
    return 'bg-[#E65100]'
  }
  if (key.includes('REVIEW') || key.includes('UPLOAD')) return 'bg-[#1565C0]'
  return 'bg-[#00433E]'
}

function ActivityDetailRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null

  return (
    <div className="min-w-0 text-[12px] leading-relaxed" style={bodyFont}>
      <span className="mb-0.5 block text-[11px] font-medium text-[#888]">{label}</span>
      <span className="block break-all text-[#444]">{value}</span>
    </div>
  )
}

function ActivityItemDetails({ item }: { item: CargoInsuranceActivityItem }) {
  const statusChange = formatCargoInsuranceActivityStatusChange(item.fromStatus, item.toStatus)
  const actorLabel = formatCargoInsuranceActivityActor(item.actorName, item.actorRole)
  const metadataLines = buildCargoInsuranceActivityDetails(item).filter(
    (line) => !line.startsWith('Attachments') || item.metadata.attachmentTitles.length === 0,
  )
  const actionLabel = formatCargoInsuranceActivityType(item.action)

  return (
    <div className="mt-2 min-w-0 overflow-hidden space-y-2.5 rounded-[10px] border border-[#e8e8e8] bg-[#f8f8fa] p-3">
      <ActivityDetailRow label="Action" value={actionLabel} />
      <ActivityDetailRow label="Status" value={statusChange} />
      <ActivityDetailRow label="Comment" value={item.description} />
      <ActivityDetailRow label="Actor" value={actorLabel} />
      <ActivityDetailRow label="Role" value={item.actorRole} />
      <ActivityDetailRow label="Date" value={formatCargoInsuranceActivityDate(item.createdAt)} />

      {metadataLines.length > 0 && (
        <div className="border-t border-[#ececec] pt-2">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#aaa]" style={bodyFont}>
            Details
          </p>
          <ul className="space-y-1 text-[12px] text-[#555]" style={bodyFont}>
            {metadataLines.map((line) => (
              <li key={line} className="break-all">
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.metadata.attachmentTitles.length > 0 && (
        <div className="border-t border-[#ececec] pt-2">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#aaa]" style={bodyFont}>
            Attachments
          </p>
          <ul className="space-y-1">
            {item.metadata.attachmentTitles.map((title) => (
              <li
                key={title}
                className="break-all rounded-md border border-[#eee] bg-white px-2.5 py-1.5 text-[12px] text-[#444]"
                style={bodyFont}
              >
                {title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function getActivityPreview(item: CargoInsuranceActivityItem): string {
  const statusChange = formatCargoInsuranceActivityStatusChange(item.fromStatus, item.toStatus)
  if (item.description.trim()) {
    const text = item.description.trim()
    return text.length > 72 ? `${text.slice(0, 72)}…` : text
  }
  if (statusChange) return statusChange
  const metadataLines = buildCargoInsuranceActivityDetails(item)
  return metadataLines[0] ?? ''
}

export function CargoInsuranceActivityPanel({
  items,
  loading,
  error,
  onOpen,
  onRetry,
}: {
  items: CargoInsuranceActivityItem[]
  loading: boolean
  error: string | null
  onOpen: () => void
  onRetry: () => void
}) {
  const [open, setOpen] = useState(false)

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next) onOpen()
  }

  return (
    <div className="rounded-[14px] border border-[#e8e8e8] bg-white p-4 md:p-5">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 rounded-[10px] px-1 py-1 text-left transition ${
          open ? 'text-[#00433E]' : 'text-[#1a1a1a] hover:text-[#00433E]'
        }`}
      >
        <span className="flex items-center gap-2 text-sm font-semibold" style={bodyFont}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          Activity
          {items.length > 0 && (
            <span className="rounded-full bg-[#E8F0EE] px-2 py-0.5 text-[11px] font-semibold text-[#00433E]">
              {items.length}
            </span>
          )}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#888]" style={bodyFont}>
          {open ? 'Hide' : 'View all'}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="mt-3.5 min-w-0 overflow-hidden border-t border-[#ececec] pt-3.5">
          <CargoInsuranceActivityList
            items={items}
            loading={loading}
            error={error}
            onRetry={onRetry}
          />
        </div>
      )}
    </div>
  )
}

export function CargoInsuranceActivityList({
  items,
  loading,
  error,
  onRetry,
}: {
  items: CargoInsuranceActivityItem[]
  loading: boolean
  error: string | null
  onRetry: () => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleItem = (id: string) => {
    setExpandedId((current) => (current === id ? null : id))
  }

  if (loading) {
    return (
      <p className="text-sm text-[#888]" style={bodyFont}>
        Loading activity...
      </p>
    )
  }

  if (error) {
    return (
      <div>
        <p className="text-sm text-[#B91C1C]" style={bodyFont}>
          {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm font-medium text-[#00433E] underline"
          style={bodyFont}
        >
          Try again
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-[#888]" style={bodyFont}>
        No activity recorded yet.
      </p>
    )
  }

  return (
    <div className="flex min-w-0 flex-col">
      {items.map((item, index) => {
        const label = item.title.trim() || formatCargoInsuranceActivityType(item.action) || 'Activity update'
        const preview = getActivityPreview(item)
        const isExpanded = expandedId === item.id

        return (
          <div key={item.id} className="flex min-w-0 gap-3">
            <div className="flex w-3 flex-col items-center pt-2">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${getActivityDotClass(item.action, item.toStatus)}`}
                aria-hidden
              />
              {index < items.length - 1 && (
                <div className="my-1 w-px flex-1 bg-[#e8e8e8] min-h-[12px]" />
              )}
            </div>
            <div className="min-w-0 flex-1 pb-3">
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isExpanded}
                className={`w-full rounded-[10px] border px-3 py-2.5 text-left transition ${
                  isExpanded
                    ? 'border-[#00433E]/25 bg-[#E8F0EE] shadow-sm'
                    : 'border-[#ececec] bg-white hover:border-[#00433E]/20 hover:bg-[#fafafa]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#1a1a1a]" style={bodyFont}>
                      {label}
                    </p>
                    {preview && !isExpanded && (
                      <p className="mt-0.5 truncate text-xs text-[#888]" style={bodyFont}>
                        {preview}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <time
                      className="text-[11px] text-[#aaa]"
                      style={bodyFont}
                      dateTime={item.createdAt}
                    >
                      {formatCargoInsuranceActivityDate(item.createdAt)}
                    </time>
                    <span
                      className={`text-[11px] font-medium ${isExpanded ? 'text-[#00433E]' : 'text-[#888]'}`}
                      style={bodyFont}
                    >
                      {isExpanded ? 'Hide' : 'Details'}
                    </span>
                  </div>
                </div>
              </button>

              {isExpanded && <ActivityItemDetails item={item} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function CargoInsuranceFileRow({
  fileName,
  fileSize,
  meta,
  badge,
  href,
  onRemove,
  onView,
  onDownload,
}: {
  fileName: string
  fileSize?: string
  meta?: string
  badge?: { label: string; className: string }
  href?: string
  onRemove?: () => void
  onView?: () => void
  onDownload?: () => void
}) {
  const kind = getFileTypeKind(fileName)

  return (
    <div className="flex items-center gap-2.5 rounded-[10px] border border-[#eee] bg-[#f8f8fa] px-3 py-2.5 transition hover:border-[#d0d0d8]">
      <div
        className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg text-base ${FILE_ICON_STYLES[kind]}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[#1a1a1a]" style={bodyFont}>
          {fileName}
        </p>
        <p className="mt-0.5 text-[11px] text-[#aaa]" style={bodyFont}>
          {[fileSize, meta].filter(Boolean).join(' · ')}
        </p>
      </div>
      {badge && (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`} style={bodyFont}>
          {badge.label}
        </span>
      )}
      <div className="flex shrink-0 items-center gap-1">
        {(href || onView) &&
          (onView ? (
            <button
              type="button"
              onClick={onView}
              className="inline-flex items-center rounded-lg border border-[#00433E]/20 px-2 py-1 text-[11px] font-medium text-[#00433E] transition hover:bg-[#00433E]/5"
              style={bodyFont}
            >
              View
            </button>
          ) : href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-[#00433E]/20 px-2 py-1 text-[11px] font-medium text-[#00433E] no-underline transition hover:bg-[#00433E]/5"
              style={bodyFont}
            >
              View
            </a>
          ) : null)}
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center rounded-lg border border-[#00433E]/20 px-2 py-1 text-[11px] font-medium text-[#00433E] transition hover:bg-[#00433E]/5"
            style={bodyFont}
          >
            Download
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-1 text-[#ccc] transition hover:bg-[#FBE9E7] hover:text-[#C62828]"
            aria-label="Remove file"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export function CargoInsuranceNotice({
  variant,
  children,
}: {
  variant: 'info' | 'warn' | 'success'
  children: ReactNode
}) {
  const styles = {
    info: 'border-l-[#00433E] bg-[#E8F0EE] text-[#00433E]',
    warn: 'border-l-[#E53935] bg-[#FBE9E7] text-[#B71C1C]',
    success: 'border-l-[#2E7D32] bg-[#E8F5E9] text-[#1B5E20]',
  }

  return (
    <div className={`border-l-[3px] rounded-r-lg px-3.5 py-2.5 text-[13px] ${styles[variant]}`} style={bodyFont}>
      {children}
    </div>
  )
}
