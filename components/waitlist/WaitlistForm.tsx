'use client'

import { useRef, useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import './WaitlistPhoneInput.css'

const font = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClass =
  'w-full h-[42px] rounded-md border border-[#D6D3CE] bg-white px-3 text-[15px] text-[#054742] outline-none transition-colors placeholder:text-[#AFA79D] focus:border-[#054742]'

const labelClass = 'block text-[13px] font-bold leading-[120%] text-[#111111] mb-1.5'

export default function WaitlistForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  const firstFieldRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError('Please fill in your name and email address.')
      return
    }
    if (!EMAIL_PATTERN.test(formData.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (!turnstileToken) {
      setError('Please complete the verification.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          turnstile_token: turnstileToken,
        }),
      })
      const result = await res.json()

      if (!result.success) {
        setTurnstileToken('')
        setError(result.error ?? 'Could not join the waitlist. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[440px] rounded-xl border border-[#E6E2DB] bg-white p-6 shadow-[0_18px_60px_rgba(0,45,45,0.14)] sm:p-7">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/image/Nav_bar-.png"
        alt="Navaro"
        className="mx-auto h-[42px] w-auto object-contain"
      />

      {submitted ? (
        <div className="pt-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E4F6F1]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12.5L10 17.5L19 7.5"
                stroke="#054742"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2
            className="mt-4 text-[20px] font-bold leading-[130%] text-[#054742]"
            style={font}
          >
            You&apos;re on the list
          </h2>
          <p className="mt-2 text-[14px] leading-[150%] text-[#666462]" style={font}>
            Thanks, {formData.firstName.trim()}. You&apos;ll be receiving a gift soon, on{' '}
            {formData.email.trim()}
          </p>
        </div>
      ) : (
        <>
          <h2
            className="mt-4 text-center text-[20px] font-bold leading-[130%] text-[#054742]"
            style={font}
          >
            Join Navaro&apos;s Waitlist
          </h2>

          <form onSubmit={handleSubmit} className="mt-5" noValidate>
            {/* Honeypot */}
            <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="join-company">Company</label>
              <input
                id="join-company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="join-first-name" className={labelClass} style={font}>
                  First Name
                </label>
                <input
                  ref={firstFieldRef}
                  id="join-first-name"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                  className={inputClass}
                  style={font}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="join-last-name" className={labelClass} style={font}>
                  Last Name
                </label>
                <input
                  id="join-last-name"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                  className={inputClass}
                  style={font}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="join-email" className={labelClass} style={font}>
                Email Address
              </label>
              <input
                id="join-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className={inputClass}
                style={font}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="join-phone" className={labelClass} style={font}>
                Phone Number{' '}
                <span className="font-normal text-[#111111]">(for WhatsApp group invite)</span>
              </label>
              <PhoneInput
                id="join-phone"
                international
                defaultCountry="IN"
                value={formData.phone || undefined}
                onChange={(value) => setFormData({ ...formData, phone: value ?? '' })}
                numberInputProps={{
                  id: 'join-phone',
                  name: 'phone',
                  autoComplete: 'tel',
                }}
                className="WaitlistPhoneInput"
              />
            </div>

            {error && (
              <p
                className="mt-4 text-[13px] leading-[140%] text-[#C0392B]"
                style={font}
                role="alert"
              >
                {error}
              </p>
            )}

            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <div className="mt-4 flex justify-center">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  onSuccess={setTurnstileToken}
                  onExpire={() => setTurnstileToken('')}
                  onError={() => setTurnstileToken('')}
                  options={{ theme: 'light' }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-[46px] w-full items-center justify-center gap-2 rounded-md bg-[#054742] text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={font}
            >
              {loading ? 'Joiningâ€¦' : 'Join Waitlist'}
              {!loading && (
                <svg width="18" height="18" viewBox="0 0 21 21" fill="none" aria-hidden="true">
                  <path
                    d="M10.5 4.375L16.625 10.5M16.625 10.5L10.5 16.625M16.625 10.5H4.375"
                    stroke="white"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <p className="mt-4 text-center text-[12px] leading-[140%] text-[#666462]" style={font}>
              Your details are safe with us. We never share your data.
            </p>
          </form>
        </>
      )}
    </div>
  )
}
