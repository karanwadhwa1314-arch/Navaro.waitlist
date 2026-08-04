import Link from 'next/link'
import type { Metadata } from 'next'
import InsightsStackedCarousel from './InsightsStackedCarousel'

export const metadata: Metadata = {
  title: 'Community Support',
  description:
    'Connect with certified members, share insights, solve real challenges, and grow alongside professionals who are actively executing.',
}

function HeroCraneDecorationLeft() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-0 flex select-none items-center"
      aria-hidden
    >
      <img
        src="/image/container-port-crane-quay__leftside.png"
        alt=""
        className="h-[min(58vh,420px)] w-auto max-w-[min(32vw,140px)] object-contain object-left sm:max-w-[min(30vw,220px)] md:h-[min(92vh,900px)] md:max-w-[min(34vw,420px)]"
      />
    </div>
  )
}

function HeroCraneDecorationRight() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 flex select-none items-center"
      aria-hidden
    >
      <img
        src="/image/container-port-crane-quay__rightside.png"
        alt=""
        className="h-[min(58vh,420px)] w-auto max-w-[min(32vw,140px)] object-contain object-right sm:max-w-[min(30vw,220px)] md:h-[min(92vh,900px)] md:max-w-[min(34vw,420px)]"
      />
    </div>
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

function LeaderboardChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4 16V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 16V4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 16V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function RankUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 3L12 8H4L8 3Z"
        fill="#C780ED"
      />
    </svg>
  )
}

function LeaderboardBarChart() {
  return (
    <svg
      viewBox="0 0 280 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden
    >
      <rect x="28" y="118" width="42" height="102" rx="6" fill="#D9C56A" />
      <rect x="92" y="72" width="42" height="148" rx="6" fill="#D9C56A" />
      <rect x="156" y="28" width="42" height="192" rx="6" fill="#D9C56A" />
      <rect x="220" y="96" width="42" height="124" rx="6" fill="#D9C56A" />
    </svg>
  )
}

const rankUpdates = [
  { name: 'Soniya Singh', course: 'Advanced Course', rank: 1, initials: 'SS', avatarBg: '#9FE4D7' },
  { name: 'Aadi', course: 'Basic Course', rank: 2, initials: 'A', avatarBg: '#DCB7EB' },
  { name: 'Shubham', course: 'Basic Course', rank: 3, initials: 'S', avatarBg: '#FFB393' },
  { name: 'Priya Nair', course: 'Advanced Course', rank: 4, initials: 'PN', avatarBg: '#FBEBA9' },
  { name: 'Rahul Verma', course: 'Basic Course', rank: 5, initials: 'RV', avatarBg: '#9FE4D7' },
]

const exploreInsights = [
  {
    tag: 'Industry Analysis',
    title: 'The 2026 Shipping Cost Landscape',
    description:
      'How fuel volatility, capacity shifts, and carrier strategy are reshaping global shipping costs over the next 12–18 months.',
    href: '/#',
    image: '/image/running_ship.png',
  },
  {
    tag: 'Technology',
    title: 'AI In Logistics: Practical Use Cases (Not Hype)',
    description:
      'Where AI actually reduces manual work in documentation, routing, and exception handling — and where it still falls short.',
    href: '/#',
    image: '/image/insight_truck.png',
  },
  {
    tag: 'Strategy',
    title: 'Why Visibility Is The New Competitive Edge',
    description:
      'Real-time shipment visibility is no longer a premium feature. It is the baseline expectation for modern trade operators.',
    href: '/#',
    image: '/image/packing_goods.png',
  },
]

type ExploreInsight = (typeof exploreInsights)[number] & { image?: string }

