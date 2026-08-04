import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ShellProvider from '@/components/ShellProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Navaro',
    template: '%s | Navaro',
  },
  description:
    'Navaro teaches you everything about shipping and logistics. Courses, tools, and calculators for modern shipping operations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <ShellProvider>{children}</ShellProvider>
      </body>
    </html>
  )
}

