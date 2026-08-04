'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, type SVGProps } from 'react'

import ShippingToolsPanel, { type ToolSlug } from '@/components/tools/ShippingToolsPanel'
import ExportDocsFlow from '@/components/tools/export-docs/ExportDocsFlow'
import CBMCalculator from '@/components/tools/CbmCalculator'
import Cbm3dCalculator from '@/components/tools/Cbm3dCalculator'
import DutyCalculator from '@/components/tools/DutyCalculator'
import PdfComparison from '@/components/tools/PdfComparison'
import PdfFieldComparison from '@/components/tools/PdfFieldComparison'
import LandedCostCalculator from '@/components/tools/LandedCostCalculator'
import CargoInsuranceContent from '@/components/navfinance/CargoInsuranceContent'
import { resolveAuthUser } from '@/lib/auth/load-user'
import { formatDisplayName, getStoredUser, isAuthenticated } from '@/lib/auth/storage'
import {
  type CargoRfq,
  formatCargoRfqStatus,
  getCargoRfqStatusBadgeClass,
  getUserCargoRFQs,
  normalizeCargoRfqStatus,
} from '@/lib/navfinance/cargo-rfq'
import { openUserDocument } from '@/lib/navfinance/user-document-download'

type FinanceSlug = 'navfinance' | 'cargo-insurance' | 'trade-finance'

const NAV_FINANCE_CHILDREN: { label: string; href: string; slug?: FinanceSlug }[] = [
  { label: 'Cargo Insurance', href: '/dashboard?finance=cargo-insurance', slug: 'cargo-insurance' },
  { label: 'Trade Finance', href: '/dashboard?finance=trade-finance', slug: 'trade-finance' },
]

const SIDEBAR = [
  { kind: 'home' as const, href: '/dashboard', label: 'Home', Icon: IconHome },
  { kind: 'group' as const, id: 'tools', label: 'NavTools', Icon: IconTools },
  {
    kind: 'group' as const,
    id: 'finance',
    label: 'NavFinance',
    Icon: IconFinance,
    href: '/dashboard?finance=navfinance',
    children: NAV_FINANCE_CHILDREN,
  },
  { kind: 'link' as const, href: '', label: 'Blogs', Icon: IconBlogs },
  { kind: 'link' as const, href: '', label: 'Templates', Icon: IconTemplates },
  { kind: 'link' as const, href: '/about', label: 'About Us', Icon: IconAbout },
  { kind: 'link' as const, href: '/contact', label: 'Contact', Icon: IconContact },
] as const

const QUICK: {
  title: string
  desc: string
  href: string
  image: string
  slug?: ToolSlug
}[] = [
  {
    title: 'CBM Calculator',
    desc: 'Calculate cubic meters instantly for acurate volumes',
    href: '/tools/cbm',
    slug: 'cbm',
    image: '/image/3d_rendered_shipping_202602131617%201%20removed%20bg.png',
  },
  {
    title: 'Duty Calculation',
    desc: 'Calculate import duties & taxes with HS code',
    href: '/tools/duty',
    slug: 'duty',
    image: '/image/duty-calculation.png',
  },
  {
    title: 'Export Docs',
    desc: 'Generate essential export shipping documents with ease',
    href: '/tools/export-docs',
    slug: 'export-docs',
    image: '/image/exports%20docs.png',
  },
  {
    title: 'Landed Cost Calculator',
    desc: 'The total cost of shipping including duties, freight, and taxes',
    href: '/tools/catalog',
    slug: 'landed-cost',
    image: '/image/landedcost-removed%20bg.png',
  },
  {
    title: 'AI Document check',
    desc: 'Automatically review shipping documents for errors missing details',
    href: '/tools/pdf-field-comparison',
    slug: 'pdf-field-comparison',
    image: '/image/ai-document-check.png',
  },
  {
    title: 'CBM 3D Calculator',
    desc: 'Visualise cargo packing in real-time 3D',
    href: '/tools/cbm-3d',
    slug: 'cbm-3d',
    image: '/image/template-gallery.png',
  },
]

const INSIGHTS = [
  {
    tag: 'Popular',
    title: 'The 2026 Shipping Costs',
    excerpt:
      'Before entering trade ecosystem, you need structured understanding - not scattered information.',
    category: 'Industry Analysis',
    href: '/dashboard',
    image: '/image/shipping image.png',
  },
  {
    tag: 'Guide',
    title: 'Cut customs delays with cleaner paperwork',
    excerpt: 'Fewer holds at the border with a repeatable documentation rhythm.',
    category: 'Operations',
    href: '/dashboard',
    image: '/image/shipping image.png',
  },
  {
    tag: 'Trend',
    title: 'Freight Basics: where learners stall',
    excerpt: 'Completion curves and how to keep cohorts moving past module four.',
    category: 'Learning',
    href: '/dashboard',
    image: '/image/shipping image.png',
  },
] as const

const BOARD = [
  { rank: 1, name: 'Alex Rivera', pts: 2840, up: true },
  { rank: 2, name: 'Jordan Lee', pts: 2695, up: true },
  { rank: 3, name: 'Sam Okonkwo', pts: 2510, up: false },
  { rank: 4, name: 'Priya Shah', pts: 2398, up: true },
  { rank: 5, name: 'Chris Nguyen', pts: 2312, up: true },
]

function formatRfqDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatRfqPolicyType(value: string) {
  return value === 'specific-marine' ? 'Specific Marine' : 'Marine Open'
}

function formatRfqActivityDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function getRfqActivityTitle(rfq: CargoRfq) {
  const status = normalizeCargoRfqStatus(rfq.status)

  if (status === 'POLICY_ISSUED') return 'Policy document received'
  if (status === 'QUOTE_ACCEPTED') return 'Quote accepted'
  if (status === 'QUOTE_RECEIVED') return 'Quote received'
  if (status === 'PAYMENT_PENDING') return 'Payment pending'
  if (status === 'PAYMENT_DONE') return 'Payment confirmed'
  if (status === 'DOCUMENT_PENDING') return 'Improvement requested'
  if (status === 'RESUBMITTED') return 'Application resubmitted'
  return 'Application status updated'
}

function getRfqActivityMeta(rfq: CargoRfq) {
  const insured = rfq.insuredName || 'Cargo/Marine RFQ'
  return `${insured} moved to ${formatCargoRfqStatus(rfq.status)} · ${formatRfqActivityDate(rfq.updatedAt || rfq.createdAt)}`
}

function NavFinanceHomePanel({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) return <NavFinanceLoggedInPanel />

  return (
    <section className="min-h-[calc(100dvh-5rem)] rounded-[1.25rem] border border-navaro-forest/10 bg-[#FFFDF8] px-5 py-6 shadow-[0_2px_18px_rgba(0,45,45,0.05)] sm:px-8 lg:px-10 lg:py-8">
      <div className="grid min-h-[560px] gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-full bg-navaro-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-navaro-forest">
            NavFinance
          </p>
          <h1 className="text-[2.35rem] font-extrabold leading-[0.98] tracking-[-0.04em] text-navaro-forest sm:text-[3.15rem] lg:text-[4.4rem]">
            Your shipment deserves more than hope.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-navaro-forest/68 sm:text-lg">
            Trade finance and cargo insurance built into your workflow, available when you need them.
          </p>

          <div className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row">
           
            <Link
              href="/dashboard?finance=cargo-insurance"
              className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-navaro-forest px-6 text-sm font-bold text-white no-underline shadow-sm transition hover:bg-navaro-forest/90"
            >
              Get Started →
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-navaro-forest/35">
            <span>Trusted by</span>
            <span>Shippers</span>
            <span>Forwarders</span>
            <span>Exporters</span>
          </div>
        </div>

        <div className="space-y-5">
          <FinanceProductCard
            badge="Available Now"
            title="Protect every shipment"
            description="Get cargo insurance quotes in minutes, then pick the one that fits."
            href="/dashboard?finance=cargo-insurance"
            cta="Get Covered"
          />
          <FinanceProductCard
            badge="Coming Q3"
            title="Fund your next shipment"
            description="Working capital against your PO or invoice, without putting personal assets at risk."
            href="/dashboard?finance=trade-finance"
            cta="Join Waitlist"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-3 border-t border-navaro-forest/10 pt-5 text-xs font-medium text-navaro-forest/65 md:grid-cols-3">
        <div className="flex items-center gap-2">
          <IconFinance className="h-4 w-4 text-navaro-forest" />
          No credit risk to you, Navaro is your LSP, not your lender.
        </div>
        <div className="flex items-center gap-2">
          <IconFinance className="h-4 w-4 text-navaro-forest" />
          Insurance from licensed broker partners, quotes returned, you choose.
        </div>
        <div className="flex items-center gap-2">
          <IconFinance className="h-4 w-4 text-navaro-forest" />
          Your shipment data stays on Navaro, secure and private.
        </div>
      </div>
    </section>
  )
}

function NavFinanceLoggedInPanel({ initialTab = 'insurance' }: { initialTab?: 'insurance' | 'finance' }) {
  const [activeTab, setActiveTab] = useState<'insurance' | 'finance'>(initialTab)

  return (
    <section className="min-h-[calc(100dvh-5rem)] rounded-[1.25rem] border border-navaro-forest/10 bg-[#FFFDF8] px-5 py-6 shadow-[0_2px_18px_rgba(0,45,45,0.05)] sm:px-8 lg:px-10 lg:py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-navaro-forest md:text-4xl">
            NavFinance
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navaro-forest/65 md:text-base">
            Manage your insurance policies, finance applications, and shipment-related financial activity in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard?finance=cargo-insurance"
            className="inline-flex items-center justify-center rounded-xl bg-navaro-forest px-5 py-3 text-xs font-bold text-white no-underline shadow-sm transition hover:bg-navaro-forest/90"
          >
            Get Insurance For A New Shipment
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF8F5] text-navaro-forest"
            aria-label="Notifications"
          >
            <IconBell className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-8 flex gap-7 border-b border-navaro-forest/10 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('insurance')}
          className={`pb-3 transition ${
            activeTab === 'insurance'
              ? 'border-b-2 border-navaro-forest text-navaro-forest'
              : 'text-navaro-forest/50 hover:text-navaro-forest'
          }`}
        >
          Insurance
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className={`pb-3 transition ${
            activeTab === 'finance'
              ? 'border-b-2 border-navaro-forest text-navaro-forest'
              : 'text-navaro-forest/50 hover:text-navaro-forest'
          }`}
        >
          Finance
        </button>
      </div>

      {activeTab === 'insurance' ? <InsuranceDashboardPanel /> : <FinanceDashboardPanel />}
    </section>
  )
}

