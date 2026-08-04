'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { backendAuthUrl } from '@/lib/auth/client'
import { resolveAuthUser } from '@/lib/auth/load-user'
import { getPostLogoutPath } from '@/lib/auth/redirects'
import { clearAuthSession, formatDisplayName } from '@/lib/auth/storage'
import { validateAvatarFile } from '@/lib/user/avatar'
import { getAvatarImageUrl } from '@/lib/user/avatar-url'
import { fetchUserProfile, updateUserProfile, uploadUserProfileAvatar } from '@/lib/user/load-profile'

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) {
    return { firstName: formatDisplayName(parts[0]), lastName: '' }
  }
  return {
    firstName: formatDisplayName(parts[0]),
    lastName: parts.slice(1).join(' '),
  }
}

function formatRole(role: string): string {
  const trimmed = role.trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }
const display = { fontFamily: '"TASA Orbiter Display", sans-serif' }

const dottedPattern = {
  backgroundImage:
    'radial-gradient(rgba(199,128,237,0.18) 2px, transparent 1px), linear-gradient(transparent, transparent)',
  backgroundSize: '16px 16px',
}

const sidebarItems = [
  'PROFILE INFO',
  'ACCOUNT SECURITY',
  'SUBSCRIPTIONS',
  'PAYMENT METHODS',
  'PRIVACY',
  'NOTIFICATION PREFERENCES',
  'API CLIENTS',
] as const

function PersonIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="#1E1E1E" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" stroke="#1E1E1E" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="#1E1E1E" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 8.5H16.5L17 5.5H14V3.5C14 2.67 14.67 2 15.5 2H17V0H15.5C12.79 0 11 1.79 11 4V5.5H9V8.5H11V22H14V8.5Z"
        fill="#1E1E1E"
      />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="4" stroke="#1E1E1E" strokeWidth="1.5" />
      <path d="M10 9.5L15.5 12L10 14.5V9.5Z" fill="#1E1E1E" />
    </svg>
  )
}

function ArrowButtonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden>
      <path
        d="M10.5 4.375L16.625 10.5M16.625 10.5L10.5 16.625M16.625 10.5H4.375"
        stroke="white"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SplitActionButton({
  label,
  onClick,
}: {
  label: string
  onClick?: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-stretch overflow-hidden">
      <span
        className="rounded-l-xl bg-[#C780ED] px-5 py-3 text-sm font-medium text-[#1E1E1E] md:px-6 md:text-base"
        style={deck}
      >
        {label}
      </span>
      <span className="flex items-center justify-center rounded-r-xl bg-[#1E1E1E] px-3 py-3 md:px-3.5">
        <ArrowButtonIcon />
      </span>
    </button>
  )
}

