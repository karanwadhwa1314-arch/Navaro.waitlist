'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import CargoInsuranceDocumentDetail from '@/components/navfinance/CargoInsuranceDocumentDetail'
import CargoInsuranceDocumentUpload from '@/components/navfinance/CargoInsuranceDocumentUpload'
import CargoInsuranceMyDocuments from '@/components/navfinance/CargoInsuranceMyDocuments'
import CargoInsuranceProcessing from '@/components/navfinance/CargoInsuranceProcessing'
import { resolveAuthUser } from '@/lib/auth/load-user'
import { isAuthenticated } from '@/lib/auth/storage'

const displayFont = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const bodyFont = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

type FlowStep = 'intro' | 'upload' | 'processed' | 'documents'

const PROTECTED_STEPS = new Set<FlowStep>(['upload', 'processed', 'documents'])

function buildLoginHref(returnTo: string) {
  return `/login?next=${encodeURIComponent(returnTo)}`
}

function useAuthState() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated())
  const [authResolved, setAuthResolved] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadSession() {
      const user = await resolveAuthUser()
      if (cancelled) return
      setIsLoggedIn(!!user)
      setAuthResolved(true)
    }

    void loadSession()
    return () => {
      cancelled = true
    }
  }, [])

  return { isLoggedIn, authResolved }
}

const FLOW_STEPS = new Set<FlowStep>(['intro', 'upload', 'processed', 'documents'])

function parseFlowStep(value: string | null): FlowStep {
  if (value === 'shipment') return 'upload'
  if (value === 'quotes') return 'processed'
  if (value && FLOW_STEPS.has(value as FlowStep) && value !== 'intro') {
    return value as FlowStep
  }
  return 'intro'
}

const steps = [
  {
    number: '1',
    title: 'Upload your invoice',
    description: 'Share your cargo invoice securely to get an accurate quote.',
  },
  {
    number: '2',
    title: 'Compare quotes',
    description: 'Review tailored policies from top-rated providers.',
  },
  {
    number: '3',
    title: 'Select your plan',
    description: 'Choose the coverage that best fits your risk profile.',
  },
  {
    number: '4',
    title: 'Policy in your dashboard',
    description: 'Access documents and file claims instantly online.',
  },
] as const

function StepItem({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <article className="flex gap-5 md:gap-6">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#00433E] text-base font-bold text-[#00433E] md:h-12 md:w-12 md:text-lg"
        style={displayFont}
        aria-hidden
      >
        {number}
      </div>
      <div className="pt-0.5">
        <h3
          className="mb-1.5 text-base font-bold text-[#00433E] md:text-lg"
          style={displayFont}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-[#00433E]/75 md:text-[15px]" style={bodyFont}>
          {description}
        </p>
      </div>
    </article>
  )
}

function VideoPlaceholder() {
  return (
    <div className="mx-auto w-full max-w-[380px] lg:max-w-[420px]">
      <div className="relative overflow-hidden rounded-xl bg-[#E8E6E1] shadow-sm md:rounded-2xl">
        <div className="relative aspect-[4/3] w-full">
          <div className="absolute left-4 top-4 flex flex-col gap-1.5 opacity-30" aria-hidden>
            <span className="h-0.5 w-14 rounded-full bg-[#00433E]" />
            <span className="h-0.5 w-20 rounded-full bg-[#00433E]" />
            <span className="h-0.5 w-10 rounded-full bg-[#00433E]" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00433E] text-white transition-opacity hover:opacity-90 md:h-16 md:w-16"
              aria-label="Play how to get insured video"
            >
              <svg width="20" height="22" viewBox="0 0 22 24" fill="none" aria-hidden>
                <path d="M2 2.5L20 12L2 21.5V2.5Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-[#00433E]/60" style={bodyFont}>
        How to get insured &bull; 30 sec
      </p>
    </div>
  )
}

