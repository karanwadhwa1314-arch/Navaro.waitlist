'use client'

import Link from 'next/link'
import { useState } from 'react'
import Footer from '@/components/Footer'
import WaitlistModal from './WaitlistModal'

const font = { fontFamily: '"TASA Orbiter Deck", sans-serif' }
const displayFont = { fontFamily: '"TASA Orbiter Display", sans-serif' }

export default function WaitlistLanding() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFBF0]">
      {/* Header — centred logo only, per the pre-login design */}
      <header className="flex justify-center px-4 py-3">
        <Link href="/" aria-label="Navaro home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/image/Nav_bar-.png"
            alt="Navaro"
            className="h-[52px] w-auto object-contain max-[500px]:h-[40px]"
          />
        </Link>
      </header>

      {/* Hero */}
      <section className="bg-[#62CDBE] px-4 py-[80px] md:py-[130px]">
        <div className="mx-auto max-w-[960px] text-center">
          <p
            className="text-[18px] font-normal leading-[130%] text-[#054742] md:text-[28px]"
            style={font}
          >
            Making Import Export Easy
          </p>

          <h1
            className="mx-auto mt-8 max-w-[900px] text-[36px] font-bold leading-[115%] text-[#054742] md:mt-12 md:text-[56px] lg:text-[64px]"
            style={displayFont}
          >
            Your First shipment before your First shipment
          </h1>

          <p
            className="mx-auto mt-8 max-w-[640px] text-[14px] font-normal leading-[150%] text-[#054742] md:mt-12 md:text-[18px]"
            style={font}
          >
            An integrated import-export ecosystem that takes you from complexity to clarity
          </p>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 transition-transform hover:scale-[1.02] md:mt-14"
          >
            <span
              className="text-[15px] font-normal leading-[120%] text-[#054742] md:text-[17px]"
              style={font}
            >
              Join Our Waitlist
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C780ED]">
              <svg width="18" height="18" viewBox="0 0 21 21" fill="none" aria-hidden="true">
                <path
                  d="M10.5 4.375L16.625 10.5M16.625 10.5L10.5 16.625M16.625 10.5H4.375"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        </div>
      </section>

      <div className="flex-1">
        <Footer />
      </div>

      {modalOpen && <WaitlistModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
