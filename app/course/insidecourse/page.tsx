'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'

const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

const heroNavLinks = [
  { label: 'Courses Structure', href: '#courses-structure' },
  { label: 'Who Teaches You', href: '#who-teaches-you' },
  { label: 'Pricing Details', href: '#pricing-details' },
  { label: 'Real outcomes', href: '#real-outcomes' },
]

const outcomes = [
  {
    title: 'GLOBAL NETWORK',
    description:
      'Knowing and doing are two different things. Navaro bridges that gap with real-time tools that calculate duties, clarify compliance, and guide every step of the process.',
    bg: '#FBEBA9',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="12" stroke="#054742" strokeWidth="1.5" />
        <path d="M16 4C16 4 9 11.5 9 16C9 20.5 16 28 16 28M16 4C16 4 23 11.5 23 16C23 20.5 16 28 16 28M4 16H28" stroke="#054742" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'DOCUMENTATION',
    description:
      'Navaro is built for the long game — connecting you to verified partners, expanding your network, and giving you the infrastructure to move to a fully operational import-export business.',
    bg: '#9EE4D7',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="8" y="5" width="16" height="22" rx="2" stroke="#054742" strokeWidth="1.5" />
        <path d="M12 12H20M12 16H20M12 20H16" stroke="#054742" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'LOGISTICS FLOW',
    description:
      "Learn the way global trade actually works. Navaro's courses are structured around one goal: turning knowledge into readiness. You need to know exactly what to do next.",
    bg: '#DFC6F7',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="7" r="2.5" stroke="#054742" strokeWidth="1.5" />
        <path d="M16 9.5V14" stroke="#054742" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 14H7M16 14H16M16 14H25" stroke="#054742" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="7" cy="23" r="2.5" stroke="#054742" strokeWidth="1.5" />
        <circle cx="16" cy="23" r="2.5" stroke="#054742" strokeWidth="1.5" />
        <circle cx="25" cy="23" r="2.5" stroke="#054742" strokeWidth="1.5" />
        <path d="M16 14V19M7 14V20.5M25 14V20.5" stroke="#054742" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

const modules = [
  {
    number: 1,
    title: 'Shipping Foundations',
    lessons: [
      'Introduction to global shipping',
      'How international trade works',
      'Key shipping roles and stakeholders',
      'Understanding incoterms basics',
      'Trade lanes and routing overview',
    ],
  },
  {
    number: 2,
    title: 'Freight & Cargo',
    lessons: [
      'Understanding cargo types',
      'Freight forwarding fundamentals',
      'Cargo handling processes',
      'Container loading principles',
      'Weight and volume calculations',
    ],
  },
  {
    number: 3,
    title: 'Ports & Operations',
    lessons: [
      'Basics of port operations',
      'Introduction to shipping routes',
      'Supply chain fundamentals',
      'Warehouse and terminal workflows',
      'Last-mile delivery planning',
    ],
  },
  {
    number: 4,
    title: 'Docs & Compliance',
    lessons: [
      'Shipping documentation essentials',
      'Export compliance basics',
      'Using Navaro tools in practice',
      'Bill of lading walkthrough',
      'Certificate of origin requirements',
    ],
  },
]

const courseOverviewItems = [
  `${modules.length} Modules`,
  `${modules.reduce((sum, mod) => sum + mod.lessons.length, 0)} Lessons`,
  '8.5hrs Of Video Content',
  '6 Tasks',
]

const toolSteps = [
  {
    step: 'STEP 1',
    title: 'LEARN',
    description: 'Complete Module 1 Kickstarting EXIM basics',
    bg: '#FBEBA9',
    img: '/image/step1_books_graduation.png',
  },
  {
    step: 'STEP 2',
    title: 'UNLOCK',
    description: 'Get document templates and checklists added',
    bg: '#9EE4D7',
    img: '/image/Metallic_key.png',
  },
  {
    step: 'STEP 3',
    title: 'EXECUTE',
    description: 'Draft your first packing list and invoice',
    bg: '#DFC6F7',
    img: '/image/Shipping_container.png',
  },
]

const instructors = [
  {
    name: 'TIMOTHY YOUNG',
    role: 'Maritime Logistics Consultant',
    image: '/image/Timothy.png',
  },
  {
    name: 'EVELYN HAYES',
    role: 'Supply Chain Operations Specialist',
    image: '/image/eveylin.png',
  },
  {
    name: 'JAMISON RHEE',
    role: 'Freight & Logistics Advisor',
    image: '/image/jamison.png',
  },
  {
    name: 'KAMARI JOSHI',
    role: 'Global Trade & Logistics Strategist',
    image: '/image/Timothy.png',
  },
]

const pricingIncludes = [
  '5 Modules',
  '21 Lessons',
  '8.5hrs Of Video Content',
  '6 Tasks',
]

const stats = [
  {
    value: '500',
    symbol: '+',
    symbolColor: '#C486F1',
    label: 'Exporters trained through our core course',
  },
  {
    value: '$50K',
    symbol: '+',
    symbolColor: '#FDBA74',
    label: 'In document errors prevented by our AI checker',
  },
  {
    value: '7',
    valueColor: '#F9DB5F',
    suffix: 'TOOLS',
    label: 'Tools accessible from one dashboard',
  },
  {
    value: '4',
    valueColor: '#054742',
    suffix: 'MODULES',
    label: 'From basics to your first shipment.',
  },
]

const testimonials = [
  {
    variant: 'quote-only' as const,
    quote:
      'Navaro helped me understand the full export workflow in weeks. The tools made it easy to go from theory to actually planning my shipments',
    bg: '#FBEBA9',
    quoteColor: '#C486F1',
  },
  {
    variant: 'profile' as const,
    quote:
      "I've been exporting for years, but Navaro's landed cost calculator and AI document checker saved me hours of manual work and prevented costly errors.",
    name: 'Rajesh Kumar',
    role: 'Textile Exporter, Bangalore',
    avatar: '/image/rajesh.png',
    bg: '#E8F8F4',
    quoteColor: '#F9DB5F',
    dotted: true,
  },
  {
    variant: 'profile' as const,
    quote:
      'The course gave me practical skills I could immediately apply in my job. My manager noticed the difference in how I handle documentation now',
    name: 'Ananya Mehta',
    role: 'Export Executive, Mumbai',
    avatar: '/image/ananya.png',
    bg: '#F3E8FF',
    quoteColor: '#9EE4D7',
  },
  {
    variant: 'profile' as const,
    quote:
      "Having courses and tools in one place made a huge difference. I don't switch between calculators or guess what's correct anymore.",
    name: 'Vikram Desai',
    role: 'D2C Brand Owner, Pune',
    avatar: '/image/vikram.png',
    bg: '#FFE8D6',
    quoteColor: '#FDBA74',
    dotted: true,
  },
]

const faqColumns = [
  [
    {
      question: 'Can I use the tools without taking a course?',
      answer:
        'Yes. Navaro tools are available from the dashboard anytime. The course teaches you when and how to use them effectively on real shipments.',
    },
    {
      question: 'Is the AI Document Checker accurate?',
      answer:
        'It catches common export document errors — missing fields, mismatched values, and formatting issues. It reduces manual review time and helps you fix problems before customs.',
    },
    {
      question: 'How long does it take to complete the course?',
      answer:
        'The course is self-paced and typically takes 3–4 weeks. You can move faster or slower depending on your schedule and prior familiarity with shipping.',
    },
    {
      question: "What's included in the 7 tools?",
      answer:
        'CBM calculator, landed cost calculator, AI document checker, export document templates, and other shipping tools — all accessible from one dashboard as you progress.',
    },
  ],
  [
    {
      question: 'Do I need prior experience in import-export?',
      answer:
        'No. The core course is designed for anyone starting from scratch. It covers documentation, customs, finance, and logistics step by step. If you already have experience, you can jump straight to tools or advanced courses.',
      defaultOpen: true,
    },
    {
      question: 'Is there a certificate of completion?',
      answer:
        'Yes. You receive a certificate after finishing all modules and the final assessment, which you can share with employers or clients.',
    },
    {
      question: 'Can I learn at my own pace?',
      answer:
        'Absolutely. All lessons are self-paced — watch on your schedule, revisit modules anytime, and practice with tools when you are ready.',
    },
    {
      question: 'Do I get lifetime access to the course?',
      answer:
        'Yes. Once enrolled, you keep access to videos, downloadable resources, and future updates to course materials.',
    },
  ],
]

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-10 text-center text-[clamp(1.5rem,3.5vw,2.4rem)] font-bold uppercase tracking-tight text-[#054742]"
      style={display}
    >
      {children}
    </h2>
  )
}

function EnrollButton({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={`inline-flex items-center justify-center rounded-full bg-[#C486F1] px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-[#1A1A1A] no-underline transition-opacity hover:opacity-90 md:text-base ${className}`}
      style={deck}
    >
      Enroll Now
    </Link>
  )
}

function TestimonialAvatar({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-dashed border-[#054742]/20 bg-white/50 text-[10px] text-[#054742]/50 md:h-16 md:w-16"
        style={deck}
        aria-label={`${alt} photo placeholder`}
      >
        Photo
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-14 w-14 shrink-0 rounded-2xl object-cover md:h-16 md:w-16"
    />
  )
}

function TestimonialCard({
  item,
}: {
  item: (typeof testimonials)[number]
}) {
  const dottedStyle = item.variant === 'profile' && item.dotted
    ? {
        backgroundImage:
          'radial-gradient(rgba(5,71,66,0.07) 1px, transparent 1px), linear-gradient(transparent, transparent)',
        backgroundSize: '18px 18px',
      }
    : undefined

  if (item.variant === 'quote-only') {
    return (
      <div
        className="h-full rounded-3xl p-6 md:p-8"
        style={{ backgroundColor: item.bg }}
      >
        <span
          className="mb-4 block text-4xl leading-none md:text-5xl"
          style={{ color: item.quoteColor }}
          aria-hidden
        >
          &ldquo;
        </span>
        <p className="text-sm leading-relaxed text-[#054742] md:text-base md:leading-[1.7]" style={deck}>
          {item.quote}
        </p>
      </div>
    )
  }

  return (
    <div
      className="h-full rounded-3xl p-5 md:p-6"
      style={{ backgroundColor: item.bg, ...dottedStyle }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex shrink-0 items-start gap-3 sm:w-[180px] sm:flex-col sm:gap-3">
          <TestimonialAvatar src={item.avatar} alt={item.name} />
          <div>
            <p className="text-sm font-bold text-[#054742] md:text-base" style={display}>
              {item.name}
            </p>
            <p className="text-xs text-[#054742]/70 md:text-sm" style={deck}>
              {item.role}
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <span
            className="mb-2 inline-block text-3xl leading-none md:text-4xl"
            style={{ color: item.quoteColor }}
            aria-hidden
          >
            &ldquo;
          </span>
          <p className="text-sm leading-relaxed text-[#054742] md:text-[15px] md:leading-[1.7]" style={deck}>
            {item.quote}
          </p>
        </div>
      </div>
    </div>
  )
}

function InstructorImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className="flex h-[220px] w-full items-end justify-center pb-4"
        aria-label={`${alt} photo placeholder`}
      >
        <div
          className="flex h-[180px] w-[140px] items-center justify-center rounded-2xl border border-dashed border-[#054742]/20 bg-white/40 text-center text-xs text-[#054742]/50"
          style={deck}
        >
          Photo
          <br />
          coming soon
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[220px] w-full items-end justify-center">
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className="max-h-[210px] w-auto max-w-[90%] object-contain object-bottom"
      />
    </div>
  )
}

function ToolStepImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="relative flex h-[90px] min-h-[140px] w-full items-end justify-center">
      {!failed ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="relative z-[1] max-h-[170px] w-auto max-w-[85%] object-contain object-bottom"
        />
      ) : (
        <div
          className="relative z-[1] mb-6 flex h-[120px] w-[120px] items-center justify-center rounded-2xl border border-dashed border-[#054742]/20 bg-white/30 text-center text-xs text-[#054742]/50"
          style={deck}
        >
          Image
          <br />
          coming soon
        </div>
      )}
    </div>
  )
}

