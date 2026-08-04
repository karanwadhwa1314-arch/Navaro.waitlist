'use client'

import LearnEnrollBanner from '@/components/learn/EnrollRequiredBanner'
import type { CourseDetail, LessonOutline } from '@/lib/lms/catalog-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function LessonLockedCard({
  lesson,
  course,
  isLoggedIn,
  onEnrolled,
}: {
  lesson: LessonOutline
  course: CourseDetail
  isLoggedIn: boolean
  onEnrolled?: () => void
}) {
  return (
    <div className="rounded-2xl border border-[#D1CEC9] bg-[#FAFAF8] p-6 md:p-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl" aria-hidden>🔒</span>
        <div>
          <h2 className="text-lg font-bold text-[#054742]" style={display}>This lesson is locked</h2>
          <p className="text-sm text-[#2D4F4A]" style={deck}>{lesson.title}</p>
        </div>
      </div>

      {!lesson.isPreview && (
        <LearnEnrollBanner course={course} isLoggedIn={isLoggedIn} onEnrolled={onEnrolled} />
      )}

      {lesson.isPreview && (
        <p className="text-sm text-[#054742]/60" style={deck}>
          This preview lesson should be unlocked. Try refreshing the page.
        </p>
      )}
    </div>
  )
}