function IntroAuthBar({
  loginHref,
  isLoggedIn,
  onGetQuote,
}: {
  loginHref: string
  isLoggedIn: boolean
  onGetQuote: () => void
}) {
  return (
    <div className="mb-8 flex items-center justify-end gap-4 md:mb-10 md:gap-6">
      {!isLoggedIn && (
        <Link
          href={loginHref}
          className="text-sm font-medium text-[#00433E] no-underline transition-opacity hover:opacity-70 md:text-base"
          style={bodyFont}
        >
          Log In
        </Link>
      )}
      <button
        type="button"
        onClick={onGetQuote}
        className="inline-flex items-center justify-center rounded-lg bg-[#00433E] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 md:px-5 md:py-2.5 md:text-base"
        style={bodyFont}
      >
        Get A Quote
      </button>
    </div>
  )
}

function InsuranceIntro({
  uploadHref,
  loginHref,
  isLoggedIn,
  onGetQuote,
}: {
  uploadHref: string
  loginHref: string
  isLoggedIn: boolean
  onGetQuote: () => void
}) {
  const continueHref = isLoggedIn ? uploadHref : loginHref

  return (
    <>
      <IntroAuthBar
        loginHref={loginHref}
        isLoggedIn={isLoggedIn}
        onGetQuote={onGetQuote}
      />

      <div className="mb-10 md:mb-14">
        <h1
          className="mb-4 text-[clamp(1.75rem,4vw,2.75rem)] font-bold uppercase leading-tight tracking-tight text-[#00433E]"
          style={displayFont}
        >
          How to get insured
        </h1>
        <p
          className="max-w-[520px] text-sm leading-relaxed text-[#00433E]/75 md:text-base md:leading-[1.65]"
          style={bodyFont}
        >
          Protect your cargo in four simple steps. Our streamlined process gets you covered in
          minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
        <div className="flex flex-col gap-8 md:gap-10">
          {steps.map((step) => (
            <StepItem
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>

        <div className="lg:pt-2">
          <VideoPlaceholder />
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[720px] md:mt-16">
        <Link
          href={continueHref}
          className="flex w-full items-center justify-center rounded-full bg-[#00433E] px-8 py-4 text-base font-medium text-white no-underline transition-opacity hover:opacity-90 md:py-[18px] md:text-lg"
          style={bodyFont}
        >
          Get Started
        </Link>
        <p className="mt-4 text-center text-xs text-[#00433E]/60 md:text-sm" style={bodyFont}>
          {isLoggedIn
            ? 'No credit card required to compare quotes.'
            : 'Sign in to upload your invoice and compare quotes.'}
        </p>
      </div>
    </>
  )
}

function FlowBody({
  step,
  uploadHref,
  loginHref,
  documentsHref,
  documentsListHref,
  documentId,
  getDocumentHref,
  introHref,
  isLoggedIn,
  onGetQuote,
  onDocumentsComplete,
  onUploadComplete,
  onReupload,
  documentsReady = true,
}: {
  step: FlowStep
  uploadHref: string
  loginHref: string
  documentsHref: string
  documentsListHref: string
  documentId: string | null
  getDocumentHref: (id: string) => string
  introHref: string
  isLoggedIn: boolean
  onGetQuote: () => void
  onDocumentsComplete: () => void
  onUploadComplete: (uploadedDocumentId?: string) => void
  onReupload: () => void
  documentsReady?: boolean
}) {
  if (step === 'documents') {
    if (documentId) {
      return (
        <CargoInsuranceDocumentDetail
          documentId={documentId}
          backHref={documentsListHref}
          onReupload={onReupload}
        />
      )
    }

    return (
      <CargoInsuranceMyDocuments
        backHref={introHref}
        getDocumentHref={getDocumentHref}
        onReupload={onReupload}
        ready={documentsReady}
      />
    )
  }

  if (step === 'upload') {
    const isCorrectionUpload = Boolean(documentId)

    return (
      <CargoInsuranceDocumentUpload
        closeHref={isCorrectionUpload ? getDocumentHref(documentId!) : introHref}
        updateDocumentId={isCorrectionUpload ? documentId! : undefined}
        onContinue={onUploadComplete}
      />
    )
  }

  if (step === 'processed') {
    return (
      <CargoInsuranceProcessing
        detailsHref={documentId ? getDocumentHref(documentId) : undefined}
        documentsHref={documentsListHref}
      />
    )
  }

  return (
    <InsuranceIntro
      uploadHref={uploadHref}
      loginHref={loginHref}
      isLoggedIn={isLoggedIn}
      onGetQuote={onGetQuote}
    />
  )
}

function useCargoInsuranceFlow(variant: 'standalone' | 'embedded' = 'standalone') {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const flowStep = parseFlowStep(searchParams.get('step'))
  const documentId = searchParams.get('documentId')

  const navigateToStep = useCallback(
    (step: FlowStep, options?: { replace?: boolean; documentId?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString())

      if (variant === 'embedded') {
        params.set('finance', 'cargo-insurance')
      }

      if (step === 'intro') {
        params.delete('step')
        params.delete('documentId')
      } else {
        params.set('step', step)
      }

      if (options?.documentId) {
        params.set('documentId', options.documentId)
      } else if (options?.documentId === null) {
        params.delete('documentId')
      }

      const qs = params.toString()
      const url = qs ? `${pathname}?${qs}` : pathname

      if (options?.replace) {
        router.replace(url)
      } else {
        router.push(url)
      }
    },
    [pathname, router, searchParams, variant],
  )

  const buildDocumentHref = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (variant === 'embedded') {
        params.set('finance', 'cargo-insurance')
      }
      params.set('step', 'documents')
      params.set('documentId', id)
      const qs = params.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [pathname, searchParams, variant],
  )

  const buildDocumentsListHref = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (variant === 'embedded') {
      params.set('finance', 'cargo-insurance')
    }
    params.set('step', 'documents')
    params.delete('documentId')
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }, [pathname, searchParams, variant])

  const buildStepHref = useCallback(
    (step: FlowStep) => {
      const params = new URLSearchParams(searchParams.toString())

      if (variant === 'embedded') {
        params.set('finance', 'cargo-insurance')
      }

      if (step === 'intro') {
        params.delete('step')
      } else {
        params.set('step', step)
      }

      const qs = params.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [pathname, searchParams, variant],
  )

  const completeDocuments = () => navigateToStep('processed')

  return {
    flowStep,
    documentId,
    uploadHref: buildStepHref('upload'),
    documentsHref: buildStepHref('documents'),
    documentsListHref: buildDocumentsListHref(),
    getDocumentHref: buildDocumentHref,
    introHref: buildStepHref('intro'),
    navigateToStep,
    completeDocuments,
  }
}

export default function CargoInsuranceContent({
  variant = 'standalone',
}: {
  variant?: 'standalone' | 'embedded'
}) {
  const router = useRouter()
  const { isLoggedIn, authResolved } = useAuthState()
  const {
    flowStep,
    documentId,
    uploadHref,
    documentsHref,
    documentsListHref,
    getDocumentHref,
    introHref,
    navigateToStep,
    completeDocuments,
  } = useCargoInsuranceFlow(variant)

  const hasStoredSession = isAuthenticated()
  const isProtectedFlow = PROTECTED_STEPS.has(flowStep)

  const loginHref = buildLoginHref(
    flowStep === 'documents'
      ? documentId
        ? getDocumentHref(documentId)
        : documentsHref
      : uploadHref,
  )

  const handleGetQuote = useCallback(() => {
    if (isLoggedIn) {
      router.push('/dashboard/cargo-rfqs')
      return
    }
    router.push(buildLoginHref('/dashboard/cargo-rfqs'))
  }, [isLoggedIn, router])

  const handleReupload = useCallback(() => {
    if (documentId) {
      navigateToStep('upload', { documentId })
      return
    }
    navigateToStep('upload', { documentId: null })
  }, [documentId, navigateToStep])

  const handleUploadComplete = useCallback(
    (uploadedDocumentId?: string) => {
      if (documentId && flowStep === 'upload') {
        navigateToStep('documents', { documentId })
        return
      }

      if (uploadedDocumentId) {
        navigateToStep('processed', { documentId: uploadedDocumentId })
        return
      }

      completeDocuments()
    },
    [completeDocuments, documentId, flowStep, navigateToStep],
  )

  useEffect(() => {
    if (!authResolved) return
    if (PROTECTED_STEPS.has(flowStep) && !isLoggedIn) {
      router.replace(loginHref)
    }
  }, [authResolved, flowStep, isLoggedIn, loginHref, router])

  const activeStep: FlowStep = isProtectedFlow
    ? !authResolved
      ? hasStoredSession
        ? flowStep
        : 'intro'
      : isLoggedIn
        ? flowStep
        : 'intro'
    : flowStep

  const documentsReady = authResolved && isLoggedIn
  const showLoggedInUi = isLoggedIn || (!authResolved && hasStoredSession)

  const isCenteredStep = activeStep === 'upload' || activeStep === 'processed'

  const contentMaxWidth =
    activeStep === 'upload' || activeStep === 'processed'
      ? 'max-w-[560px]'
      : activeStep === 'documents'
        ? documentId
          ? 'max-w-[1100px]'
          : 'max-w-[1100px]'
        : 'max-w-[1100px]'

  if (variant === 'embedded') {
    return (
      <div className="overflow-hidden rounded-[1rem] border border-navaro-forest/10 bg-[#FDFBF7] shadow-[0_2px_12px_rgba(0,45,45,0.06)]">
        <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto overflow-x-hidden px-4 py-8 sm:px-8 md:px-10 md:py-10">
          <FlowBody
            step={activeStep}
            uploadHref={uploadHref}
            loginHref={loginHref}
            documentsHref={documentsHref}
            documentsListHref={documentsListHref}
            documentId={documentId}
            getDocumentHref={getDocumentHref}
            introHref={introHref}
            isLoggedIn={showLoggedInUi}
            onGetQuote={handleGetQuote}
            onDocumentsComplete={completeDocuments}
            onUploadComplete={handleUploadComplete}
            onReupload={handleReupload}
            documentsReady={documentsReady}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFBF7] text-[#00433E]">
      <main
        className={`flex flex-1 flex-col overflow-y-auto px-4 md:px-10 ${
          isCenteredStep ? 'py-8 md:py-10' : 'pt-5 pb-10 md:pt-6 md:pb-14'
        }`}
      >
        <div
          className={`${
            isCenteredStep
              ? 'mx-auto my-auto w-full max-w-[560px]'
              : `mx-auto w-full ${contentMaxWidth}`
          }`}
        >
          <FlowBody
            step={activeStep}
            uploadHref={uploadHref}
            loginHref={loginHref}
            documentsHref={documentsHref}
            documentsListHref={documentsListHref}
            documentId={documentId}
            getDocumentHref={getDocumentHref}
            introHref={introHref}
            isLoggedIn={showLoggedInUi}
            onGetQuote={handleGetQuote}
            onDocumentsComplete={completeDocuments}
            onUploadComplete={handleUploadComplete}
            onReupload={handleReupload}
            documentsReady={documentsReady}
          />
        </div>
      </main>

      {activeStep === 'intro' && flowStep === 'intro' && (
        <footer className="mt-auto border-t border-[#00433E]/10 px-4 py-6 md:px-10">
          <div
            className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 text-xs text-[#00433E]/70 sm:flex-row md:text-sm"
            style={bodyFont}
          >
            <p>&copy; {new Date().getFullYear()} Navaro Inc. All Rights Reserved.</p>
            <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link href="/privacy" className="text-[#00433E]/70 no-underline hover:text-[#00433E]">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-[#00433E]/70 no-underline hover:text-[#00433E]">
                Terms Of Service
              </Link>
              <Link href="/contact" className="text-[#00433E]/70 no-underline hover:text-[#00433E]">
                Contact Support
              </Link>
            </nav>
          </div>
        </footer>
      )}
    </div>
  )
}
