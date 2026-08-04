'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { WaitlistEntry } from '@/lib/waitlist/store'

const font = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function WaitlistAdminTable({ entries }: { entries: WaitlistEntry[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return entries
    return entries.filter((entry) =>
      [entry.firstName, entry.lastName, entry.email, entry.phone]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [entries, query])

  const handleLogout = async () => {
    await fetch('/api/admin/waitlist/logout', { method: 'POST' })
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#FDFBF0]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6E2DB] px-6 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/image/Nav_bar-.png"
          alt="Navaro"
          className="h-[38px] w-auto object-contain"
        />
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-[#D6D3CE] px-4 py-2 text-[14px] text-[#054742] transition-colors hover:bg-[#F4F1EA]"
          style={font}
        >
          Log out
        </button>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold leading-[130%] text-[#054742]" style={font}>
              Waitlist
            </h1>
            <p className="mt-1 text-[14px] text-[#666462]" style={font}>
              {entries.length} {entries.length === 1 ? 'signup' : 'signups'}
              {query.trim() && ` · ${filtered.length} matching`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone"
              aria-label="Search signups"
              className="h-[42px] w-[240px] rounded-md border border-[#D6D3CE] bg-white px-3 text-[14px] text-[#054742] outline-none transition-colors placeholder:text-[#AFA79D] focus:border-[#054742]"
              style={font}
            />
            <a
              href="/api/admin/waitlist/export"
              className="flex h-[42px] items-center gap-2 rounded-md bg-[#054742] px-5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
              style={font}
            >
              Download CSV
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M10 3v10m0 0l-4-4m4 4l4-4M3 16h14"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-[#E6E2DB] bg-white">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E6E2DB]">
                {['Date', 'First Name', 'Last Name', 'Email', 'Phone'].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-[#666462]"
                    style={font}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-[14px] text-[#666462]"
                    style={font}
                  >
                    {entries.length === 0 ? 'No signups yet.' : 'No signups match that search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#F0EDE6] last:border-b-0">
                    <td className="whitespace-nowrap px-4 py-3 text-[14px] text-[#666462]" style={font}>
                      {formatDate(entry.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-[14px] text-[#054742]" style={font}>
                      {entry.firstName}
                    </td>
                    <td className="px-4 py-3 text-[14px] text-[#054742]" style={font}>
                      {entry.lastName}
                    </td>
                    <td className="px-4 py-3 text-[14px] text-[#054742]" style={font}>
                      <a href={`mailto:${entry.email}`} className="hover:underline">
                        {entry.email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[14px] text-[#054742]" style={font}>
                      {entry.phone || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