function InsuranceDashboardPanel() {
  const [rfqs, setRfqs] = useState<CargoRfq[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadLatestRfqs() {
      setLoading(true)
      setError(null)

      const result = await getUserCargoRFQs({ limit: 3 })
      if (cancelled) return

      if (!result.success) {
        setRfqs([])
        setError(result.error)
        setLoading(false)
        return
      }

      const latest = [...result.data.rfqs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)

      setRfqs(latest)
      setLoading(false)
    }

    void loadLatestRfqs()
    return () => {
      cancelled = true
    }
  }, [])

  function openRfqDocument(fileUrl: string, fileName?: string, mode: 'view' | 'download' = 'view') {
    void openUserDocument(fileUrl, fileName, mode).then((result) => {
      if (!result.success) setError(result.error)
    })
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-navaro-forest">My Cargo/Marine RFQs</h2>
            <p className="mt-1 text-sm text-navaro-forest/60">
              Latest 3 RFQs from your cargo insurance applications.
            </p>
          </div>
          <Link
            href="/dashboard/cargo-rfqs"
            className="text-sm font-bold text-navaro-forest no-underline underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-[#e8e8e8] bg-white p-4 shadow-sm md:p-5">
          {loading && (
            <p className="py-10 text-center text-sm text-[#888]">Loading RFQs...</p>
          )}

          {!loading && error && (
            <p className="py-10 text-center text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && rfqs.length === 0 && (
            <p className="py-10 text-center text-sm text-[#888]">No Cargo/Marine RFQs found.</p>
          )}

          {!loading && !error && rfqs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-[#8E8E8E]">
                    <th className="border-b border-[#eee] px-3 py-3">Insured</th>
                    <th className="border-b border-[#eee] px-3 py-3">Policy</th>
                    <th className="border-b border-[#eee] px-3 py-3">Transit</th>
                    <th className="border-b border-[#eee] px-3 py-3">Status</th>
                    <th className="border-b border-[#eee] px-3 py-3">Documents</th>
                    <th className="border-b border-[#eee] px-3 py-3">Created</th>
                    <th className="border-b border-[#eee] px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map((rfq) => (
                    <tr key={rfq.id} className="text-sm text-[#1a1a1a]">
                      <td className="border-b border-[#f1f1f1] px-3 py-4 font-semibold">{rfq.insuredName || '-'}</td>
                      <td className="border-b border-[#f1f1f1] px-3 py-4">{formatRfqPolicyType(rfq.policyType)}</td>
                      <td className="border-b border-[#f1f1f1] px-3 py-4">{rfq.transitType || '-'}</td>
                      <td className="border-b border-[#f1f1f1] px-3 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCargoRfqStatusBadgeClass(rfq.status)}`}>
                          {formatCargoRfqStatus(rfq.status)}
                        </span>
                      </td>
                      <td className="border-b border-[#f1f1f1] px-3 py-4">
                        {rfq.documents.length === 0 ? (
                          <span className="text-xs text-[#888]">No documents</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {rfq.documents.map((document) => (
                              <span key={document.id} className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openRfqDocument(document.fileUrl, document.fileName)}
                                  className="text-left text-xs font-semibold text-[#00433E] underline-offset-4 hover:underline"
                                >
                                  {document.fileName || document.documentType}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openRfqDocument(document.fileUrl, document.fileName, 'download')}
                                  className="text-xs font-semibold text-[#00433E] underline-offset-4 hover:underline"
                                >
                                  Download
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="border-b border-[#f1f1f1] px-3 py-4">{formatRfqDate(rfq.createdAt)}</td>
                      <td className="border-b border-[#f1f1f1] px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/dashboard/cargo-rfqs/${encodeURIComponent(rfq.id)}`}
                            className="font-semibold text-[#00433E] no-underline underline-offset-4 hover:underline"
                          >
                            View
                          </Link>
                          {normalizeCargoRfqStatus(rfq.status) === 'DOCUMENT_PENDING' && (
                            <Link
                              href={`/dashboard/cargo-rfqs/${encodeURIComponent(rfq.id)}`}
                              className="font-semibold text-[#00433E] no-underline underline-offset-4 hover:underline"
                            >
                              Improve/Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[1.15rem] border border-navaro-forest/10 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-xl font-extrabold text-navaro-forest">Recent Activity</h2>
          <div className="space-y-4">
            {loading && <p className="text-sm font-medium text-navaro-forest/45">Loading recent activity...</p>}

            {!loading && error && (
              <p className="text-sm font-medium text-red-600">Unable to load recent activity.</p>
            )}

            {!loading && !error && rfqs.length === 0 && (
              <p className="text-sm font-medium text-navaro-forest/45">No recent activity found.</p>
            )}

            {!loading &&
              !error &&
              rfqs.map((rfq, index) => (
                <ActivityItem
                  key={rfq.id}
                  title={getRfqActivityTitle(rfq)}
                  meta={getRfqActivityMeta(rfq)}
                  done={index < 2}
                />
              ))}
          </div>
        </section>

        <aside className="rounded-[1.15rem] border border-navaro-forest/10 bg-gradient-to-br from-[#F5FBF7] to-[#EAF5EF] p-6 shadow-sm">
          <span className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-navaro-forest shadow-sm">
            <IconFinance className="h-5 w-5" />
          </span>
          <h3 className="text-lg font-extrabold leading-tight text-navaro-forest">
            You shipped to UAE last month, insure your next one in 2 minutes
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-navaro-forest/62">
            Fast-track your application using details from your previous successful shipment.
          </p>
          <Link
            href="/dashboard?finance=cargo-insurance"
            className="mt-6 inline-flex rounded-xl bg-navaro-forest px-5 py-3 text-sm font-bold text-white no-underline"
          >
            Start Application →
          </Link>
        </aside>
      </div>
    </div>
  )
}

function FinanceDashboardPanel() {
  return (
    <section className="rounded-[1.25rem] border border-navaro-forest/10 bg-white p-8 text-center shadow-sm">
      <p className="mx-auto mb-4 inline-flex rounded-full bg-navaro-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-navaro-forest">
        Coming Q3
      </p>
      <h1 className="text-3xl font-extrabold text-navaro-forest">Trade Finance is coming soon</h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-navaro-forest/65 md:text-base">
        Working capital against purchase orders and invoices will be available here. For now, you can join the waitlist from the NavFinance home screen.
      </p>
      <Link
        href="/dashboard?finance=navfinance"
        className="mt-8 inline-flex rounded-xl bg-navaro-forest px-6 py-3 text-sm font-bold text-white no-underline"
      >
        Back to NavFinance
      </Link>
    </section>
  )
}

function ActivityItem({ title, meta, done = false }: { title: string; meta: string; done?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className={`mt-1 h-4 w-4 rounded-full border-2 ${done ? 'border-navaro-forest bg-white' : 'border-navaro-forest/20 bg-white'}`} />
      <div>
        <p className="text-sm font-bold text-navaro-forest">{title}</p>
        <p className="mt-0.5 text-xs font-medium text-navaro-forest/45">{meta}</p>
      </div>
    </div>
  )
}

function FinanceProductCard({
  badge,
  title,
  description,
  href,
  cta,
}: {
  badge: string
  title: string
  description: string
  href: string
  cta: string
}) {
  return (
    <article className="rounded-[1.35rem] border border-navaro-forest/10 bg-white p-5 shadow-[0_10px_30px_rgba(0,45,45,0.06)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="rounded-full bg-navaro-accent-soft px-3 py-1 text-[10px] font-bold text-navaro-forest">
          {badge}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4FBF8] text-navaro-forest">
          <IconFinance className="h-4 w-4" />
        </span>
      </div>
      <h2 className="text-lg font-extrabold text-navaro-forest">{title}</h2>
      <p className="mt-3 min-h-[56px] text-sm leading-relaxed text-navaro-forest/62">{description}</p>
      <Link
        href={href}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-navaro-forest px-4 py-3 text-sm font-bold text-white no-underline transition hover:bg-navaro-forest/90"
      >
        {cta}
      </Link>
    </article>
  )
}

function TradeFinanceComingSoon() {
  return (
    <section className="rounded-[1.25rem] border border-navaro-forest/10 bg-white p-8 text-center shadow-sm">
      <p className="mx-auto mb-4 inline-flex rounded-full bg-navaro-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-navaro-forest">
        Coming Q3
      </p>
      <h1 className="text-3xl font-extrabold text-navaro-forest">Trade Finance is coming soon</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-navaro-forest/65">
        Working capital against purchase orders and invoices will be available here. For now, you can join the waitlist from the NavFinance home screen.
      </p>
      <Link
        href="/dashboard?finance=navfinance"
        className="mt-6 inline-flex rounded-xl bg-navaro-forest px-5 py-3 text-sm font-bold text-white no-underline"
      >
        Back to NavFinance
      </Link>
    </section>
  )
}

export default function ToolsHomeDashboard() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  /** Narrow icon rail by default; bottom chevron expands to show labels (lg+). */
  const [collapsed, setCollapsed] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  /** In-page Shipping Tools grid (sidebar "Tools") vs default dashboard home. */
  const [mainPanel, setMainPanel] = useState<'home' | 'shipping-tools'>('home')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    tools: false,
    finance: false,
  })
  const [locationHash, setLocationHash] = useState('')
  const [userName, setUserName] = useState(() => {
    const cached = getStoredUser()
    return cached?.name ? formatDisplayName(cached.name) : ''
  })
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated())

  useEffect(() => {
    let cancelled = false

    async function loadSession() {
      const user = await resolveAuthUser()
      if (cancelled) return

      if (user) {
        setUserName(user.name ? formatDisplayName(user.name) : '')
        setIsLoggedIn(true)
        return
      }

      setUserName('')
      setIsLoggedIn(false)
    }

    void loadSession()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const syncHash = () => setLocationHash(window.location.hash)
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [pathname])

  /** Currently opened tool rendered inline inside the dashboard. */
  const [activeTool, setActiveTool] = useState<ToolSlug | null>(null)
  const [landedCostFormOpen, setLandedCostFormOpen] = useState(false)
  const sidebarW = collapsed ? 'w-[76px]' : 'w-[260px]'

  const TOOL_TITLES: Record<ToolSlug, string> = {
    cbm: 'CBM Calculator',
    'cbm-3d': 'CBM 3D Packing',
    duty: 'Import Duty Calculation',
    'pdf-comparison': 'PDF Text Comparison',
    'pdf-field-comparison': 'AI Document Checker',
    'export-docs': 'Export Docs',
    'landed-cost': 'Landed Cost Calculator',
  }

  const toolFromUrl = searchParams.get('tool')
  const financeFromUrl = searchParams.get('finance')
  const panelFromUrl = searchParams.get('panel') === 'shipping-tools' ? 'shipping-tools' : 'home'

  const FINANCE_TITLES: Record<FinanceSlug, string> = {
    navfinance: 'NavFinance',
    'cargo-insurance': 'Cargo Insurance',
    'trade-finance': 'Trade Finance',
  }

  const activeFinance: FinanceSlug | null =
    financeFromUrl === 'navfinance' ||
    financeFromUrl === 'cargo-insurance' ||
    financeFromUrl === 'trade-finance'
      ? financeFromUrl
      : null

  useEffect(() => {
    if (activeFinance) {
      setActiveTool(null)
      setMainPanel('home')
      setLandedCostFormOpen(false)
      return
    }

    if (toolFromUrl && toolFromUrl in TOOL_TITLES) {
      setActiveTool(toolFromUrl as ToolSlug)
      setMainPanel(panelFromUrl)
      return
    }

    setActiveTool(null)
    setMainPanel(panelFromUrl)
    setLandedCostFormOpen(false)
  }, [toolFromUrl, panelFromUrl, activeFinance])

  useEffect(() => {
    setExpandedGroups((prev) => ({
      ...prev,
      finance: pathname.startsWith('/navfinance') || activeFinance !== null ? true : prev.finance,
      tools: panelFromUrl === 'shipping-tools' || mainPanel === 'shipping-tools' ? true : prev.tools,
    }))
  }, [pathname, panelFromUrl, mainPanel, activeFinance])

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const openToolFromDashboard = (slug: ToolSlug) => {
    setLandedCostFormOpen(false)
    router.push(`/dashboard?tool=${slug}&panel=home`)
  }

  const openToolFromShippingPanel = (slug: ToolSlug) => {
    setLandedCostFormOpen(false)
    router.push(`/dashboard?tool=${slug}&panel=shipping-tools`)
  }

  const goDashboardHome = () => {
    setLandedCostFormOpen(false)
    router.push('/dashboard')
  }

  const goShippingToolsPanel = () => {
    setLandedCostFormOpen(false)
    router.push('/dashboard?panel=shipping-tools')
  }

  return (
    <div
      id="tools-dashboard-root"
      className="flex min-h-screen w-full bg-navaro-cream font-sans text-navaro-ink antialiased"
    >
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar: click empty rail / padding toggles width; nav links and controls stopPropagation */}
      <aside
        className={`tools-dashboard-sidebar fixed inset-y-0 left-0 z-50 flex shrink-0 cursor-pointer flex-col overflow-hidden border-r border-navaro-forest/10 bg-[#FFFCF5] shadow-[2px_0_24px_rgba(0,45,45,0.04)] transition-[width] duration-300 ease-out lg:static lg:z-0 ${sidebarW} ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        onClick={() => setCollapsed((c) => !c)}
      >
        <div
          className={`flex h-[76px] shrink-0 items-center border-b border-navaro-forest/10 px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}
        >
          <Link
            href="/"
            className="flex cursor-pointer items-center gap-3 font-semibold tracking-tight text-navaro-forest"
            onClick={(e) => e.stopPropagation()}
          >
            <LogoNavaro className="h-11 w-11 shrink-0" />
            {!collapsed && <span className="text-[1.35rem] font-semibold lowercase tracking-tight">navaro</span>}
          </Link>
        </div>

        <nav
          id="tools-dashboard-sidebar-nav"
          className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden p-3"
        >
          {SIDEBAR.map((item) => {
            const { label, Icon } = item

            const rowClass = (active: boolean) =>
              `flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-3 text-left text-[0.9375rem] font-semibold transition-colors ${
                active
                  ? 'bg-navaro-accent-soft text-navaro-forest'
                  : 'text-navaro-forest/75 hover:bg-white/90'
              } ${collapsed ? 'justify-center px-2' : ''}`

            if (item.kind === 'home') {
              const active =
                pathname === item.href && mainPanel === 'home' && activeTool === null && activeFinance === null
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCollapsed(false)
                    goDashboardHome()
                    setMobileOpen(false)
                  }}
                  title={collapsed ? label : undefined}
                  className={rowClass(active)}
                >
                  <Icon className="h-6 w-6 shrink-0 opacity-90" />
                  {!collapsed && <span className="flex-1">{label}</span>}
                </Link>
              )
            }

            if (item.kind === 'group') {
              const isTools = item.id === 'tools'
              const active = isTools
                ? mainPanel === 'shipping-tools'
                : pathname.startsWith('/navfinance') || activeFinance !== null
              const isExpanded = expandedGroups[item.id]
              const parentHref = 'href' in item ? item.href : undefined
              const children = 'children' in item ? item.children : undefined

              return (
                <div key={item.id} className="flex flex-col">
                  <div className={rowClass(active)}>
                    {isTools ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCollapsed(false)
                          goShippingToolsPanel()
                          setExpandedGroups((prev) => ({ ...prev, tools: true }))
                          setMobileOpen(false)
                        }}
                        title={collapsed ? label : undefined}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <Icon className="h-6 w-6 shrink-0 opacity-90" />
                        {!collapsed && <span className="flex-1">{label}</span>}
                      </button>
                    ) : (
                      <Link
                        href={parentHref ?? '#'}
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          setCollapsed(false)
                          setExpandedGroups((prev) => ({ ...prev, finance: true }))
                          router.push('/dashboard?finance=navfinance')
                          setMobileOpen(false)
                        }}
                        title={collapsed ? label : undefined}
                        className="flex min-w-0 flex-1 items-center gap-3 no-underline"
                      >
                        <Icon className="h-6 w-6 shrink-0 opacity-90" />
                        {!collapsed && <span className="flex-1 text-inherit">{label}</span>}
                      </Link>
                    )}
                    {!collapsed && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleGroup(item.id)
                        }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-navaro-forest/60 transition hover:bg-white/80 hover:text-navaro-forest"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
                      >
                        <IconChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                        />
                      </button>
                    )}
                  </div>

                  {!collapsed && isExpanded && children && children.length > 0 && (
                    <div className="relative ml-[1.35rem] border-l border-navaro-forest/15 pl-4">
                      {children.map((child, index) => {
                        const childHash = child.href.includes('#') ? child.href.slice(child.href.indexOf('#')) : ''
                        const childActive = child.slug
                          ? activeFinance === child.slug
                          : pathname.startsWith('/navfinance') &&
                            (locationHash === childHash ||
                              (index === 0 && !locationHash && pathname === '/navfinance'))

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={(e) => {
                              e.stopPropagation()
                              setMobileOpen(false)
                              if (child.slug) {
                                e.preventDefault()
                                router.push(child.href)
                              }
                            }}
                            className={`relative block py-2.5 pl-3 text-[0.875rem] font-medium no-underline transition-colors before:absolute before:left-[-1rem] before:top-[1.125rem] before:h-px before:w-3 before:bg-navaro-forest/15 ${
                              childActive
                                ? 'font-semibold text-navaro-forest'
                                : 'text-navaro-forest/70 hover:text-navaro-forest'
                            }`}
                          >
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.stopPropagation()
                  setCollapsed(false)
                  setMobileOpen(false)
                }}
                title={collapsed ? label : undefined}
                className={rowClass(pathname === item.href)}
              >
                <Icon className="h-6 w-6 shrink-0 opacity-90" />
                {!collapsed && <span className="flex-1">{label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="relative z-10 mt-auto flex shrink-0 flex-col gap-3 border-t border-navaro-forest/10 p-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setCollapsed((c) => !c)
            }}
            className="mx-auto flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-navaro-teal text-white shadow-md transition hover:brightness-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-navaro-forest/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5]"
            aria-expanded={!collapsed}
            aria-controls="tools-dashboard-sidebar-nav"
            aria-label={collapsed ? 'Expand sidebar to show menu names' : 'Collapse sidebar to icons only'}
          >
            <IconRailDoubleArrow pointRight={collapsed} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setMobileOpen(false)
            }}
            className="w-full cursor-pointer rounded-2xl bg-navaro-forest py-3 text-sm font-semibold text-white lg:hidden"
          >
            Close menu
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-navaro-forest/10 bg-[#FFFCF5]/95 px-4 backdrop-blur-md lg:hidden">
            <button
              type="button"
              className="rounded-xl border border-navaro-forest/15 bg-white p-2.5 text-navaro-forest shadow-sm"
              onClick={() => {
              setCollapsed(false)
              setMobileOpen(true)
            }}
              aria-label="Open menu"
            >
              <IconMenu />
            </button>
            <LogoNavaro className="h-9 w-9" />
            <span className="w-10" aria-hidden />
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            {activeFinance ? (
              activeFinance === 'navfinance' ? (
                <NavFinanceHomePanel isLoggedIn={isLoggedIn} />
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard?finance=navfinance')}
                      className="inline-flex items-center gap-2 rounded-xl border border-navaro-forest/15 bg-white px-4 py-2 text-sm font-semibold text-navaro-forest shadow-sm transition hover:bg-navaro-cream"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to NavFinance
                    </button>
                    <h2 className="text-lg font-bold text-navaro-forest sm:text-xl">
                      {FINANCE_TITLES[activeFinance]}
                    </h2>
                  </div>
                  {activeFinance === 'cargo-insurance' && <CargoInsuranceContent variant="embedded" />}
                  {activeFinance === 'trade-finance' && <TradeFinanceComingSoon />}
                </div>
              )
            ) : activeTool ? (
              <div className="space-y-6">
                {!(activeTool === 'landed-cost' && landedCostFormOpen) && (
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (mainPanel === 'shipping-tools') {
                        goShippingToolsPanel()
                      } else {
                        goDashboardHome()
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-navaro-forest/15 bg-white px-4 py-2 text-sm font-semibold text-navaro-forest shadow-sm transition hover:bg-navaro-cream"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    {mainPanel === 'shipping-tools' ? 'Back to Shipping Tools' : 'Back to Dashboard'}
                  </button>
                  <h2 className="text-lg font-bold text-navaro-forest sm:text-xl">
                    {TOOL_TITLES[activeTool]}
                  </h2>
                </div>
                )}
                {activeTool === 'export-docs' ? (
                  <ExportDocsFlow />
                ) : activeTool === 'landed-cost' ? (
                  <LandedCostCalculator onFormOpenChange={setLandedCostFormOpen} />
                ) : (
                  <div className="max-h-[calc(100dvh-10rem)] min-h-0 overflow-y-auto overflow-x-hidden rounded-[1rem] border border-navaro-forest/10 bg-white shadow-[0_2px_12px_rgba(0,45,45,0.06)]">
                    {activeTool === 'cbm' && <CBMCalculator showHeader={false} />}
                    {activeTool === 'cbm-3d' && <Cbm3dCalculator />}
                    {activeTool === 'duty' && <DutyCalculator />}
                    {activeTool === 'pdf-comparison' && <PdfComparison />}
                    {activeTool === 'pdf-field-comparison' && <PdfFieldComparison />}
                  </div>
                )}
              </div>
            ) : mainPanel === 'shipping-tools' ? (
              <ShippingToolsPanel
                onSelectTool={(slug) => {
                  openToolFromShippingPanel(slug)
                }}
              />
            ) : (
              <>
            <header className="mb-8 flex items-start justify-between gap-4 lg:mb-10">
              <div className="min-w-0">
                <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-navaro-forest sm:text-[2rem]">
                  {userName ? `Hi, ${userName}!` : 'Hi there!'}
                </h1>
                <p className="mt-2 text-base text-navaro-forest/65">
                  Let&apos;s keep mastering the art of shipping.
                </p>
              </div>
              <div className="shrink-0 pt-0.5">
                {isLoggedIn ? (
                  <Link
                    href="/profile"
                    aria-label={userName ? `Go to ${userName}'s profile` : 'Go to profile'}
                    className="group relative inline-flex shrink-0 rounded-full transition hover:scale-[1.04] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navaro-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5]"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-navaro-teal via-[#2a8f84] to-[#145c55] text-lg font-bold text-white shadow-[0_4px_16px_rgba(0,45,45,0.24)] ring-2 ring-white transition group-hover:shadow-[0_6px_22px_rgba(0,45,45,0.32)] sm:h-[3.25rem] sm:w-[3.25rem] sm:text-xl">
                      {userName ? userName.charAt(0).toUpperCase() : <IconUser className="h-6 w-6 sm:h-7 sm:w-7" />}
                    </span>
                    <span
                      className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-navaro-accent text-navaro-forest shadow-sm transition group-hover:scale-110 sm:h-5 sm:w-5"
                      aria-hidden
                    >
                      <IconChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-2xl border border-navaro-forest/15 bg-white px-5 py-3 text-sm font-semibold text-navaro-forest shadow-[0_4px_16px_rgba(0,45,45,0.08)] transition hover:border-navaro-teal/25 hover:bg-navaro-cream hover:shadow-[0_6px_20px_rgba(0,45,45,0.12)] sm:px-6 sm:py-3.5 sm:text-base"
                  >
                    Login / Signup
                  </Link>
                )}
              </div>
            </header>

            {/* Hero */}
            <section className="relative mb-10 overflow-hidden rounded-[1.25rem] shadow-[0_12px_40px_rgba(0,45,45,0.12)] lg:rounded-2xl">
              <img
                src="/image/Gemini_Generated_Image_4tx6j34tx6j34tx6%201.png"
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a1628]/88 via-[#0d3834]/55 to-transparent" />
              <div className="relative px-6 py-8 sm:px-10 sm:py-10 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8 lg:py-12">
                <div>
                  {/* <div className="mb-6 max-w-2xl space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Hey Minni!</h2>
                    <p className="text-lg font-medium text-white sm:text-xl">
                      You&apos;re{' '}
                      <span className="text-2xl font-bold text-navaro-accent sm:text-[1.75rem]">58%</span> through
                      Freight Basics Course
                    </p>
                    <p className="text-sm font-medium leading-relaxed text-white/90 sm:text-base">
                      Keep going! Complete the next lesson to earn your certificate.
                    </p>
                  </div> */}
                  <div className="mb-8 h-2.5 max-w-md overflow-hidden rounded-full bg-white/15">
                    <div className="h-full w-[58%] rounded-full bg-navaro-accent shadow-[0_0_24px_rgba(252,232,131,0.45)]" />
                  </div> 
                  <div className="mt-16 flex flex-wrap gap-3">
                    <Link
                      href="/course"
                      className="inline-flex items-center gap-2 rounded-2xl bg-navaro-purple-cta px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                    >
                      Continue Learning
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link
                      href="/course"
                      className="inline-flex items-center rounded-2xl border-2 border-white/40 bg-white px-6 py-3.5 text-sm font-semibold text-navaro-forest shadow-sm transition hover:bg-white/95"
                    >
                      Explore Resources
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Tools */}
            <section className="mb-12 lg:mb-14">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-navaro-forest sm:text-2xl">Quick Tools</h2>
                  <p className="mt-1 text-sm text-navaro-forest/55">Jump into the tools you use most.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    goShippingToolsPanel()
                  }}
                  className="text-sm font-semibold text-navaro-forest underline-offset-4 transition hover:underline"
                >
                  View all tools →
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {QUICK.map(({ title, desc, href, image, slug }) => {
                  const cardClass =
                    'group relative flex min-h-[148px] w-full overflow-hidden rounded-2xl border border-navaro-forest/10 bg-white p-5 text-left transition hover:border-navaro-accent/40 hover:shadow-[0_4px_20px_rgba(0,45,45,0.08)] sm:min-h-[156px]'
                  const cardBody = (
                    <>
                      <div className="relative z-10 flex max-w-[58%] flex-col justify-center pr-2">
                        <h3 className="mb-2 text-base font-bold leading-snug text-navaro-forest sm:text-lg">{title}</h3>
                        <p className="text-sm leading-snug text-navaro-forest/55">{desc}</p>
                      </div>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[70%] items-center justify-end">
                        <QuickToolCardImage src={image} title={title} />
                      </div>
                      <span
                        className="absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-lg border border-navaro-forest/10 bg-navaro-cream text-navaro-forest/50 transition group-hover:border-navaro-accent/50 group-hover:bg-navaro-accent/30 group-hover:text-navaro-forest"
                        aria-hidden
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
                        </svg>
                      </span>
                    </>
                  )

                  if (slug) {
                    return (
                      <button
                        key={title}
                        type="button"
                        onClick={() => {
                          openToolFromDashboard(slug)
                        }}
                        className={cardClass}
                      >
                        {cardBody}
                      </button>
                    )
                  }

                  return (
                    <Link key={title} href={href} className={cardClass}>
                      {cardBody}
                    </Link>
                  )
                })}
              </div>
            </section>

            {/* Insights */}
            <section>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <h2 className="text-xl font-bold tracking-tight text-navaro-forest sm:text-2xl">
                  Discover more insights
                </h2>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-navaro-forest underline-offset-4 transition hover:underline"
                >
                  View all insights →
                </Link>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {INSIGHTS.map((post) => (
                  <Link
                    key={post.title}
                    href={post.href}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-navaro-forest/10 bg-white transition hover:border-sky-400/70 hover:shadow-[0_8px_28px_rgba(0,45,45,0.1)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#c5ddd9] via-navaro-cream to-[#e8f4f2]">
                      <InsightCardImage src={post.image} title={post.title} />
                      <span className="absolute left-3 top-3 rounded-lg bg-[#D1B3E8] px-3 py-1 text-xs font-semibold text-navaro-forest">
                        {post.tag}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-2 text-lg font-bold leading-snug text-navaro-forest">{post.title}</h3>
                      <p className="mb-5 flex-1 text-sm leading-relaxed text-navaro-forest/55">{post.excerpt}</p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-lg bg-navaro-accent-soft px-3 py-1.5 text-xs font-medium text-navaro-forest">
                          {post.category}
                        </span>
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navaro-accent text-navaro-forest transition group-hover:scale-105"
                          aria-hidden
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
              </>
            )}
          </main>
        </div>

        {/* Right rail — hidden on Shipping Tools and any active tool view to match full-width tools layout */}
        {mainPanel === 'home' && activeTool === null && activeFinance === null && (
        <aside className="w-full shrink-0 border-t border-navaro-forest/10 bg-navaro-panel px-4 py-8 lg:w-[300px] lg:border-l lg:border-t-0 xl:w-[320px] xl:px-6">
          <div className="mx-auto max-w-md space-y-8 lg:sticky lg:top-8 lg:mx-0">
            <section className="rounded-[1rem] border border-navaro-forest/10 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <span className="text-navaro-forest">
                  <IconTrophy className="h-7 w-7" />
                </span>
                <h3 className="text-lg font-bold text-navaro-forest">Leaderboard</h3>
              </div>
              <div className="relative">
                <ul className="space-y-3 blur-[6px] select-none pointer-events-none">
                  {BOARD.map((row) => (
                    <li
                      key={row.rank}
                      className="flex items-center gap-3 rounded-xl px-1 py-1.5 text-sm"
                    >
                      <span className="w-6 font-bold tabular-nums text-navaro-forest/45">{row.rank}</span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navaro-cream to-[#e0f2ef] text-xs font-bold text-navaro-forest ring-1 ring-navaro-forest/10">
                        {row.name
                          .split(' ')
                          .map((s) => s[0])
                          .join('')}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium text-navaro-forest">{row.name}</span>
                      <span className="font-semibold tabular-nums text-navaro-forest">{row.pts}</span>
                      <span className={row.up ? 'text-emerald-600' : 'text-rose-500'}>{row.up ? '↑' : '↓'}</span>
                    </li>
                  ))}
                </ul>
                {/* <div className="absolute inset-0 flex items-center justify-center">
                  <Link
                    href="/dashboard"
                    className="rounded-xl bg-navaro-forest px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-navaro-forest/90 transition-colors no-underline"
                  >
                    Login to View
                  </Link>
                </div> */}
              </div>
              {/* <div className="mt-4 rounded-xl bg-navaro-accent-soft px-4 py-3">
                <div className="flex items-center justify-between text-sm font-semibold text-navaro-forest">
                  <span>You · #24</span>
                  <span className="tabular-nums">690 pts</span>
                </div>
                <p className="mt-1 text-xs font-medium text-navaro-forest/70">+23 vs last week</p>
              </div> */}
              <Link
                href="/dashboard"
                className="mt-4 block text-center text-sm font-semibold text-navaro-forest/55 underline-offset-4 hover:text-navaro-forest hover:underline"
              >
                View full leaderboard →
              </Link>
            </section>

            {/* <section className="rounded-[1rem] border border-navaro-forest/10 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-orange-500">
                  <IconFlame className="h-7 w-7" />
                </span>
                <h3 className="text-lg font-bold text-navaro-forest">5 Day Streak</h3>
              </div>
              <div className="mb-4 flex justify-between gap-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={`${d}-${i}`} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-navaro-forest/45">{d}</span>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                        i < 5 ? 'bg-navaro-teal text-white shadow-inner' : 'bg-navaro-cream text-navaro-forest/30'
                      }`}
                    >
                      {i < 5 ? '✓' : ''}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-navaro-forest/70">
                Keep it up minni! You&apos;re building real expertise.
              </p>
            </section> */}
          </div>
        </aside>
        )}
      </div>
    </div>
  )
}

function InsightCardImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    <img
      src={src}
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}

function QuickToolCardImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className="h-24 w-24 rounded-xl bg-gradient-to-br from-navaro-cream to-[#eef5f3] ring-1 ring-navaro-forest/5"
        aria-hidden
      />
    )
  }

  return (
    <img
      src={src}
      alt=""
      className="max-h-[7.5rem] max-w-full object-contain object-right"
      onError={() => setFailed(true)}
    />
  )
}

