'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import LearnEnrollBanner from '@/components/learn/EnrollRequiredBanner'
import CatalogToast from '@/components/catalog/CatalogUi'
import { useCatalogAuth } from '@/hooks/useCatalogAuth'
import { getAccessToken } from '@/lib/auth/storage'
import { catalogApi } from '@/lib/lms/catalog-api'
import { findFirstUnlockedLesson, getLessonHref } from '@/lib/lms/catalog-helpers'

import type { CourseDetail } from '@/lib/lms/catalog-types'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

function LearnIndexContent({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, accessToken, authVersion } = useCatalogAuth()
  const [toast, setToast] = useState<string | null>(null)
  const [showEnroll, setShowEnroll] = useState(false)
  const [course, setCourse] = useState<CourseDetail | null>(null)

  const load = useCallback(async () => {
    const legacyLesson = searchParams.get('lesson')
    if (legacyLesson) {
      router.replace(getLessonHref(params.slug, legacyLesson))
      return
    }

    const token = isLoggedIn ? (accessToken || getAccessToken()) : null
    const result = await catalogApi.getUserCourseBySlug(params.slug, token)

    if (!result.success) {
      if (result.status === 404) {
        router.replace(`/courses/${encodeURIComponent(params.slug)}`)
        return
      }
      setToast(result.error)
      return
    }

    const firstLessonId = findFirstUnlockedLesson(result.data)
    if (firstLessonId) {
      router.replace(getLessonHref(params.slug, firstLessonId))
      return
    }

    setCourse(result.data)
    setShowEnroll(true)
  }, [params.slug, searchParams, router, isLoggedIn, accessToken])

  useEffect(() => {
    void load()
  }, [load, authVersion])

  if (showEnroll && course) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] px-4 py-8">
        <div className="mx-auto max-w-lg">
          <LearnEnrollBanner
            course={course}
            isLoggedIn={isLoggedIn}
            onEnrolled={() => void load()}
          />
        </div>
        <CatalogToast message={toast} onClose={() => setToast(null)} />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-8">
      <div className="mx-auto max-w-[1400px] animate-pulse">
        <div className="mb-4 h-8 w-1/3 rounded bg-[#E8E4DC]" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[420px] rounded-3xl bg-[#E8E4DC]" />
          <div className="h-[420px] rounded-3xl bg-[#E8E4DC]" />
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-[#054742]/60" style={deck}>Loading course…</p>
      <CatalogToast message={toast} onClose={() => setToast(null)} />
    </main>
  )
}

export default function CourseLearnIndexPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FDFBF7] px-4 py-8">
          <div className="mx-auto max-w-[1400px] animate-pulse">
            <div className="h-[420px] rounded-3xl bg-[#E8E4DC]" />
          </div>
        </main>
      }
    >
      <LearnIndexContent params={params} />
    </Suspense>
  )
}