function FaqItem({
  question,
  answer,
  defaultOpen = false,
}: {
  question: string
  answer: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-[#FDFBF7]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6 md:py-5"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-[#054742] md:text-base" style={deck}>
          {question}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-base leading-none transition-colors ${
            open
              ? 'border-transparent bg-[#DFC6F7] text-[#054742]'
              : 'border-[#D1CEC9] bg-white text-[#054742]'
          }`}
          aria-hidden
        >
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 md:px-6 md:pb-6">
          <p className="text-sm leading-relaxed text-[#2D4F4A]/80 md:text-[15px] md:leading-[1.7]" style={deck}>
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

export default function InsideCoursePage() {
  const [activeModule, setActiveModule] = useState(-1)
  const instructorScrollRef = useRef<HTMLDivElement>(null)

  const scrollInstructors = (direction: 'left' | 'right') => {
    instructorScrollRef.current?.scrollBy({
      left: direction === 'left' ? -320 : 320,
      behavior: 'smooth',
    })
  }

  return (
    <div className="bg-[#FDFBF7]">
      {/* Hero */}
      <section className="px-4 pb-16 pt-12 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-[920px] text-center">
          <span
            className="mb-8 inline-block rounded-lg bg-[#FBEBA9] px-4 py-1.5 text-sm font-medium text-[#1A1A1A]"
            style={deck}
          >
            Basic Course
          </span>

          <h1
            className="mb-8 text-[clamp(2rem,5.5vw,3.75rem)] font-bold uppercase leading-[1.08] tracking-tight text-[#1A1A1A]"
            style={display}
          >
            Shipping Fundamentals
          </h1>

          <p
            className="mx-auto mb-10 max-w-[640px] text-base leading-relaxed text-[#2D4F4A] md:text-lg md:leading-[1.65]"
            style={deck}
          >
            Learn how global shipping works—from cargo movement and logistics workflows to
            essential documentation used in real-world operations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {heroNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center rounded-xl border border-[#1A1A1A]/35 bg-transparent px-5 py-2.5 text-sm font-normal text-[#1A1A1A] no-underline transition-colors hover:bg-[#1A1A1A]/5 md:px-6 md:py-3 md:text-base"
                style={deck}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section id="real-outcomes" className="scroll-mt-28 px-4 pb-16 md:pb-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 text-center">
            <div className="mb-6 flex items-center justify-center gap-4">
              <span className="h-px w-full max-w-[140px] bg-[#D1CEC9]" aria-hidden />
              <span
                className="shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-[#054742]"
                style={deck}
              >
                Outcomes
              </span>
              <span className="h-px w-full max-w-[140px] bg-[#D1CEC9]" aria-hidden />
            </div>

            <h2
              className="mb-4 text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold uppercase tracking-tight text-[#1A1A1A]"
              style={display}
            >
              Outcomes of the Course
            </h2>

            <p
              className="mx-auto max-w-[560px] text-sm leading-relaxed text-[#2D4F4A] md:text-base md:leading-[1.65]"
              style={deck}
            >
              Build the essential skills required to understand and work with real-world shipping
              operations.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {outcomes.map((item) => (
              <div
                key={item.title}
                className="flex flex-col rounded-3xl p-7 md:min-h-[320px] md:p-8"
                style={{ backgroundColor: item.bg }}
              >
                <div className="mb-6">{item.icon}</div>
                <h3
                  className="mb-4 text-xl font-bold uppercase tracking-tight text-[#054742] md:text-2xl"
                  style={display}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#054742] md:text-[15px] md:leading-[1.7]" style={deck}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="courses-structure" className="scroll-mt-28 px-4 pb-16 md:pb-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 text-center">
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#054742]"
              style={deck}
            >
              Course Structure
            </p>
            <h2
              className="mb-4 text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold uppercase tracking-tight text-[#1A1A1A]"
              style={display}
            >
              What You&apos;ll Learn
            </h2>
            <p
              className="mx-auto max-w-[560px] text-sm leading-relaxed text-[#2D4F4A] md:text-base md:leading-[1.65]"
              style={deck}
            >
              A structured set of modules designed to help you understand shipping processes
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
            {/* Overview sidebar */}
            <div
              className="h-fit rounded-2xl border border-[#D1CEC9] bg-[#FDFBF7] p-6"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(5,71,66,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(5,71,66,0.04) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <h3 className="mb-4 text-lg font-bold text-[#054742]" style={display}>
                Overview
              </h3>
              <ul className="space-y-3">
                {courseOverviewItems.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[#054742]" style={deck}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
                      <path
                        d="M3.5 8L6.5 11L12.5 5"
                        stroke="#054742"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Module accordion */}
            <div className="space-y-3">
              {modules.map((mod, i) => {
                const isActive = activeModule === i
                return (
                  <div
                    key={mod.number}
                    className="overflow-hidden rounded-2xl border border-[#D1CEC9] bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveModule(isActive ? -1 : i)}
                      className="flex w-full items-center gap-4 px-4 py-4 text-left md:px-5 md:py-5"
                      aria-expanded={isActive}
                    >
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FBEBA9] text-base font-bold text-[#1A1A1A] md:h-12 md:w-12 md:text-lg"
                        style={display}
                      >
                        {mod.number}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className="block text-base font-bold text-[#054742] md:text-lg"
                          style={display}
                        >
                          {mod.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-[#054742]/70" style={deck}>
                          {mod.lessons.length} Lessons
                        </span>
                      </span>

                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-lg leading-none text-white"
                        aria-hidden
                      >
                        {isActive ? '−' : '+'}
                      </span>
                    </button>

                    {isActive && (
                      <div className="border-t border-[#D1CEC9] px-5 pb-5 pt-3 md:px-6">
                        <ul className="space-y-2.5">
                          {mod.lessons.map((lesson) => (
                            <li
                              key={lesson}
                              className="flex items-center gap-3 text-sm text-[#2D4F4A]"
                              style={deck}
                            >
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#054742]" />
                              {lesson}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Tools unlock */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 text-center">
            <h2
              className="mb-4 text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold uppercase tracking-tight text-[#1A1A1A]"
              style={display}
            >
              How Learning Unlocks Your Tools
            </h2>
            <p
              className="mx-auto max-w-[640px] text-sm leading-relaxed text-[#2D4F4A] md:text-base md:leading-[1.65]"
              style={deck}
            >
              Each module you finish instantly unlocks a tool you can use on your real shipment,
              inside the same dashboard
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-stretch md:justify-center md:gap-3">
            {toolSteps.map((step, index) => (
              <div key={step.title} className="contents">
                {index > 0 && (
                  <span
                    className="hidden shrink-0 self-center text-2xl text-[#054742] md:block"
                    aria-hidden
                  >
                    →
                  </span>
                )}

                <div
                  className="flex min-h-[380px] flex-1 flex-col overflow-hidden rounded-3xl md:max-w-[360px]"
                  style={{ backgroundColor: step.bg }}
                >
                  <div className="p-6 md:p-7">
                    <span
                      className="mb-3 block text-xs font-semibold uppercase tracking-[0.15em] text-[#054742]"
                      style={deck}
                    >
                      {step.step}
                    </span>
                    <h3
                      className="mb-3 text-2xl font-bold uppercase tracking-tight text-[#054742] md:text-[2rem]"
                      style={display}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#054742] md:text-[15px]" style={deck}>
                      {step.description}
                    </p>
                  </div>

                  <div
                    className="relative mt-auto min-h-[50px] flex-1"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(5,71,66,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(5,71,66,0.06) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  >
                    <ToolStepImage src={step.img} alt={step.title} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section id="who-teaches-you" className="scroll-mt-28 px-4 pb-16 md:pb-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 text-center">
            <h2
              className="mb-4 text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold uppercase tracking-tight text-[#1A1A1A]"
              style={display}
            >
              Who Teaches You
            </h2>
            <p
              className="mx-auto max-w-[560px] text-sm leading-relaxed text-[#2D4F4A] md:text-base md:leading-[1.65]"
              style={deck}
            >
              Learn from professionals with real experience in logistics and global shipping
              operations.
            </p>
          </div>

          <div
            ref={instructorScrollRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {instructors.map((person) => (
              <div
                key={person.name}
                className="relative flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-[#E8E4DC] bg-[#F5F1E8] sm:w-[300px]"
              >
                <div className="px-6 pb-4 pt-6">
                  <h3
                    className="mb-1 text-base font-bold uppercase tracking-tight text-[#054742] md:text-lg"
                    style={display}
                  >
                    {person.name}
                  </h3>
                  <p className="text-sm text-[#054742]/70" style={deck}>
                    {person.role}
                  </p>
                </div>

                <div
                  className="relative flex-1"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(5,71,66,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(5,71,66,0.05) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                >
                  <InstructorImage src={person.image} alt={person.name} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => scrollInstructors('left')}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFC6F7] text-[#054742] transition-opacity hover:opacity-80"
              aria-label="Previous instructor"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollInstructors('right')}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFC6F7] text-[#054742] transition-opacity hover:opacity-80"
              aria-label="Next instructor"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing-details" className="scroll-mt-28 px-4 pb-16 md:pb-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 text-center">
            <h2
              className="mb-4 text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold uppercase tracking-tight text-[#1A1A1A]"
              style={display}
            >
              Pricing Details
            </h2>
            <p
              className="mx-auto max-w-[560px] text-sm leading-relaxed text-[#2D4F4A] md:text-base md:leading-[1.65]"
              style={deck}
            >
              Details of what you get in the overall package.
            </p>
          </div>

          <div
            className="overflow-hidden rounded-3xl p-7 md:p-10"
            style={{
              backgroundColor: '#FDBA74',
              backgroundImage:
                'linear-gradient(rgba(5,71,66,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(5,71,66,0.06) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h3
                  className="mb-5 text-xl font-bold text-[#054742] md:text-2xl"
                  style={display}
                >
                  The Basic Price Includes
                </h3>
                <ul className="mb-8 space-y-3">
                  {pricingIncludes.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[#054742] md:text-base" style={deck}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
                        <path
                          d="M3 8L6.5 11.5L13 5"
                          stroke="#054742"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="#courses-structure"
                  className="inline-flex items-center overflow-hidden rounded-2xl bg-white text-sm font-semibold text-[#1A1A1A] no-underline transition-opacity hover:opacity-90 md:text-base"
                  style={deck}
                >
                  <span className="px-5 py-3.5 md:px-6">Read More</span>
                  <span className="flex h-full items-center justify-center border-l border-[#1A1A1A]/10 px-4 py-3.5">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                      <path
                        d="M4 9H14M10 5L14 9L10 13"
                        stroke="#1A1A1A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </Link>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="rounded-full bg-[#1A1A1A] px-8 py-6 text-center md:px-10 md:py-7">
                  <p className="mb-2 text-xs text-white/60 md:text-sm" style={deck}>
                    Price for the course
                  </p>
                  <div className="flex items-baseline justify-center gap-3">
                    <span className="text-4xl font-bold text-white md:text-5xl" style={display}>
                      ₹3999
                    </span>
                    <span className="text-lg text-white/45 line-through md:text-xl" style={deck}>
                      4999
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#E8E4DC] bg-[#FDFBF7]">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center justify-center px-4 py-10 text-center md:px-6 md:py-14 ${
                  index % 2 === 1 ? 'border-l border-[#E8E4DC]' : ''
                } ${index >= 2 ? 'border-t border-[#E8E4DC] md:border-t-0' : ''} ${
                  index > 0 ? 'md:border-l md:border-[#E8E4DC]' : ''
                }`}
              >
                <p className="mb-3 text-[clamp(1.5rem,3vw,2rem)] font-bold leading-none" style={display}>
                  {'suffix' in stat ? (
                    <>
                      <span style={{ color: stat.valueColor }}>{stat.value}</span>{' '}
                      <span className="text-[#1A1A1A]">{stat.suffix}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#1A1A1A]">{stat.value}</span>{' '}
                      <span style={{ color: stat.symbolColor }}>{stat.symbol}</span>
                    </>
                  )}
                </p>
                <p
                  className="max-w-[220px] text-xs leading-relaxed text-[#1A1A1A]/75 md:text-sm md:leading-[1.5]"
                  style={deck}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 text-center">
            <h2
              className="mb-4 text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold uppercase tracking-tight text-[#054742]"
              style={display}
            >
              What Students Say
            </h2>
            <p
              className="mx-auto max-w-[640px] text-sm leading-relaxed text-[#2D4F4A] md:text-base md:leading-[1.65]"
              style={deck}
            >
              Hear from learners who have completed the course and gained a better understanding of
              global shipping and logistics.
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-12 md:items-start">
              <div className="md:col-span-5">
                <TestimonialCard item={testimonials[0]} />
              </div>
              <div className="md:col-span-7 md:translate-y-8">
                <TestimonialCard item={testimonials[1]} />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-12 md:items-start">
              <div className="md:col-span-6">
                <TestimonialCard item={testimonials[2]} />
              </div>
              <div className="md:col-span-6 md:translate-y-6">
                <TestimonialCard item={testimonials[3]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-20 md:pb-28">
        <div className="mx-auto max-w-[1200px]">
          <h2
            className="mb-12 text-center text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold uppercase tracking-tight text-[#054742]"
            style={display}
          >
            Frequently Asked Questions
          </h2>

          <div className="grid gap-8 md:grid-cols-2 md:gap-10">
            {faqColumns.map((column, columnIndex) => (
              <div key={columnIndex} className="space-y-4">
                {column.map((faq) => (
                  <FaqItem
                    key={faq.question}
                    question={faq.question}
                    answer={faq.answer}
                    defaultOpen={'defaultOpen' in faq ? faq.defaultOpen : false}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
