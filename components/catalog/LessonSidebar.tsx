'use client'

import Link from 'next/link'

import AssessmentListItem from '@/components/assessments/AssessmentListItem'
import {
  canAccessLesson,
  formatCatalogDurationSeconds,
  getLessonHref,
} from '@/lib/lms/catalog-helpers'
import type { UserAssessmentListItem } from '@/lib/lms/assessment-types'
import type { CourseDetail } from '@/lib/lms/catalog-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

function filterAssessments(
  assessments: UserAssessmentListItem[],
  moduleId: string | null,
  lessonId: string | null,
) {
  return assessments.filter((item) => {
    const itemModuleId = item.moduleId || null
    const itemLessonId = item.lessonId || null
    return itemModuleId === moduleId && itemLessonId === lessonId
  })
}

export default function LessonSidebar({
  course,
  slug,
  activeLessonId,
  assessments = [],
}: {
  course: CourseDetail
  slug: string
  activeLessonId: string
  assessments?: UserAssessmentListItem[]
}) {
  const totalLessons = course.modules.reduce((sum, courseModule) => sum + courseModule.lessons.length, 0)
  const courseLevelAssessments = filterAssessments(assessments, null, null)

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-[#D1CEC9] bg-white">
      <div className="border-b border-[#D1CEC9] px-4 py-4">
        <h2 className="text-base font-bold text-[#054742]" style={display}>Course content</h2>
        <p className="mt-1 text-xs text-[#054742]/60" style={deck}>
          {course.modules.length} modules · {totalLessons} lessons
          {assessments.length > 0 ? ` · ${assessments.length} assessments` : ''}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-4">
          {courseLevelAssessments.length > 0 && (
            <div>
              <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-[#054742]/70" style={display}>
                Assessments
              </p>
              <div className="space-y-1">
                {courseLevelAssessments.map((item) => (
                  <AssessmentListItem key={item.id} item={item} slug={slug} compact />
                ))}
              </div>
            </div>
          )}

          {course.modules.map((courseModule, moduleIndex) => {
            const moduleAssessments = filterAssessments(assessments, courseModule.id, null)

            return (
              <div key={courseModule.id}>
                <div className="mb-2 flex items-start gap-2 px-2">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#FBEBA9] text-xs font-bold text-[#1A1A1A]"
                    style={display}
                  >
                    {moduleIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#054742]" style={display}>{courseModule.title}</p>
                    <p className="text-xs text-[#054742]/55" style={deck}>
                      {courseModule.lessons.length} lessons
                    </p>
                  </div>
                </div>

                {moduleAssessments.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {moduleAssessments.map((item) => (
                      <AssessmentListItem key={item.id} item={item} slug={slug} compact />
                    ))}
                  </div>
                )}

                <ul className="space-y-1">
                  {courseModule.lessons.map((lesson, lessonIndex) => {
                    const unlocked = canAccessLesson(lesson)
                    const isActive = lesson.id === activeLessonId
                    const href = getLessonHref(course.slug, lesson.id)
                    const lessonAssessments = filterAssessments(assessments, courseModule.id, lesson.id)

                    return (
                      <li key={lesson.id} className="space-y-1">
                        {!unlocked ? (
                          <div
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#054742]/40"
                            style={deck}
                          >
                            <span className="w-5 shrink-0 text-center text-xs">{lessonIndex + 1}</span>
                            <span className="min-w-0 flex-1 line-clamp-2">{lesson.title}</span>
                            <span className="shrink-0 text-[10px]">🔒</span>
                          </div>
                        ) : (
                          <Link
                            href={href}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm no-underline transition ${
                              isActive
                                ? 'bg-[#054742] font-semibold text-white'
                                : 'text-[#054742] hover:bg-[#F8F6F1]'
                            }`}
                            style={deck}
                          >
                            <span className={`w-5 shrink-0 text-center text-xs ${isActive ? 'text-white/80' : 'text-[#054742]/50'}`}>
                              {lessonIndex + 1}
                            </span>
                            <span className="min-w-0 flex-1 line-clamp-2">{lesson.title}</span>
                            <span className={`shrink-0 text-[10px] ${isActive ? 'text-white/70' : 'text-[#054742]/45'}`}>
                              {formatCatalogDurationSeconds(lesson.durationSeconds)}
                            </span>
                          </Link>
                        )}

                        {lessonAssessments.length > 0 && (
                          <div className="space-y-1 pl-4">
                            {lessonAssessments.map((item) => (
                              <AssessmentListItem key={item.id} item={item} slug={slug} compact />
                            ))}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}

          {assessments.length === 0 && (
            <p className="px-2 text-xs text-[#054742]/45" style={deck}>No quizzes or assignments for this course.</p>
          )}
        </div>
      </div>
    </aside>
  )
}
