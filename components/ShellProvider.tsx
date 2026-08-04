'use client'

import { Suspense, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import ChatWidget from './ChatWidget'

function ShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const bareShell =
    pathname === '/' ||
    pathname === '/dashboard' ||
    pathname === '/signup' ||
    pathname === '/login' ||
    pathname === '/otp_verify' ||
    pathname === '/waitlist' ||
    pathname === '/navfinance/cargo-insurance'
  const creamPage = pathname === '/community-support' || pathname === '/profile'
  // Admin pages get no global chrome at all — not even the chat widget.
  const adminPage = pathname.startsWith('/admin')

  if (adminPage) {
    return <>{children}</>
  }

  if (bareShell) {
    return (
      <>
        {children}
        <ChatWidget />
      </>
    )
  }

  return (
    <div
      className={`flex min-h-screen flex-col ${creamPage ? 'bg-[#FDF8F3]' : 'bg-gradient-to-b from-primary-50 to-white'}`}
    >
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

/**
 * Client shell so /dashboard and / (when served by the app) skip global nav without relying
 * on middleware-injected headers (which often do not reach server components).
 */
export default function ShellProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-navaro-cream" id="shell-suspense-fallback">
          {children}
        </div>
      }
    >
      <ShellInner>{children}</ShellInner>
    </Suspense>
  )
}