function AccountSecuritySection({ userEmail = '' }: { userEmail?: string }) {
  const [securityData, setSecurityData] = useState({
    email: userEmail,
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (userEmail) {
      setSecurityData((prev) => ({ ...prev, email: userEmail }))
    }
  }, [userEmail])

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurityData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const inputClass =
    'w-full rounded-xl bg-[#F0EFEB] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:ring-2 focus:ring-[#C780ED]/40'

  return (
    <div>
      <h1
        className="mb-8 text-xl font-bold uppercase tracking-wide text-[#1E1E1E] md:text-2xl"
        style={display}
      >
        Account Security
      </h1>

      {/* Email */}
      <div className="border-b border-[rgba(30,30,30,0.1)] pb-8">
        <label htmlFor="securityEmail" className="mb-2 block text-sm text-[#1E1E1E]/55" style={deck}>
          Email:
        </label>
        <input
          id="securityEmail"
          name="email"
          type="email"
          placeholder="Your Email Address Is JhonDoe@Gmail.com"
          value={securityData.email}
          onChange={handleSecurityChange}
          className="w-full rounded-xl border border-[#C780ED]/45 bg-transparent px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:ring-2 focus:ring-[#C780ED]/40"
          style={deck}
        />
      </div>

      {/* Password update */}
      <div className="border-b border-[rgba(30,30,30,0.1)] py-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="mb-2 block text-sm text-[#1E1E1E]/55" style={deck}>
              New-Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={securityData.newPassword}
              onChange={handleSecurityChange}
              className={inputClass}
              style={deck}
            />
            <p className="mt-1.5 text-xs text-[#054742]/60 md:text-sm" style={deck}>
              Add a professional headline like &apos;Instructor at Navaro&apos; etc.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm text-[#1E1E1E]/55" style={deck}>
              Confirm Your Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={securityData.confirmPassword}
              onChange={handleSecurityChange}
              className={inputClass}
              style={deck}
            />
            <p className="mt-1.5 text-xs text-[#054742]/60 md:text-sm" style={deck}>
              e.g., &apos;jane.doe@email.com&apos;
            </p>
          </div>
        </div>

        <div className="mt-8">
          <SplitActionButton label="Start Your Journey" />
        </div>
      </div>

      {/* Multifactor authentication */}
      <div className="mt-8 rounded-2xl border border-[#C780ED]/40 bg-[#F0EFEB]/70 p-6 md:p-8">
        <h2
          className="mb-4 text-base font-bold uppercase tracking-wide text-[#1E1E1E] md:text-lg"
          style={display}
        >
          Multifactor Authentication
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-[#1E1E1E]/55 md:text-base" style={deck}>
          Increase Your Account Security By Requiring That A Code Emailed To You Be Entered When You Log In.
          For More Information On How Multi-Factor Authentication Works, Contact Our{' '}
          <a href="/contact" className="text-[#1E1E1E]/70 underline underline-offset-2 hover:text-[#1E1E1E]">
            Support Team
          </a>
        </p>
        <div className="mt-6">
          <SplitActionButton label="Enable" />
        </div>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M16.6667 5L7.50004 14.1667L3.33337 10"
        stroke="#3FCBBD"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BookStackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 19.5C4 18.6716 4.67157 18 5.5 18H20"
        stroke="#1E1E1E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 4H20V20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4Z"
        stroke="#1E1E1E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 8H16" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 12H14" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const planFeatures = [
  'Access To 28,000+ Top Courses',
  'Courses In Tech, Business, And More',
  'Practice Tests, Exercises, And Q&A',
]

function SubscriptionsSection() {
  return (
    <div>
      <h1
        className="mb-8 text-xl font-bold uppercase tracking-wide text-[#1E1E1E] md:text-2xl"
        style={display}
      >
        Subscription Settings
      </h1>

      {/* Active plans */}
      <div className="border-b border-[rgba(30,30,30,0.1)] pb-8">
        <p className="mb-4 text-sm text-[#1E1E1E]/55 md:text-base" style={deck}>
          Active Plans
        </p>
        <div className="flex min-h-[140px] items-center justify-center rounded-2xl border border-dashed border-[#1E1E1E]/20 bg-[#F0EFEB]/40 px-6 py-10">
          <p className="text-center text-sm text-[#1E1E1E]/40 md:text-base" style={deck}>
            You Have No Active Subscriptions
          </p>
        </div>
      </div>

      {/* Available plan */}
      <div className="pt-8">
        <p className="mb-4 text-sm text-[#1E1E1E]/55 md:text-base" style={deck}>
          Subscription plan Available
        </p>

        <div className="overflow-hidden rounded-2xl border border-[rgba(30,30,30,0.08)] bg-[#F0EFEB]/50">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left — plan details */}
            <div className="border-b border-[rgba(30,30,30,0.08)] p-6 md:p-8 lg:border-b-0 lg:border-r">
              <h2 className="text-xl font-bold text-[#054742] md:text-2xl" style={display}>
                Personal Plan
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1E1E1E]/60 md:text-base" style={deck}>
                New Opportunities Await. Sign Up For Personal Plan To Get All This And More:
              </p>

              <ul className="mt-5 space-y-3">
                {planFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckIcon />
                    <span className="text-sm text-[#1E1E1E]/75 md:text-base" style={deck}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className="rounded-xl bg-[#C780ED] px-6 py-2.5 text-sm font-medium text-[#1E1E1E] transition-opacity hover:opacity-90 md:text-base"
                  style={deck}
                >
                  Subscribe
                </button>
                <button
                  type="button"
                  className="text-sm text-[#1E1E1E]/70 underline-offset-2 hover:text-[#1E1E1E] hover:underline md:text-base"
                  style={deck}
                >
                  Learn More
                </button>
              </div>

              <p className="mt-5 text-sm text-[#1E1E1E]/55 md:text-base" style={deck}>
                Starting At ₹375{' '}
                <span className="line-through">₹500</span> Per Month. Cancel Anytime.
              </p>
            </div>

            {/* Right — marketing panel */}
            <div className="flex flex-col bg-[#D8C4F0] p-6 md:p-8">
              <div className="flex flex-col items-center text-center">
                <BookStackIcon />
                <h3
                  className="mt-3 text-base font-bold uppercase tracking-wide text-[#1E1E1E] md:text-lg"
                  style={display}
                >
                  Courses You Need
                </h3>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#1E1E1E]/65 md:text-sm" style={deck}>
                  Navaro Combines Practical Certification Courses With Shipping Calculators, Document Checkers, And
                  Tracking
                </p>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-[rgba(30,30,30,0.08)] shadow-sm">
                <img
                  src="/image/tools-dashboard-hero.png"
                  alt="Bill of Lading Generator dashboard preview"
                  className="h-auto w-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PaymentMethodsSection() {
  const [showOnCheckout, setShowOnCheckout] = useState(true)

  return (
    <div>
      <h1
        className="mb-8 text-xl font-bold uppercase tracking-wide text-[#1E1E1E] md:text-2xl"
        style={display}
      >
        Payment Methods
      </h1>

      <p className="mb-4 text-sm text-[#1E1E1E]/55 md:text-base" style={deck}>
        Active Plans
      </p>

      <div className="flex min-h-[180px] flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-[#1E1E1E]/20 bg-[#F0EFEB]/40 px-6 py-12">
        <p className="text-center text-sm text-[#1E1E1E]/40 md:text-base" style={deck}>
          You Don&apos;t Have Any Saved Payment Methods
        </p>
        <button
          type="button"
          className="rounded-xl border border-[rgba(30,30,30,0.15)] bg-white px-6 py-2.5 text-sm font-medium text-[#1E1E1E] transition-colors hover:bg-[#F9F9F9] md:text-base"
          style={deck}
        >
          Add Payment Method
        </button>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={showOnCheckout}
          onChange={(e) => setShowOnCheckout(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#1E1E1E]/20 accent-[#3FCBBD]"
        />
        <span className="text-sm text-[#1E1E1E]/55 md:text-base" style={deck}>
          Show my saved payment methods on checkout steps
        </span>
      </label>
    </div>
  )
}

function PrivacyCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border border-[#1E1E1E]/25 accent-[#3FCBBD]"
      />
      <span className="text-sm text-[#1E1E1E]/55 md:text-base" style={deck}>
        {label}
      </span>
    </label>
  )
}

function PrivacySettingsGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="py-8 first:pt-0">
      <h2 className="mb-4 text-sm font-bold text-[#1E1E1E] md:text-base" style={deck}>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function PrivacySection() {
  const [settings, setSettings] = useState({
    showProfile: false,
    showCourses: false,
    shareCompletion: false,
    appearLeaderboards: false,
    productUpdates: false,
    courseRecommendations: false,
    courseReminders: false,
  })

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div>
      <h1
        className="mb-2 text-xl font-bold uppercase tracking-wide text-[#1E1E1E] md:text-2xl"
        style={display}
      >
        Privacy Settings
      </h1>

      <div className="divide-y divide-[rgba(30,30,30,0.1)]">
        <PrivacySettingsGroup title="Profile page settings">
          <PrivacyCheckbox
            id="showProfile"
            label="Show your profile to logged-in users"
            checked={settings.showProfile}
            onChange={() => toggle('showProfile')}
          />
          <PrivacyCheckbox
            id="showCourses"
            label="Show courses you're taking on your profile page"
            checked={settings.showCourses}
            onChange={() => toggle('showCourses')}
          />
        </PrivacySettingsGroup>

        <PrivacySettingsGroup title="Activity & Progress">
          <PrivacyCheckbox
            id="shareCompletion"
            label="Share course completion updates"
            checked={settings.shareCompletion}
            onChange={() => toggle('shareCompletion')}
          />
          <PrivacyCheckbox
            id="appearLeaderboards"
            label="Appear on course leaderboards"
            checked={settings.appearLeaderboards}
            onChange={() => toggle('appearLeaderboards')}
          />
        </PrivacySettingsGroup>

        <PrivacySettingsGroup title="Communication Preferences">
          <PrivacyCheckbox
            id="productUpdates"
            label="Product updates & announcements"
            checked={settings.productUpdates}
            onChange={() => toggle('productUpdates')}
          />
          <PrivacyCheckbox
            id="courseRecommendations"
            label="Personalized course recommendations"
            checked={settings.courseRecommendations}
            onChange={() => toggle('courseRecommendations')}
          />
          <PrivacyCheckbox
            id="courseReminders"
            label="Course reminders"
            checked={settings.courseReminders}
            onChange={() => toggle('courseReminders')}
          />
          <div className="pt-4">
            <SplitActionButton label="Save" />
          </div>
        </PrivacySettingsGroup>

        <PrivacySettingsGroup title="Security & Data Control">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="rounded-xl bg-[#054742] px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-white transition-opacity hover:opacity-90 md:text-sm"
              style={deck}
            >
              Download My Data
            </button>
            <button
              type="button"
              className="text-sm text-[#1E1E1E]/70 transition-colors hover:text-[#1E1E1E] md:text-base"
              style={deck}
            >
              Delete My Account
            </button>
          </div>
        </PrivacySettingsGroup>
      </div>
    </div>
  )
}

function ToggleSwitch({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean
  onChange: (enabled: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        enabled ? 'bg-[#C780ED]' : 'bg-[#1E1E1E]/15'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

const notificationSections = [
  {
    id: 'updates',
    title: 'Updates and announcements',
    options: [
      { id: 'productUpdatesFeatures', label: 'Product updates and new feature releases' },
      { id: 'platformAnnouncements', label: 'Platform announcements and improvements' },
    ],
  },
  {
    id: 'learning',
    title: 'Your learning',
    options: [
      { id: 'courseProgress', label: 'Course progress and stats' },
      { id: 'recommendedCourses', label: 'Recommended courses based on your activity' },
      { id: 'learningTips', label: 'Learning tips and insights' },
      { id: 'mentorNotifications', label: 'Notifications from mentors/instructors' },
    ],
  },
  {
    id: 'community',
    title: 'Community and activity',
    options: [
      { id: 'communityHighlights', label: 'Community highlights and discussions' },
      { id: 'newGroups', label: 'New groups or communities to join' },
      { id: 'eventsLeaderboard', label: 'Events, challenges, and leaderboard updates' },
    ],
  },
  {
    id: 'account',
    title: 'Account and activity',
    options: [
      { id: 'loginAlerts', label: 'Login alerts and security updates' },
      { id: 'purchaseConfirmations', label: 'Purchase confirmations and receipts' },
      { id: 'subscriptionBilling', label: 'Subscription and billing updates' },
    ],
  },
] as const

function NotificationPreferencesSection() {
  const [sectionEnabled, setSectionEnabled] = useState({
    updates: true,
    learning: true,
    community: true,
    account: true,
  })

  const [optionChecked, setOptionChecked] = useState<Record<string, boolean>>({
    productUpdatesFeatures: false,
    platformAnnouncements: false,
    courseProgress: false,
    recommendedCourses: false,
    learningTips: false,
    mentorNotifications: false,
    communityHighlights: false,
    newGroups: false,
    eventsLeaderboard: false,
    loginAlerts: false,
    purchaseConfirmations: false,
    subscriptionBilling: false,
  })

  return (
    <div>
      <h1
        className="mb-6 text-xl font-bold uppercase tracking-wide text-[#1E1E1E] md:text-2xl"
        style={display}
      >
        Notifications Settings
      </h1>

      <div>
        {notificationSections.map((section) => (
          <div
            key={section.id}
            className="border-b border-[rgba(30,30,30,0.1)] py-6 first:pt-0 last:border-b-0"
          >
            <div className="flex items-center justify-between gap-4 rounded-xl bg-[#F0EFEB] px-4 py-3.5 md:px-5">
              <h2 className="text-sm font-bold text-[#1E1E1E] md:text-base" style={deck}>
                {section.title}
              </h2>
              <ToggleSwitch
                label={`Toggle ${section.title}`}
                enabled={sectionEnabled[section.id as keyof typeof sectionEnabled]}
                onChange={(enabled) =>
                  setSectionEnabled((prev) => ({ ...prev, [section.id]: enabled }))
                }
              />
            </div>

            <div className="mt-4 space-y-3 pl-1">
              {section.options.map((option) => (
                <PrivacyCheckbox
                  key={option.id}
                  id={option.id}
                  label={option.label}
                  checked={optionChecked[option.id] ?? false}
                  onChange={(checked) =>
                    setOptionChecked((prev) => ({ ...prev, [option.id]: checked }))
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm italic text-[#1E1E1E]/55 md:text-base" style={deck}>
        Changes may take a few hours to reflect. You&apos;ll still receive essential emails related
        to your account and transactions.
      </p>

      <div className="mt-6">
        <SplitActionButton label="Save" />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const confirmedAvatarRef = useRef<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [activeSection, setActiveSection] = useState<(typeof sidebarItems)[number]>('PROFILE INFO')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [avatarCacheKey, setAvatarCacheKey] = useState(0)
  const [fileName, setFileName] = useState('No file selected yet')
  const [displayName, setDisplayName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  )
  const [avatarMessage, setAvatarMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  )
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    phone: '',
    country: '',
    biography: '',
    website: '',
    instagram: '',
    facebook: '',
    youtube: '',
  })

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      const user = await resolveAuthUser()
      if (cancelled) return

      if (!user) {
        router.replace('/login')
        return
      }

      const profile = await fetchUserProfile()
      if (cancelled) return

      const fullName = profile?.name || user.name
      const name = formatDisplayName(fullName)
      const { firstName, lastName } = splitName(fullName)
      const email = profile?.email || user.email

      setDisplayName(name)
      setUserEmail(email)
      setFormData((prev) => ({
        ...prev,
        firstName,
        lastName,
        email,
        phone: profile?.phone ?? prev.phone,
        country: profile?.country ?? prev.country,
        biography: profile?.bio ?? prev.biography,
        role: formatRole(user.role),
      }))

      if (profile?.avatar) {
        confirmedAvatarRef.current = profile.avatar
        setProfileImage(profile.avatar)
        setAvatarCacheKey(Date.now())
        setFileName('Current profile image')
      }

      setAuthReady(true)
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateAvatarFile(file)
    if (validationError) {
      setAvatarMessage({ type: 'error', text: validationError })
      e.target.value = ''
      return
    }

    setAvatarMessage(null)
    setUploadingAvatar(true)
    setFileName(file.name)

    const previewUrl = URL.createObjectURL(file)
    setProfileImage(previewUrl)

    const result = await uploadUserProfileAvatar(file)
    URL.revokeObjectURL(previewUrl)
    setUploadingAvatar(false)
    e.target.value = ''

    if (result.success) {
      confirmedAvatarRef.current = result.avatar
      setProfileImage(result.avatar)
      setAvatarCacheKey(Date.now())
      setFileName('Current profile image')
      setAvatarMessage({ type: 'success', text: 'Avatar updated successfully.' })
      return
    }

    setProfileImage(confirmedAvatarRef.current)
    setFileName(confirmedAvatarRef.current ? 'Current profile image' : 'No file selected yet')
    setAvatarMessage({
      type: 'error',
      text: result.error || 'Failed to upload avatar.',
    })
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch(backendAuthUrl('/logout'), {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Still clear local session if the request fails
    } finally {
      clearAuthSession()
      setLoggingOut(false)
      router.replace(getPostLogoutPath())
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveMessage(null)

    const result = await updateUserProfile({
      phone: formData.phone.trim(),
      country: formData.country.trim(),
      bio: formData.biography.trim(),
    })

    setSaving(false)

    if (result.success) {
      setFormData((prev) => ({
        ...prev,
        phone: result.profile.phone,
        country: result.profile.country,
        biography: result.profile.bio,
      }))
      if (result.profile.avatar) {
        confirmedAvatarRef.current = result.profile.avatar
        setProfileImage(result.profile.avatar)
        setAvatarCacheKey(Date.now())
        setFileName('Current profile image')
      }
      setSaveMessage({ type: 'success', text: 'Profile updated successfully.' })
      return
    }

    setSaveMessage({
      type: 'error',
      text: result.error || 'Failed to update profile.',
    })
  }

  const applyBiographyFormat = (format: 'bold' | 'italic') => {
    const textarea = document.getElementById('biography') as HTMLTextAreaElement | null
    if (!textarea) return
    const { selectionStart, selectionEnd, value } = textarea
    const selected = value.slice(selectionStart, selectionEnd)
    if (!selected) return
    const wrapper = format === 'bold' ? `**${selected}**` : `*${selected}*`
    const next =
      value.slice(0, selectionStart) + wrapper + value.slice(selectionEnd)
    setFormData((prev) => ({ ...prev, biography: next }))
  }

  if (!authReady) {
    return null
  }

  const avatarDisplayUrl = getAvatarImageUrl(profileImage, avatarCacheKey)

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      {/* User header */}
      <section
        className="border-b border-[rgba(30,30,30,0.1)]"
        style={dottedPattern}
      >
        <div className="mx-auto flex max-w-[1415px] flex-wrap items-center justify-between gap-4 px-4 py-5 md:px-6 md:py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#E8F8F4] shadow-sm md:h-16 md:w-16">
              {avatarDisplayUrl ? (
                <img
                  src={avatarDisplayUrl}
                  alt="User avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <PersonIcon className="h-7 w-7 text-[#1E1E1E]/40 md:h-8 md:w-8" />
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-[#1E1E1E] md:text-xl" style={display}>
                {displayName || 'User'}
              </p>
              <p className="text-sm text-[#1E1E1E]/70 md:text-base" style={deck}>
                {userEmail ? userEmail : 'Hello, Welcome Back'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="rounded-lg bg-[#FBEBA9] px-4 py-2 text-xs font-medium text-[#1E1E1E] md:text-sm"
              style={deck}
            >
              Public Profile
            </span>
            <span
              className="rounded-lg bg-[#FBEBA9] px-4 py-2 text-xs font-medium text-[#1E1E1E] md:text-sm"
              style={deck}
            >
              Basic Course
            </span>
          </div>
        </div>
      </section>

      {/* Main layout */}
      <div className="mx-auto flex max-w-[1415px] flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 border-b border-[rgba(30,30,30,0.1)] px-4 py-6 lg:w-[280px] lg:border-b-0 lg:border-r lg:px-6 lg:py-8 xl:w-[320px]">
          <nav className="flex flex-col gap-1">
            {sidebarItems.map((item) => {
              const isActive = activeSection === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveSection(item)}
                  className={`rounded-xl px-4 py-3 text-left text-xs font-medium tracking-wide transition-colors md:text-sm ${
                    isActive
                      ? 'bg-[#C780ED] text-[#1E1E1E]'
                      : 'text-[#1E1E1E]/55 hover:bg-[#1E1E1E]/5 hover:text-[#1E1E1E]'
                  }`}
                  style={{
                    ...deck,
                    ...(isActive ? dottedPattern : {}),
                  }}
                >
                  {item}
                </button>
              )
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-8 w-full rounded-xl bg-[#FFB393] px-4 py-3.5 text-sm font-medium text-[#1E1E1E] transition-opacity hover:opacity-90 disabled:opacity-60 md:text-base"
            style={deck}
          >
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </button>
        </aside>

        {/* Profile form */}
        <section className="flex-1 px-4 py-8 md:px-8 md:py-10 lg:px-10">
          {activeSection === 'PROFILE INFO' ? (
            <div>
              <h1
                className="mb-8 text-xl font-bold uppercase tracking-wide text-[#1E1E1E] md:text-2xl"
                style={display}
              >
                Edit Your Profile
              </h1>

              {/* Avatar upload */}
              <div className="mb-8 flex flex-col items-start gap-4 border-b border-[rgba(30,30,30,0.1)] pb-8 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#C780ED] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:h-28 md:w-28"
                  aria-label="Add or change profile image"
                >
                  {avatarDisplayUrl ? (
                    <img
                      src={avatarDisplayUrl}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PersonIcon className="h-12 w-12 md:h-14 md:w-14" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={(e) => {
                    void handleImageChange(e)
                  }}
                />
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="text-left text-sm font-medium text-[#1E1E1E] hover:underline disabled:cursor-not-allowed disabled:opacity-60 md:text-base"
                    style={deck}
                  >
                    {uploadingAvatar ? 'Uploading image...' : 'Tap Here To Add / Change Image'}
                  </button>
                  <p className="mt-1 text-xs text-[#1E1E1E]/45 md:text-sm" style={deck}>
                    {fileName}
                  </p>
                  <p className="mt-1 text-xs text-[#1E1E1E]/45 md:text-sm" style={deck}>
                    Max file size: 2 MB. Allowed types: JPEG, PNG, WebP, GIF.
                  </p>
                  {avatarMessage ? (
                    <p
                      className={`mt-2 text-xs md:text-sm ${
                        avatarMessage.type === 'success' ? 'text-[#054742]' : 'text-red-600'
                      }`}
                      style={deck}
                    >
                      {avatarMessage.text}
                    </p>
                  ) : null}
                </div>
              </div>

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  void handleSaveProfile()
                }}
              >
                {/* Name row */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-[#1E1E1E]" style={deck}>
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Jhone"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-[#F0EFEB] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:ring-2 focus:ring-[#C780ED]/40"
                      style={deck}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-[#1E1E1E]" style={deck}>
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-[#F0EFEB] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:ring-2 focus:ring-[#C780ED]/40"
                      style={deck}
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="mb-2 block text-sm font-medium text-[#1E1E1E]" style={deck}>
                    Your Role
                  </label>
                  <input
                    id="role"
                    name="role"
                    type="text"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#F0EFEB] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:ring-2 focus:ring-[#C780ED]/40"
                    style={deck}
                  />
                  <p className="mt-1.5 text-xs text-[#1E1E1E]/45 md:text-sm" style={deck}>
                    Add a professional headline like &apos;Instructor at Navaro&apos; etc.
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#1E1E1E]" style={deck}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#F0EFEB] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:ring-2 focus:ring-[#C780ED]/40"
                    style={deck}
                  />
                  <p className="mt-1.5 text-xs text-[#1E1E1E]/45 md:text-sm" style={deck}>
                    e.g., jane.doe@gmail.com
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[#1E1E1E]" style={deck}>
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#F0EFEB] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:ring-2 focus:ring-[#C780ED]/40"
                    style={deck}
                  />
                  <p className="mt-1.5 text-xs text-[#1E1E1E]/45 md:text-sm" style={deck}>
                    Enter your Phone Number: + 99-xx-xxx
                  </p>
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="mb-2 block text-sm font-medium text-[#1E1E1E]" style={deck}>
                    Country
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    placeholder="India"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#F0EFEB] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:ring-2 focus:ring-[#C780ED]/40"
                    style={deck}
                  />
                </div>

                {/* Biography */}
                <div>
                  <label htmlFor="biography" className="mb-2 block text-sm font-medium text-[#1E1E1E]" style={deck}>
                    Biography
                  </label>
                  <div className="relative">
                    <textarea
                      id="biography"
                      name="biography"
                      rows={5}
                      placeholder="Write about yourself here..."
                      value={formData.biography}
                      onChange={handleChange}
                      className="w-full resize-none rounded-xl bg-[#F0EFEB] px-4 py-3 pb-10 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:ring-2 focus:ring-[#C780ED]/40"
                      style={deck}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => applyBiographyFormat('bold')}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-white/80 text-sm font-bold text-[#1E1E1E] hover:bg-white"
                        aria-label="Bold"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => applyBiographyFormat('italic')}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-white/80 text-sm italic text-[#1E1E1E] hover:bg-white"
                        aria-label="Italic"
                      >
                        I
                      </button>
                    </div>
                  </div>
                </div>

                {/* Website */}
                <div className="border-t border-[rgba(30,30,30,0.1)] pt-6">
                  <label htmlFor="website" className="mb-2 block text-sm font-medium text-[#1E1E1E]" style={deck}>
                    Your Website Link
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="Website (https://..."
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#F0EFEB] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:ring-2 focus:ring-[#C780ED]/40"
                    style={deck}
                  />
                </div>

                {/* Social links */}
                <div>
                  <p className="mb-3 text-sm font-medium text-[#1E1E1E]" style={deck}>
                    Socials Links
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl bg-[#F0EFEB] px-4 py-3">
                      <InstagramIcon />
                      <input
                        name="instagram"
                        type="url"
                        placeholder="Website (https://..."
                        value={formData.instagram}
                        onChange={handleChange}
                        className="w-full bg-transparent text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35"
                        style={deck}
                      />
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-[#F0EFEB] px-4 py-3">
                      <FacebookIcon />
                      <input
                        name="facebook"
                        type="url"
                        placeholder="Website (https://..."
                        value={formData.facebook}
                        onChange={handleChange}
                        className="w-full bg-transparent text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35"
                        style={deck}
                      />
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-[#F0EFEB] px-4 py-3">
                      <YouTubeIcon />
                      <input
                        name="youtube"
                        type="url"
                        placeholder="Website (https://..."
                        value={formData.youtube}
                        onChange={handleChange}
                        className="w-full bg-transparent text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35"
                        style={deck}
                      />
                    </div>
                  </div>
                </div>

                {saveMessage ? (
                  <p
                    className={`text-sm ${saveMessage.type === 'success' ? 'text-[#054742]' : 'text-red-600'}`}
                    style={deck}
                  >
                    {saveMessage.text}
                  </p>
                ) : null}

                <div className="border-t border-[rgba(30,30,30,0.1)] pt-6">
                  <SplitActionButton
                    label={saving ? 'Saving...' : 'Save'}
                    onClick={() => {
                      void handleSaveProfile()
                    }}
                  />
                </div>
              </form>
            </div>
          ) : activeSection === 'ACCOUNT SECURITY' ? (
            <AccountSecuritySection userEmail={userEmail} />
          ) : activeSection === 'SUBSCRIPTIONS' ? (
            <SubscriptionsSection />
          ) : activeSection === 'PAYMENT METHODS' ? (
            <PaymentMethodsSection />
          ) : activeSection === 'PRIVACY' ? (
            <PrivacySection />
          ) : activeSection === 'NOTIFICATION PREFERENCES' ? (
            <NotificationPreferencesSection />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center">
              <p className="text-center text-sm text-[#1E1E1E]/50 md:text-base" style={deck}>
                {activeSection.replace(/_/g, ' ')} settings coming soon.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
