'use client'

import type { AssignmentSubmission } from '@/lib/lms/assessment-types'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function AssignmentSubmissionView({
  submission,
}: {
  submission: AssignmentSubmission
}) {
  return (
    <div className="rounded-2xl border border-[#D1CEC9] bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {submission.status === 'GRADED' ? (
          <span className="rounded-full bg-[#E9F8F0] px-3 py-1 text-[10px] font-bold uppercase text-[#087A48]" style={deck}>
            Graded
          </span>
        ) : (
          <span className="rounded-full bg-[#E8F0EE] px-3 py-1 text-[10px] font-bold uppercase text-[#054742]" style={deck}>
            Waiting for grading
          </span>
        )}
        {submission.status === 'GRADED' && submission.score != null && (
          <span className="text-sm font-bold text-[#054742]" style={deck}>
            Score: {submission.score}/{submission.maxScore}
          </span>
        )}
      </div>

      <p className="mb-2 text-xs font-semibold uppercase text-[#054742]/60" style={deck}>Your submission</p>
      <div className="whitespace-pre-wrap rounded-xl bg-[#F8F6F1] p-4 text-sm leading-relaxed text-[#2D4F4A]" style={deck}>
        {submission.contentText}
      </div>

      {submission.feedback && (
        <>
          <p className="mb-2 mt-4 text-xs font-semibold uppercase text-[#054742]/60" style={deck}>Feedback</p>
          <div className="whitespace-pre-wrap rounded-xl border border-[#D1CEC9] p-4 text-sm text-[#2D4F4A]" style={deck}>
            {submission.feedback}
          </div>
        </>
      )}

      <p className="mt-3 text-xs text-[#054742]/50" style={deck}>
        Submitted {new Date(submission.submittedAt).toLocaleString('en-IN')}
        {submission.gradedAt ? ` · Graded ${new Date(submission.gradedAt).toLocaleString('en-IN')}` : ''}
      </p>
    </div>
  )
}
