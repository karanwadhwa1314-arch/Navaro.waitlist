'use client'

import Link from 'next/link'

export default function ToolsCatalogPage() {
  const tools = [
    {
      id: 'cbm',
      title: 'CBM Calculator',
      description:
        'Calculate cubic meters instantly for accurate shipping volume and freight cost estimation.',
      href: '/tools/cbm',
      gradient: 'from-cyan-400 to-blue-500',
    },
    {
      id: 'cbm-3d',
      title: 'CBM Calculator 3D',
      description:
        'Visualize container packing with interactive 3D viewer. See how boxes fit in shipping containers.',
      href: '/tools/cbm-3d',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'duty',
      title: 'Duty Calculation',
      description:
        'Calculate import duties and taxes accurately based on product value and duty rates.',
      href: '/tools/duty',
      gradient: 'from-teal-400 to-cyan-500',
    },
    {
      id: 'pdf-field-comparison',
      title: 'Document Comparison',
      description:
        'Compare specific fields between documents (BL Draft vs SI) automatically.',
      href: '/tools/pdf-field-comparison',
      gradient: 'from-purple-500 to-pink-600',
    },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20">
      <div className="absolute inset-0 z-0 opacity-40">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 min-h-full min-w-full object-cover"
          style={{ objectFit: 'cover' }}
        >
          <source src="/video/2.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
            Shipping <span className="text-cyan-400">Tools</span>
          </h1>
          <p className="mx-auto mb-4 max-w-3xl text-2xl font-medium leading-relaxed text-gray-700">
            Essential tools to streamline your shipping and logistics operations
          </p>
          <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-cyan-400 to-primary-500" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.08]`}
              />
              <div className="relative z-10">
                <h3 className="mb-3 text-2xl font-extrabold leading-tight text-gray-900 transition-colors group-hover:text-cyan-600">
                  {tool.title}
                </h3>
                <p className="mb-6 text-sm font-medium leading-relaxed text-gray-700">{tool.description}</p>
                <span className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-cyan-600 transition-colors group-hover:text-cyan-700">
                  Use tool
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
