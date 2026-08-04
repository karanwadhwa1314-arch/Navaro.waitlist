import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NavFinance',
  description:
    'Protect your shipments, access working capital, and manage trade finance from the same platform you use to run your trade operations.',
}

function DocumentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect x="6" y="3" width="16" height="22" rx="2" stroke="#1E1E1E" strokeWidth="1.5" />
      <path d="M10 9H18M10 13H18M10 17H14" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

interface ProductCardProps {
  id?: string
  title: string
  description: string
  features: [string, string, string]
  bgColor: string
  href: string
}

function ProductCard({ id, title, description, features, bgColor, href }: ProductCardProps) {
  const tagOffsets = [
    'mx-auto md:mx-0 md:ml-6',
    'mx-auto md:mx-0 md:mr-8 md:ml-auto',
    'mx-auto md:mx-0 md:ml-10',
  ]

  return (
    <article
      id={id}
      className="flex min-h-[520px] flex-col rounded-[28px] px-6 py-8 text-center md:min-h-[560px] md:px-8 md:py-10"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mb-5 flex justify-center">
        <DocumentIcon />
      </div>

      <h3
        className="mb-4 text-xl font-bold uppercase tracking-wide text-[#054742] md:text-2xl"
        style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
      >
        {title}
      </h3>

      <p
        className="mx-auto mb-6 max-w-[300px] text-sm leading-relaxed text-[#054742] md:text-[15px] md:leading-[1.6]"
        style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
      >
        {description}
      </p>

      <div className="mb-8 flex flex-1 flex-col justify-center gap-3 md:gap-4">
        {features.map((feature, index) => (
          <span
            key={feature}
            className={`inline-block w-fit max-w-[88%] rounded-xl bg-white/95 px-4 py-2.5 text-left text-xs font-medium text-[#054742] shadow-sm md:max-w-[78%] md:px-5 md:py-3 md:text-sm ${tagOffsets[index]}`}
            style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
          >
            {feature}
          </span>
        ))}
      </div>

      <Link
        href={href}
        className="mx-auto inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-medium text-[#054742] no-underline transition-opacity hover:opacity-90 md:text-base"
        style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
      >
        Learn more
      </Link>
    </article>
  )
}

const howItWorksSteps = [
  {
    step: '1',
    title: 'Plan your Shipment',
    description:
      'Prepare your shipment details. We organise your cargo, route, and documentation information in one connected workflow.',
  },
  {
    step: '2',
    title: 'Protect or finance it',
    description:
      'Compare insurance options or explore funding solutions. We simplify decisions without adding complexity to process.',
  },
  {
    step: '3',
    title: 'Track status inside Navaro',
    description:
      'Monitor policies, applications, and updates. Everything stays visible in one place from start to finish.',
  },
] as const

const whyNavFinanceFeatures = [
  {
    icon: 'lightning',
    title: 'Shipment first experience',
    description:
      'Start with your shipment, not paperwork. We use trade context to make financial decisions simpler.',
  },
  {
    icon: 'user',
    title: 'Human Support',
    description:
      'Get guidance when questions arise. Our team helps you move forward with confidence and clarity.',
  },
  {
    icon: 'shield',
    title: 'Transparent process',
    description:
      'See exactly where things stand. Clear statuses, next steps, and updates without unnecessary jargon.',
  },
] as const

