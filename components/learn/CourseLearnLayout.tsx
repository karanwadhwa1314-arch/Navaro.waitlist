'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'

import CourseCurriculumSidebar from '@/components/learn/CourseCurriculumSidebar'
import CourseProgressBar from '@/components/learn/CourseProgressBar'
import type { UserAssessmentListItem } from '@/lib/lms/assessment-types'
import type { CourseDetail } from '@/lib/lms/catalog-types'
import type { CourseProgress } from '@/lib/lms/progress-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function CourseLearnLayout({
  course,
  slug,
  activeLessonId,
  progress,
  assessments,
  children,
}: {
  course: CourseDetail
  slug: string
  activeLessonId?: string
  progress: CourseProgress | null
  assessments: UserAssessmentListItem[]
  children: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-6 md:py-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link
              href={`/courses/${encodeURIComponent(slug)}`}
              className="mb-1 inline-block text-sm text-[#054742]/70 no-underline hover:underline"
              style={deck}
            >
              ← Back to course
            </Link>
            <h1 className="truncate text-lg font-bold text-[#054742] md:text-xl" style={display}>
              {course.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:max-w-xs sm:flex-1">
            <CourseProgressBar progress={course.isEnrolled ? progress : null} />
          </div>
        </header>

        <button
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D1CEC9] bg-white px-4 py-3 text-sm font-semibold text-[#054742] lg:hidden"
          style={deck}
        >
          {sidebarOpen ? 'Hide curriculum' : 'Show curriculum'}
        </button>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="min-w-0">{children}</div>

          <div
            className={`min-h-[480px] lg:sticky lg:top-6 lg:block lg:h-[calc(100vh-8rem)] ${
              sidebarOpen ? 'block' : 'hidden'
            }`}
          >
            <CourseCurriculumSidebar
              course={course}
              slug={slug}
              activeLessonId={activeLessonId}
              progress={progress}
              assessments={assessments}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
