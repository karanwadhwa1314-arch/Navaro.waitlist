'use client'

import type { CourseProgress } from '@/lib/lms/progress-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function CourseProgressBar({ progress }: { progress: CourseProgress | null }) {
  if (!progress) return null

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs" style={deck}>
        <span className="font-bold text-[#054742]">{progress.progressPercent}% complete</span>
        <span className="text-[#054742]/55">
          ({progress.completedLessons}/{progress.totalLessons} lessons)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#E8E4DC]">
        <div
          className="h-full rounded-full bg-[#054742] transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress.progressPercent))}%` }}
        />
      </div>
    </div>
  )
}
