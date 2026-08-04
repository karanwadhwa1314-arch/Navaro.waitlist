'use client'

import Link from 'next/link'

import { getAssessmentSummary } from '@/components/assessments/AssessmentShared'
import { getAssignmentHref, getQuizHref } from '@/lib/lms/catalog-helpers'
import type { UserAssessmentListItem } from '@/lib/lms/assessment-types'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

function QuizIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="#054742" strokeWidth="1.3" />
      <path d="M5.5 6h5M5.5 8.5h3" stroke="#054742" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function AssignmentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 2.5h5.5L12 5v8.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" stroke="#054742" strokeWidth="1.3" />
      <path d="M9 2.5V5H12" stroke="#054742" strokeWidth="1.3" />
    </svg>
  )
}

export default function AssessmentListItem({
  item,
  slug,
  compact = false,
}: {
  item: UserAssessmentListItem
  slug: string
  compact?: boolean
}) {
  const href = item.type === 'QUIZ' ? getQuizHref(slug, item.id) : getAssignmentHref(slug, item.id)
  const summary = getAssessmentSummary(item)
  const typeLabel = item.type === 'QUIZ' ? 'Quiz' : 'Assignment'

  if (item.isLocked) {
    return (
      <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm text-[#054742]/40 ${compact ? '' : 'border border-[#E8E4DC] bg-[#FAFAF8]'}`} style={deck}>
        <span className="mt-0.5 shrink-0">🔒</span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-medium">{item.title}</p>
          <p className="mt-0.5 text-[10px] uppercase">{typeLabel} · Locked</p>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm no-underline transition hover:bg-[#F8F6F1] ${
        compact ? 'text-[#054742]' : 'border border-[#D1CEC9] bg-white text-[#054742]'
      }`}
      style={deck}
    >
      <span className="mt-0.5 shrink-0">{item.type === 'QUIZ' ? <QuizIcon /> : <AssignmentIcon />}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="line-clamp-2 font-semibold">{item.title}</p>
          <span className="rounded-full bg-[#FBEBA9] px-2 py-0.5 text-[10px] font-bold uppercase text-[#1A1A1A]">
            {typeLabel}
          </span>
          {item.type === 'QUIZ' && item.passed && (
            <span className="rounded-full bg-[#E9F8F0] px-2 py-0.5 text-[10px] font-bold uppercase text-[#087A48]">
              Passed
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[10px] text-[#054742]/55">{summary}</p>
      </div>
    </Link>
  )
}
