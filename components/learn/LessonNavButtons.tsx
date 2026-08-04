'use client'

import Link from 'next/link'

import { getLessonHref } from '@/lib/lms/catalog-helpers'
import type { LessonOutline } from '@/lib/lms/catalog-types'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function LessonNavButtons({
  slug,
  previous,
  next,
}: {
  slug: string
  previous: LessonOutline | null
  next: LessonOutline | null
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {previous && (
        <Link
          href={getLessonHref(slug, previous.id)}
          className={`rounded-full border px-5 py-2.5 text-sm font-semibold no-underline ${
            previous.isLocked
              ? 'pointer-events-none border-[#E8E4DC] text-[#054742]/40'
              : 'border-[#D1CEC9] text-[#054742] hover:bg-[#F8F6F1]'
          }`}
          style={deck}
          aria-disabled={previous.isLocked}
        >
          ← Previous lesson
        </Link>
      )}
      {next && (
        <Link
          href={next.isLocked ? '#' : getLessonHref(slug, next.id)}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold no-underline ${
            next.isLocked
              ? 'pointer-events-none bg-[#E8E4DC] text-[#054742]/40'
              : 'bg-[#C486F1] text-[#1A1A1A] hover:opacity-90'
          }`}
          style={deck}
          aria-disabled={next.isLocked}
        >
          {next.isLocked ? 'Next lesson 🔒' : 'Next lesson →'}
        </Link>
      )}
    </div>
  )
}
