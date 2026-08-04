export type CategorySummary = {
  id: string
  name: string
  slug: string
}

export type CourseListItem = {
  id: string
  slug: string
  title: string
  subtitle: string
  shortDescription: string
  level: string
  language: string
  thumbnailS3Key?: string
  thumbnailUrl?: string
  price: number
  currency: string
  durationMinutes: number
  category: CategorySummary
  isEnrolled: boolean
  publishedAt?: string
}

export type CourseListResponse = {
  courses: CourseListItem[]
  total: number
  page: number
  limit: number
}

export type LessonOutline = {
  id: string
  title: string
  description?: string
  contentType: 'VIDEO' | 'PDF' | 'TEXT' | 'HTML'
  durationSeconds: number
  sortOrder: number
  isPreview: boolean
  isLocked: boolean
  contentText?: string
  videoS3Key?: string
  videoUrl?: string
  videoFileName?: string
  thumbnailS3Key?: string
  thumbnailUrl?: string
}

export type ModuleOutline = {
  id: string
  title: string
  description: string
  sortOrder: number
  lessons: LessonOutline[]
}

export type CourseDetail = {
  id: string
  slug: string
  title: string
  subtitle: string
  shortDescription: string
  description: string
  level: string
  language: string
  thumbnailS3Key?: string
  thumbnailUrl?: string
  price: number
  currency: string
  durationMinutes: number
  learningOutcomes: string[]
  requirements: string[]
  targetAudience: string[]
  category: CategorySummary
  isEnrolled: boolean
  publishedAt?: string
  modules: ModuleOutline[]
}

export type CatalogCategory = {
  id: string
  name: string
  slug: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CategoryListResponse = {
  categories: CatalogCategory[]
  total: number
}

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type CourseListParams = {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  level?: CourseLevel | string
}

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export type EnrollmentResponse = {
  id: string
  courseId: string
  status: EnrollmentStatus
  enrolledAt: string
  completedAt?: string
}

export type EnrolledCourseItem = {
  enrollmentId: string
  enrolledAt: string
  status: string
  course: CourseListItem
}

export type EnrolledCourseListResponse = {
  enrollments: EnrolledCourseItem[]
  total: number
  page: number
  limit: number
}

export type InitiatePaymentResponse = {
  transactionId: string
  orderId: string
  paymentUrl: string
  encRequest?: string
  accessCode?: string
  mockMode?: boolean
  mockCompleteUrl?: string
}

export type CompleteMockPaymentResponse = {
  orderId: string
  orderStatus: string
  courseId: string
  enrollmentId: string
  enrollmentStatus: string
  paymentStatus: string
}