function LogoNavaro({ className }: { className?: string }) {
  return (
    <img
      src="/image/navaro%20logo.png"
      alt="Navaro"
      className={`object-contain ${className ?? ''}`}
    />
  )
}

/** « collapse · » expand — matches dashboard screenshots (guillemets in the teal circle). */
function IconRailDoubleArrow({ pointRight }: { pointRight: boolean }) {
  return (
    <span
      className="block select-none font-sans text-[1.125rem] font-extrabold leading-none tracking-tight transition-opacity duration-200"
      aria-hidden
    >
      {pointRight ? '»' : '«'}
    </span>
  )
}

function IconMenu() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function IconHome(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1v-10.5z" />
    </svg>
  )
}
function IconTools(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  )
}
function IconFinance(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10h.01M18 14h.01" />
    </svg>
  )
}
function IconBell(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a3 3 0 006 0" />
    </svg>
  )
}
function IconChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  )
}
function IconBlogs(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}
function IconTemplates(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
function IconAbout(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function IconContact(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function IconCube(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}
function IconPercent(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}
function IconExport(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v9m0-9l3 3m-3-3l-3 3m9-5v10a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h6a2 2 0 012 2z" />
    </svg>
  )
}
function IconChart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
function IconDoc(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l4 4v15a2 2 0 01-2 2z" />
      <path strokeLinecap="round" d="M13 3v4h4" />
    </svg>
  )
}
function IconGallery(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function IconUser(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function IconChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function IconTrophy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9H4.5a2 2 0 00-2 2v1h3m13-3H19.5a2 2 0 012 2v1h-3M6 9V7a2 2 0 012-2h8a2 2 0 012 2v2M6 9v8a2 2 0 002 2h8a2 2 0 002-2V9M9 21h6m-5-4v4" />
    </svg>
  )
}

function IconFlame(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2s3 4 3 7a4 4 0 11-8 0c0-1 .5-3 2-5-2 2-3 5-3 8a7 7 0 1014 0c0-5-4-8-8-10z" />
    </svg>
  )
}
