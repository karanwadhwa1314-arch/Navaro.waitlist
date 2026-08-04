'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import AssignmentDetailView from '@/components/assessments/AssignmentDetail'
import AssignmentForm from '@/components/assessments/AssignmentForm'
import AssignmentSubmissionView from '@/components/assessments/AssignmentSubmissionView'
import EnrollRequiredBanner, { isDueDatePassed } from '@/components/assessments/AssessmentShared'
import CatalogToast from '@/components/catalog/CatalogUi'
import { useCatalogAuth } from '@/hooks/useCatalogAuth'
import { getAccessToken } from '@/lib/auth/storage'
import { assessmentApi } from '@/lib/lms/assessment-api'
import { buildLoginHref } from '@/lib/lms/catalog-helpers'
import type { UserAssignmentDetailResponse } from '@/lib/lms/assessment-types'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

type AssignmentState = 'loading' | 'view' | 'submitting' | 'error'

export default function AssignmentPage({
  params,
}: {
  params: { slug: string; assessmentId: string }
}) {
  const router = useRouter()
  const { isLoggedIn, accessToken, authVersion } = useCatalogAuth()

  const [assignment, setAssignment] = useState<UserAssignmentDetailResponse | null>(null)
  const [state, setState] = useState<AssignmentState>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [enrollmentRequired, setEnrollmentRequired] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const resolveToken = useCallback(() => {
    if (!isLoggedIn) return null
    return accessToken || getAccessToken()
  }, [isLoggedIn, accessToken])

  const loadAssignment = useCallback(async () => {
    const token = resolveToken()
    if (!token) {
      router.replace(buildLoginHref(`/courses/${params.slug}/assessments/assignment/${params.assessmentId}`))
      return
    }

    setState('loading')
    setEnrollmentRequired(false)

    const result = await assessmentApi.getAssignment(params.assessmentId, token)

    if (!result.success) {
      if (result.status === 401) {
        router.replace(buildLoginHref(`/courses/${params.slug}/assessments/assignment/${params.assessmentId}`))
        return
      }
      if (result.status === 403 && result.error.toLowerCase().includes('enrollment')) {
        setEnrollmentRequired(true)
        setState('error')
        return
      }
      setErrorMessage(result.error)
      setState('error')
      return
    }

    setAssignment(result.data)
    setState('view')
  }, [params.assessmentId, params.slug, resolveToken, router])

  useEffect(() => {
    void loadAssignment()
  }, [loadAssignment, authVersion])

  const handleSubmit = async (contentText: string) => {
    const token = resolveToken()
    if (!token) return

    setState('submitting')
    const result = await assessmentApi.submitAssignment(params.assessmentId, contentText, token)

    if (!result.success) {
      setState('view')
      if (result.error.toLowerCase().includes('due date')) {
        setToast(result.error)
        await loadAssignment()
        return
      }
      setToast(result.error)
      return
    }

    setToast('Assignment submitted successfully.')
    await loadAssignment()
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

  if (state === 'error' || !assignment) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] px-4 py-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-[#FDECEC] bg-white p-6 text-center">
          <p className="mb-4 text-sm text-[#C0392B]" style={deck}>{errorMessage || 'Unable to load assignment.'}</p>
          <Link href={`/courses/${encodeURIComponent(params.slug)}/learn`} className="text-sm font-semibold text-[#054742] no-underline hover:underline" style={deck}>
            Back to course
          </Link>
        </div>
      </main>
    )
  }

  const pastDue = isDueDatePassed(assignment.dueAt)
  const showForm = !pastDue

  return (
    <>
      <main className="min-h-screen bg-[#FDFBF7] px-4 py-6 md:py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-[#054742]/70" style={deck}>
            <Link href={`/courses/${encodeURIComponent(params.slug)}/learn`} className="no-underline hover:underline">
              ← Back to course
            </Link>
          </nav>

          <AssignmentDetailView assignment={assignment} />

          {assignment.submission && (
            <AssignmentSubmissionView submission={assignment.submission} />
          )}

          {showForm && (
            <div>
              {assignment.submission && (
                <p className="mb-3 text-sm font-semibold text-[#054742]" style={deck}>
                  Resubmit assignment
                </p>
              )}
              <AssignmentForm
                onSubmit={(text) => void handleSubmit(text)}
                loading={state === 'submitting'}
                disabled={pastDue}
                initialValue=""
              />
            </div>
          )}
        </div>
      </main>

      <CatalogToast message={toast} onClose={() => setToast(null)} />
    </>
  )
}
