'use client'

import Link from 'next/link'

export default function Blogs() {
  const blogs = [
    {
      slug: 'understanding-international-shipping-regulations',
      title: 'Understanding International Shipping Regulations',
      excerpt: 'A comprehensive guide to navigating international shipping regulations and compliance requirements for global trade.',
      category: 'Shipping Basics',
      date: 'November 15, 2024',
      readTime: '5 min read',
    },
    {
      slug: 'how-to-calculate-shipping-costs-accurately',
      title: 'How to Calculate Shipping Costs Accurately',
      excerpt: 'Learn the essential factors that affect shipping costs and how to calculate them accurately for your business.',
      category: 'Cost Optimization',
      date: 'November 10, 2024',
      readTime: '7 min read',
    },
    {
      slug: 'customs-documentation-complete-checklist',
      title: 'Customs Documentation: Complete Checklist',
      excerpt: 'Everything you need to know about customs documentation, including required forms and filing procedures.',
      category: 'International Shipping',
      date: 'November 5, 2024',
      readTime: '6 min read',
    },
    {
      slug: 'hs-code-classification-made-simple',
      title: 'HS Code Classification Made Simple',
      excerpt: 'Master the Harmonized System code classification process to ensure accurate product categorization.',
      category: 'International Shipping',
      date: 'October 28, 2024',
      readTime: '8 min read',
    },
    {
      slug: 'packaging-best-practices-for-safe-shipping',
      title: 'Packaging Best Practices for Safe Shipping',
      excerpt: 'Essential packaging techniques and materials to protect your products during transit and reduce damage claims.',
      category: 'Shipping Basics',
      date: 'October 20, 2024',
      readTime: '4 min read',
    },
    {
      slug: 'reducing-shipping-costs-10-proven-strategies',
      title: 'Reducing Shipping Costs: 10 Proven Strategies',
      excerpt: 'Discover practical strategies to reduce your shipping costs without compromising on service quality.',
      category: 'Cost Optimization',
      date: 'October 12, 2024',
      readTime: '6 min read',
    },
  ]

  return (
    <main className="min-h-screen py-20 bg-gradient-to-br from-primary-50 via-cyan-50 to-blue-50 relative overflow-hidden">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full opacity-20" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <path d="M0,150 Q300,100 600,150 T1200,150 L1200,300 L0,300 Z" fill="url(#waveGradient1)">
            <animate attributeName="d" dur="20s" repeatCount="indefinite" values="M0,150 Q300,100 600,150 T1200,150 L1200,300 L0,300 Z;M0,150 Q300,200 600,150 T1200,150 L1200,300 L0,300 Z;M0,150 Q300,100 600,150 T1200,150 L1200,300 L0,300 Z" />
          </path>
          <defs>
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-full opacity-15" viewBox="0 0 1200 300" preserveAspectRatio="none" style={{ transform: 'scaleX(-1)' }}>
          <path d="M0,150 Q300,100 600,150 T1200,150 L1200,300 L0,300 Z" fill="url(#waveGradient2)">
            <animate attributeName="d" dur="25s" repeatCount="indefinite" values="M0,150 Q300,200 600,150 T1200,150 L1200,300 L0,300 Z;M0,150 Q300,100 600,150 T1200,150 L1200,300 L0,300 Z;M0,150 Q300,200 600,150 T1200,150 L1200,300 L0,300 Z" />
          </path>
          <defs>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        {/* Floating circles */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 left-10 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Shipping <span className="text-cyan-400">Blogs</span>
          </h1>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium mb-4">
            Stay updated with the latest shipping trends, tips, and best practices
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-primary-500 mx-auto rounded-full"></div>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <article
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-xl border-2 border-cyan-100 hover:shadow-2xl hover:border-cyan-400 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105"
            >
              <div className="mb-4">
                <span className="inline-block bg-cyan-100 text-cyan-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {blog.category}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors">
                {blog.title}
              </h2>
              <p className="text-gray-600 leading-relaxed font-medium mb-6">
                {blog.excerpt}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{blog.date}</span>
                <span>{blog.readTime}</span>
              </div>
              <div className="mt-6">
                <Link href={`/blogs/${blog.slug}`} className="text-cyan-400 hover:text-cyan-500 font-semibold flex items-center group-hover:underline">
                  Read More
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

