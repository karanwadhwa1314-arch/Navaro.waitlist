'use client'

import { useRef } from 'react'
import Link from 'next/link'

export default function About() {
  const teamScrollRef = useRef<HTMLDivElement>(null)

  const scrollTeam = (direction: 'left' | 'right') => {
    if (!teamScrollRef.current) return
    const container = teamScrollRef.current
    const cardWidth = container.scrollWidth / container.children.length
    container.scrollBy({
      left: direction === 'right' ? cardWidth : -cardWidth,
      behavior: 'smooth',
    })
  }
  return (
    <main className="min-h-screen bg-[#F9F9F9]">
      {/* Hero Section with Video Background */}
      <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/landing/img/aboutbannervd.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#F9F9F9]/85" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-[800px] mx-auto">
          <h1
            className="text-4xl md:text-6xl lg:text-[72px] font-bold leading-[1.1] text-[#1E1E1E] mb-6"
            style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
          >
            WHERE LEARNING MEETS EXECUTION
          </h1>
          <p
            className="text-[#054742] text-sm md:text-base leading-relaxed max-w-[500px] mx-auto mb-8"
            style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
          >
            Navaro combines certification and tools in one workflow, so learning turns into execution.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#C780ED] text-black text-sm md:text-base font-medium px-6 py-3 rounded-full no-underline hover:opacity-90 transition-opacity"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Explore our Courses
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M3 7L10 10L17 7" stroke="black" strokeWidth="1.56863" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 18V10" stroke="black" strokeWidth="1.56863" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.27503 2.06706L3.82503 4.53373C2.8167 5.09206 1.9917 6.49206 1.9917 7.64206V12.3504C1.9917 13.5004 2.8167 14.9004 3.82503 15.4587L8.27503 17.9337C9.22503 18.4587 10.7834 18.4587 11.7334 17.9337L16.1834 15.4587C17.1917 14.9004 18.0167 13.5004 18.0167 12.3504V7.64206C18.0167 6.49206 17.1917 5.09206 16.1834 4.53373L11.7334 2.05873C10.775 1.53373 9.22503 1.53373 8.27503 2.06706Z" stroke="black" strokeWidth="1.56863" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-[#1E1E1E] text-[#1E1E1E] text-sm md:text-base font-medium px-6 py-3 rounded-full no-underline hover:bg-[#1E1E1E] hover:text-white transition-colors"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Learn about Tools
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="bg-transparent py-16 md:py-24">
        <div className="max-w-[1334px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl lg:text-[48px] font-bold leading-tight text-[#1E1E1E] mb-4"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              THE PROBLEM
            </h2>
            <p
              className="text-[#054742] text-sm md:text-base leading-relaxed max-w-[600px] mx-auto"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Import-export forces you to learn from one place, calculate costs in another, and validate documents somewhere else. That fragmentation is where mistakes and delays happen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 01 */}
            <div className="bg-[#FDF8F3] rounded-3xl p-8 md:p-10 border border-[#f0e8e0]">
              <div className="flex items-start gap-6 md:gap-10">
                <span
                  className="text-[#054742]/30 text-2xl md:text-3xl font-medium shrink-0"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  01
                </span>
                <div>
                  <h3
                    className="text-[#054742] text-xl md:text-2xl font-bold mb-2"
                    style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
                  >
                    No clear &ldquo;next step&rdquo;
                  </h3>
                  <p
                    className="text-[#5A5A5A] text-sm md:text-base leading-relaxed"
                    style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                  >
                    Content tells you what HS codes are, but not how to actually move a shipment forward without second-guessing.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 02 */}
            <div className="bg-[#FDF8F3] rounded-3xl p-8 md:p-10 border border-[#f0e8e0]">
              <div className="flex items-start gap-6 md:gap-10">
                <span
                  className="text-[#054742]/30 text-2xl md:text-3xl font-medium shrink-0"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  02
                </span>
                <div>
                  <h3
                    className="text-[#054742] text-xl md:text-2xl font-bold mb-2"
                    style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
                  >
                    Tools are scattered
                  </h3>
                  <p
                    className="text-[#5A5A5A] text-sm md:text-base leading-relaxed"
                    style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                  >
                    Even good tools feel unreliable when they don&apos;t connect to the workflow you&apos;re learning
                  </p>
                </div>
              </div>
            </div>

            {/* Card 03 */}
            <div className="bg-[#FDF8F3] rounded-3xl p-8 md:p-10 border border-[#f0e8e0]">
              <div className="flex items-start gap-6 md:gap-10">
                <span
                  className="text-[#054742]/30 text-2xl md:text-3xl font-medium shrink-0"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  03
                </span>
                <div>
                  <h3
                    className="text-[#054742] text-xl md:text-2xl font-bold mb-2"
                    style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
                  >
                    Paperwork risk is real
                  </h3>
                  <p
                    className="text-[#5A5A5A] text-sm md:text-base leading-relaxed"
                    style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                  >
                    Document mismatches can trigger delays and penalties. People usually discover issues too late.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 04 */}
            <div className="bg-[#FDF8F3] rounded-3xl p-8 md:p-10 border border-[#f0e8e0]">
              <div className="flex items-start gap-6 md:gap-10">
                <span
                  className="text-[#054742]/30 text-2xl md:text-3xl font-medium shrink-0"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  04
                </span>
                <div>
                  <h3
                    className="text-[#054742] text-xl md:text-2xl font-bold mb-2"
                    style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
                  >
                    Landed cost surprises
                  </h3>
                  <p
                    className="text-[#5A5A5A] text-sm md:text-base leading-relaxed"
                    style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                  >
                    If you can&apos;t estimate duties and landed cost early, every quote feels like a gamble.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="bg-transparent py-12 md:py-18">
        <div className="max-w-[1334px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl lg:text-[48px] font-bold leading-tight text-[#1E1E1E] mb-4"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              HOW NAVARO SOLVES IT
            </h2>
            <p
              className="text-[#054742] text-sm md:text-base leading-relaxed max-w-[600px] mx-auto"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              One platform that connects learning, tools, and validation — so you move from knowledge to action without switching tabs.
            </p>
          </div>

        </div>
      </section>

      {/* What Makes Navaro Different Section */}
      <section className="bg-transparent py-16 md:py-24">
        <div className="max-w-[1334px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl lg:text-[48px] font-bold leading-tight text-[#1E1E1E] mb-4"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              WHAT MAKES NAVARO DIFFERENT
            </h2>
            <p
              className="text-[#054742] text-sm md:text-base leading-relaxed max-w-[600px] mx-auto"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Import-export forces you to learn from one place, calculate costs in another, and validate documents somewhere else. That fragmentation is where mistakes and delays happen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1 - Light Yellow */}
            <div className="bg-[#DCB7EB] rounded-3xl p-8 md:p-10">
              <h3
                className="text-[#054742] text-xl md:text-2xl font-bold mb-2"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                Courses that unlock the exact tools you need
              </h3>
              <p
                className="text-[#054742]/80 text-sm md:text-base leading-relaxed mb-6"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Every module is designed around the actions you&apos;ll actually take. As you progress, Navaro unlocks the tools that match that stage, so learning immediately turns into execution.
              </p>
              <div className="rounded-2xl overflow-hidden">
                <img src="/landing/img/image1.png" alt="Courses" className="w-full h-48 object-cover rounded-2xl" />
              </div>
            </div>

            {/* Card 2 - Light Purple */}
            <div className="bg-[#FBEBA9] rounded-3xl p-8 md:p-10">
              <h3
                className="text-[#054742] text-xl md:text-2xl font-bold mb-2"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                Built around a real shipment, not theory
              </h3>
              <p
                className="text-[#054742]/80 text-sm md:text-base leading-relaxed mb-6"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                The core course is structured to get you from basics to your first practical shipment, covering documentation, customs flow, finance, and logistics in sequence.
              </p>
              <div className="rounded-2xl overflow-hidden">
                <img src="/landing/img/image2.png" alt="Real shipment" className="w-full h-48 object-cover rounded-2xl" />
              </div>
            </div>

            {/* Card 3 - Light Teal */}
            <div className="bg-[#FFB393] rounded-3xl p-8 md:p-10">
              <h3
                className="text-[#054742] text-xl md:text-2xl font-bold mb-2"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                Prevent errors before customs finds them
              </h3>
              <p
                className="text-[#054742]/80 text-sm md:text-base leading-relaxed mb-6"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Document mismatches cost time and money. Navaro&apos;s document checking and templates help you catch issues earlier, when they&apos;re cheaper to fix.
              </p>
              <div className="rounded-2xl overflow-hidden">
                <img src="/landing/img/image3.png" alt="Prevent errors" className="w-full h-48 object-cover rounded-2xl" />
              </div>
            </div>

            {/* Card 4 - Light Pink */}
            <div className="bg-[#9FE4D7] rounded-3xl p-8 md:p-10">
              <h3
                className="text-[#054742] text-xl md:text-2xl font-bold mb-2"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                We redesign complexity into usable interfaces
              </h3>
              <p
                className="text-[#054742]/80 text-sm md:text-base leading-relaxed mb-6"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Trade data often comes from fragmented sources and ugly tools. Navaro&apos;s job is to turn that into clear, guided screens people can use under pressure.
              </p>
              <div className="rounded-2xl overflow-hidden">
                <img src="/landing/img/image4.png" alt="Usable interfaces" className="w-full h-48 object-cover rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

           {/* How Navaro Helps You Ship With Confidence */}
      <section className="bg-[#FDF8F3] py-16 md:py-24">
        <div className="max-w-[1334px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl lg:text-[48px] font-bold leading-tight text-black mb-4 uppercase"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              HOW NAVARO HELPS YOU SHIP WITH CONFIDENCE
            </h2>
            <p
              className="text-[#054742] text-sm md:text-base leading-relaxed max-w-[650px] mx-auto"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Import-export forces you to learn from one place, calculate costs in another, and validate documents somewhere else. That fragmentation is where mistakes and delays happen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="bg-[#FDF8F3] rounded-3xl pt-6 px-6 pb-0 flex flex-col border border-[#054742]/15 overflow-hidden">
              <span
                className="text-[#054742]/40 text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Step 1
              </span>
              <h3
                className="text-[#054742] text-xl md:text-2xl font-bold mb-2"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                UNDERSTAND SYSTEM
              </h3>
              <p
                className="text-[#5A5A5A] text-sm leading-relaxed mb-4"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Before entering the trade ecosystem, you need structured understanding &mdash; not scattered information.
              </p>
              <div className="mt-auto flex justify-center">
                <img src="/image/understand System.png" alt="Understand System" className="w-full max-w-[220px] h-auto object-contain" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FDF8F3] rounded-3xl pt-6 px-6 pb-0 flex flex-col border border-[#054742]/15 overflow-hidden">
              <span
                className="text-[#054742]/40 text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Step 2
              </span>
              <h3
                className="text-[#054742] text-xl md:text-2xl font-bold mb-2"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                APPLY LEARNINGS
              </h3>
              <p
                className="text-[#5A5A5A] text-sm leading-relaxed mb-4"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Each tool is built to translate theory into structured action. Instead of learning passively, You learn with the tools in hand
              </p>
              <div className="mt-auto flex justify-center">
                <img src="/image/apply learning.png" alt="Apply Learnings" className="w-full max-w-[220px] h-auto object-contain" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FDF8F3] rounded-3xl pt-6 px-6 pb-0 flex flex-col border border-[#054742]/15 overflow-hidden">
              <span
                className="text-[#054742]/40 text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Step 3
              </span>
              <h3
                className="text-[#054742] text-xl md:text-2xl font-bold mb-2"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                SCALE TRANSACTIONS
              </h3>
              <p
                className="text-[#5A5A5A] text-sm leading-relaxed mb-4"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Navaro supports long-term growth by helping you: Standardize repeatable processes Optimize cost structures
              </p>
              <div className="mt-auto flex justify-center">
                <img src="/image/scale transaction.png" alt="Scale Transactions" className="w-full max-w-[220px] h-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet The Navaro Team */}
      <section className="bg-[#FDF8F3] py-16 md:py-24 overflow-hidden">
        <div className="max-w-[1334px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl lg:text-[48px] font-bold leading-tight text-black mb-4 uppercase"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              MEET THE NAVARO TEAM
            </h2>
            <p
              className="text-[#054742] text-sm md:text-base leading-relaxed max-w-[600px] mx-auto"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              We streamline global trade. Current systems use separate tools for learning, costing, and compliance, leading to errors and delays.
            </p>
          </div>

          <div ref={teamScrollRef} className="flex gap-5 overflow-hidden pb-4" style={{ scrollBehavior: 'smooth' }}>
            {/* Card 1 */}
            <div className="bg-[#FBEBA9] rounded-3xl pt-6 px-6 pb-0 flex flex-col flex-shrink-0 w-[calc(33.333%-14px)] h-[420px] overflow-hidden relative"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <h3
                className="text-[#054742] text-xl md:text-2xl font-bold mb-1 relative z-10"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                TIMOTHY YOUNG
              </h3>
              <p
                className="text-[#054742]/70 text-sm font-medium relative z-10"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Chief Executive Officer
              </p>
              <div className="mt-auto flex justify-center">
                <img src="/image/Timothy.png" alt="Timothy Young" className="w-full h-[350px] object-cover object-top" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#9FE4D7] rounded-3xl pt-6 px-6 pb-0 flex flex-col flex-shrink-0 w-[calc(33.333%-14px)] h-[420px] overflow-hidden relative"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <h3
                className="text-[#054742] text-xl md:text-2xl font-bold mb-1 relative z-10"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                EVELYN HAYES
              </h3>
              <p
                className="text-[#054742]/70 text-sm font-medium relative z-10"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Chief Executive Officer
              </p>
              <div className="mt-auto flex justify-center">
                <img src="/image/eveylin.png" alt="Evelyn Hayes" className="w-full h-[350px] object-cover object-top" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#DCB7EB] rounded-3xl pt-6 px-6 pb-0 flex flex-col flex-shrink-0 w-[calc(33.333%-14px)] h-[420px] overflow-hidden relative"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <h3
                className="text-[#054742] text-xl md:text-2xl font-bold mb-1 relative z-10"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                JAMISON RHEE
              </h3>
              <p
                className="text-[#054742]/70 text-sm font-medium relative z-10"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Chief Executive Officer
              </p>
              <div className="mt-auto flex justify-center">
                <img src="/image/jamison.png" alt="Jamison Rhee" className="w-full h-[350px] object-cover object-top" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#FBEBA9] rounded-3xl pt-6 px-6 pb-0 flex flex-col flex-shrink-0 w-[calc(33.333%-14px)] h-[420px] overflow-hidden relative"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <h3
                className="text-[#054742] text-xl md:text-2xl font-bold mb-1 relative z-10"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                KAMARI JOSH
              </h3>
              <p
                className="text-[#054742]/70 text-sm font-medium relative z-10"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Chief Executive Officer
              </p>
              <div className="mt-auto flex justify-center">
                <img src="/image/eveylin.png" alt="Kamari Josh" className="w-full h-[350px] object-cover object-top" />
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-[#DCB7EB] rounded-3xl pt-6 px-6 pb-0 flex flex-col flex-shrink-0 w-[calc(33.333%-14px)] h-[420px] overflow-hidden relative"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <h3
                className="text-[#054742] text-xl md:text-2xl font-bold mb-1 relative z-10"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                JAMISON RHEE
              </h3>
              <p
                className="text-[#054742]/70 text-sm font-medium relative z-10"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Chief Executive Officer
              </p>
              <div className="mt-auto flex justify-center">
                <img src="/image/jamison.png" alt="Jamison Rhee" className="w-full h-[350px] object-cover object-top" />
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-[#FBEBA9] rounded-3xl pt-6 px-6 pb-0 flex flex-col flex-shrink-0 w-[calc(33.333%-14px)] h-[420px] overflow-hidden relative"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <h3
                className="text-[#054742] text-xl md:text-2xl font-bold mb-1 relative z-10"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                KAMARI JOSH
              </h3>
              <p
                className="text-[#054742]/70 text-sm font-medium relative z-10"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Chief Executive Officer
              </p>
              <div className="mt-auto flex justify-center">
                <img src="/image/eveylin.png" alt="Kamari Josh" className="w-full h-[350px] object-cover object-top" />
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => scrollTeam('left')} className="w-10 h-10 rounded-full border-2 border-[#C780ED] flex items-center justify-center hover:bg-[#C780ED]/20 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 19L8 12L15 5" stroke="#C780ED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={() => scrollTeam('right')} className="w-10 h-10 rounded-full border-2 border-[#C780ED] flex items-center justify-center hover:bg-[#C780ED]/20 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5L16 12L9 19" stroke="#C780ED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#FDF8F3] py-12 md:py-16">
        <div className="max-w-[1334px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-[#054742]/10">
            <div className="text-center px-4">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E1E1E] mb-2" style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}>
                500<span className="text-[#C780ED]">+</span>
              </h3>
              <p className="text-[#5A5A5A] text-sm leading-relaxed" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                Exporters trained<br />through our core course
              </p>
            </div>
            <div className="text-center px-4">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E1E1E] mb-2" style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}>
                $50K<span className="text-[#FBEBA9]">+</span>
              </h3>
              <p className="text-[#5A5A5A] text-sm leading-relaxed" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                In document errors<br />prevented by our AI checker
              </p>
            </div>
            <div className="text-center px-4">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E1E1E] mb-2" style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}>
                7 <span className="text-[#054742]">TOOLS</span>
              </h3>
              <p className="text-[#5A5A5A] text-sm leading-relaxed" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                Tools accessible from<br />one dashboard
              </p>
            </div>
            <div className="text-center px-4">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E1E1E] mb-2" style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}>
                4 <span className="text-[#054742]">MODULES</span>
              </h3>
              <p className="text-[#5A5A5A] text-sm leading-relaxed" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                From basics to your first<br />shipment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="max-w-[1334px] mx-auto mt-10 px-4 pb-16 md:pb-20">
        <div className="bg-[#054742] rounded-3xl py-16 md:py-20 px-6 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10">
            <h2
              className="text-2xl md:text-4xl lg:text-[42px] font-bold text-white leading-tight mb-4 max-w-[600px] mx-auto"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              READY TO BUILD YOUR TRADE OPERATION?
            </h2>
            <p
              className="text-white/70 text-sm md:text-base mb-8 max-w-[500px] mx-auto"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Move from scattered learning to structured execution with Navaro.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#C780ED] text-black text-sm md:text-base font-medium px-6 py-3 rounded-full no-underline hover:opacity-90 transition-opacity"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Explore our Courses
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M3 7L10 10L17 7" stroke="black" strokeWidth="1.56863" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 18V10" stroke="black" strokeWidth="1.56863" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.27503 2.06706L3.82503 4.53373C2.8167 5.09206 1.9917 6.49206 1.9917 7.64206V12.3504C1.9917 13.5004 2.8167 14.9004 3.82503 15.4587L8.27503 17.9337C9.22503 18.4587 10.7834 18.4587 11.7334 17.9337L16.1834 15.4587C17.1917 14.9004 18.0167 13.5004 18.0167 12.3504V7.64206C18.0167 6.49206 17.1917 5.09206 16.1834 4.53373L11.7334 2.05873C10.775 1.53373 9.22503 1.53373 8.27503 2.06706Z" stroke="black" strokeWidth="1.56863" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 border border-white text-white text-sm md:text-base font-medium px-6 py-3 rounded-full no-underline hover:bg-white hover:text-[#054742] transition-colors"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Explore the Platform
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
