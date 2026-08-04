'use client'

import { lessonThumbnailSrc, lessonVideoSrc } from '@/lib/media'
import type { LessonOutline } from '@/lib/lms/catalog-types'

export default function LessonVideoPlayer({
  lesson,
  onEnded,
  onMediaError,
}: {
  lesson: LessonOutline
  onEnded?: () => void
  onMediaError?: () => void
}) {
  const src = lessonVideoSrc(lesson)
  const poster = lessonThumbnailSrc(lesson) || undefined

  if (!src) {
    return <p className="text-sm text-[#2D4F4A]">Video is not available.</p>
  }

  return (
    <video
      key={lesson.videoUrl || lesson.id}
      src={src}
      controls
      controlsList="nodownload"
      poster={poster}
      onEnded={onEnded}
      onError={onMediaError}
      className="aspect-video w-full rounded-2xl bg-black"
    />
  )
}
