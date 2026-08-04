'use client'

import type { LessonOutline } from '@/lib/lms/catalog-types'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

function stripUnsafeHtml(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
}

export default function LessonTextContent({ lesson }: { lesson: LessonOutline }) {
  const content = lesson.contentText || 'Lesson content is not available.'

  if (lesson.contentType === 'HTML') {
    return (
      <div
        className="prose max-w-none text-sm leading-relaxed text-[#2D4F4A] md:text-base"
        style={deck}
        dangerouslySetInnerHTML={{ __html: stripUnsafeHtml(content) }}
      />
    )
  }

  return (
    <div className="prose max-w-none whitespace-pre-wrap text-sm leading-relaxed text-[#2D4F4A] md:text-base" style={deck}>
      {content}
    </div>
  )
}
