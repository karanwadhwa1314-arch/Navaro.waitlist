'use client'

import type { UserQuizQuestion } from '@/lib/lms/assessment-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function QuizPlayer({
  questions,
  answers,
  onAnswer,
  unansweredQuestionId,
}: {
  questions: UserQuizQuestion[]
  answers: Record<string, string>
  onAnswer: (questionId: string, optionId: string) => void
  unansweredQuestionId?: string | null
}) {
  const answeredCount = Object.keys(answers).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F8F6F1] px-4 py-3">
        <p className="text-sm font-semibold text-[#054742]" style={deck}>
          {answeredCount} / {questions.length} answered
        </p>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((question, index) => (
            <span
              key={question.id}
              className={`h-2.5 w-2.5 rounded-full ${
                answers[question.id] ? 'bg-[#054742]' : 'bg-[#D1CEC9]'
              }`}
              title={`Question ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {questions.map((question, index) => {
        const isHighlighted = unansweredQuestionId === question.id
        return (
          <article
            key={question.id}
            id={`question-${question.id}`}
            className={`rounded-2xl border bg-white p-5 ${
              isHighlighted ? 'border-[#C486F1] ring-2 ring-[#C486F1]/30' : 'border-[#D1CEC9]'
            }`}
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-base font-bold text-[#054742]" style={display}>
                {index + 1}. {question.questionText}
              </h2>
              <span className="rounded-full bg-[#FBEBA9] px-2.5 py-0.5 text-[10px] font-bold uppercase" style={deck}>
                {question.points} pts
              </span>
            </div>

            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                    answers[question.id] === option.id
                      ? 'border-[#054742] bg-[#E8F0EE]'
                      : 'border-[#E8E4DC] hover:bg-[#FAFAF8]'
                  }`}
                  style={deck}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() => onAnswer(question.id, option.id)}
                    className="h-4 w-4 accent-[#054742]"
                  />
                  <span className="text-sm text-[#2D4F4A]">{option.optionText}</span>
                </label>
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}
