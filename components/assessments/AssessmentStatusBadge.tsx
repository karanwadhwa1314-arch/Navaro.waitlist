'use client'

import type { UserAssessmentListItem } from '@/lib/lms/assessment-types'

import { formatDueDate } from '@/components/assessments/AssessmentShared'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function AssessmentStatusBadge({ item }: { item: UserAssessmentListItem }) {
  if (item.isLocked) {
    return (
      <span className="rounded-full bg-[#F5F5F5] px-2 py-0.5 text-[10px] font-bold uppercase text-[#054742]/50" style={deck}>
        Locked
      </span>
    )
  }

  if (item.type === 'QUIZ') {
    if (item.passed) {
      return (
        <span className="rounded-full bg-[#E9F8F0] px-2 py-0.5 text-[10px] font-bold uppercase text-[#087A48]" style={deck}>
          Passed
        </span>
      )
    }
    if (item.attemptCount > 0) {
      return (
        <span className="rounded-full bg-[#FFF4D8] px-2 py-0.5 text-[10px] font-bold uppercase text-[#9A6A00]" style={deck}>
          Not passed
        </span>
      )
    }
    return null
  }

  const due = formatDueDate(item.dueAt)
  if (due) {
    return (
      <span className="rounded-full bg-[#FFF4D8] px-2 py-0.5 text-[10px] font-bold uppercase text-[#9A6A00]" style={deck}>
        Due {due}
      </span>
    )
  }

  return null
}
