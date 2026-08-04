export type AssessmentType = 'QUIZ' | 'ASSIGNMENT'
export type QuestionType = 'MCQ' | 'TRUE_FALSE'
export type SubmissionStatus = 'SUBMITTED' | 'GRADED'

export type UserAssessmentListItem = {
  id: string
  type: AssessmentType
  title: string
  description: string
  moduleId?: string | null
  lessonId?: string | null
  passingScorePercent?: number
  maxAttempts?: number
  maxScore: number
  dueAt?: string | null
  isRequired: boolean
  isLocked: boolean
  attemptCount: number
  bestScore?: number | null
  passed: boolean
}

export type UserAssessmentListResponse = {
  assessments: UserAssessmentListItem[]
  total: number
}

export type UserQuizOption = {
  id: string
  optionText: string
  sortOrder: number
}

export type UserQuizQuestion = {
  id: string
  questionText: string
  questionType: QuestionType
  points: number
  sortOrder: number
  options: UserQuizOption[]
}

export type UserQuizDetailResponse = {
  id: string
  title: string
  instructions: string
  passingScorePercent: number
  maxAttempts: number
  maxScore: number
  attemptCount: number
  questions: UserQuizQuestion[]
}

export type StartQuizResponse = {
  attemptId: string
  startedAt: string
}

export type SubmitQuizRequest = {
  attemptId: string
  answers: { questionId: string; selectedOptionId: string }[]
}

export type SubmitQuizResponse = {
  attemptId: string
  score: number
  maxScore: number
  passed: boolean
  submittedAt: string
}

export type AssignmentSubmission = {
  id: string
  assessmentId: string
  contentText: string
  status: SubmissionStatus
  score?: number | null
  maxScore: number
  feedback?: string
  submittedAt: string
  gradedAt?: string | null
}

export type UserAssignmentDetailResponse = {
  id: string
  title: string
  instructions: string
  maxScore: number
  dueAt?: string | null
  submission?: AssignmentSubmission
}
