'use client'

import Link from 'next/link'
import { useState } from 'react'

export type ToolSlug =
  | 'cbm'
  | 'cbm-3d'
  | 'duty'
  | 'pdf-comparison'
  | 'pdf-field-comparison'
  | 'export-docs'
  | 'landed-cost'

const TOOLS: {
  title: string
  description: string
  href: string
  slug?: ToolSlug
  image: string
}[] = [
  {
    title: 'CBM Calculator',
    description:
      'Quickly calculate cargo volume in cubic meters for accurate shipment planning. Optimise container utilisation and reduce unused shipping space. Ideal for freight estimation across air, sea, and land transport.',
    href: '/tools/cbm',
    slug: 'cbm',
    image: '/image/3d_rendered_shipping_202602131617%201%20removed%20bg.png',
  },
  {
    title: 'Import Duty Calculation',
    description:
      'Estimate customs duties, taxes, and import charges in seconds. Get better visibility into international shipping expenses before importing. Helps businesses avoid unexpected costs and pricing errors.',
    href: '/tools/duty',
    slug: 'duty',
    image: '/image/duty-calculation.png',
  },
  {
    title: 'Export Docs',
    description:
      'Create and organise essential export shipping documents effortlessly. Access invoices, packing lists, shipping bills, and compliance paperwork. Simplifies documentation for faster and smoother global trade operations.',
    href: '/tools/export-docs',
    slug: 'export-docs',
    image: '/image/exports%20docs.png',
  },
  {
    title: 'Landed Cost Calculator',
    description:
      'Calculate the total landed cost of imported goods accurately. Include freight, insurance, duties, taxes, and additional logistics charges. Helps businesses understand true product costs before shipping.',
    href: '/tools/catalog',
    slug: 'landed-cost',
    image: '/image/landedcost-removed%20bg.png',
  },
  {
    title: 'AI Document Checker',
    description:
      'Use AI to review shipping and customs documents instantly. Detect missing details, formatting issues, and compliance errors automatically. Reduce manual mistakes and improve documentation accuracy with confidence.',
    href: '/tools/pdf-field-comparison',
    slug: 'pdf-field-comparison',
    image: '/image/ai-document-check.png',
  },
  {
    title: 'CBM 3D calculator ',
    description:
      'Browse professionally designed shipping and logistics templates. Access ready-to-use formats for invoices, declarations, and trade documents. Save time and standardise your workflow with reusable resources.',
    href: '/tools/cbm-3d',
    slug: 'cbm-3d',
    image: '/image/template-gallery.png',
  },
]

export default function ShippingToolsPanel({
  onSelectTool,
}: {
  onSelectTool?: (slug: ToolSlug) => void
} = {}) {
  return (
    <div className="shipping-tools-panel">
      <header className="mb-8 lg:mb-10">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-navaro-forest sm:text-[2rem]">
          Shipping Tools
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-navaro-forest/65">
          Essential tools to streamline your shipping and logistics operations
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.title} {...tool} onSelectTool={onSelectTool} />
        ))}
      </div>
    </div>
  )
}

function ToolCard({
  title,
  description,
  href,
  slug,
  image,
  onSelectTool,
}: {
  title: string
  description: string
  href: string
  slug?: ToolSlug
  image: string
  onSelectTool?: (slug: ToolSlug) => void
}) {
  const canRenderInline = Boolean(slug && onSelectTool)
  const cta = (
    <span className="inline-flex overflow-hidden rounded-xl shadow-sm ring-1 ring-navaro-purple-cta/15">
      <span className="bg-[#E8DFF5] px-4 py-2.5 text-sm font-semibold text-navaro-forest">Use this tool</span>
      <span className="flex w-10 items-center justify-center border-l border-navaro-purple-cta/20 bg-navaro-purple-cta text-white">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
        </svg>
      </span>
    </span>
  )

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-navaro-forest/10 bg-white shadow-[0_2px_12px_rgba(0,45,45,0.06)]">
      <div className="relative aspect-[16/11] shrink-0 overflow-hidden bg-gradient-to-br from-navaro-cream to-[#eef5f3]">
        <ToolCardImage src={image} title={title} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold text-navaro-forest">{title}</h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-navaro-forest/60">{description}</p>
        <div className="mt-5 flex justify-end">
          {canRenderInline ? (
            <button
              type="button"
              onClick={() => onSelectTool?.(slug as ToolSlug)}
              className="transition hover:brightness-[1.02] focus-visible:outline focus-visible:ring-2 focus-visible:ring-navaro-purple-cta/40"
            >
              {cta}
            </button>
          ) : (
            <Link
              href={href}
              className="transition hover:brightness-[1.02] focus-visible:outline focus-visible:ring-2 focus-visible:ring-navaro-purple-cta/40"
            >
              {cta}
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

function ToolCardImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    <img
      src={src}
      alt=""
      className="absolute inset-0 h-full w-full object-cover object-center"
      onError={() => setFailed(true)}
    />
  )
}
