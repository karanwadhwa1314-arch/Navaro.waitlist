'use client'

import Link from 'next/link'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import CourseCurriculum from '@/components/catalog/CourseCurriculum'
import CatalogToast, { CatalogSkeletonGrid } from '@/components/catalog/CatalogUi'
import { useCatalogAuth } from '@/hooks/useCatalogAuth'
import { getAccessToken } from '@/lib/auth/storage'
import { catalogApi } from '@/lib/lms/catalog-api'
import {
  buildLoginHref,
  canAccessLesson,
  formatCatalogDurationMinutes,
  formatCatalogLevel,
  formatCatalogPrice,
  getLessonHref,
  isFreeCourse,
} from '@/lib/lms/catalog-helpers'
import { courseThumbnailSrc } from '@/lib/media'
import { enrollmentApi } from '@/lib/lms/enrollment-api'
import { paymentApi } from '@/lib/lms/payment-api'
import { getCoursePaymentDetails } from '@/lib/payments/api'
import { startPayment } from '@/lib/payments/handlePayment'
import type { CoursePaymentDetails } from '@/lib/payments/types'
import type { CourseDetail } from '@/lib/lms/catalog-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

function BulletList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-[#2D4F4A]/80" style={deck}>{emptyLabel}</p>
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-[#2D4F4A]" style={deck}>
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#054742]" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function resolveCatalogToken(isLoggedIn: boolean, accessToken: string | null) {
  if (!isLoggedIn) return null
  return accessToken || getAccessToken()
}

function CourseDetailContent({ slug }: { slug: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, accessToken, authVersion } = useCatalogAuth()
  const paymentHandled = useRef(false)

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<CoursePaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [activeModule, setActiveModule] = useState(0)
  const [activeTab, setActiveTab] = useState<'description' | 'learning' | 'requirements' | 'audience'>('description')

  const refetchCourse = useCallback(async () => {
    const token = resolveCatalogToken(isLoggedIn, accessToken)
    const result = await catalogApi.getCourseBySlug(slug, token)
    if (result.success) {
      setCourse(result.data)
      return result.data
    }
    if (result.status === 404) setNotFound(true)
    else setToast(result.error)
    return null
  }, [slug, accessToken, isLoggedIn])

  const loadCourse = useCallback(async () => {
    setLoading(true)
    setNotFound(false)

    const data = await refetchCourse()
    setCourse(data)

    if (data && isLoggedIn && !data.isEnrolled && !isFreeCourse(data.price)) {
      const token = resolveCatalogToken(isLoggedIn, accessToken)
      if (token) {
        try {
          const details = await getCoursePaymentDetails(token, data.id)
          setPaymentDetails(details)
        } catch {
          setPaymentDetails(null)
        }
      }
    } else {
      setPaymentDetails(null)
    }

    setLoading(false)
  }, [refetchCourse, isLoggedIn, accessToken])

  useEffect(() => {
    void loadCourse()
  }, [loadCourse, authVersion])

  useEffect(() => {
    const payment = searchParams.get('payment')
    if (!payment || paymentHandled.current) return

    const token = resolveCatalogToken(isLoggedIn, accessToken)
    if (!token) return

    paymentHandled.current = true

    async function handlePaymentReturn() {
      if (payment === 'success') {
        setToast('Payment successful! You are now enrolled.')
        await refetchCourse()
      } else if (payment === 'failed') {
        setToast('Payment failed. Please try again.')
      }

      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', window.location.pathname)
      }
    }

    void handlePaymentReturn()
  }, [searchParams, isLoggedIn, accessToken, refetchCourse, slug])

  const firstUnlockedLesson = useMemo(() => {
    if (!course) return null
    for (const courseModule of course.modules) {
      const lesson = courseModule.lessons.find((item) => canAccessLesson(item))
      if (lesson) return lesson
    }
    return null
  }, [course])

  const loginHref = buildLoginHref(`/courses/${slug}`)
  const isFree = course ? isFreeCourse(course.price) : false

  async function handleEnroll() {
    if (!course || enrolling) return
    const token = resolveCatalogToken(isLoggedIn, accessToken)
    if (!token) {
      router.push(loginHref)
      return
    }

    setEnrolling(true)
    const result = await enrollmentApi.enrollInCourse(course.id, token)

    if (!result.success) {
      if (result.status === 401) {
        router.push(loginHref)
        setEnrolling(false)
        return
      }
      if (result.status === 409) {
        setToast('Enrolled successfully')
        await refetchCourse()
        setEnrolling(false)
        return
      }
      setToast(result.error)
      setEnrolling(false)
      return
    }

    setToast('Enrolled successfully')
    await refetchCourse()
    setEnrolling(false)
  }

  async function handlePurchase() {
    if (!course || purchasing) return
    const token = resolveCatalogToken(isLoggedIn, accessToken)
    if (!token) {
      router.push(loginHref)
      return
    }

    setPurchasing(true)
    try {
      const result = await paymentApi.initiateCoursePayment(course.id, token)
      if (!result.success) {
        if (result.status === 401) {
          router.push(loginHref)
        } else {
          setToast(result.error)
        }
        setPurchasing(false)
        return
      }
      startPayment(result.data)
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Failed to start payment')
      setPurchasing(false)
    }
  }

  function handlePrimaryCta() {
    if (!course) return

    if (!isLoggedIn) {
      router.push(loginHref)
      return
    }

    if (course.isEnrolled) {
      if (firstUnlockedLesson) {
        router.push(getLessonHref(course.slug, firstUnlockedLesson.id))
        return
      }
      document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    if (isFree) {
      void handleEnroll()
      return
    }

    void handlePurchase()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <CatalogSkeletonGrid count={1} />
        </div>
      </main>
    )
  }

  if (notFound || !course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4">
        <div className="text-center">
          <h1 className="mb-3 text-3xl font-bold text-[#054742]" style={display}>Course not found</h1>
          <Link href="/courses" className="rounded-xl bg-[#054742] px-5 py-3 text-sm font-semibold text-white no-underline" style={deck}>
            Back to catalog
          </Link>
        </div>
      </main>
    )
  }

  const thumbnail = courseThumbnailSrc(course)
  const showBuyButton =
    isLoggedIn &&
    !course.isEnrolled &&
    !isFree &&
    (paymentDetails?.paymentRequired ?? course.price > 0)

  const ctaLabel = !isLoggedIn
    ? isFree
      ? 'Sign in to enroll'
      : 'Sign in to purchase'
    : course.isEnrolled
      ? 'Continue learning'
      : isFree
        ? 'Enroll for free'
        : showBuyButton
          ? `Buy now — ${formatCatalogPrice(paymentDetails?.amount ?? course.price, paymentDetails?.currency ?? course.currency)}`
          : `Buy now — ${formatCatalogPrice(course.price, course.currency)}`

  const ctaBusy = enrolling || purchasing
  const ctaBusyLabel = enrolling ? 'Enrolling…' : 'Processing…'

  return (
    <>
      <main className="min-h-screen bg-[#FDFBF7] px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-[1200px]">
          <Link href="/courses" className="mb-6 inline-flex text-sm font-semibold text-[#054742] no-underline hover:underline" style={deck}>
            ← Back to catalog
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              {course.category?.name && (
                <span className="mb-4 inline-block rounded-lg bg-[#FBEBA9] px-4 py-1.5 text-sm font-medium text-[#1A1A1A]" style={deck}>
                  {course.category.name}
                </span>
              )}

              <h1 className="mb-3 text-[clamp(2rem,4vw,3.2rem)] font-bold uppercase text-[#1A1A1A]" style={display}>
                {course.title}
              </h1>

              {course.subtitle && (
                <p className="mb-4 text-lg font-medium text-[#054742]" style={deck}>{course.subtitle}</p>
              )}

              <p className="mb-6 max-w-3xl text-base leading-relaxed text-[#2D4F4A]" style={deck}>
                {course.shortDescription || course.description}
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#054742] ring-1 ring-[#D1CEC9]" style={deck}>
                  {formatCatalogLevel(course.level)}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#054742] ring-1 ring-[#D1CEC9]" style={deck}>
                  {course.language}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#054742] ring-1 ring-[#D1CEC9]" style={deck}>
                  {formatCatalogDurationMinutes(course.durationMinutes)}
                </span>
                {course.isEnrolled && (
                  <span className="rounded-full bg-[#E9F8F0] px-3 py-1 text-xs font-semibold text-[#087A48]" style={deck}>
                    Enrolled
                  </span>
                )}
              </div>
            </div>

            <aside className="space-y-4">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={course.title}
                  className="h-56 w-full rounded-3xl object-cover md:h-72"
                  onError={() => void refetchCourse()}
                />
              ) : (
                <div className="flex h-56 items-center justify-center rounded-3xl bg-[#E8F0EE] text-sm text-[#054742]/50 md:h-72" style={deck}>
                  Course thumbnail
                </div>
              )}

              <div id="enroll" className="rounded-3xl border border-[#D1CEC9] bg-white p-6 shadow-sm">
                <p className="mb-2 text-3xl font-bold text-[#054742]" style={display}>
                  {formatCatalogPrice(course.price, course.currency)}
                </p>
                <button
                  type="button"
                  onClick={handlePrimaryCta}
                  disabled={ctaBusy}
                  className="mt-4 w-full rounded-full bg-[#C486F1] px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-60"
                  style={deck}
                >
                  {ctaBusy ? ctaBusyLabel : ctaLabel}
                </button>
              </div>
            </aside>
          </div>

          <div className="mt-10">
            <div className="mb-6 flex flex-wrap gap-4 border-b border-[#D1CEC9] text-sm font-semibold" style={deck}>
              {([
                ['description', 'Description'],
                ['learning', "What you'll learn"],
                ['requirements', 'Requirements'],
                ['audience', 'Target audience'],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 transition ${activeTab === tab ? 'border-b-2 border-[#054742] text-[#054742]' : 'text-[#054742]/45 hover:text-[#054742]'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="rounded-3xl border border-[#D1CEC9] bg-white p-6 md:p-8">
              {activeTab === 'description' && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#2D4F4A] md:text-base" style={deck}>
                  {course.description || 'Course description will be available soon.'}
                </p>
              )}
              {activeTab === 'learning' && (
                <BulletList items={course.learningOutcomes} emptyLabel="Learning outcomes will be published soon." />
              )}
              {activeTab === 'requirements' && (
                <BulletList items={course.requirements} emptyLabel="No specific requirements listed." />
              )}
              {activeTab === 'audience' && (
                <BulletList items={course.targetAudience} emptyLabel="Target audience details will be published soon." />
              )}
            </div>
          </div>

          <CourseCurriculum
            course={course}
            isLoggedIn={isLoggedIn}
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            onMediaError={() => void refetchCourse()}
          />
        </div>
      </main>

      <CatalogToast message={toast} onClose={() => setToast(null)} />
    </>
  )
}

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FDFBF7] px-4 py-10 md:px-8">
          <div className="mx-auto max-w-[1200px]">
            <CatalogSkeletonGrid count={1} />
          </div>
        </main>
      }
    >
      <CourseDetailContent slug={params.slug} />
    </Suspense>
  )
}
