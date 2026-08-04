'use client'

import type { UserQuizDetailResponse } from '@/lib/lms/assessment-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function QuizIntro({
  quiz,
  maxAttemptsReached,
  onStart,
  loading,
}: {
  quiz: UserQuizDetailResponse
  maxAttemptsReached: boolean
  onStart: () => void
  loading: boolean
}) {
  const attemptsLabel =
    quiz.maxAttempts > 0
      ? `${quiz.attemptCount} / ${quiz.maxAttempts} attempts used`
      : 'Unlimited attempts'

  return (
    <div className="rounded-3xl border border-[#D1CEC9] bg-white p-6 md:p-8">
      <h1 className="mb-3 text-2xl font-bold text-[#1A1A1A]" style={display}>{quiz.title}</h1>
      <p className="mb-6 whitespace-pre-wrap text-sm leading-relaxed text-[#2D4F4A]" style={deck}>
        {quiz.instructions || 'Answer all questions to complete this quiz.'}
      </p>

      <dl className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-[#F8F6F1] px-4 py-3">
          <dt className="text-xs text-[#054742]/60" style={deck}>Passing score</dt>
          <dd className="text-lg font-bold text-[#054742]" style={display}>{quiz.passingScorePercent}%</dd>
        </div>
        <div className="rounded-xl bg-[#F8F6F1] px-4 py-3">
          <dt className="text-xs text-[#054742]/60" style={deck}>Max score</dt>
          <dd className="text-lg font-bold text-[#054742]" style={display}>{quiz.maxScore}</dd>
        </div>
        <div className="rounded-xl bg-[#F8F6F1] px-4 py-3">
          <dt className="text-xs text-[#054742]/60" style={deck}>Attempts</dt>
          <dd className="text-lg font-bold text-[#054742]" style={display}>{attemptsLabel}</dd>
        </div>
      </dl>

      {quiz.questions.length === 0 ? (
        <p className="text-sm text-[#054742]" style={deck}>This quiz has no questions yet.</p>
      ) : maxAttemptsReached ? (
        <p className="rounded-xl bg-[#FFF4D8] px-4 py-3 text-sm font-semibold text-[#9A6A00]" style={deck}>
          Maximum quiz attempts reached. You cannot start another attempt.
        </p>
      ) : (
        <button
          type="button"
          onClick={onStart}
          disabled={loading}
          className="rounded-full bg-[#054742] px-8 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          style={deck}
        >
          {loading ? 'Starting…' : 'Start quiz'}
        </button>
      )}
    </div>
  )
}
