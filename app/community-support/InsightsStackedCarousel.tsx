'use client'

import Link from 'next/link'
import { useState } from 'react'

const insights = [
  {
    date: 'October 24, 2024',
    category: 'Carrier Misalignment',
    title: 'The Hidden Cost Of Poor Shipping Decisions',
    description: 'Learn the way global trade actually works....',
    cardBg: '#DCB7EB',
    stack: ['#FBEBA9', '#FFB393', '#054742'],
    href: '/blogs',
    image: '/landing/img/image1.png',
  },
  {
    date: 'September 12, 2024',
    category: 'Landed Cost',
    title: 'Why Early Duty Estimates Change Your Margins',
    description: 'See how small calculation gaps compound across every shipment....',
    cardBg: '#9FE4D7',
    stack: ['#DCB7EB', '#FBEBA9', '#FFB393'],
    href: '/blogs',
    image: '/landing/img/image2.png',
  },
  {
    date: 'August 03, 2024',
    category: 'Documentation',
    title: 'Document Mismatches That Delay Customs Clearance',
    description: 'Catch the errors operators miss before cargo hits the port....',
    cardBg: '#FFB393',
    stack: ['#054742', '#DCB7EB', '#FBEBA9'],
    href: '/blogs',
    image: '/landing/img/image3.png',
  },
  
]

type Insight = (typeof insights)[number] & { image?: string }

function ArrowButton({
  direction,
  onClick,
  label,
}: {
  direction: 'left' | 'right'
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8D4F5] text-[#1E1E1E] transition-opacity hover:opacity-80"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        {direction === 'left' ? (
          <path
            d="M11 4L6 9L11 14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M7 4L12 9L7 14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  )
}

export default function InsightsStackedCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeInsight: Insight = insights[activeIndex]

  const goPrev = () => {
    setActiveIndex((current) => (current === 0 ? insights.length - 1 : current - 1))
  }

  const goNext = () => {
    setActiveIndex((current) => (current === insights.length - 1 ? 0 : current + 1))
  }

  return (
    <div className="mx-auto max-w-[920px]">
      <div className="relative pt-3">
        {activeInsight.stack.map((color, index) => (
          <div
            key={`${activeInsight.title}-stack-${index}`}
            className="absolute left-1/2 h-14 -translate-x-1/2 rounded-t-[1.75rem]"
            style={{
              backgroundColor: color,
              top: `${index * 14}px`,
              width: `calc(100% - ${(activeInsight.stack.length - 1 - index) * 16}px)`,
              zIndex: index,
            }}
            aria-hidden
          />
        ))}

        <article
          className="relative z-10 mt-[42px] overflow-hidden rounded-[1.75rem] p-6 md:p-8"
          style={{
            backgroundColor: activeInsight.cardBg,
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        >
          <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
            <div className="text-left">
              <div className="mb-5 flex flex-wrap gap-2">
                <span
                  className="rounded-lg bg-[#054742] px-3 py-1.5 text-xs font-medium text-white md:text-sm"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  {activeInsight.date}
                </span>
                <span
                  className="rounded-lg bg-[#054742] px-3 py-1.5 text-xs font-medium text-white md:text-sm"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  {activeInsight.category}
                </span>
              </div>

              <h3
                className="mb-4 text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold leading-tight text-[#1E1E1E]"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                {activeInsight.title}
              </h3>

              <p
                className="mb-8 max-w-[420px] text-sm leading-relaxed text-[#2D4F4A] md:text-base"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                {activeInsight.description}
              </p>

              <Link
                href={activeInsight.href}
                className="inline-flex items-center overflow-hidden rounded-2xl bg-white text-sm font-semibold text-[#1E1E1E] no-underline transition-opacity hover:opacity-90 md:text-base"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                <span className="px-5 py-3.5 md:px-6">Read More</span>
                <span className="flex h-full items-center justify-center border-l border-[#1E1E1E]/10 px-4 py-3.5">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                    <path
                      d="M4 9H14M10 5L14 9L10 13"
                      stroke="#1E1E1E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </div>

            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#E5E5E5]">
              {activeInsight.image ? (
                <img
                  src={activeInsight.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
          </div>
        </article>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <ArrowButton direction="left" onClick={goPrev} label="Previous insight" />
        <ArrowButton direction="right" onClick={goNext} label="Next insight" />
      </div>
    </div>
  )
}
