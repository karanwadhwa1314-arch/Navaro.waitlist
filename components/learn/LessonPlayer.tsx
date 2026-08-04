'use client'

import LessonLockedCard from '@/components/learn/LessonLockedCard'
import LessonPdfViewer from '@/components/learn/LessonPdfViewer'
import LessonTextContent from '@/components/learn/LessonTextContent'
import LessonVideoPlayer from '@/components/learn/LessonVideoPlayer'
import type { CourseDetail, LessonOutline } from '@/lib/lms/catalog-types'

export default function LessonPlayer({
  lesson,
  course,
  isLoggedIn,
  onVideoEnded,
  onEnrolled,
  onMediaError,
}: {
  lesson: LessonOutline
  course: CourseDetail
  isLoggedIn: boolean
  onVideoEnded?: () => void
  onEnrolled?: () => void
  onMediaError?: () => void
}) {
  if (lesson.isLocked) {
    return (
      <LessonLockedCard
        lesson={lesson}
        course={course}
        isLoggedIn={isLoggedIn}
        onEnrolled={onEnrolled}
      />
    )
  }

  if (lesson.contentType === 'TEXT' || lesson.contentType === 'HTML') {
    return <LessonTextContent lesson={lesson} />
  }

  if (lesson.contentType === 'PDF') {
    return <LessonPdfViewer lesson={lesson} onMediaError={onMediaError} />
  }

  return <LessonVideoPlayer lesson={lesson} onEnded={onVideoEnded} onMediaError={onMediaError} />
}
