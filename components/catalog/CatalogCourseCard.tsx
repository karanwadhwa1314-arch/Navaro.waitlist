'use client'

import Link from 'next/link'

import {
  formatCatalogDurationMinutes,
  formatCatalogLevel,
  formatCatalogPrice,
} from '@/lib/lms/catalog-helpers'
import { courseThumbnailSrc } from '@/lib/media'
import type { CourseListItem } from '@/lib/lms/catalog-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

function CourseThumbnail({
  course,
  onThumbnailError,
}: {
  course: CourseListItem
  onThumbnailError?: () => void
}) {
  const src = courseThumbnailSrc(course)

  if (!src) {
    return <div className="flex h-44 items-center justify-center bg-[#E8F0EE] text-sm text-[#054742]/50" style={deck}>Course</div>
  }

  return (
    <img
      src={src}
      alt={course.title}
      className="h-44 w-full object-cover"
      loading="lazy"
      onError={() => onThumbnailError?.()}
    />
  )
}

export default function CatalogCourseCard({
  course,
  onThumbnailError,
}: {
  course: CourseListItem
  onThumbnailError?: () => void
}) {
  return (
    <Link
      href={`/courses/${encodeURIComponent(course.slug)}`}
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#E8E4DC] bg-white shadow-sm no-underline transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <CourseThumbnail course={course} onThumbnailError={onThumbnailError} />

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {course.category?.name && (
            <span className="rounded-full bg-[#FBEBA9] px-3 py-1 text-[11px] font-semibold text-[#1A1A1A]" style={deck}>
              {course.category.name}
            </span>
          )}
          {course.isEnrolled && (
            <span className="rounded-full bg-[#E9F8F0] px-3 py-1 text-[11px] font-semibold text-[#087A48]" style={deck}>
              Enrolled
            </span>
          )}
        </div>

        <h2 className="mb-2 text-xl font-bold text-[#054742]" style={display}>
          {course.title}
        </h2>

        <p className="mb-4 line-clamp-3 text-sm text-[#2D4F4A]/80" style={deck}>
          {course.shortDescription || course.subtitle || 'Explore this course to build practical skills.'}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <span className="text-lg font-bold text-[#054742]" style={display}>
            {formatCatalogPrice(course.price, course.currency)}
          </span>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#F5F1E8] px-3 py-1 text-xs font-medium text-[#054742]" style={deck}>
              {formatCatalogLevel(course.level)}
            </span>
            <span className="rounded-full bg-[#F5F1E8] px-3 py-1 text-xs font-medium text-[#054742]" style={deck}>
              {formatCatalogDurationMinutes(course.durationMinutes)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
