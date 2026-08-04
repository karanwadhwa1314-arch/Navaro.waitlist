'use client'

import Link from 'next/link'

import type { SubmitQuizResponse, UserQuizDetailResponse } from '@/lib/lms/assessment-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function QuizResultCard({
  result,
  quiz,
  slug,
  canRetake,
  onRetake,
}: {
  result: SubmitQuizResponse
  quiz: UserQuizDetailResponse
  slug: string
  canRetake: boolean
  onRetake: () => void
}) {
  return (
    <div className="rounded-3xl border border-[#D1CEC9] bg-white p-8 text-center">
      <p className="mb-2 text-sm uppercase tracking-wide text-[#054742]/60" style={deck}>Your score</p>
      <p className="mb-4 text-5xl font-bold text-[#054742]" style={display}>
        {result.score}/{result.maxScore}
      </p>

      <span
        className={`mb-6 inline-block rounded-full px-4 py-1.5 text-sm font-bold uppercase ${
          result.passed ? 'bg-[#E9F8F0] text-[#087A48]' : 'bg-[#FFF4D8] text-[#9A6A00]'
        }`}
        style={deck}
      >
        {result.passed ? 'Passed' : 'Not passed'} · need {quiz.passingScorePercent}%
      </span>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        {canRetake && (
          <button
            type="button"
            onClick={onRetake}
            className="rounded-full bg-[#054742] px-6 py-3 text-sm font-semibold text-white"
            style={deck}
          >
            Retake quiz
          </button>
        )}
        <Link
          href={`/courses/${encodeURIComponent(slug)}/learn`}
          className="rounded-full border border-[#D1CEC9] px-6 py-3 text-sm font-semibold text-[#054742] no-underline hover:bg-[#F8F6F1]"
          style={deck}
        >
          Back to course
        </Link>
      </div>
    </div>
  )
}
