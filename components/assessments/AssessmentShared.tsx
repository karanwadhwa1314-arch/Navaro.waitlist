'use client'

import Link from 'next/link'

import type { UserAssessmentListItem } from '@/lib/lms/assessment-types'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function EnrollRequiredBanner({
  courseSlug,
}: {
  courseSlug: string
}) {
  return (
    <div className="rounded-2xl border border-[#FDECEC] bg-[#FFF8F8] p-6 text-center">
      <p className="mb-2 text-lg font-semibold text-[#054742]" style={deck}>Enrollment required</p>
      <p className="mb-4 text-sm text-[#2D4F4A]" style={deck}>
        Enroll in this course to access quizzes and assignments.
      </p>
      <Link
        href={`/courses/${encodeURIComponent(courseSlug)}`}
        className="inline-flex rounded-full bg-[#054742] px-6 py-3 text-sm font-semibold text-white no-underline"
        style={deck}
      >
        Go to course to enroll
      </Link>
    </div>
  )
}

export function AssessmentLockedMessage({ courseSlug }: { courseSlug: string }) {
  return (
    <p className="text-xs text-[#054742]/55" style={deck}>
      <Link href={`/courses/${encodeURIComponent(courseSlug)}`} className="font-semibold text-[#054742] no-underline hover:underline">
        Enroll
      </Link>
      {' '}to unlock
    </p>
  )
}

export function formatDueDate(dueAt?: string | null) {
  if (!dueAt) return null
  const date = new Date(dueAt)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function isDueDatePassed(dueAt?: string | null) {
  if (!dueAt) return false
  const date = new Date(dueAt)
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now()
}

export function getAssessmentSummary(item: UserAssessmentListItem) {
  if (item.isLocked) return 'Locked'

  if (item.type === 'QUIZ') {
    const attempts =
      item.maxAttempts && item.maxAttempts > 0
        ? `Attempt ${item.attemptCount}/${item.maxAttempts}`
        : 'Unlimited attempts'
    const score =
      item.bestScore != null ? `Best: ${item.bestScore}/${item.maxScore}` : null
    const pass = item.passed ? 'Passed' : item.attemptCount > 0 ? 'Not passed' : null
    return [attempts, score, pass].filter(Boolean).join(' · ')
  }

  const due = formatDueDate(item.dueAt)
  if (due) return `Due ${due}`
  return 'Assignment'
}
