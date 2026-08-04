'use client'

import { lessonVideoSrc } from '@/lib/media'
import type { LessonOutline } from '@/lib/lms/catalog-types'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function LessonPdfViewer({
  lesson,
  onMediaError,
}: {
  lesson: LessonOutline
  onMediaError?: () => void
}) {
  const src = lessonVideoSrc(lesson)

  if (!src) {
    return <p className="text-sm text-[#2D4F4A]" style={deck}>PDF is not available.</p>
  }

  return (
    <div className="space-y-4">
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex rounded-xl bg-[#054742] px-5 py-3 text-sm font-semibold text-white no-underline"
        style={deck}
      >
        Open PDF
      </a>
      <iframe
        title={lesson.title}
        src={src}
        className="h-[75vh] w-full rounded-2xl border border-[#D1CEC9] bg-white"
        onError={onMediaError}
      />
    </div>
  )
}
