'use client'

import Link from 'next/link'
import { useState } from 'react'

import { getAccessToken } from '@/lib/auth/storage'
import { enrollmentApi } from '@/lib/lms/enrollment-api'
import { paymentApi } from '@/lib/lms/payment-api'
import { buildLoginHref, isFreeCourse } from '@/lib/lms/catalog-helpers'
import type { CourseDetail } from '@/lib/lms/catalog-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function LearnEnrollBanner({
  course,
  isLoggedIn,
  onEnrolled,
}: {
  course: CourseDetail
  isLoggedIn: boolean
  onEnrolled?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-[#FDECEC] bg-[#FFF8F8] p-6 text-center">
        <p className="mb-2 text-lg font-semibold text-[#054742]" style={display}>Sign in required</p>
        <p className="mb-4 text-sm text-[#2D4F4A]" style={deck}>Sign in to enroll and unlock all lessons.</p>
        <Link
          href={buildLoginHref(`/courses/${course.slug}/learn`)}
          className="inline-flex rounded-full bg-[#054742] px-6 py-3 text-sm font-semibold text-white no-underline"
          style={deck}
        >
          Sign in
        </Link>
      </div>
    )
  }

  const handleEnroll = async () => {
    setLoading(true)
    setError('')
    const token = getAccessToken()
    if (!token) return

    if (isFreeCourse(course.price)) {
      const result = await enrollmentApi.enrollInCourse(course.id, token)
      setLoading(false)
      if (result.success) {
        onEnrolled?.()
      } else {
        setError(result.error)
      }
      return
    }

    const payResult = await paymentApi.handleBuyNow(course, token)
    setLoading(false)
    if (!payResult.success) setError(payResult.error)
  }

  return (
    <div className="rounded-2xl border border-[#FDECEC] bg-[#FFF8F8] p-6 text-center">
      <p className="mb-2 text-lg font-semibold text-[#054742]" style={display}>Enrollment required</p>
      <p className="mb-4 text-sm text-[#2D4F4A]" style={deck}>
        {isFreeCourse(course.price)
          ? 'Enroll for free to access all lessons in this course.'
          : 'Purchase this course to unlock all lessons.'}
      </p>
      {error && <p className="mb-3 text-sm text-[#C0392B]" style={deck}>{error}</p>}
      <button
        type="button"
        onClick={() => void handleEnroll()}
        disabled={loading}
        className="rounded-full bg-[#054742] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        style={deck}
      >
        {loading ? 'Please wait…' : isFreeCourse(course.price) ? 'Enroll for free' : 'Buy now'}
      </button>
      <p className="mt-3">
        <Link href={`/courses/${encodeURIComponent(course.slug)}`} className="text-xs font-semibold text-[#054742] no-underline hover:underline" style={deck}>
          Back to course page
        </Link>
      </p>
    </div>
  )
}
