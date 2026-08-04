'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { refreshAccessToken } from '@/lib/auth/refresh'
import { getAccessToken } from '@/lib/auth/storage'
import { catalogApi } from '@/lib/lms/catalog-api'
import type { CourseListItem } from '@/lib/lms/catalog-types'

const displayFont = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const bodyFont = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

type ApiCourse = CourseListItem

type CourseCard = {
  id: string
  slug: string
  badge: string
  badgeBg: string
  badgeText: string
  title: string
  description: string
  price: string
  originalPrice?: string
  tags: string[]
  topics: string[]
  cardBg: string
  textColor: string
  subTextColor: string
  tagBg: string
  tagText: string
  btnBg: string
  btnText: string
  btnIconBg: string
}

const CARD_THEMES = [
  {
    badgeBg: '#C486F1',
    badgeText: '#1A1A1A',
    cardBg: '#DFC6F7',
    textColor: '#1A1A1A',
    subTextColor: 'rgba(26,26,26,0.65)',
    tagBg: 'rgba(26,26,26,0.10)',
    tagText: '#1A1A1A',
    btnBg: '#ffffff',
    btnText: '#1A1A1A',
    btnIconBg: '#1A1A1A',
  },
  {
    badgeBg: '#0a6b63',
    badgeText: '#ffffff',
    cardBg: '#054742',
    textColor: '#ffffff',
    subTextColor: 'rgba(255,255,255,0.65)',
    tagBg: 'rgba(255,255,255,0.15)',
    tagText: '#ffffff',
    btnBg: '#ffffff',
    btnText: '#054742',
    btnIconBg: '#054742',
  },
] as const

function formatLevel(level?: string) {
  const normalized = level?.trim().toUpperCase()
  if (normalized === 'BEGINNER') return 'Beginner'
  if (normalized === 'INTERMEDIATE') return 'Intermediate'
  if (normalized === 'ADVANCED') return 'Advanced'
  return level || 'Course'
}

function formatDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return 'Self-Paced'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
  if (hours > 0) return `${hours}h`
  return `${mins} min`
}

function formatCoursePrice(price?: number, currency = 'INR') {
  if (!price || price === 0) return 'Free'
  if (currency === 'INR') return `₹${price.toLocaleString('en-IN')}`
  return `${currency} ${price.toLocaleString('en-IN')}`
}

function mapCourseToCard(course: ApiCourse, index: number): CourseCard {
  const theme = CARD_THEMES[index % CARD_THEMES.length]
  const topics = [
    course.category?.name,
    formatLevel(course.level),
    course.language,
    course.shortDescription,
    course.subtitle,
    course.isEnrolled ? 'Enrolled' : null,
  ].filter((item): item is string => !!item?.trim())

  return {
    id: course.id,
    slug: course.slug,
    badge: course.category?.name || formatLevel(course.level),
    ...theme,
    title: course.title,
    description:
      course.subtitle ||
      course.shortDescription ||
      'Explore this course to build practical skills step by step.',
    price: formatCoursePrice(course.price, course.currency),
    tags: [formatDuration(course.durationMinutes), course.language || 'English'],
    topics: topics.length > 0 ? topics : ['Course details coming soon'],
  }
}

async function fetchCourses(): Promise<{ courses: ApiCourse[]; error?: string }> {
  let token = getAccessToken()
  if (!token) {
    const refreshed = await refreshAccessToken()
    token = refreshed?.access_token ?? null
  }

  const result = await catalogApi.getCourses({ page: 1, limit: 20 }, token)
  if (!result.success) {
    return { courses: [], error: result.error }
  }

  return { courses: result.data.courses }
}

function HeroCubeDecorationLeft() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-0 flex select-none flex-col items-start justify-center"
      aria-hidden
    >
      <img
        src="/image/course%20cube%20box.png"
        alt=""
        className="w-[clamp(80px,14vw,160px)] -translate-x-[30%] -translate-y-[-45%] object-contain opacity-90"
      />
      <img
        src="/image/course%20cube%20box.png"
        alt=""
        className="w-[clamp(140px,24vw,280px)] -translate-x-[10%] object-contain opacity-90"
      />
    </div>
  )
}

function HeroCubeDecorationRight() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 flex select-none flex-col items-end justify-center"
      aria-hidden
    >
      <img
        src="/image/course%20cube%20box.png"
        alt=""
        className="w-[clamp(80px,14vw,160px)] translate-x-[30%] -translate-y-[-45%] object-contain opacity-90 scale-x-[-1]"
      />
      <img
        src="/image/course%20cube%20box.png"
        alt=""
        className="w-[clamp(140px,24vw,280px)] translate-x-[10%] object-contain opacity-90 scale-x-[-1]"
      />
    </div>
  )
}

function CubeButtonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 7L10 10L17 7" stroke="black" strokeWidth="1.56863" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 18V10" stroke="black" strokeWidth="1.56863" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M8.27503 2.06706L3.82503 4.53373C2.8167 5.09206 1.9917 6.49206 1.9917 7.64206V12.3504C1.9917 13.5004 2.8167 14.9004 3.82503 15.4587L8.27503 17.9337C9.22503 18.4587 10.7834 18.4587 11.7334 17.9337L16.1834 15.4587C17.1917 14.9004 18.0167 13.5004 18.0167 12.3504V7.64206C18.0167 6.49206 17.1917 5.09206 16.1834 4.53373L11.7334 2.05873C10.775 1.53373 9.22503 1.53373 8.27503 2.06706Z"
        stroke="black"
        strokeWidth="1.56863"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="mt-0.5 shrink-0">
      <path d="M2.5 7L5.5 10L11.5 4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function CoursePage() {
  const [courses, setCourses] = useState<CourseCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCourses = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchCourses()
    setCourses(result.courses.map(mapCourseToCard))
    setError(result.error ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadCourses()
  }, [loadCourses])

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <section className="relative flex min-h-[calc(100vh-88px)] items-center justify-center overflow-hidden px-4 py-12 md:py-18">
        <HeroCubeDecorationLeft />
        <HeroCubeDecorationRight />

        <div className="relative z-10 mx-auto w-full max-w-[920px] text-center">
          <h1
            className="mb-6 text-[clamp(2rem,5.5vw,4rem)] font-bold uppercase leading-[1.08] tracking-tight text-[#1A1A1A]"
            style={displayFont}
          >
            Learn shipping from basics
            <br />
            to advanced.
          </h1>

          <p
            className="mx-auto mb-10 max-w-[520px] text-sm leading-relaxed text-[#2D4F4A] md:text-base md:leading-[1.65]"
            style={bodyFont}
          >
            Structured courses designed to help you understand logistics, shipping operations, and cost
            optimization step by step.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <a
              href="#courses"
              className="inline-flex items-center gap-2 rounded-full bg-[#C486F1] px-6 py-3 text-sm font-medium text-black no-underline transition-opacity hover:opacity-90 md:text-base"
              style={bodyFont}
            >
              Explore our Courses
              <CubeButtonIcon />
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-[#1E1E1E] px-6 py-3 text-sm font-medium text-[#1E1E1E] no-underline transition-colors hover:bg-[#1E1E1E] hover:text-white md:text-base"
              style={bodyFont}
            >
              Learn about Tools
            </Link>
          </div>
        </div>
      </section>

      <section id="courses" className="bg-[#FDFBF7] px-4 py-12 md:py-18">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-6 flex justify-center">
            <span
              className="rounded-full border border-dashed border-[#1E1E1E]/30 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#1E1E1E]"
              style={bodyFont}
            >
              Our Courses
            </span>
          </div>

          <h2
            className="mb-4 text-center text-[clamp(1.8rem,4vw,3rem)] font-bold uppercase leading-tight text-[#1A1A1A]"
            style={displayFont}
          >
            Courses We Have
          </h2>
          <p
            className="mx-auto mb-12 max-w-[520px] text-center text-sm leading-relaxed text-[#2D4F4A] md:text-base"
            style={bodyFont}
          >
            Start with the fundamentals or advance your expertise in maritime logistics with structured
            learning designed for real-world shipping operations.
          </p>

          {loading && (
            <p className="py-10 text-center text-sm text-[#888]" style={bodyFont}>
              Loading courses...
            </p>
          )}

          {!loading && error && (
            <div className="py-10 text-center">
              <p className="mb-4 text-sm text-red-600" style={bodyFont}>
                {error}
              </p>
              <button
                type="button"
                onClick={() => void loadCourses()}
                className="rounded-xl bg-[#054742] px-5 py-2.5 text-sm font-semibold text-white"
                style={bodyFont}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <p className="py-10 text-center text-sm text-[#888]" style={bodyFont}>
              No courses found.
            </p>
          )}

          {!loading && !error && courses.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="flex w-full flex-col rounded-3xl p-7 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] md:p-8"
                  style={{ backgroundColor: c.cardBg }}
                >
                  <div className="mb-4">
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-semibold"
                      style={{ backgroundColor: c.badgeBg, color: c.badgeText, ...bodyFont }}
                    >
                      {c.badge}
                    </span>
                  </div>

                  <h3 className="mb-1 text-2xl font-bold md:text-3xl" style={{ color: c.textColor, ...displayFont }}>
                    {c.title}
                  </h3>

                  <p className="mb-5 text-sm" style={{ color: c.subTextColor, ...bodyFont }}>
                    {c.description}
                  </p>

                  <div className="mb-5 flex items-baseline gap-3">
                    <span className="text-3xl font-bold" style={{ color: c.textColor, ...displayFont }}>
                      {c.price}
                    </span>
                    {c.originalPrice && (
                      <span className="text-lg line-through" style={{ color: c.subTextColor, ...bodyFont }}>
                        {c.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{ backgroundColor: c.tagBg, color: c.tagText, ...bodyFont }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="mb-3 text-sm font-semibold" style={{ color: c.textColor, ...bodyFont }}>
                    Topics Covered
                  </p>
                  <ul className="mb-8 space-y-2">
                    {c.topics.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm" style={{ color: c.textColor, ...bodyFont }}>
                        <CheckIcon color={c.textColor} />
                        {t}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <Link
                      href={`/courses/${encodeURIComponent(c.slug)}`}
                      className="flex items-center justify-between rounded-2xl px-5 py-3.5 text-sm font-semibold no-underline transition-opacity hover:opacity-80"
                      style={{ backgroundColor: c.btnBg, color: c.btnText, ...bodyFont }}
                    >
                      View Course
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-xl"
                        style={{ backgroundColor: c.btnIconBg }}
                      >
                        <ArrowIcon color={c.btnBg} />
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#FDFBF7] px-4 pb-20 pt-8 md:pb-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 text-center">
            <h2
              className="mb-2 text-[clamp(1.6rem,3.5vw,2.6rem)] font-bold uppercase tracking-tight text-[#1A1A1A]"
              style={displayFont}
            >
              Try Navaro Tools
            </h2>
            <p className="text-sm text-[#2D4F4A] md:text-base" style={bodyFont}>
              See how our tools work, no sign-up required
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {[
              {
                img: '/landing/img/cbm-calc.png',
                imgAlt: 'CBM Calculator',
                imgBg: '#EDE5F7',
                cardBg: '#DCB7EB',
                badge: 'Free To Use',
                badgeBg: '#C780ED',
                title: 'CBM Calculator',
                desc: 'Calculate container volume and see how your cargo fits with a 3D view.',
                btnLabel: 'Try CBM Calculator',
                href: '/tools/cbm',
              },
              {
                img: '/landing/img/lcc-calc.png',
                imgAlt: 'Landed Cost Calculator',
                imgBg: '#FDF5D0',
                cardBg: '#FBEBA9',
                badge: 'Free To Use',
                badgeBg: '#F9DB5F',
                title: 'Landed Cost Calculator',
                desc: 'See the real cost of your shipment before you commit.',
                btnLabel: 'Try Cost Calculator',
                href: '/tools/duty',
              },
              {
                img: '/landing/img/aidac.png',
                imgAlt: 'AI Document Checker',
                imgBg: '#C5F0E8',
                cardBg: '#9EE4D7',
                badge: 'Free To Use',
                badgeBg: '#3ECEB9',
                title: 'AI Document Checker',
                desc: 'Scan export documents for errors before customs.',
                btnLabel: 'Try Document Checker',
                href: '/tools/pdf-comparison',
              },
            ].map((tool) => (
              <div key={tool.title} className="flex w-full flex-col gap-3 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                <div className="overflow-hidden rounded-2xl" style={{ backgroundColor: tool.imgBg }}>
                  <img src={tool.img} alt={tool.imgAlt} className="h-[220px] w-full object-cover md:h-[260px]" />
                </div>

                <div className="rounded-2xl p-5" style={{ backgroundColor: tool.cardBg }}>
                  <span
                    className="mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-semibold text-[#1A1A1A]"
                    style={{ backgroundColor: tool.badgeBg, ...bodyFont }}
                  >
                    {tool.badge}
                  </span>

                  <h3 className="mb-4 text-2xl font-bold text-[#054742] md:text-3xl" style={displayFont}>
                    {tool.title}
                  </h3>

                  <div className="flex items-end justify-between gap-4">
                    <p className="max-w-[55%] text-sm leading-relaxed text-[#1A1A1A]/75" style={bodyFont}>
                      {tool.desc}
                    </p>
                    <Link
                      href={tool.href}
                      className="shrink-0 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#1A1A1A] no-underline transition-opacity hover:opacity-80"
                      style={bodyFont}
                    >
                      {tool.btnLabel}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
