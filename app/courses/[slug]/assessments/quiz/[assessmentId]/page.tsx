'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import EnrollRequiredBanner from '@/components/assessments/AssessmentShared'
import QuizIntro from '@/components/assessments/QuizIntro'
import QuizPlayer from '@/components/assessments/QuizPlayer'
import QuizResultCard from '@/components/assessments/QuizResultCard'
import QuizSubmitBar from '@/components/assessments/QuizSubmitBar'
import CatalogToast from '@/components/catalog/CatalogUi'
import { useCatalogAuth } from '@/hooks/useCatalogAuth'
import { getAccessToken } from '@/lib/auth/storage'
import { assessmentApi } from '@/lib/lms/assessment-api'
import { buildLoginHref, getQuizAttemptStorageKey } from '@/lib/lms/catalog-helpers'
import type { SubmitQuizResponse, UserQuizDetailResponse } from '@/lib/lms/assessment-types'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

type QuizState =
  | 'loading'
  | 'intro'
  | 'in_progress'
  | 'submitting'
  | 'results'
  | 'max_attempts'
  | 'error'

export default function QuizPage({
  params,
}: {
  params: { slug: string; assessmentId: string }
}) {
  const router = useRouter()
  const { isLoggedIn, accessToken, authVersion } = useCatalogAuth()

  const [quiz, setQuiz] = useState<UserQuizDetailResponse | null>(null)
  const [state, setState] = useState<QuizState>('loading')
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<SubmitQuizResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [enrollmentRequired, setEnrollmentRequired] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [unansweredQuestionId, setUnansweredQuestionId] = useState<string | null>(null)

  const storageKey = getQuizAttemptStorageKey(params.assessmentId)

  const resolveToken = useCallback(() => {
    if (!isLoggedIn) return null
    return accessToken || getAccessToken()
  }, [isLoggedIn, accessToken])

  const maxAttemptsReached = useMemo(() => {
    if (!quiz) return false
    return quiz.maxAttempts > 0 && quiz.attemptCount >= quiz.maxAttempts
  }, [quiz])

  const canRetake = useMemo(() => {
    if (!quiz) return false
    return quiz.maxAttempts === 0 || quiz.attemptCount < quiz.maxAttempts
  }, [quiz])

  const sortedQuestions = useMemo(() => {
    if (!quiz) return []
    return [...quiz.questions].sort((a, b) => a.sortOrder - b.sortOrder)
  }, [quiz])

  const loadQuiz = useCallback(async () => {
    const token = resolveToken()
    if (!token) {
      router.replace(buildLoginHref(`/courses/${params.slug}/assessments/quiz/${params.assessmentId}`))
      return
    }

    setState('loading')
    setEnrollmentRequired(false)

    const resultData = await assessmentApi.getQuiz(params.assessmentId, token)

    if (!resultData.success) {
      if (resultData.status === 401) {
        router.replace(buildLoginHref(`/courses/${params.slug}/assessments/quiz/${params.assessmentId}`))
        return
      }
      if (resultData.status === 403 && resultData.error.toLowerCase().includes('enrollment')) {
        setEnrollmentRequired(true)
        setState('error')
        return
      }
      setErrorMessage(resultData.error)
      setState('error')
      return
    }

    const quizData = resultData.data
    setQuiz(quizData)

    const attemptsExceeded =
      quizData.maxAttempts > 0 && quizData.attemptCount >= quizData.maxAttempts

    if (attemptsExceeded) {
      setState('max_attempts')
      return
    }

    const storedAttemptId =
      typeof window !== 'undefined' ? sessionStorage.getItem(storageKey) : null

    if (storedAttemptId) {
      const startResult = await assessmentApi.startQuiz(params.assessmentId, token)
      if (startResult.success) {
        setAttemptId(startResult.data.attemptId)
        setState('in_progress')
        return
      }
    }

    setState('intro')
  }, [params.assessmentId, params.slug, resolveToken, router, storageKey])

  useEffect(() => {
    void loadQuiz()
  }, [loadQuiz, authVersion])

  const handleStart = async () => {
    const token = resolveToken()
    if (!token || !quiz) return

    setStarting(true)
    const startResult = await assessmentApi.startQuiz(params.assessmentId, token)
    setStarting(false)

    if (!startResult.success) {
      if (startResult.error.toLowerCase().includes('maximum quiz attempts')) {
        setState('max_attempts')
        setToast(startResult.error)
        return
      }
      if (startResult.error.toLowerCase().includes('no questions')) {
        setToast('This quiz has no questions yet.')
        return
      }
      setToast(startResult.error)
      return
    }

    setAttemptId(startResult.data.attemptId)
    sessionStorage.setItem(storageKey, startResult.data.attemptId)
    setAnswers({})
    setState('in_progress')
  }

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
    if (unansweredQuestionId === questionId) setUnansweredQuestionId(null)
  }

  const handleSubmitRequest = () => {
    if (!quiz) return

    const firstUnanswered = sortedQuestions.find((question) => !answers[question.id])
    if (firstUnanswered) {
      setUnansweredQuestionId(firstUnanswered.id)
      setToast('Please answer all questions before submitting.')
      document.getElementById(`question-${firstUnanswered.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setShowConfirm(true)
  }

  const handleSubmit = async () => {
    const token = resolveToken()
    if (!token || !quiz || !attemptId) return

    setShowConfirm(false)
    setState('submitting')

    const payload = {
      attemptId,
      answers: sortedQuestions.map((question) => ({
        questionId: question.id,
        selectedOptionId: answers[question.id],
      })),
    }

    const submitResult = await assessmentApi.submitQuiz(params.assessmentId, payload, token)

    if (!submitResult.success) {
      setState('in_progress')
      if (submitResult.error.toLowerCase().includes('already submitted')) {
        sessionStorage.removeItem(storageKey)
        void loadQuiz()
        return
      }
      setToast(submitResult.error)
      return
    }

    sessionStorage.removeItem(storageKey)
    setResult(submitResult.data)
    setQuiz((prev) =>
      prev
        ? { ...prev, attemptCount: prev.attemptCount + 1 }
        : prev,
    )
    setState('results')
  }

  const handleRetake = async () => {
    setResult(null)
    setAttemptId(null)
    setAnswers({})
    sessionStorage.removeItem(storageKey)

    const token = resolveToken()
    if (!token) return

    const refreshed = await assessmentApi.getQuiz(params.assessmentId, token)
    if (refreshed.success) {
      setQuiz(refreshed.data)
      const exceeded =
        refreshed.data.maxAttempts > 0 &&
        refreshed.data.attemptCount >= refreshed.data.maxAttempts
      setState(exceeded ? 'max_attempts' : 'intro')
      return
    }

    setState('intro')
  }

  if (state === 'loading') {
    return (
      <main className="min-h-screen bg-[#FDFBF7] px-4 py-8">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-8 w-2/3 rounded bg-[#E8E4DC]" />
          <div className="h-64 rounded-3xl bg-[#E8E4DC]" />
        </div>
      </main>
    )
  }

  if (enrollmentRequired) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] px-4 py-8">
        <div className="mx-auto max-w-lg">
          <EnrollRequiredBanner courseSlug={params.slug} />
        </div>
      </main>
    )
  }

  if (state === 'error') {
    return (
      <main className="min-h-screen bg-[#FDFBF7] px-4 py-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-[#FDECEC] bg-white p-6 text-center">
          <p className="mb-4 text-sm text-[#C0392B]" style={deck}>{errorMessage || 'Unable to load quiz.'}</p>
          <Link href={`/courses/${encodeURIComponent(params.slug)}/learn`} className="text-sm font-semibold text-[#054742] no-underline hover:underline" style={deck}>
            Back to course
          </Link>
        </div>
      </main>
    )
  }

  if (!quiz) return null

  return (
    <>
      <main className="min-h-screen bg-[#FDFBF7] px-4 py-6 md:py-8">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#054742]/70" style={deck}>
            <Link href={`/courses/${encodeURIComponent(params.slug)}/learn`} className="no-underline hover:underline">
              ← Back to course
            </Link>
          </nav>

          {state === 'intro' && (
            <QuizIntro
              quiz={quiz}
              maxAttemptsReached={maxAttemptsReached}
              onStart={() => void handleStart()}
              loading={starting}
            />
          )}

          {state === 'max_attempts' && (
            <div className="rounded-3xl border border-[#D1CEC9] bg-white p-8 text-center">
              <h1 className="mb-3 text-2xl font-bold text-[#1A1A1A]" style={display}>{quiz.title}</h1>
              <p className="mb-6 text-sm text-[#9A6A00]" style={deck}>
                Maximum quiz attempts reached ({quiz.attemptCount}/{quiz.maxAttempts}).
              </p>
              <Link
                href={`/courses/${encodeURIComponent(params.slug)}/learn`}
                className="inline-flex rounded-full bg-[#054742] px-6 py-3 text-sm font-semibold text-white no-underline"
                style={deck}
              >
                Back to course
              </Link>
            </div>
          )}

          {(state === 'in_progress' || state === 'submitting') && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-[#054742]" style={display}>{quiz.title}</h1>
              <QuizPlayer
                questions={sortedQuestions}
                answers={answers}
                onAnswer={handleAnswer}
                unansweredQuestionId={unansweredQuestionId}
              />
              <QuizSubmitBar
                onSubmit={handleSubmitRequest}
                loading={state === 'submitting'}
              />
            </div>
          )}

          {state === 'results' && result && (
            <QuizResultCard
              result={result}
              quiz={quiz}
              slug={params.slug}
              canRetake={canRetake}
              onRetake={handleRetake}
            />
          )}
        </div>
      </main>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-bold text-[#054742]" style={display}>Submit quiz?</h2>
            <p className="mb-6 text-sm text-[#2D4F4A]" style={deck}>
              You cannot change answers after submitting.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-full border border-[#D1CEC9] px-5 py-2 text-sm font-semibold text-[#054742]"
                style={deck}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                className="rounded-full bg-[#054742] px-5 py-2 text-sm font-semibold text-white"
                style={deck}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <CatalogToast message={toast} onClose={() => setToast(null)} />
    </>
  )
}
