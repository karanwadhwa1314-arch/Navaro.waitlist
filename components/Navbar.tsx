'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

import { useCatalogAuth } from '@/hooks/useCatalogAuth'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname() ?? ''
  const { isLoggedIn } = useCatalogAuth()
  const headerBg = pathname === '/community-support' || pathname === '/profile' ? 'bg-[#FDF8F3]' : 'bg-[#F9F9F9]'

  return (
    <>
      <header className={`py-2.5 sticky top-0 z-50 ${headerBg}`}>
        <div className="max-w-[1415px] mx-auto px-4 max-[500px]:px-2.5">
          <div className="flex items-center justify-between flex-nowrap">
            {/* Hamburger - mobile only */}
            <button
              className="hidden max-[800px]:block z-20"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="13" viewBox="0 0 19 13" fill="none">
                <path d="M0.713794 0.714844H17.8567M0.710938 6.42913H17.8495M0.713794 12.1434H17.8495" stroke="#080707" strokeWidth="1.42857" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Desktop nav links */}
            <div className="block max-[800px]:hidden">
              <ul className="flex list-none p-0 m-0">
                <li>
                  <Link href="/course" className="text-[#1E1E1E] text-lg font-normal leading-[120%] px-4 inline-block hover:opacity-70 transition-opacity" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                  NavLearn
                  </Link>
                </li>
                {isLoggedIn && (
                  <li>
                    <Link href="/my-courses" className="text-[#1E1E1E] text-lg font-normal leading-[120%] px-4 inline-block hover:opacity-70 transition-opacity" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                      My Courses
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/dashboard" className="text-[#1E1E1E] text-lg font-normal leading-[120%] px-4 inline-block hover:opacity-70 transition-opacity" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                  NavTools
                  </Link>
                </li>
                <li>
                  <Link href="/navfinance" className="text-[#1E1E1E] text-lg font-normal leading-[120%] px-4 inline-block hover:opacity-70 transition-opacity" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                    NavFinance
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-[#1E1E1E] text-lg font-normal leading-[120%] px-4 inline-block hover:opacity-70 transition-opacity" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                    About
                  </Link>
                </li>
              </ul>
            </div>

            {/* Center logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <img
                  src="/image/Nav_bar-.png"
                  alt="Navaro Logo"
                  className="w-[230px] h-[72px] object-contain max-[800px]:w-[170px] max-[800px]:h-auto max-[500px]:w-[120px] max-[360px]:w-[100px]"
                />
              </Link>
            </div>

            {/* Get Started & Login buttons */}
            <div className="relative z-10 flex items-center gap-3 max-[800px]:gap-2 max-[500px]:gap-[5px] max-[360px]:gap-1">
              <Link href="/dashboard" className="flex items-center no-underline">
                <span
                  className="text-black text-lg font-normal leading-[120%] px-4 py-2.5 rounded-xl bg-[#C780ED] max-[800px]:text-sm max-[800px]:px-3 max-[800px]:py-2 max-[500px]:text-[11px] max-[500px]:px-2 max-[500px]:py-[7px] max-[360px]:text-[10px] max-[360px]:px-1.5 max-[360px]:py-1.5"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  Get Started
                </span>
                <span className="leading-[0] px-2.5 py-2.5 rounded-xl bg-[#C780ED] max-[800px]:px-2 max-[800px]:py-2 max-[500px]:px-1.5 max-[500px]:py-[7px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none" className="max-[800px]:w-5 max-[800px]:h-5 max-[500px]:w-3.5 max-[500px]:h-3.5 max-[360px]:w-3 max-[360px]:h-3">
                    <path d="M10.5 4.375L16.625 10.5M16.625 10.5L10.5 16.625M16.625 10.5H4.375" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </Link>
              {/* <Link
                href="/login"
                className="text-black text-lg font-normal leading-[120%] px-4 py-2.5 rounded-xl border border-[#1E1E1E] hover:bg-[#1E1E1E] hover:text-white transition-colors no-underline max-[800px]:text-sm max-[800px]:px-3 max-[800px]:py-2 max-[500px]:text-[11px] max-[500px]:px-2 max-[500px]:py-[7px] max-[360px]:text-[10px] max-[360px]:px-1.5 max-[360px]:py-1.5"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Login / Signup
              </Link> */}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#C780ED] z-[999] flex items-center max-[800px]:flex hidden">
          <button
            className="absolute right-5 top-5"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="#fff"/>
            </svg>
          </button>
          <div className="px-6">
            <ul className="list-none p-0 m-0">
              <li className="mb-2.5">
                <Link href="/course" onClick={() => setIsMenuOpen(false)} className="text-white text-xl block" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                  Courses
                </Link>
              </li>
              {isLoggedIn && (
                <li className="mb-2.5">
                  <Link href="/my-courses" onClick={() => setIsMenuOpen(false)} className="text-white text-xl block" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                    My Courses
                  </Link>
                </li>
              )}
              <li className="mb-2.5">
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-white text-xl block" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                  Tools
                </Link>
              </li>
              <li className="mb-2.5">
                <Link href="/dashboard?finance=navfinance" onClick={() => setIsMenuOpen(false)} className="text-white text-xl block" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                  NavFinance
                </Link>
              </li>
              <li className="mb-2.5">
                <Link href="/about" onClick={() => setIsMenuOpen(false)} className="text-white text-xl block" style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}>
                  About
                </Link>
              </li>
            </ul>
            {/* Mobile menu buttons */}
            <div className="flex flex-col gap-3 mt-8">
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="text-black text-lg font-normal leading-[120%] px-5 py-3 rounded-xl bg-white text-center no-underline"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Get Started
              </Link>
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="text-white text-lg font-normal leading-[120%] px-5 py-3 rounded-xl border border-white text-center no-underline"
                style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
              >
                Login / Signup
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Border separator */}
      <div className="max-w-[1415px] mx-auto border-b border-[rgba(30,30,30,0.1)]" />
    </>
  )
}
