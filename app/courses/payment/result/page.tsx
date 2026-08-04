'use client'

import Link from 'next/link'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { useCatalogAuth } from '@/hooks/useCatalogAuth'
import { catalogApi } from '@/lib/lms/catalog-api'
import { buildLoginHref } from '@/lib/lms/catalog-helpers'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

function PaymentResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, accessToken, authVersion } = useCatalogAuth()

  const success = searchParams.get('success') === 'true'
  const slug = searchParams.get('slug') || ''
  const [confirmedEnrolled, setConfirmedEnrolled] = useState<boolean | null>(null)

  const verifyEnrollment = useCallback(async () => {
    if (!success || !slug || !isLoggedIn) {
      setConfirmedEnrolled(null)
      return
    }

    const result = await catalogApi.getCourseBySlug(slug, accessToken)
    if (!result.success) {
      setConfirmedEnrolled(null)
      return
    }

    setConfirmedEnrolled(result.data.isEnrolled)
  }, [success, slug, isLoggedIn, accessToken])

  useEffect(() => {
    if (!isLoggedIn) {
      const query = searchParams.toString()
      const returnPath = query ? `/courses/payment/result?${query}` : '/courses/payment/result'
      router.replace(buildLoginHref(returnPath))
      return
    }
    void verifyEnrollment()
  }, [isLoggedIn, verifyEnrollment, authVersion, router, searchParams])

  const courseHref = slug ? `/courses/${encodeURIComponent(slug)}` : '/courses'

  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-[#D1CEC9] bg-white p-8 text-center shadow-sm">
          {success ? (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E9F8F0] text-3xl text-[#087A48]">
                ✓
              </div>
              <h1 className="mb-3 text-2xl font-bold text-[#054742]" style={display}>
                Payment successful
              </h1>
              <p className="mb-2 text-sm text-[#2D4F4A]" style={deck}>
                Your course enrollment is being confirmed.
              </p>
              {confirmedEnrolled === true && (
                <p className="mb-6 text-sm font-semibold text-[#087A48]" style={deck}>
                  Enrollment confirmed — you can start learning now.
                </p>
              )}
              {confirmedEnrolled === false && (
                <p className="mb-6 text-sm text-[#2D4F4A]/80" style={deck}>
                  Payment received. If lessons are still locked, refresh the course page in a moment.
                </p>
              )}
              {confirmedEnrolled === null && slug && (
                <p className="mb-6 text-sm text-[#2D4F4A]/80" style={deck}>
                  Verifying enrollment…
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/my-courses"
                  className="rounded-full bg-[#054742] px-6 py-3 text-sm font-semibold text-white no-underline"
                  style={deck}
                >
                  My Courses
                </Link>
                <Link
                  href={courseHref}
                  className="rounded-full bg-[#C486F1] px-6 py-3 text-sm font-semibold text-[#1A1A1A] no-underline"
                  style={deck}
                >
                  {slug ? 'Back to course' : 'Browse courses'}
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDECEC] text-3xl text-[#C0392B]">
                ✕
              </div>
              <h1 className="mb-3 text-2xl font-bold text-[#054742]" style={display}>
                Payment failed
              </h1>
              <p className="mb-6 text-sm text-[#2D4F4A]" style={deck}>
                Your payment could not be completed. You can try again from the course page.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href={courseHref}
                  className="rounded-full bg-[#054742] px-6 py-3 text-sm font-semibold text-white no-underline"
                  style={deck}
                >
                  {slug ? 'Retry purchase' : 'Browse courses'}
                </Link>
                <Link
                  href="/courses"
                  className="rounded-full border border-[#D1CEC9] px-6 py-3 text-sm font-semibold text-[#054742] no-underline"
                  style={deck}
                >
                  Course catalog
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#054742] border-t-transparent" />
        </main>
      }
    >
      <PaymentResultContent />
    </Suspense>
  )
}
