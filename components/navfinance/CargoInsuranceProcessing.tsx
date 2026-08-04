'use client'

import Link from 'next/link'

const displayFont = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const bodyFont = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

function ProcessingIcon() {
  return (
    <div className="relative mx-auto mb-8 flex h-[88px] w-[88px] items-center justify-center md:mb-10">
      <span
        className="absolute h-[88px] w-[88px] rounded-full border border-[#00433E]/10"
        aria-hidden
      />
      <span
        className="absolute h-[68px] w-[68px] rounded-full border border-[#00433E]/12"
        aria-hidden
      />
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,67,62,0.08)]">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="8.5" stroke="#00433E" strokeWidth="1.75" />
          <path
            d="M11 6V11L14.5 13.5"
            stroke="#00433E"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  )
}

export default function CargoInsuranceProcessing({
  detailsHref,
  documentsHref,
}: {
  detailsHref?: string
  documentsHref: string
}) {
  const viewHref = '/dashboard/cargo-rfqs'

  return (
    <div className="flex flex-col items-center px-2 py-6 text-center md:py-8">
      <ProcessingIcon />

      <h1
        className="mb-4 max-w-[420px] text-[clamp(1.35rem,3.2vw,2rem)] font-bold leading-tight text-[#00433E]"
        style={displayFont}
      >
        Your RFQ Is Under Review
      </h1>

      <div className="mb-8 max-w-[440px] space-y-3 md:mb-10">
        <p className="text-sm text-[#8E8E8E] md:text-[15px]" style={bodyFont}>
          Processing time:{' '}
          <span className="font-semibold text-[#00433E]">4–5 working days</span>
        </p>
        <p className="text-sm leading-relaxed text-[#8E8E8E] md:text-[15px]" style={bodyFont}>
          Your RFQ details and documents have been submitted for review. We will notify you once a
          quote is received.
        </p>
      </div>

      <div className="flex w-full max-w-[480px] flex-col items-center gap-4">
        <Link
          href={viewHref}
          className="inline-flex w-full max-w-[320px] items-center justify-center rounded-full bg-[#00433E] px-6 py-3.5 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90 md:text-[15px]"
          style={bodyFont}
        >
          View application details
        </Link>
        <Link
          href="/dashboard?finance=cargo-insurance"
          className="text-sm font-medium text-[#8E8E8E] no-underline transition hover:text-[#00433E] md:text-[15px]"
          style={bodyFont}
        >
          Return to NavFinance
        </Link>
        <p className="text-sm text-[#8E8E8E] md:text-[15px]" style={bodyFont}>
          You will receive an update once admin shares a quote.
        </p>
      </div>
    </div>
  )
}
