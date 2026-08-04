'use client'

import AssessmentListItem from '@/components/assessments/AssessmentListItem'
import LessonSidebarItem from '@/components/learn/LessonSidebarItem'
import type { UserAssessmentListItem } from '@/lib/lms/assessment-types'
import type { CourseDetail } from '@/lib/lms/catalog-types'
import type { CourseProgress } from '@/lib/lms/progress-types'

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

export default function CourseCurriculumSidebar({
  course,
  slug,
  activeLessonId,
  progress,
  assessments = [],
}: {
  course: CourseDetail
  slug: string
  activeLessonId?: string
  progress: CourseProgress | null
  assessments?: UserAssessmentListItem[]
}) {
  const totalLessons = course.modules.reduce((sum, courseModule) => sum + courseModule.lessons.length, 0)
  const courseLevelAssessments = filterAssessments(assessments, null, null)
  const showProgress = Boolean(progress && course.isEnrolled)

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-[#D1CEC9] bg-white">
      <div className="border-b border-[#D1CEC9] px-4 py-4">
        <h2 className="text-base font-bold text-[#054742]" style={display}>Curriculum</h2>
        <p className="mt-1 text-xs text-[#054742]/60" style={deck}>
          {course.modules.length} modules · {totalLessons} lessons
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-4">
          {courseLevelAssessments.length > 0 && (
            <div>
              <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-[#054742]/70" style={display}>
                Course assessments
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
                    const lessonAssessments = filterAssessments(assessments, courseModule.id, lesson.id)
                    const isCompleted = progress?.lessons[lesson.id] === true

                    return (
                      <li key={lesson.id} className="space-y-1">
                        <LessonSidebarItem
                          lesson={lesson}
                          slug={slug}
                          lessonIndex={lessonIndex}
                          isActive={lesson.id === activeLessonId}
                          isCompleted={isCompleted}
                          showProgress={showProgress}
                        />

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
        </div>
      </div>
    </aside>
  )
}
