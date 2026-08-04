'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('basics')
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const categories = [
    {
      id: 'basics',
      name: 'Shipping Basics',
      topics: [
        'Understanding Shipping Methods',
        'Packaging Best Practices',
        'Labeling Requirements',
        'Shipping Insurance',
        'Tracking Packages',
        'Handling Returns',
      ],
      description: 'Learn the fundamentals of shipping, from choosing the right method to packaging your products correctly.',
      content: {
        overview: 'Shipping basics cover everything you need to know to get started with shipping products. This includes understanding different shipping methods, proper packaging techniques, and essential labeling requirements.',
        methods: 'Common shipping methods include Express (1-3 days), Standard (3-7 days), and Economy (7-14 days). Choose based on your customer needs and budget.',
        packaging: 'Proper packaging protects your products during transit. Use appropriate box sizes, padding materials, and secure closures to prevent damage.',
      },
    },
    {
      id: 'international',
      name: 'International Shipping',
      topics: [
        'Customs Documentation',
        'Duty & Tax Calculation',
        'Import/Export Regulations',
        'International Carriers',
        'Prohibited Items',
        'HS Code Classification',
      ],
      description: 'Master international shipping with guides on customs, duties, regulations, and cross-border logistics.',
      content: {
        overview: 'International shipping requires understanding customs procedures, duty calculations, and country-specific regulations. Proper documentation is crucial for smooth cross-border shipments.',
        customs: 'Customs documentation typically includes commercial invoices, packing lists, and certificates of origin. Requirements vary by country and product type.',
        duties: 'Duties and taxes are calculated based on the product value, origin country, and destination. Use HS codes to determine applicable rates.',
      },
    },
    {
      id: 'optimization',
      name: 'Cost Optimization',
      topics: [
        'Carrier Comparison',
        'Rate Negotiation',
        'Bulk Shipping Discounts',
        'Zone Skipping',
        'Dimensional Weight',
        'Shipping Software',
      ],
      description: 'Learn strategies to reduce shipping costs and optimize your logistics operations.',
      content: {
        overview: 'Shipping cost optimization involves comparing carriers, negotiating rates, and implementing strategies to reduce overall logistics expenses.',
        carriers: 'Compare rates across multiple carriers (USPS, FedEx, UPS, DHL) to find the best rates for your shipping volume and destinations.',
        strategies: 'Strategies include negotiating volume discounts, using zone skipping for long distances, and optimizing package dimensions to avoid dimensional weight charges.',
      },
    },
  ]

  const activeCategoryData = categories.find(c => c.id === activeCategory)!

  return (
    <main className="min-h-screen py-20 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Shipping <span className="text-cyan-400">Resources</span>
          </h1>
          <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium mb-4">
            Comprehensive guides and resources covering all aspects of shipping and logistics
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-primary-500 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-600">
            Need help with a specific shipping topic?{' '}
            <a href="/contact" className="text-cyan-400 hover:text-cyan-500 font-semibold underline">
              Contact Us
            </a>
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-cyan-400 to-primary-500 text-white shadow-xl transform scale-105'
                  : 'bg-white text-gray-700 border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-lg'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Active Category Content */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-cyan-100 p-10 mb-8">
          {/* Description */}
          <div className="mb-8">
            <p className="text-xl text-gray-700 leading-relaxed font-medium">
              {activeCategoryData.description}
            </p>
          </div>

          {/* Topics */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
              <div className="w-2 h-10 bg-gradient-to-b from-cyan-400 to-primary-500 rounded-full mr-4"></div>
              Topics Covered
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
              {activeCategoryData.topics.map((topic, idx) => (
                <div
                  key={idx}
                  className="bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-3 text-gray-800 font-medium hover:bg-cyan-100 transition-colors"
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>

          {/* Overview */}
          <div className="mb-8">
            <button
              onClick={() => toggleSection('overview')}
              className="w-full text-left flex items-center justify-between mb-4"
            >
              <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
                <div className="w-2 h-10 bg-gradient-to-b from-cyan-400 to-primary-500 rounded-full mr-4"></div>
                Overview
              </h2>
              <svg
                className={`w-6 h-6 text-cyan-400 transition-transform ${expandedSections.overview ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.overview && (
              <div className="ml-6 bg-cyan-50 rounded-xl p-6 border border-cyan-200">
                <p className="text-lg text-gray-700 leading-relaxed font-medium">
                  {activeCategoryData.content.overview}
                </p>
              </div>
            )}
          </div>

          {/* Additional Content Sections */}
          {activeCategoryData.content.methods && (
            <div className="mb-8">
              <button
                onClick={() => toggleSection('methods')}
                className="w-full text-left flex items-center justify-between mb-4"
              >
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
                  <div className="w-2 h-10 bg-gradient-to-b from-cyan-400 to-primary-500 rounded-full mr-4"></div>
                  Shipping Methods
                </h2>
                <svg
                  className={`w-6 h-6 text-cyan-400 transition-transform ${expandedSections.methods ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.methods && (
                <div className="ml-6 bg-cyan-50 rounded-xl p-6 border border-cyan-200">
                  <p className="text-lg text-gray-700 leading-relaxed font-medium">
                    {activeCategoryData.content.methods}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeCategoryData.content.packaging && (
            <div className="mb-8">
              <button
                onClick={() => toggleSection('packaging')}
                className="w-full text-left flex items-center justify-between mb-4"
              >
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
                  <div className="w-2 h-10 bg-gradient-to-b from-cyan-400 to-primary-500 rounded-full mr-4"></div>
                  Packaging Guidelines
                </h2>
                <svg
                  className={`w-6 h-6 text-cyan-400 transition-transform ${expandedSections.packaging ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.packaging && (
                <div className="ml-6 bg-cyan-50 rounded-xl p-6 border border-cyan-200">
                  <p className="text-lg text-gray-700 leading-relaxed font-medium">
                    {activeCategoryData.content.packaging}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeCategoryData.content.customs && (
            <div className="mb-8">
              <button
                onClick={() => toggleSection('customs')}
                className="w-full text-left flex items-center justify-between mb-4"
              >
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
                  <div className="w-2 h-10 bg-gradient-to-b from-cyan-400 to-primary-500 rounded-full mr-4"></div>
                  Customs Documentation
                </h2>
                <svg
                  className={`w-6 h-6 text-cyan-400 transition-transform ${expandedSections.customs ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.customs && (
                <div className="ml-6 bg-cyan-50 rounded-xl p-6 border border-cyan-200">
                  <p className="text-lg text-gray-700 leading-relaxed font-medium">
                    {activeCategoryData.content.customs}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeCategoryData.content.duties && (
            <div className="mb-8">
              <button
                onClick={() => toggleSection('duties')}
                className="w-full text-left flex items-center justify-between mb-4"
              >
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
                  <div className="w-2 h-10 bg-gradient-to-b from-cyan-400 to-primary-500 rounded-full mr-4"></div>
                  Duties & Taxes
                </h2>
                <svg
                  className={`w-6 h-6 text-cyan-400 transition-transform ${expandedSections.duties ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.duties && (
                <div className="ml-6 bg-cyan-50 rounded-xl p-6 border border-cyan-200">
                  <p className="text-lg text-gray-700 leading-relaxed font-medium">
                    {activeCategoryData.content.duties}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeCategoryData.content.carriers && (
            <div className="mb-8">
              <button
                onClick={() => toggleSection('carriers')}
                className="w-full text-left flex items-center justify-between mb-4"
              >
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
                  <div className="w-2 h-10 bg-gradient-to-b from-cyan-400 to-primary-500 rounded-full mr-4"></div>
                  Carrier Comparison
                </h2>
                <svg
                  className={`w-6 h-6 text-cyan-400 transition-transform ${expandedSections.carriers ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.carriers && (
                <div className="ml-6 bg-cyan-50 rounded-xl p-6 border border-cyan-200">
                  <p className="text-lg text-gray-700 leading-relaxed font-medium">
                    {activeCategoryData.content.carriers}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeCategoryData.content.strategies && (
            <div className="mb-8">
              <button
                onClick={() => toggleSection('strategies')}
                className="w-full text-left flex items-center justify-between mb-4"
              >
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
                  <div className="w-2 h-10 bg-gradient-to-b from-cyan-400 to-primary-500 rounded-full mr-4"></div>
                  Optimization Strategies
                </h2>
                <svg
                  className={`w-6 h-6 text-cyan-400 transition-transform ${expandedSections.strategies ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.strategies && (
                <div className="ml-6 bg-cyan-50 rounded-xl p-6 border border-cyan-200">
                  <p className="text-lg text-gray-700 leading-relaxed font-medium">
                    {activeCategoryData.content.strategies}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="mt-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Our <span className="text-cyan-400">Products</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium mb-4">
              Explore our comprehensive suite of shipping education and tools
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-primary-500 mx-auto rounded-full"></div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Shipping Basics Course */}
            <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-cyan-100 hover:shadow-2xl hover:border-cyan-400 transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-cyan-400">$99</span>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-3">Shipping Basics Course</h3>
              <p className="text-xl font-bold text-gray-800 mb-3 leading-tight">Master shipping fundamentals</p>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed font-medium flex-grow">
                Learn the essentials of shipping and logistics from the ground up
              </p>
              <p className="text-base text-gray-600 mb-6 italic">
                Perfect for beginners and small businesses starting their shipping journey
              </p>
              <div className="flex gap-3 mt-auto">
                <button className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                  View Sample
                </button>
                <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                  Buy
                </button>
              </div>
            </div>

            {/* International Shipping Guide */}
            <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-cyan-100 hover:shadow-2xl hover:border-cyan-400 transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-cyan-400">$199</span>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-3">International Shipping Guide</h3>
              <p className="text-xl font-bold text-gray-800 mb-3 leading-tight">Navigate global shipping</p>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed font-medium flex-grow">
                Comprehensive guide to international shipping, customs, and regulations
              </p>
              <p className="text-base text-gray-600 mb-6 italic">
                Includes documentation requirements, duty calculations, and compliance guidelines
              </p>
              <div className="flex gap-3 mt-auto">
                <button className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                  View Sample
                </button>
                <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                  Buy
                </button>
              </div>
            </div>

            {/* Shipping Rate Calculator */}
            <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-cyan-100 hover:shadow-2xl hover:border-cyan-400 transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-cyan-400">$49</span>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-3">Shipping Rate Calculator</h3>
              <p className="text-xl font-bold text-gray-800 mb-3 leading-tight">Calculate shipping costs</p>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed font-medium flex-grow">
                Compare rates across multiple carriers instantly
              </p>
              <p className="text-base text-gray-600 mb-6 italic">
                Get real-time shipping quotes and optimize your shipping costs
              </p>
              <div className="flex gap-3 mt-auto">
                <button className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                  View Sample
                </button>
                <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                  Buy
                </button>
              </div>
            </div>
          </div>

          {/* Comparison Table Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Course <span className="text-cyan-400">Features</span>
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium mb-4">
                Our shipping education products include essential features tailored to your learning needs. Compare what&apos;s included in each course and tool.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-primary-500 mx-auto rounded-full"></div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border-2 border-cyan-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-cyan-50 to-primary-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-lg font-extrabold text-gray-900 border-b-2 border-cyan-200">
                        Feature
                      </th>
                      <th className="px-6 py-4 text-center text-lg font-extrabold text-gray-900 border-b-2 border-cyan-200">
                        Shipping Basics
                      </th>
                      <th className="px-6 py-4 text-center text-lg font-extrabold text-gray-900 border-b-2 border-cyan-200">
                        International Guide
                      </th>
                      <th className="px-6 py-4 text-center text-lg font-extrabold text-gray-900 border-b-2 border-cyan-200">
                        Rate Calculator
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-cyan-100 hover:bg-cyan-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">Shipping Fundamentals</td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                    </tr>
                    <tr className="border-b border-cyan-100 hover:bg-cyan-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">Carrier Comparison</td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                    </tr>
                    <tr className="border-b border-cyan-100 hover:bg-cyan-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">Rate Calculation</td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                    </tr>
                    <tr className="border-b border-cyan-100 hover:bg-cyan-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">Packaging Guidelines</td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                    </tr>
                    <tr className="border-b border-cyan-100 hover:bg-cyan-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">Labeling Requirements</td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                    </tr>
                    <tr className="border-b border-cyan-100 hover:bg-cyan-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">International Customs</td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                    </tr>
                    <tr className="border-b border-cyan-100 hover:bg-cyan-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">Duty & Tax Calculation</td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                    </tr>
                    <tr className="border-b border-cyan-100 hover:bg-cyan-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">Documentation Guide</td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                    </tr>
                    <tr className="border-b border-cyan-100 hover:bg-cyan-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">Real-time Rate Quotes</td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                    </tr>
                    <tr className="border-b border-cyan-100 hover:bg-cyan-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">Multi-Carrier Comparison</td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                    </tr>
                    <tr className="border-b border-cyan-100 hover:bg-cyan-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">Shipping Cost Optimization</td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                    </tr>
                    <tr className="hover:bg-cyan-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">Delivery Time Estimates</td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-gray-300 text-xl">✗</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-cyan-400 text-2xl font-bold">✓</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
