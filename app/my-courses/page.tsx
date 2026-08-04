'use client'

import Link from 'next/link'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import CatalogCourseCard from '@/components/catalog/CatalogCourseCard'
import CatalogToast, { CatalogPageShell, CatalogSkeletonGrid } from '@/components/catalog/CatalogUi'
import { useCatalogAuth } from '@/hooks/useCatalogAuth'
import { buildLoginHref } from '@/lib/lms/catalog-helpers'
import { enrollmentApi } from '@/lib/lms/enrollment-api'
import type { EnrolledCourseItem } from '@/lib/lms/catalog-types'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

function formatEnrolledDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function MyCoursesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, accessToken, authVersion } = useCatalogAuth()

  const page = Math.max(1, Number(searchParams.get('page') || '1') || 1)
  const limit = 20

  const [enrollments, setEnrollments] = useState<EnrolledCourseItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const loadEnrollments = useCallback(async (options?: { silent?: boolean }) => {
    if (!isLoggedIn || !accessToken) {
      setEnrollments([])
      setTotal(0)
      setLoading(false)
      return
    }

    if (!options?.silent) {
      setLoading(true)
    }
    const result = await enrollmentApi.getMyEnrolledCourses(page, limit, accessToken)

    if (!result.success) {
      if (result.status === 401) {
        router.replace(buildLoginHref('/my-courses'))
        return
      }
      setEnrollments([])
      setTotal(0)
      setToast(result.error)
      setLoading(false)
      return
    }

    setEnrollments(result.data.enrollments)
    setTotal(result.data.total)
    setLoading(false)
  }, [isLoggedIn, accessToken, page, limit, router])

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace(buildLoginHref('/my-courses'))
      return
    }
    void loadEnrollments()
  }, [isLoggedIn, loadEnrollments, authVersion, router])

  return (
    <>
      <CatalogPageShell
        title="My Courses"
        subtitle="Courses you have enrolled in. Pick up where you left off."
      >
        {loading ? (
          <CatalogSkeletonGrid count={3} />
        ) : enrollments.length === 0 ? (
          <div className="rounded-3xl border border-[#D1CEC9] bg-white px-6 py-16 text-center">
            <p className="mb-4 text-lg font-semibold text-[#054742]" style={deck}>
              You haven&apos;t enrolled in any courses yet
            </p>
            <Link
              href="/courses"
              className="inline-flex rounded-full bg-[#054742] px-6 py-3 text-sm font-semibold text-white no-underline"
              style={deck}
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {enrollments.map((item) => (
                <div key={item.enrollmentId} className="flex flex-col gap-2">
                  <CatalogCourseCard
                    course={item.course}
                    onThumbnailError={() => void loadEnrollments({ silent: true })}
                  />
                  {item.enrolledAt && (
                    <p className="px-1 text-xs text-[#054742]/60" style={deck}>
                      Enrolled {formatEnrolledDate(item.enrolledAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <Link
                  href={page > 1 ? `/my-courses?page=${page - 1}` : '#'}
                  aria-disabled={page <= 1}
                  className={`rounded-full px-4 py-2 text-sm font-semibold no-underline ${
                    page <= 1
                      ? 'pointer-events-none bg-[#E8E4DC] text-[#054742]/40'
                      : 'bg-white text-[#054742] ring-1 ring-[#D1CEC9] hover:bg-[#F8F6F1]'
                  }`}
                  style={deck}
                >
                  Previous
                </Link>
                <span className="text-sm text-[#054742]" style={deck}>
                  Page {page} of {totalPages}
                </span>
                <Link
                  href={page < totalPages ? `/my-courses?page=${page + 1}` : '#'}
                  aria-disabled={page >= totalPages}
                  className={`rounded-full px-4 py-2 text-sm font-semibold no-underline ${
                    page >= totalPages
                      ? 'pointer-events-none bg-[#E8E4DC] text-[#054742]/40'
                      : 'bg-white text-[#054742] ring-1 ring-[#D1CEC9] hover:bg-[#F8F6F1]'
                  }`}
                  style={deck}
                >
                  Next
                </Link>
              </div>
            )}
          </>
        )}
      </CatalogPageShell>

      <CatalogToast message={toast} onClose={() => setToast(null)} />
    </>
  )
}

export default function MyCoursesPage() {
  return (
    <Suspense
      fallback={
        <CatalogPageShell title="My Courses">
          <CatalogSkeletonGrid count={3} />
        </CatalogPageShell>
      }
    >
      <MyCoursesContent />
    </Suspense>
  )
}
