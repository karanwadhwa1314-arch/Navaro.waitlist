export interface CourseProgress {
  courseId: string
  totalLessons: number
  completedLessons: number
  progressPercent: number
  lessons: Record<string, boolean>
}

export interface CompleteLessonResponse {
  lessonId: string
  isCompleted: boolean
  completedAt: string
}
