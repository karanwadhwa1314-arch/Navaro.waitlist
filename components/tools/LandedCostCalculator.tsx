'use client'

import { useState } from 'react'

import LandedCostForm from '@/components/tools/LandedCostForm'

function LandedCostIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="8" y="18" width="52" height="62" rx="8" fill="#E8DFF5" stroke="#C9B0E8" strokeWidth="2" />
      <rect x="16" y="26" width="36" height="12" rx="3" fill="#F5F0FC" />
      <rect x="16" y="44" width="10" height="10" rx="2" fill="#D4C4ED" />
      <rect x="29" y="44" width="10" height="10" rx="2" fill="#D4C4ED" />
      <rect x="42" y="44" width="10" height="10" rx="2" fill="#D4C4ED" />
      <rect x="16" y="57" width="10" height="10" rx="2" fill="#D4C4ED" />
      <rect x="29" y="57" width="10" height="10" rx="2" fill="#D4C4ED" />
      <rect x="42" y="57" width="10" height="10" rx="2" fill="#D4C4ED" />
      <rect x="16" y="70" width="22" height="6" rx="2" fill="#D4C4ED" />
      <circle cx="78" cy="38" r="22" fill="#F5F0FC" stroke="#C9B0E8" strokeWidth="2" />
      <path d="M68 38h20M78 28v20" stroke="#C9B0E8" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="98" cy="62" rx="10" ry="4" fill="#E8DFF5" />
      <ellipse cx="98" cy="58" rx="10" ry="4" fill="#D4C4ED" />
      <ellipse cx="98" cy="54" rx="10" ry="4" fill="#C9B0E8" />
    </svg>
  )
}

export default function LandedCostCalculator({
  onFormOpenChange,
}: {
  onFormOpenChange?: (open: boolean) => void
} = {}) {
  const [showForm, setShowForm] = useState(false)

  const openForm = () => {
    setShowForm(true)
    onFormOpenChange?.(true)
  }

  const closeForm = () => {
    setShowForm(false)
    onFormOpenChange?.(false)
  }

  if (showForm) {
    return <LandedCostForm onClose={closeForm} />
  }

  return (
    <div className="flex min-h-[calc(100dvh-12rem)] flex-col items-center justify-center rounded-[1rem] bg-navaro-cream px-6 py-16 text-center">
      <LandedCostIllustration className="mb-8 h-24 w-auto sm:h-28" />

      <h2 className="max-w-xl text-xl font-bold leading-snug text-navaro-forest sm:text-2xl">
        Calculated landed cost and find your sell price
      </h2>

      <p className="mt-4 max-w-lg text-sm leading-relaxed text-navaro-forest/55 sm:text-base">
        Quickly determine the landed cost of goods and apply margins or markups to find your ideal sell price
      </p>

      <button
        type="button"
        onClick={openForm}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#C9B0E8] px-8 py-3.5 text-sm font-semibold text-navaro-forest shadow-sm transition hover:brightness-105 focus-visible:outline focus-visible:ring-2 focus-visible:ring-navaro-purple-cta/40"
      >
        <span className="text-lg leading-none" aria-hidden>
          +
        </span>
        Create New
      </button>
    </div>
  )
}
