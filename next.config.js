/** @type {import('next').NextConfig} */
const backendUrl = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || '').replace(/\/$/, '')

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [{ source: '/tools', destination: '/dashboard', permanent: false }]
  },
  async rewrites() {
    const rules = [
      {
        source: '/cargo-rfqs/:id',
        destination: '/dashboard/cargo-rfqs/:id',
      },
    ]

    if (!backendUrl) return rules

    return [
      ...rules,
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ]
  },
}

module.exports = nextConfig