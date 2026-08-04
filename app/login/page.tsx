'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import GoogleOAuthButton from '@/components/auth/GoogleOAuthButton'
import { backendAuthUrl } from '@/lib/auth/client'
import { getSafeRedirectPath } from '@/lib/auth/redirects'
import { isAuthenticated, setAuthSession, type AuthUser } from '@/lib/auth/storage'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verifyMessage = searchParams.get('message') ?? ''
  const oauthError = searchParams.get('error') ?? ''
  const nextPath = getSafeRedirectPath(searchParams.get('next'))
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotMessage, setForgotMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(nextPath)
    }
  }, [router, nextPath])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!agreedToTerms) {
      setError('Please agree to the Terms and Privacy Policy')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(backendAuthUrl('/login'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })
      const result = await res.json()

      if (!res.ok || !result.access_token || !result.user) {
        setError(result.error ?? 'Login failed. Please try again.')
        return
      }

      setAuthSession({
        access_token: result.access_token,
        user: result.user as AuthUser,
      })

      router.replace(nextPath)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const openForgotPassword = () => {
    setShowForgotPassword(true)
    setForgotError('')
    setForgotMessage('')
    setError('')
  }

  const closeForgotPassword = () => {
    setShowForgotPassword(false)
    setForgotError('')
    setForgotMessage('')
    setForgotLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError('')
    setForgotMessage('')

    const email = formData.email.trim()
    if (!email) {
      setForgotError('Please enter your email address')
      return
    }

    setForgotLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await res.json()

      if (!result.success) {
        setForgotError(result.error ?? 'Failed to send reset email. Please try again.')
        return
      }

      setForgotMessage(
        result.message ?? 'If an account exists for that email, a password reset link has been sent.',
      )
    } catch {
      setForgotError('Something went wrong. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFBF0' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-4">
        <Link href="/" className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="160" height="50" viewBox="0 0 230 72" fill="none">
            <path d="M30.42 26.1531C32.6699 26.0446 35.1331 26.123 37.2622 26.092C43.7846 25.9972 51.1863 25.6839 50.9978 34.5024C50.9713 35.7437 51.0048 37.3497 51.0042 38.629L50.992 48.9013C49.6352 48.9291 48.2779 48.9271 46.9212 48.8951C46.765 47.3108 46.8358 44.8165 46.8373 43.1325L46.844 33.0778C44.4342 34.9928 40.3378 37.5969 37.6736 39.4833C36.9674 39.8993 35.7045 40.699 35.1304 41.2715C32.1786 44.2154 34.498 44.9987 37.2611 45.0746C37.2738 46.3164 37.2468 47.5492 37.2669 48.7995C37.0553 48.8168 36.8434 48.8301 36.6314 48.8394C34.7053 48.9227 32.3381 48.5282 30.8594 47.2208C29.5215 46.038 29.0124 42.6523 30.0904 41.2101C32.7626 37.6354 37.369 35.3375 40.9647 32.7271C42.2288 31.8092 43.5253 31.1852 44.6285 30.0264C39.5984 30.1217 34.5671 30.1423 29.5363 30.088C29.5145 29.0976 29.4242 27.2449 29.5208 26.3249C29.8667 26.1035 29.9695 26.17 30.42 26.1531Z" fill="#054742"/>
            <path d="M108.887 26.5837C111.821 26.2315 114.984 27.7619 116.939 29.9002C116.939 29.0326 116.906 28.2047 116.869 27.3387C117.95 27.2485 119.701 27.304 120.832 27.3061L120.833 47.8869C119.555 47.9083 118.223 47.8745 116.936 47.8775C116.891 47.02 116.917 46.3472 116.953 45.4926C116.072 46.1696 115.457 46.7357 114.502 47.3976C110.98 49.5647 106.104 48.9986 102.984 46.3655C100.666 44.3945 99.2361 41.5802 99.0137 38.551C98.7605 35.5316 99.7142 32.5348 101.667 30.2133C103.558 28.002 106.01 26.8187 108.887 26.5837ZM110.563 45.219C119.58 43.9148 118.715 29.5536 109.07 30.0514C99.6827 31.8139 101.736 46.0427 110.563 45.219Z" fill="#054742"/>
            <path d="M156.034 26.5841C159.338 26.5274 161.463 27.6322 163.826 29.8008C163.783 28.9597 163.774 28.1782 163.77 27.3371C164.997 27.2341 166.355 27.3505 167.674 27.2436L167.681 47.9271C166.442 47.8408 165.107 47.8999 163.857 47.9313C163.738 47.096 163.782 46.3998 163.809 45.562C163.009 46.1037 162.254 46.7984 161.33 47.4205C157.805 49.5 152.881 49.0491 149.802 46.3156C142.537 39.8673 145.686 27.4483 156.034 26.5841ZM157.5 45.2392C159.9 44.7047 160.98 44.205 162.405 42.0782C165.755 37.0808 162.64 29.8473 156.266 30.044C154.28 30.3155 152.632 31.1368 151.394 32.7552C150.125 34.443 149.571 36.5599 149.85 38.6509C150.428 42.7009 153.315 45.4593 157.5 45.2392Z" fill="#054742"/>
            <path d="M191.896 26.4916C198.082 25.9339 203.548 30.4837 204.102 36.6512C204.657 42.8185 200.09 48.2655 193.904 48.8138C187.724 49.3616 182.268 44.8136 181.714 38.6527C181.161 32.492 185.718 27.0486 191.896 26.4916ZM193.882 45.0868C197.974 44.5615 200.879 40.8472 200.392 36.7614C199.904 32.6756 196.209 29.7434 192.106 30.1893C187.946 30.6414 184.957 34.3896 185.45 38.5319C185.944 42.6742 189.732 45.6193 193.882 45.0868Z" fill="#054742"/>
            <path d="M87.3382 26.6948C87.5175 26.6757 87.6978 26.6648 87.8781 26.6621C90.2224 26.6292 92.2672 27.4347 93.943 29.087C95.0979 30.2319 95.9049 31.6787 96.2711 33.2609C96.6545 34.8813 96.517 38.0876 96.5115 39.8999C96.5009 42.5749 96.5095 45.25 96.5376 47.9248C95.2021 47.8986 93.916 47.8695 92.5784 47.9127C92.7313 46.2179 92.661 43.8939 92.6328 42.1067C92.5907 39.4366 92.8996 35.7098 92.126 33.2208C91.3428 30.7008 87.8277 29.5727 85.3762 30.4275C84.6702 30.8024 83.8947 31.191 83.3232 31.752C81.2872 33.7502 81.6482 37.2068 81.6511 39.8364C81.6751 42.515 81.6662 45.1938 81.6244 47.8721C80.51 47.951 78.9326 47.9066 77.7844 47.9074L77.803 34.9347C77.8039 32.4617 77.8555 29.7701 77.7729 27.3116C78.9682 27.3082 80.4419 27.3416 81.6065 27.2153C81.65 27.9598 81.6247 28.9752 81.6248 29.7392C83.3707 28.1241 84.8671 26.9127 87.3382 26.6948Z" fill="#054742"/>
            <path d="M144.421 27.2906L144.481 27.4584C143.225 30.5038 141.686 33.5914 140.337 36.6239C138.787 39.9955 137.293 43.397 135.684 46.7404C134.896 48.381 134.404 48.2712 132.775 47.9867C131.923 46.709 130.879 44.1884 130.182 42.6946C128.434 38.9503 126.728 35.186 125.067 31.4024C124.336 30.049 123.901 28.6612 123.125 27.3343C124.309 27.2514 126.064 27.3009 127.289 27.2984C127.645 28.249 128.24 29.4671 128.647 30.4509C130.339 34.5476 132.361 38.6853 133.914 42.8319C135.873 37.7465 138.273 32.3399 140.445 27.2842L144.421 27.2906Z" fill="#054742"/>
            <path d="M19.2265 36.6716C19.1569 31.0392 19.2311 25.6046 23.4095 21.2856C28.5655 15.9561 33.6537 16.2929 40.3042 16.1973C40.3049 17.6303 40.2793 19.0633 40.2274 20.4953C35.403 20.2336 31.1953 20.207 27.4271 23.5448C23.0585 27.4144 23.3303 32.1805 23.3528 37.4638C22.0812 37.4899 20.6916 37.5462 19.4312 37.4827C19.2274 37.1958 19.2696 37.0483 19.2265 36.6716Z" fill="#3FCBBD"/>
            <path d="M40.3044 16.1975C44.5856 16.1871 47.9058 15.6995 51.8722 17.6953C57.6502 20.6025 61.2059 25.6929 61.2163 32.2232C61.2166 33.9674 61.2072 35.7117 61.1878 37.4558C59.8874 37.4653 58.4849 37.449 57.1932 37.4945C57.2375 32.6421 57.4305 28.4569 54.0565 24.4737C52.4987 22.6346 49.0656 20.7908 46.705 20.6066C44.805 20.4583 42.3126 20.6151 40.2275 20.4956C40.2794 19.0635 40.305 17.6306 40.3044 16.1975Z" fill="#EED25A"/>
            <path d="M61.188 37.4551C61.1862 39.0513 61.218 40.6118 61.3062 42.1995C61.8105 51.268 53.8006 59.2253 44.7041 58.8356C43.3624 58.7781 41.5578 58.9867 40.25 58.83C40.2925 57.4217 40.2991 56.0125 40.2697 54.6038C41.0449 54.4631 44.6284 54.59 45.5908 54.5869C48.4097 54.5781 51.8405 53.0622 53.7741 51.0099C57.6288 46.9184 57.2115 42.5513 57.1934 37.4938C58.4851 37.4482 59.8876 37.4646 61.188 37.4551Z" fill="#C67BEC"/>
            <path d="M19.2266 36.6719C19.2697 37.0486 19.2275 37.1961 19.4313 37.483C20.6917 37.5465 22.0813 37.4902 23.3529 37.4641C23.3684 42.7306 22.7748 46.9899 26.9225 51.1316C29.817 54.0221 32.6192 54.6486 36.5423 54.6368C37.7847 54.636 39.0271 54.6253 40.2694 54.6046C40.2989 56.0132 40.2922 57.4224 40.2498 58.8307C35.5917 58.5068 33.2368 59.5319 28.5942 57.3072C27.1029 56.6061 25.7253 55.6867 24.5069 54.5792C18.443 49.0623 19.557 43.8058 19.2266 36.6719Z" fill="#04463F"/>
            <path d="M179.273 26.6835C179.538 26.6457 179.694 26.5964 179.928 26.7235C180.309 27.2292 180.143 29.1966 180.142 29.9621C178.444 30.1699 176.693 30.7329 175.457 31.9633C174.747 32.6675 174.253 33.557 174.028 34.5295C173.732 35.7889 173.825 38.4676 173.826 39.8771L173.825 47.9144C172.772 47.8427 171.016 47.9024 169.911 47.9046L169.926 46.7216L169.935 27.3056C171.2 27.2839 172.533 27.3077 173.805 27.3096C173.86 28.1822 173.814 28.9661 173.777 29.8371C175.467 28.0305 176.743 27.0225 179.273 26.6835Z" fill="#054742"/>
          </svg>
        </Link>

        <div className="relative z-10">
              <Link href="/signup" className="flex items-center no-underline">
                <span
                  className="text-black text-base md:text-lg font-normal leading-[120%] px-4 py-2.5 rounded-xl bg-[#C780ED]"
                  style={{ fontFamily: '"TASA Orbiter Deck", sans-serif' }}
                >
                  Sign Up
                </span>
                <span className="leading-[0] px-2.5 py-2.5 rounded-xl bg-[#C780ED]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                    <path d="M10.5 4.375L16.625 10.5M16.625 10.5L10.5 16.625M16.625 10.5H4.375" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </Link>
            </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-lg rounded-2xl border px-8 py-10 sm:px-12 sm:py-12" style={{ borderColor: '#D6D1C4', backgroundColor: '#FDFBF0' }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#054742', fontFamily: 'Georgia, "Times New Roman", serif' }}>
              {showForgotPassword ? 'Forgot Password' : 'Sign In With Email'}
            </h1>
            <p className="text-sm" style={{ color: '#6B6B6B' }}>
              {showForgotPassword
                ? 'Enter your email and we will send you a reset link'
                : 'Enter your email and password to sign in'}
            </p>
            {verifyMessage && !showForgotPassword && (
              <p
                className="mt-4 text-xs leading-relaxed rounded-lg px-3 py-2.5 text-center"
                style={{ color: '#054742', backgroundColor: '#E8F5E9', border: '1px solid #B8D4BB' }}
              >
                {verifyMessage}
              </p>
            )}
          </div>

          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              {forgotError && (
                <p
                  className="text-xs leading-relaxed rounded-lg px-3 py-2.5 text-center"
                  style={{ color: '#8B2E2E', backgroundColor: '#FDECEC', border: '1px solid #E8B4B4' }}
                >
                  {forgotError}
                </p>
              )}
              {forgotMessage && (
                <p
                  className="text-xs leading-relaxed rounded-lg px-3 py-2.5 text-center"
                  style={{ color: '#054742', backgroundColor: '#E8F5E9', border: '1px solid #B8D4BB' }}
                >
                  {forgotMessage}
                </p>
              )}
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium mb-1.5" style={{ color: '#054742' }}>
                  Email
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  name="email"
                  required
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors focus:ring-2"
                  style={{ borderColor: '#D6D1C4', backgroundColor: '#FDFBF0', color: '#054742' }}
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-3.5 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#B48AE0' }}
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={closeForgotPassword}
                className="w-full text-sm underline"
                style={{ color: '#054742' }}
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <>
          <form onSubmit={handleSubmit} className="space-y-5">
            {(error || oauthError) && (
              <p
                className="text-xs leading-relaxed rounded-lg px-3 py-2.5 text-center"
                style={{ color: '#8B2E2E', backgroundColor: '#FDECEC', border: '1px solid #E8B4B4' }}
              >
                {error || oauthError}
              </p>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: '#054742' }}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors focus:ring-2"
                style={{ borderColor: '#D6D1C4', backgroundColor: '#FDFBF0', color: '#054742' }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#054742' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-11 rounded-lg border text-sm outline-none transition-colors focus:ring-2"
                  style={{ borderColor: '#D6D1C4', backgroundColor: '#FDFBF0', color: '#054742' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                  style={{ color: '#054742' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-xs underline"
                  style={{ color: '#054742' }}
                >
                  Forgot Password ?
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border accent-current"
                style={{ borderColor: '#D6D1C4', accentColor: '#054742' }}
              />
              <label htmlFor="terms" className="text-xs leading-relaxed" style={{ color: '#6B6B6B' }}>
                By submitting, you agree to our{' '}
                <Link href="#" className="underline" style={{ color: '#054742' }}>Terms</Link>
                {' '}and{' '}
                <Link href="#" className="underline" style={{ color: '#054742' }}>Privacy Policy.</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#B48AE0' }}
            >
              {loading ? 'Signing in...' : 'Get Started'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: '#D6D1C4' }} />
            <span className="text-xs" style={{ color: '#9B9B9B' }}>Or sign in with</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#D6D1C4' }} />
          </div>

          <GoogleOAuthButton
            ariaLabel="Sign in with Google"
            label="Continue with Google"
            agreedToTerms={agreedToTerms}
            onTermsRequired={() =>
              setError('Please agree to the Terms and Privacy Policy')
            }
          />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFBF0' }}>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            Loading...
          </p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
