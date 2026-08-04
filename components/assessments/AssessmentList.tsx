'use client'

import AssessmentListItem from '@/components/assessments/AssessmentListItem'
import type { CourseDetail } from '@/lib/lms/catalog-types'
import type { UserAssessmentListItem } from '@/lib/lms/assessment-types'

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

export default function AssessmentList({
  slug,
  course,
  assessments,
  compact = false,
}: {
  slug: string
  course: CourseDetail
  assessments: UserAssessmentListItem[]
  compact?: boolean
}) {
  const courseLevel = filterAssessments(assessments, null, null)

  if (assessments.length === 0) {
    return compact ? null : (
      <p className="px-2 text-xs text-[#054742]/50" style={deck}>No quizzes or assignments for this course.</p>
    )
  }

  return (
    <div className="space-y-3">
      {courseLevel.length > 0 && (
        <div>
          {!compact && (
            <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-[#054742]/70" style={display}>
              Course assessments
            </p>
          )}
          <div className="space-y-1">
            {courseLevel.map((item) => (
              <AssessmentListItem key={item.id} item={item} slug={slug} compact={compact} />
            ))}
          </div>
        </div>
      )}

      {course.modules.map((courseModule) => {
        const moduleLevel = filterAssessments(assessments, courseModule.id, null)
        const lessonAssessments = courseModule.lessons.flatMap((lesson) => ({
          lesson,
          items: filterAssessments(assessments, courseModule.id, lesson.id),
        }))

        const hasModuleContent =
          moduleLevel.length > 0 || lessonAssessments.some((entry) => entry.items.length > 0)

        if (!hasModuleContent) return null

        return (
          <div key={courseModule.id}>
            {!compact && (
              <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-[#054742]/70" style={display}>
                {courseModule.title}
              </p>
            )}
            <div className="space-y-1">
              {moduleLevel.map((item) => (
                <AssessmentListItem key={item.id} item={item} slug={slug} compact={compact} />
              ))}
              {lessonAssessments.map(({ lesson, items }) =>
                items.length > 0 ? (
                  <div key={lesson.id} className="space-y-1">
                    {!compact && (
                      <p className="px-3 pt-1 text-[10px] font-semibold text-[#054742]/55" style={deck}>
                        {lesson.title}
                      </p>
                    )}
                    {items.map((item) => (
                      <AssessmentListItem key={item.id} item={item} slug={slug} compact={compact} />
                    ))}
                  </div>
                ) : null,
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function getModuleAssessments(
  assessments: UserAssessmentListItem[],
  moduleId: string,
  lessonId?: string | null,
) {
  return assessments.filter((item) => {
    if (item.moduleId !== moduleId) return false
    if (lessonId) return item.lessonId === lessonId
    return !item.lessonId
  })
}

export function getLessonAssessments(assessments: UserAssessmentListItem[], moduleId: string, lessonId: string) {
  return assessments.filter((item) => item.moduleId === moduleId && item.lessonId === lessonId)
}
