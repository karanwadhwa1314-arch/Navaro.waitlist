'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const font = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function WaitlistAdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!password) {
      setError('Enter the password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/waitlist/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const result = await res.json()

      if (!result.success) {
        setError(result.error ?? 'Could not sign in.')
        return
      }

      setPassword('')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFBF0] px-4">
      <div className="w-full max-w-[400px] rounded-xl border border-[#E6E2DB] bg-white p-7 shadow-[0_18px_60px_rgba(0,45,45,0.10)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/image/Nav_bar-.png"
          alt="Navaro"
          className="mx-auto h-[42px] w-auto object-contain"
        />

        <h1
          className="mt-5 text-center text-[20px] font-bold leading-[130%] text-[#054742]"
          style={font}
        >
          Waitlist Admin
        </h1>
        <p className="mt-2 text-center text-[13px] leading-[150%] text-[#666462]" style={font}>
          Enter the password to view and export signups.
        </p>

        {configured ? (
          <form onSubmit={handleSubmit} className="mt-6" noValidate>
            <label htmlFor="admin-password" className="sr-only">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              className="h-[42px] w-full rounded-md border border-[#D6D3CE] bg-white px-3 text-[15px] text-[#054742] outline-none transition-colors placeholder:text-[#AFA79D] focus:border-[#054742]"
              placeholder="Password"
              style={font}
            />

            {error && (
              <p className="mt-3 text-[13px] leading-[140%] text-[#C0392B]" style={font} role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 h-[46px] w-full rounded-md bg-[#054742] text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={font}
            >
              {loading ? 'Checking…' : 'Unlock'}
            </button>
          </form>
        ) : (
          <p
            className="mt-6 rounded-md bg-[#FDF2B3] px-4 py-3 text-[13px] leading-[150%] text-[#054742]"
            style={font}
          >
            Admin access is not configured. Set{' '}
            <code className="font-bold">WAITLIST_ADMIN_PASSWORD</code> in your environment and
            restart the server.
          </p>
        )}
      </div>
    </div>
  )
}
