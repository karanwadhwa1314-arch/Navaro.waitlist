'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import CatalogToast from '@/components/catalog/CatalogUi'
import CourseLearnLayout from '@/components/learn/CourseLearnLayout'
import LessonNavButtons from '@/components/learn/LessonNavButtons'
import LessonPlayer from '@/components/learn/LessonPlayer'
import { useCatalogAuth } from '@/hooks/useCatalogAuth'
import { getAccessToken } from '@/lib/auth/storage'
import { assessmentApi } from '@/lib/lms/assessment-api'
import { catalogApi } from '@/lib/lms/catalog-api'
import {
  buildLoginHref,
  findLessonInCourse,
  formatCatalogDurationSeconds,
  getAdjacentLessons,
} from '@/lib/lms/catalog-helpers'
import { progressApi } from '@/lib/lms/progress-api'
import type { UserAssessmentListItem } from '@/lib/lms/assessment-types'
import type { CourseDetail } from '@/lib/lms/catalog-types'
import type { CourseProgress } from '@/lib/lms/progress-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function LessonPlayerPage({
  params,
}: {
  params: { slug: string; lessonId: string }
}) {
  const router = useRouter()
  const { isLoggedIn, accessToken, authVersion } = useCatalogAuth()

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [progress, setProgress] = useState<CourseProgress | null>(null)
  const [assessments, setAssessments] = useState<UserAssessmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const resolveToken = useCallback(() => {
    if (!isLoggedIn) return null
    return accessToken || getAccessToken()
  }, [isLoggedIn, accessToken])

  const loadData = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true)
    }
    setNotFound(false)

    const token = resolveToken()
    const courseResult = await catalogApi.getUserCourseBySlug(params.slug, token)

    if (!courseResult.success) {
      if (courseResult.status === 401) {
        router.replace(buildLoginHref(`/courses/${params.slug}/learn/lesson/${params.lessonId}`))
        return
      }
      if (courseResult.status === 404) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setToast(courseResult.error)
      setLoading(false)
      return
    }

    const courseData = courseResult.data
    const lessonMatch = findLessonInCourse(courseData, params.lessonId)

    if (!lessonMatch) {
      setNotFound(true)
      setLoading(false)
      return
    }

    const [progressResult, assessmentsResult] = await Promise.all([
      courseData.isEnrolled && token
        ? progressApi.getCourseProgress(params.slug, token)
        : Promise.resolve({ success: false as const, error: '', status: 403 }),
      token
        ? assessmentApi.listAssessments(params.slug, token)
        : Promise.resolve({ success: false as const, error: '', status: 401 }),
    ])

    setCourse(courseData)
    setProgress(progressResult.success ? progressResult.data : null)
    setAssessments(assessmentsResult.success ? assessmentsResult.data.assessments : [])
    setLoading(false)
  }, [params.slug, params.lessonId, resolveToken, router])

  useEffect(() => {
    void loadData()
  }, [loadData, authVersion])

  const lesson = useMemo(
    () => (course ? findLessonInCourse(course, params.lessonId) : null),
    [course, params.lessonId],
  )

  const navigation = useMemo(() => {
    if (!course) return { previous: null, next: null }
    return getAdjacentLessons(course, params.lessonId)
  }, [course, params.lessonId])

  const isCompleted = progress?.lessons[params.lessonId] === true

  const handleMarkComplete = useCallback(async () => {
    const token = resolveToken()
    if (!token || !course || !lesson || lesson.isLocked) return

    const result = await progressApi.completeLesson(params.lessonId, token)

    if (!result.success) {
      setToast(result.error)
      return
    }

    const updated = await progressApi.getCourseProgress(params.slug, token)
    if (updated.success) setProgress(updated.data)
    setToast('Lesson marked complete')
  }, [resolveToken, course, lesson, params.lessonId, params.slug])

  const handleVideoEnded = useCallback(() => {
    if (!course?.isEnrolled || lesson?.isLocked || isCompleted) return
    void handleMarkComplete()
  }, [course?.isEnrolled, lesson?.isLocked, isCompleted, handleMarkComplete])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] px-4 py-8">
        <div className="mx-auto max-w-[1400px] animate-pulse">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-[420px] rounded-3xl bg-[#E8E4DC]" />
            <div className="h-[420px] rounded-3xl bg-[#E8E4DC]" />
          </div>
        </div>
      </main>
    )
  }

  if (notFound || !course || !lesson) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] px-4 py-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-[#FDECEC] bg-white p-6 text-center">
          <p className="mb-4 text-sm text-[#C0392B]" style={deck}>Lesson not found.</p>
          <a
            href={`/courses/${encodeURIComponent(params.slug)}/learn`}
            className="text-sm font-semibold text-[#054742] no-underline hover:underline"
            style={deck}
          >
            Back to course
          </a>
        </div>
      </main>
    )
  }

  return (
    <>
      <CourseLearnLayout
        course={course}
        slug={params.slug}
        activeLessonId={params.lessonId}
        progress={progress}
        assessments={assessments}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {lesson.isPreview && (
            <span className="rounded-full bg-[#E9F8F0] px-3 py-1 text-[10px] font-bold uppercase text-[#087A48]" style={deck}>
              Free Preview
            </span>
          )}
          {isCompleted && (
            <span className="rounded-full bg-[#E9F8F0] px-3 py-1 text-[10px] font-bold uppercase text-[#087A48]" style={deck}>
              Completed
            </span>
          )}
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#054742] ring-1 ring-[#D1CEC9]" style={deck}>
            {formatCatalogDurationSeconds(lesson.durationSeconds)}
          </span>
        </div>

        <h2 className="mb-3 text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-[#1A1A1A]" style={display}>
          {lesson.title}
        </h2>

        {lesson.description && (
          <p className="mb-4 text-sm leading-relaxed text-[#2D4F4A] md:text-base" style={deck}>
            {lesson.description}
          </p>
        )}

        <section className="mb-4 overflow-hidden rounded-2xl border border-[#D1CEC9] bg-white p-3 shadow-sm md:p-4">
          <LessonPlayer
            lesson={lesson}
            course={course}
            isLoggedIn={isLoggedIn}
            onVideoEnded={handleVideoEnded}
            onEnrolled={() => void loadData()}
            onMediaError={() => void loadData({ silent: true })}
          />
        </section>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <LessonNavButtons slug={params.slug} previous={navigation.previous} next={navigation.next} />
        </div>
      </CourseLearnLayout>

      <CatalogToast message={toast} onClose={() => setToast(null)} />
    </>
  )
}
