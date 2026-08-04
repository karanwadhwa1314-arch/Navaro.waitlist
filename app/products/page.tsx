export default function Products() {
  const products = [
    {
      title: 'Shipping Basics Course',
      price: '$99',
      description: 'Master shipping fundamentals',
      subtitle: 'Learn the essentials of shipping and logistics from the ground up',
      details: 'Perfect for beginners and small businesses starting their shipping journey',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: 'International Shipping Guide',
      price: '$199',
      description: 'Navigate global shipping',
      subtitle: 'Comprehensive guide to international shipping, customs, and regulations',
      details: 'Includes documentation requirements, duty calculations, and compliance guidelines',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Shipping Rate Calculator',
      price: '$49',
      description: 'Calculate shipping costs',
      subtitle: 'Compare rates across multiple carriers instantly',
      details: 'Get real-time shipping quotes and optimize your shipping costs',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  const courseFeatures = [
    { feature: 'Shipping Fundamentals', basics: true, international: true, calculator: false },
    { feature: 'Carrier Comparison', basics: true, international: true, calculator: true },
    { feature: 'Rate Calculation', basics: true, international: true, calculator: true },
    { feature: 'Packaging Guidelines', basics: true, international: true, calculator: false },
    { feature: 'Labeling Requirements', basics: true, international: true, calculator: false },
    { feature: 'International Customs', basics: false, international: true, calculator: false },
    { feature: 'Duty & Tax Calculation', basics: false, international: true, calculator: false },
    { feature: 'Documentation Guide', basics: false, international: true, calculator: false },
    { feature: 'Real-time Rate Quotes', basics: false, international: false, calculator: true },
    { feature: 'Multi-Carrier Comparison', basics: false, international: false, calculator: true },
    { feature: 'Shipping Cost Optimization', basics: false, international: false, calculator: true },
    { feature: 'Delivery Time Estimates', basics: false, international: false, calculator: true },
  ]

  return (
    <main className="min-h-screen py-20 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Our <span className="text-cyan-400">Products</span>
          </h1>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium mb-4">
            Explore our comprehensive suite of shipping education and tools
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-primary-500 mx-auto rounded-full"></div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {products.map((product, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-10 shadow-xl border-2 border-cyan-100 hover:shadow-2xl hover:border-cyan-400 transition-all duration-300 transform hover:-translate-y-2 flex flex-col"
            >
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white">
                {product.icon}
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-cyan-400">{product.price}</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
                {product.title}
              </h2>

              {/* Description */}
              <p className="text-xl font-bold text-gray-800 mb-3 leading-tight">
                {product.description}
              </p>

              {/* Subtitle */}
              <p className="text-lg text-gray-700 mb-4 leading-relaxed font-medium flex-grow">
                {product.subtitle}
              </p>

              {/* Details */}
              <p className="text-base text-gray-600 mb-6 italic">
                {product.details}
              </p>

              {/* Buttons */}
              <div className="flex gap-3 mt-auto">
                <button className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                  View Sample
                </button>
                <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                  Buy
                </button>
              </div>
            </div>
          ))}
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
                  {courseFeatures.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-cyan-100 hover:bg-cyan-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.basics ? (
                          <span className="text-cyan-400 text-2xl font-bold">✓</span>
                        ) : (
                          <span className="text-gray-300 text-xl">✗</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.international ? (
                          <span className="text-cyan-400 text-2xl font-bold">✓</span>
                        ) : (
                          <span className="text-gray-300 text-xl">✗</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.calculator ? (
                          <span className="text-cyan-400 text-2xl font-bold">✓</span>
                        ) : (
                          <span className="text-gray-300 text-xl">✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