function WhyNavFinanceIcon({ type }: { type: (typeof whyNavFinanceFeatures)[number]['icon'] }) {
  if (type === 'lightning') {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <path
          d="M12.5 2L5 12.5H10.5L9.5 20L17 9.5H11.5L12.5 2Z"
          stroke="#054742"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (type === 'user') {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <circle cx="11" cy="7" r="3.5" stroke="#054742" strokeWidth="1.5" />
        <path
          d="M4.5 19C5.5 15.5 8 13.5 11 13.5C14 13.5 16.5 15.5 17.5 19"
          stroke="#054742"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M11 3L4 6.5V11C4 15.5 7.2 19.6 11 20.5C14.8 19.6 18 15.5 18 11V6.5L11 3Z"
        stroke="#054742"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WhyNavFinanceFeature({
  icon,
  title,
  description,
}: {
  icon: (typeof whyNavFinanceFeatures)[number]['icon']
  title: string
  description: string
}) {
  return (
    <article className="rounded-[24px] bg-[#FCF9F4] px-6 py-8 md:px-7 md:py-9">
      <div className="mb-5">
        <WhyNavFinanceIcon type={icon} />
      </div>
      <h3
        className="mb-3 text-lg font-bold text-[#054742] md:text-xl"
        style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed text-[#4A5D58] md:text-[15px] md:leading-[1.65]"
        style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
      >
        {description}
      </p>
    </article>
  )
}

function HowItWorksStep({
  step,
  title,
  description,
}: {
  step: string
  title: string
  description: string
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl bg-white/[0.08] px-6 py-8 md:px-7 md:py-9">
      <span
        className="pointer-events-none absolute left-4 top-2 select-none text-[clamp(4.5rem,10vw,7rem)] font-bold leading-none text-white/10"
        style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
        aria-hidden
      >
        {step}
      </span>

      <div className="relative z-10 pt-10 md:pt-12">
        <h3
          className="mb-3 text-lg font-bold text-white md:text-xl"
          style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed text-white/70 md:text-[15px] md:leading-[1.65]"
          style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
        >
          {description}
        </p>
      </div>
    </article>
  )
}

function CubeButtonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 7L10 10L17 7"
        stroke="black"
        strokeWidth="1.56863"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 18V10" stroke="black" strokeWidth="1.56863" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M8.27503 2.06706L3.82503 4.53373C2.8167 5.09206 1.9917 6.49206 1.9917 7.64206V12.3504C1.9917 13.5004 2.8167 14.9004 3.82503 15.4587L8.27503 17.9337C9.22503 18.4587 10.7834 18.4587 11.7334 17.9337L16.1834 15.4587C17.1917 14.9004 18.0167 13.5004 18.0167 12.3504V7.64206C18.0167 6.49206 17.1917 5.09206 16.1834 4.53373L11.7334 2.05873C10.775 1.53373 9.22503 1.53373 8.27503 2.06706Z"
        stroke="black"
        strokeWidth="1.56863"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function NavFinancePage() {
  return (
    <main className="min-h-screen bg-[#FAFBFA]">
      <section
        className="relative flex min-h-[calc(100vh-88px)] items-center justify-center overflow-hidden px-4 py-16 md:py-24"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 45%, #FFFFFF 0%, #F8FAF9 45%, #EEF3F1 100%)',
        }}
      >
        <div className="relative z-10 mx-auto w-full max-w-[860px] text-center">
          <h1
            className="mb-6 text-[clamp(2rem,5.5vw,3.75rem)] font-bold leading-[1.12] tracking-tight text-[#054742]"
            style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
          >
            Trade moves fast.
            <br />
            Risk should not slow you down.
          </h1>

          <p
            className="mx-auto mb-10 max-w-[560px] text-sm leading-relaxed text-[#5A6B68] md:text-base md:leading-[1.65]"
            style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
          >
            Protect your shipments, access working capital, and manage everything from the same
            platform you already use to run your trade operations.
          </p>

          <div className="mb-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Link
              href="/dashboard?finance=cargo-insurance"
              className="inline-flex items-center gap-2 rounded-xl bg-[#C780ED] px-6 py-3 text-sm font-medium text-black no-underline transition-opacity hover:opacity-90 md:text-base"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Get Cargo Insurance
              <CubeButtonIcon />
            </Link>
            <Link
              href="/dashboard?finance=navfinance"
              className="inline-flex items-center rounded-xl border border-[#D1D5DB] bg-white/60 px-6 py-3 text-sm font-medium text-[#1E1E1E] no-underline transition-colors hover:bg-white md:text-base"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Explore NavFinance
            </Link>
          </div>

          <p
            className="text-xs text-[#9CA3AF] md:text-sm"
            style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
          >
            Your shipment data stays inside Navaro
          </p>
        </div>
      </section>

      <section
        id="overview"
        className="bg-[#F9F7F2] px-4 py-20 md:px-8 md:py-28 lg:py-32"
      >
        <div className="mx-auto max-w-[1200px]">
          <p
            className="mx-auto mb-16 max-w-[1080px] text-center text-[clamp(1.35rem,3.2vw,2.35rem)] font-bold leading-[1.22] tracking-tight md:mb-24 md:leading-[1.2]"
            style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
          >
            <span className="text-[#004236]">
              Protect Your Shipments Against Unexpected Risks And Access The Financial Support
              Needed To Keep Trade Moving. NavFinance Brings Cargo Insurance And Trade
            </span>
            <span className="text-[#8E8E8E]">
              {' '}
              Finance Together In One Trusted Platform, Helping Businesses Operate With Greater
              Confidence, Stability, And Control.
            </span>
          </p>

          <div className="grid grid-cols-1 items-center gap-10 md:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,44%)_minmax(0,1fr)] lg:gap-6 xl:gap-10">
            <h2
              className="text-center text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] text-[#D1C9E0] lg:text-right"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              Your Cargo
              <br />
              System.
            </h2>

            <div className="relative mx-auto w-full max-w-[560px] overflow-hidden lg:max-w-none">
              {/* Swap this img for a <video> when your NavFinance asset is ready */}
              <img
                src="/image/shipping image.png"
                alt=""
                className="aspect-[16/10] w-full object-cover"
              />
            </div>

            <h2
              className="text-center text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] text-[#D1C9E0] lg:text-left"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              Totally
              <br />
              Secured.
            </h2>
          </div>
        </div>
      </section>

      <section id="cargo-insurance" className="bg-[#FDFBF7] px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <p
            className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#054742] md:text-sm"
            style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
          >
            The Products That Help You Scale
          </p>

          <h2
            className="mx-auto mb-4 max-w-[720px] text-center text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold uppercase leading-tight text-[#054742]"
            style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
          >
            Everything You Need To Secure In One Platform
          </h2>

          <p
            className="mx-auto mb-12 max-w-[560px] text-center text-sm leading-relaxed text-[#054742] md:mb-14 md:text-base md:leading-[1.65]"
            style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
          >
            Navaro combines practical certification courses with shipping calculators, document
            checkers, and tracking tools so you can ship profitably and error-free.
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <ProductCard
              title="Cargo Insurance"
              description="Protect every shipment before it leaves. Trusted insurance broker partners. You choose the policy that fits your shipment."
              features={[
                'Compare multiple quotes in minutes',
                'Claims guidance when you need it',
                'Plain-language coverage explanations',
              ]}
              bgColor="#B5E8DF"
              href="/dashboard?finance=cargo-insurance"
            />
            <ProductCard
              id="trade-finance"
              title="Trade Finance"
              description="Working capital for growing importers and exporters. Finance against eligible purchase orders and invoices. Built for shipment-driven businesses"
              features={[
                'Track application status inside Navaro',
                'Upload documents in one go without hassle',
                'Transparent and easy process for you',
              ]}
              bgColor="#FFF4BD"
              href="#trade-finance"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#054742] px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <p
            className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/80 md:text-sm"
            style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
          >
            How It Works
          </p>

          <h2
            className="mx-auto mb-12 max-w-[640px] text-center text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold leading-tight text-white md:mb-14"
            style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
          >
            Built into the workflow you already use
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {howItWorksSteps.map((item) => (
              <HowItWorksStep
                key={item.step}
                step={item.step}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#054742] md:text-sm"
            style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
          >
            Why NavFinance
          </p>

          <h2
            className="mb-12 max-w-[520px] text-[clamp(1.8rem,3.8vw,2.75rem)] font-bold leading-[1.12] text-[#054742] md:mb-14"
            style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
          >
            Finance Designed For Traders,
            <br />
            Not Bankers.
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {whyNavFinanceFeatures.map((feature) => (
              <WhyNavFinanceFeature
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="relative overflow-hidden rounded-3xl bg-[#054742] px-6 py-16 text-center md:px-10 md:py-20">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
              aria-hidden
            />

            <div className="relative z-10">
              <h2
                className="mx-auto mb-4 max-w-[640px] text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold uppercase leading-tight text-white"
                style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
              >
                Ready To Secure Your Trade Operation?
              </h2>

              <p
                className="mx-auto mb-8 max-w-[480px] text-sm text-white/70 md:mb-10 md:text-base"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Tools, learning, insurance and finance connected together.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                <Link
                  href="/dashboard?finance=cargo-insurance"
                  className="inline-flex items-center gap-2 rounded-full bg-[#C780ED] px-6 py-3 text-sm font-medium text-black no-underline transition-opacity hover:opacity-90 md:text-base"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  Get Secured with Insurance
                  <CubeButtonIcon />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-full border border-white px-6 py-3 text-sm font-medium text-white no-underline transition-colors hover:bg-white hover:text-[#054742] md:text-base"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  Explore the Platform
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
