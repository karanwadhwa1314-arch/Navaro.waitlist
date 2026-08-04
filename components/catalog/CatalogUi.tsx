'use client'

import { useEffect } from 'react'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function CatalogToast({
  message,
  onClose,
}: {
  message: string | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onClose, 4000)
    return () => window.clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className="fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-xl bg-[#054742] px-5 py-3 text-sm font-medium text-white shadow-lg" style={deck}>
      {message}
    </div>
  )
}

export function CatalogPageShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8">
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold uppercase tracking-tight text-[#1A1A1A]" style={display}>
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm text-[#2D4F4A] md:text-base" style={deck}>
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </main>
  )
}

export function CatalogSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-[360px] animate-pulse rounded-3xl bg-[#E8E4DC]" />
      ))}
    </div>
  )
}