function ExploreInsightCard({ insight }: { insight: ExploreInsight }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-[#E4E4E4] bg-white p-5 md:p-7">
      <div className="mb-5 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#E5E5E5] md:mb-6">
        {insight.image ? (
          <img src={insight.image} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>

      <span
        className="mb-4 inline-block w-fit rounded-xl bg-[#FBEBA9] px-4 py-1.5 text-sm font-medium text-[#1E1E1E] md:text-base"
        style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
      >
        {insight.tag}
      </span>

      <h3
        className="mb-3 text-xl font-bold leading-snug text-[#054742] md:text-2xl"
        style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
      >
        {insight.title}
      </h3>

      <p
        className="mb-8 flex-1 text-base leading-relaxed text-[#5A5A5A] md:text-[17px] md:leading-[1.65]"
        style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
      >
        {insight.description}
      </p>

      <Link
        href={insight.href}
        className="inline-flex w-fit items-center overflow-hidden rounded-2xl bg-[#C780ED] text-base font-semibold text-[#1E1E1E] no-underline transition-opacity hover:opacity-90 md:text-lg"
        style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
      >
        <span className="px-5 py-3.5 md:px-6 md:py-4">Read More</span>
        <span className="flex h-full items-center justify-center border-l border-[#1E1E1E]/10 px-4 py-3.5 md:px-5 md:py-4">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden>
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
    </article>
  )
}

type RankUpdate = (typeof rankUpdates)[number] & { image?: string }

function RankUpdateCard({ update }: { update: RankUpdate }) {
  return (
    <div className="flex shrink-0 items-center gap-4">
      <div className="h-[68px] w-[68px] shrink-0 overflow-hidden rounded-2xl bg-[#E5E5E5] sm:h-[76px] sm:w-[76px]">
        {update.image ? (
          <img src={update.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-base font-bold text-[#1E1E1E] sm:text-lg"
            style={{ backgroundColor: update.avatarBg, fontFamily: '"TASA Orbiter Deck", sans-serif' }}
          >
            {update.initials}
          </div>
        )}
      </div>

      <div className="flex min-w-[min(88vw,400px)] items-center justify-between gap-6 rounded-[1.35rem] border border-[#D9BFF0] bg-[#E8D4F5] px-6 py-5 sm:min-w-[480px] md:min-w-[540px] md:px-7 md:py-[22px]">
        <p
          className="truncate text-[17px] font-bold text-[#1E1E1E] sm:text-lg"
          style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
        >
          {update.name}{' '}
          <span className="font-normal text-[#5A5A5A]">({update.course})</span>
        </p>
        <p
          className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[15px] text-[#5A5A5A] sm:text-base"
          style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
        >
          Just Went Up To Rank #{update.rank}
          <RankUpIcon />
        </p>
      </div>
    </div>
  )
}

function RankUpdateMarquee() {
  const marqueeItems = [...rankUpdates, ...rankUpdates]

  return (
    <div className="relative left-1/2 mt-6 w-screen -translate-x-1/2 overflow-hidden md:mt-8">
      <div className="animate-rank-marquee flex w-max items-center gap-5 px-4 sm:gap-6">
        {marqueeItems.map((update, index) => (
          <RankUpdateCard key={`${update.name}-${index}`} update={update} />
        ))}
      </div>
    </div>
  )
}

export default function CommunitySupportPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      <section className="relative flex min-h-[calc(100vh-88px)] items-center justify-center overflow-hidden px-4 py-16 md:py-24">
        <HeroCraneDecorationLeft />
        <HeroCraneDecorationRight />

        <div className="relative z-10 mx-auto w-full max-w-[800px] px-12 text-center sm:px-16 md:px-4">
          <h1
            className="mb-6 text-[clamp(2.25rem,6vw,4.5rem)] font-bold uppercase leading-[1.08] tracking-tight text-[#1E1E1E]"
            style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
          >
            Build with the
            <br />
            community
          </h1>

          <p
            className="mx-auto mb-10 max-w-[560px] text-sm leading-relaxed text-[#054742] md:text-base md:leading-[1.65]"
            style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
          >
            Connect with certified members, share insights, solve real challenges, and grow alongside
            professionals who are actively executing — not just learning.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Link
              href="/course"
              className="inline-flex items-center gap-2 rounded-xl bg-[#C780ED] px-6 py-3 text-sm font-medium text-black no-underline transition-opacity hover:opacity-90 md:text-base"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Explore our Courses
              <CubeButtonIcon />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-xl border border-[#1E1E1E] px-6 py-3 text-sm font-medium text-[#1E1E1E] no-underline transition-colors hover:bg-[#1E1E1E] hover:text-white md:text-base"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Learn about Tools
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#FDF8F3] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-[920px] text-center">
          <h2
            className="mb-6 text-[clamp(1.75rem,4.5vw,3rem)] font-bold uppercase leading-[1.12] tracking-tight text-[#1E1E1E]"
            style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
          >
            Built by operators.
            <br />
            Powered by community.
          </h2>

          <p
            className="mx-auto max-w-[640px] text-sm leading-relaxed text-[#054742] md:text-base md:leading-[1.65]"
            style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
          >
            Navaro&apos;s community brings together founders, logistics professionals, and operators to share
            insights, solve real shipping challenges, and grow together.
          </p>

          <div className="mx-auto mt-10 aspect-[16/10] w-full max-w-[480px] overflow-hidden bg-[#E5E5E5] md:mt-14 md:max-w-[560px]">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            >
              <source src="/image/import-and-export-2025-12-17-20-30-22-utc.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section className="bg-[#FDF8F3] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-[920px]">
          <div className="mb-10 text-center md:mb-12">
            <h2
              className="mb-4 text-[clamp(1.75rem,4.5vw,3rem)] font-bold uppercase leading-[1.12] tracking-tight text-[#1E1E1E]"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              Climb the board
            </h2>
            <p
              className="mx-auto max-w-[640px] text-sm leading-relaxed text-[#054742] md:text-base md:leading-[1.65]"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              See who&apos;s leading the course, moving up the ranks, and shipping with confidence.
            </p>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl border border-[#C8C4BC] bg-[#FBEBA9] p-6 md:p-8"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          >
            <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[min(52%,280px)] items-end justify-end opacity-40 md:w-[min(48%,320px)]">
              <div className="h-[85%] w-full pr-2">
                <LeaderboardBarChart />
              </div>
            </div>

            <div className="relative z-10">
              <div className="text-left">
                <p
                  className="text-[clamp(2.75rem,7vw,4.25rem)] font-bold leading-none text-[#1E1E1E]"
                  style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
                >
                  # 1029
                </p>
                <p
                  className="mt-2 text-sm font-bold uppercase tracking-[0.06em] text-[#C780ED] md:text-[15px]"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  Enrolled till now
                </p>
                <p
                  className="mt-2.5 flex items-center gap-2 text-sm font-medium text-[#054742]"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  <span className="inline-block h-2.5 w-2.5 shrink-0 bg-[#3FCBBD]" aria-hidden />
                  31 new people enrolled
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-5 sm:mt-10 sm:flex-row sm:items-end sm:justify-between md:mt-12">
                <div className="max-w-[420px] text-left">
                  <h3
                    className="text-[clamp(1.5rem,3.5vw,2rem)] font-bold leading-tight text-[#1E1E1E]"
                    style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
                  >
                    Leader Boards
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed text-[#5A5A5A] md:text-[15px]"
                    style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                  >
                    Course for Beginners in Shipping teaching the fundamentals and tools
                  </p>
                </div>

                <Link
                  href=" "
                  className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-[#C780ED] px-5 py-3 text-sm font-medium text-black no-underline transition-opacity hover:opacity-90 sm:self-auto md:text-base"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  View Leader Board
                  <LeaderboardChartIcon />
                </Link>
              </div>
            </div>
          </div>

          <RankUpdateMarquee />
        </div>
      </section>

      <section className="bg-[#FDF8F3] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-[920px]">
          <div className="mb-10 text-center md:mb-12">
            <h2
              className="mb-4 text-[clamp(1.75rem,4.5vw,3rem)] font-bold uppercase leading-[1.12] tracking-tight text-[#1E1E1E]"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              Insights for modern operators
            </h2>
            <p
              className="mx-auto max-w-[680px] text-sm leading-relaxed text-[#054742] md:text-base md:leading-[1.65]"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Actionable strategies, shipping intelligence, and operational frameworks to help you build
              and scale with confidence.
            </p>
          </div>

          <InsightsStackedCarousel />
        </div>
      </section>

      <section className="bg-[#FDF8F3] px-4 py-20 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-12 text-center md:mb-16">
            <h2
              className="mb-5 text-[clamp(2rem,5vw,3.5rem)] font-bold uppercase leading-[1.12] tracking-tight text-[#1E1E1E]"
              style={{ fontFamily: '"TASA Orbiter Display", sans-serif' }}
            >
              Explore more insights
            </h2>
            <p
              className="mx-auto max-w-[720px] text-base leading-relaxed text-[#054742] md:text-lg md:leading-[1.65]"
              style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
            >
              Discover more guides, insights, and industry knowledge from the Navaro blog.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {exploreInsights.map((insight) => (
              <ExploreInsightCard key={insight.title} insight={insight} />
            ))}
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
