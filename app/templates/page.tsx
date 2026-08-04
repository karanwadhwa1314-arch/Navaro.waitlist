'use client'

interface Template {
  filename: string
  displayName: string
  category: string
}

export default function Templates() {
  const templates: Template[] = [
    {
      filename: 'bill-exchange.html',
      displayName: 'Bill of Exchange',
      category: 'Financial Documents',
    },
    {
      filename: 'bill-of-landing.html',
      displayName: 'Bill of Lading',
      category: 'Shipping Documents',
    },
    {
      filename: 'certificate-of-origion-usmca.html',
      displayName: 'Certificate of Origin (USMCA)',
      category: 'Certificates',
    },
    {
      filename: 'certificate-of-origion.html',
      displayName: 'Certificate of Origin',
      category: 'Certificates',
    },
    {
      filename: 'CMR-carrier.html',
      displayName: 'CMR - Carrier',
      category: 'CMR Documents',
    },
    {
      filename: 'CMR-consignee.html',
      displayName: 'CMR - Consignee',
      category: 'CMR Documents',
    },
    {
      filename: 'CMR-sender.html',
      displayName: 'CMR - Sender',
      category: 'CMR Documents',
    },
    {
      filename: 'REQUEST FOR QUOTATION.html',
      displayName: 'Request for Quotation',
      category: 'Business Documents',
    },
    {
      filename: 'sale contract.html',
      displayName: 'Sale Contract',
      category: 'Contracts',
    },
    {
      filename: 'sale invoice.html',
      displayName: 'Sale Invoice',
      category: 'Invoices',
    },
    {
      filename: 'SHIPPING INSTRUCTION.html',
      displayName: 'Shipping Instruction',
      category: 'Shipping Documents',
    },
    {
      filename: 'deepseek_html_20251212_4b21ad (1).html',
      displayName: 'Document Template',
      category: 'Other',
    },
  ]

  const handleTemplateClick = (filename: string) => {
    // URL encode the filename to handle spaces and special characters
    const encodedFilename = encodeURIComponent(filename)
    window.open(`/templates/${encodedFilename}`, '_blank')
  }

  return (
    <main className="min-h-screen py-20 bg-gradient-to-br from-primary-50 via-cyan-50 to-blue-50 relative overflow-hidden">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full opacity-20" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <path d="M0,150 Q300,100 600,150 T1200,150 L1200,300 L0,300 Z" fill="url(#waveGradient5)">
            <animate attributeName="d" dur="20s" repeatCount="indefinite" values="M0,150 Q300,100 600,150 T1200,150 L1200,300 L0,300 Z;M0,150 Q300,200 600,150 T1200,150 L1200,300 L0,300 Z;M0,150 Q300,100 600,150 T1200,150 L1200,300 L0,300 Z" />
          </path>
          <defs>
            <linearGradient id="waveGradient5" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-full opacity-15" viewBox="0 0 1200 300" preserveAspectRatio="none" style={{ transform: 'scaleX(-1)' }}>
          <path d="M0,150 Q300,100 600,150 T1200,150 L1200,300 L0,300 Z" fill="url(#waveGradient6)">
            <animate attributeName="d" dur="25s" repeatCount="indefinite" values="M0,150 Q300,200 600,150 T1200,150 L1200,300 L0,300 Z;M0,150 Q300,100 600,150 T1200,150 L1200,300 L0,300 Z;M0,150 Q300,200 600,150 T1200,150 L1200,300 L0,300 Z" />
          </path>
          <defs>
            <linearGradient id="waveGradient6" x1="0%" y1="0%" x2="100%" y2="0%">
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
            Shipping <span className="text-cyan-400">Templates</span>
          </h1>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium mb-4">
            Browse and download professional shipping and business document templates
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-primary-500 mx-auto rounded-full"></div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template, index) => (
            <div
              key={index}
              onClick={() => handleTemplateClick(template.filename)}
              className="group bg-white rounded-2xl p-6 shadow-xl border-2 border-cyan-100 hover:shadow-2xl hover:border-cyan-400 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer"
            >
              {/* Template Preview */}
              <div className="mb-4 h-48 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200 group-hover:from-cyan-100 group-hover:to-blue-100 transition-all duration-300 overflow-hidden relative">
                <div className="w-full h-full overflow-hidden">
                  <iframe
                    src={`/templates/${encodeURIComponent(template.filename)}`}
                    className="border-0"
                    style={{
                      width: '400%',
                      height: '400%',
                      transform: 'scale(0.25)',
                      transformOrigin: '0 0',
                      pointerEvents: 'none',
                      border: 'none',
                      display: 'block',
                    }}
                    title={`Preview of ${template.displayName}`}
                    loading="lazy"
                    sandbox="allow-same-origin"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-transparent pointer-events-none"></div>
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-600 pointer-events-none shadow-sm">
                  Preview
                </div>
              </div>

              {/* Template Info */}
              <div className="mb-3">
                <span className="inline-block bg-cyan-100 text-cyan-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {template.category}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                {template.displayName}
              </h3>
              
              {/* Click Indicator */}
              <div className="flex items-center text-cyan-400 group-hover:text-cyan-500 font-semibold text-sm mt-4">
                <span>Open Template</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

