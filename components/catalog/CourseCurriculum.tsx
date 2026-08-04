'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { lessonThumbnailSrc } from '@/lib/media'
import {
  buildLoginHref,
  canAccessLesson,
  formatCatalogDurationSeconds,
  getLessonHref,
} from '@/lib/lms/catalog-helpers'
import type { CourseDetail, LessonOutline, ModuleOutline } from '@/lib/lms/catalog-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="3.5" y="7" width="9" height="7" rx="1.5" stroke="#054742" strokeWidth="1.4" />
      <path d="M5.5 7V5.5C5.5 3.85 6.85 2.5 8.5 2.5C10.15 2.5 11.5 3.85 11.5 5.5V7" stroke="#054742" strokeWidth="1.4" />
    </svg>
  )
}

function LessonRow({
  lesson,
  slug,
  isLoggedIn,
  onMediaError,
}: {
  lesson: LessonOutline
  slug: string
  isLoggedIn: boolean
  onMediaError?: () => void
}) {
  const pathname = usePathname()
  const duration = formatCatalogDurationSeconds(lesson.durationSeconds)
  const thumb = lessonThumbnailSrc(lesson)

  if (!canAccessLesson(lesson)) {
    const loginHref = buildLoginHref(pathname || `/courses/${slug}`)
    const lockedLabel = !isLoggedIn ? 'Sign in to watch' : 'Enroll to unlock'
    const lockedHref = !isLoggedIn ? loginHref : '#enroll'

    return (
      <div className="flex flex-col gap-3 rounded-xl border border-[#E8E4DC] bg-[#FAFAF8] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {thumb ? (
            <img
              src={thumb}
              alt=""
              className="h-8 w-12 shrink-0 rounded object-cover"
              onError={onMediaError}
            />
          ) : null}
          <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-[#054742]/70" style={deck}>{lesson.title}</p>
            {lesson.isPreview && (
              <span className="rounded-full bg-[#FFF4D8] px-2 py-0.5 text-[10px] font-bold uppercase text-[#9A6A00]" style={deck}>
                Preview
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[#054742]/45" style={deck}>{duration}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LockIcon />
          {lockedHref.startsWith('/login') ? (
            <Link href={lockedHref} className="text-xs font-semibold text-[#054742] no-underline hover:underline" style={deck}>
              {lockedLabel}
            </Link>
          ) : (
            <a href={lockedHref} className="text-xs font-semibold text-[#054742] no-underline hover:underline" style={deck}>
              {lockedLabel}
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <Link
      href={getLessonHref(slug, lesson.id)}
      className="flex items-center justify-between gap-3 rounded-xl border border-[#D1CEC9] bg-white px-4 py-3 no-underline transition-colors hover:bg-[#F8F6F1]"
    >
      <div className="flex min-w-0 items-center gap-3">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="h-8 w-12 shrink-0 rounded object-cover"
            onError={onMediaError}
          />
        ) : null}
        <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-[#054742]" style={deck}>{lesson.title}</p>
          {lesson.isPreview && (
            <span className="rounded-full bg-[#E9F8F0] px-2 py-0.5 text-[10px] font-bold uppercase text-[#087A48]" style={deck}>
              {isLoggedIn ? 'Preview' : 'Free Preview'}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-[#054742]/60" style={deck}>{duration}</p>
        </div>
      </div>
      <span className="text-xs font-semibold text-[#054742]" style={deck}>Watch</span>
    </Link>
  )
}

function ModuleAccordion({
  module,
  index,
  slug,
  isLoggedIn,
  isEnrolled,
  activeModule,
  setActiveModule,
  onMediaError,
}: {
  module: ModuleOutline
  index: number
  slug: string
  isLoggedIn: boolean
  isEnrolled: boolean
  activeModule: number
  setActiveModule: (value: number) => void
  onMediaError?: () => void
}) {
  const isActive = activeModule === index

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D1CEC9] bg-white">
      <button
        type="button"
        onClick={() => setActiveModule(isActive ? -1 : index)}
        className="flex w-full items-center gap-4 px-4 py-4 text-left md:px-5 md:py-5"
        aria-expanded={isActive}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FBEBA9] text-base font-bold text-[#1A1A1A] md:h-12 md:w-12" style={display}>
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold text-[#054742] md:text-lg" style={display}>{module.title}</span>
          <span className="mt-0.5 block text-sm text-[#054742]/70" style={deck}>{module.lessons.length} lessons</span>
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-lg text-white" aria-hidden>
          {isActive ? '−' : '+'}
        </span>
      </button>

      {isActive && (
        <div className="space-y-2 border-t border-[#D1CEC9] px-4 py-4 md:px-5">
          {module.description && (
            <p className="mb-2 text-sm text-[#2D4F4A]/80" style={deck}>{module.description}</p>
          )}
          {module.lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              slug={slug}
              isLoggedIn={isLoggedIn}
              onMediaError={onMediaError}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CourseCurriculum({
  course,
  isLoggedIn,
  activeModule,
  setActiveModule,
  onMediaError,
}: {
  course: CourseDetail
  isLoggedIn: boolean
  activeModule: number
  setActiveModule: (value: number) => void
  onMediaError?: () => void
}) {
  const lessonCount = course.modules.reduce((sum, courseModule) => sum + courseModule.lessons.length, 0)

  return (
    <section id="curriculum" className="mt-10">
      <h2 className="mb-6 text-2xl font-bold uppercase text-[#054742]" style={display}>Curriculum</h2>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="h-fit rounded-2xl border border-[#D1CEC9] bg-[#FDFBF7] p-6">
          <h3 className="mb-4 text-lg font-bold text-[#054742]" style={display}>Overview</h3>
          <ul className="space-y-3 text-sm text-[#054742]" style={deck}>
            <li>{course.modules.length} modules</li>
            <li>{lessonCount} lessons</li>
          </ul>
        </div>

        <div className="space-y-3">
          {course.modules.map((module, index) => (
            <ModuleAccordion
              key={module.id}
              module={module}
              index={index}
              slug={course.slug}
              isLoggedIn={isLoggedIn}
              isEnrolled={course.isEnrolled}
              activeModule={activeModule}
              setActiveModule={setActiveModule}
              onMediaError={onMediaError}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
