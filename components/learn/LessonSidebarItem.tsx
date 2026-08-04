'use client'

import Link from 'next/link'

import { formatCatalogDurationSeconds, getLessonHref } from '@/lib/lms/catalog-helpers'
import type { LessonOutline } from '@/lib/lms/catalog-types'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

function CheckIcon({ completed }: { completed: boolean }) {
  if (completed) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#087A48]" aria-hidden>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#054742]/35" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export default function LessonSidebarItem({
  lesson,
  slug,
  lessonIndex,
  isActive,
  isCompleted,
  showProgress,
}: {
  lesson: LessonOutline
  slug: string
  lessonIndex: number
  isActive: boolean
  isCompleted: boolean
  showProgress: boolean
}) {
  const duration = formatCatalogDurationSeconds(lesson.durationSeconds)

  if (lesson.isLocked) {
    return (
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#054742]/40"
        style={deck}
      >
        {showProgress && <CheckIcon completed={false} />}
        <span className="w-5 shrink-0 text-center text-xs">{lessonIndex + 1}</span>
        <span className="min-w-0 flex-1 line-clamp-2">{lesson.title}</span>
        <span className="shrink-0 text-[10px]">🔒</span>
      </div>
    )
  }

  return (
    <Link
      href={getLessonHref(slug, lesson.id)}
      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm no-underline transition ${
        isActive
          ? 'bg-[#054742] font-semibold text-white'
          : 'text-[#054742] hover:bg-[#F8F6F1]'
      }`}
      style={deck}
    >
      {showProgress && (
        <span className={isActive ? 'text-white' : ''}>
          <CheckIcon completed={isCompleted} />
        </span>
      )}
      <span className={`w-5 shrink-0 text-center text-xs ${isActive ? 'text-white/80' : 'text-[#054742]/50'}`}>
        {lessonIndex + 1}
      </span>
      <span className="min-w-0 flex-1 line-clamp-2">{lesson.title}</span>
      <span className={`shrink-0 text-[10px] ${isActive ? 'text-white/70' : 'text-[#054742]/45'}`}>
        {duration}
      </span>
    </Link>
  )
}
