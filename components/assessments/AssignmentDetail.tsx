'use client'

import { formatDueDate, isDueDatePassed } from '@/components/assessments/AssessmentShared'
import type { UserAssignmentDetailResponse } from '@/lib/lms/assessment-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function AssignmentDetailView({
  assignment,
}: {
  assignment: UserAssignmentDetailResponse
}) {
  const dueLabel = formatDueDate(assignment.dueAt)
  const pastDue = isDueDatePassed(assignment.dueAt)

  return (
    <div className="rounded-3xl border border-[#D1CEC9] bg-white p-6 md:p-8">
      <h1 className="mb-3 text-2xl font-bold text-[#1A1A1A]" style={display}>{assignment.title}</h1>

      {dueLabel && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${
            pastDue ? 'bg-[#FDECEC] text-[#C0392B]' : 'bg-[#FFF4D8] text-[#9A6A00]'
          }`}
          style={deck}
        >
          {pastDue ? `Due date has passed (${dueLabel})` : `Due: ${dueLabel}`}
        </div>
      )}

      <p className="mb-2 text-xs font-semibold uppercase text-[#054742]/60" style={deck}>Instructions</p>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#2D4F4A]" style={deck}>
        {assignment.instructions || 'Complete the assignment below.'}
      </div>

      <p className="mt-4 text-xs text-[#054742]/55" style={deck}>Max score: {assignment.maxScore}</p>
    </div>
  )
}
