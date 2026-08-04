'use client'

import { useEffect, useRef, useState } from 'react'

import {
  emptyContact,
  type BolContact,
  type BolContactType,
} from '@/components/tools/export-docs/bill-of-lading/billOfLadingTypes'

const CONTACT_TYPES: BolContactType[] = ['Customer', 'Supplier', 'Forwarding Agent', 'Other']

const COUNTRIES = [
  '',
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'China',
  'India',
  'United Arab Emirates',
  'Australia',
  'Mexico',
  'Brazil',
  'Japan',
  'Singapore',
  'Netherlands',
]

const modalLabel = 'mb-1.5 block text-xs font-medium text-[#475569]'
const modalInput =
  'w-full rounded border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm text-[#1e293b] outline-none placeholder:text-[#94a3b8] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/25'

type TabId = 'other' | 'additional' | 'defaults'

type Props = {
  open: boolean
  title?: string
  initial: BolContact
  onClose: () => void
  onSubmit: (contact: BolContact) => void
}

export default function BolContactModal({
  open,
  title = 'Create Contact',
  initial,
  onClose,
  onSubmit,
}: Props) {
  const [draft, setDraft] = useState<BolContact>(initial)
  const [tab, setTab] = useState<TabId>('other')
  const [logoError, setLogoError] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setDraft(initial)
      setTab('other')
      setLogoError(null)
    }
  }, [open, initial])

  const onLogoFile = (file: File | undefined) => {
    setLogoError(null)
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setLogoError('Please choose an image file (PNG, JPG, or WebP).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Logo must be 2 MB or smaller.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : ''
      if (url) patch({ logoDataUrl: url })
    }
    reader.onerror = () => setLogoError('Could not read the image file.')
    reader.readAsDataURL(file)
  }

  if (!open) return null

  const patch = (partial: Partial<BolContact>) => setDraft((d) => ({ ...d, ...partial }))

  const canSubmit = draft.companyName.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const companyName = draft.companyName.trim()
    onSubmit({
      ...draft,
      companyName,
      name: companyName,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1e293b]/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bol-contact-modal-title"
        className="flex max-h-[min(640px,92vh)] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-[0_24px_48px_rgba(15,23,42,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 border-b border-[#e2e8f0] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="bol-contact-modal-title" className="text-base font-semibold text-[#1e293b]">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#1e293b]"
              aria-label="Close"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M2.974 2 2 2.974 7.026 8 2 13.026l.974.974L8 8.974 13.026 14l.974-.974L8.974 8 14 2.974 13.026 2 8 7.026 2.974 2z" />
              </svg>
            </button>
          </div>
          <hr className="mt-4 border-[#e2e8f0]" />
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="mb-4">
              <label className={modalLabel}>
                Company Name <span className="text-[#dc2626]">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  name="company.name"
                  required
                  value={draft.companyName}
                  onChange={(e) => patch({ companyName: e.target.value })}
                  placeholder="Company name"
                  autoComplete="off"
                  className={`${modalInput} flex-1`}
                />
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  className="sr-only"
                  aria-hidden
                  onChange={(e) => {
                    onLogoFile(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="mt-0.5 shrink-0 rounded border border-[#bfdbfe] bg-white px-3 py-2 text-xs font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
                >
                  {draft.logoDataUrl ? 'Change Logo' : 'Upload Logo'}
                </button>
              </div>
              {logoError ? (
                <p className="mt-1.5 text-xs text-[#dc2626]" role="alert">
                  {logoError}
                </p>
              ) : null}
              {draft.logoDataUrl ? (
                <div className="mt-2 flex items-center gap-3 rounded border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
                  <img
                    src={draft.logoDataUrl}
                    alt="Company logo preview"
                    className="max-h-10 max-w-[140px] object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => patch({ logoDataUrl: '' })}
                    className="text-xs font-semibold text-[#64748b] hover:text-[#dc2626]"
                  >
                    Remove logo
                  </button>
                </div>
              ) : null}
            </div>

            <div className="mb-4">
              <div className="flex flex-wrap gap-4">
                {CONTACT_TYPES.map((type) => {
                  const checked = draft.contactType === type
                  return (
                    <label key={type} className="flex cursor-pointer items-center gap-2">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          checked ? 'border-[#2563eb]' : 'border-[#cbd5e1]'
                        }`}
                      >
                        {checked && <span className="h-2 w-2 rounded-full bg-[#2563eb]" />}
                      </span>
                      <input
                        type="radio"
                        name="contactType"
                        value={type}
                        checked={checked}
                        onChange={() => patch({ contactType: type })}
                        className="sr-only"
                      />
                      <span className="text-sm text-[#334155]">{type}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="mb-4">
              <label className={modalLabel}>Primary Person</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="name.first"
                  value={draft.firstName}
                  onChange={(e) => patch({ firstName: e.target.value })}
                  placeholder="First name"
                  autoComplete="off"
                  className={modalInput}
                />
                <input
                  name="name.last"
                  value={draft.lastName}
                  onChange={(e) => patch({ lastName: e.target.value })}
                  placeholder="Last name"
                  autoComplete="off"
                  className={modalInput}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className={modalLabel}>Email</label>
              <input
                name="email"
                type="email"
                value={draft.email}
                onChange={(e) => patch({ email: e.target.value })}
                placeholder="name@email.com"
                autoComplete="off"
                className={modalInput}
              />
            </div>

            <div className="mb-4 flex border-b border-[#e2e8f0]">
              {(
                [
                  ['other', 'Other details'],
                  ['additional', 'Additional fields'],
                  ['defaults', 'Default settings'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`border-b-2 px-3 py-2 text-xs font-semibold transition ${
                    tab === id
                      ? 'border-[#2563eb] text-[#2563eb]'
                      : 'border-transparent text-[#64748b] hover:text-[#334155]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'other' && (
              <div className="space-y-3">
                <div>
                  <label className={modalLabel}>Street Address</label>
                  <input
                    name="company.address.address1"
                    value={draft.line1}
                    onChange={(e) => patch({ line1: e.target.value })}
                    placeholder="Street Address"
                    autoComplete="off"
                    className={modalInput}
                  />
                </div>
                <div>
                  <input
                    name="company.address.address2"
                    value={draft.line2}
                    onChange={(e) => patch({ line2: e.target.value })}
                    placeholder=""
                    autoComplete="off"
                    className={modalInput}
                  />
                </div>
                <div>
                  <input
                    name="company.address.city"
                    value={draft.city}
                    onChange={(e) => patch({ city: e.target.value })}
                    placeholder="City"
                    autoComplete="off"
                    className={modalInput}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="company.address.region"
                    value={draft.region}
                    onChange={(e) => patch({ region: e.target.value })}
                    placeholder="State"
                    autoComplete="off"
                    className={modalInput}
                  />
                  <input
                    name="company.address.zip"
                    value={draft.postal}
                    onChange={(e) => patch({ postal: e.target.value })}
                    placeholder="Postal / ZIP Code"
                    autoComplete="off"
                    className={modalInput}
                  />
                </div>
                <div>
                  <select
                    name="company.address.country"
                    value={draft.country}
                    onChange={(e) => patch({ country: e.target.value })}
                    className={modalInput}
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.filter(Boolean).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pt-2">
                  <label className={modalLabel}>Contact info</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      name="number"
                      value={draft.phone}
                      onChange={(e) => patch({ phone: e.target.value })}
                      placeholder="Telephone"
                      autoComplete="off"
                      className={modalInput}
                    />
                    <input
                      name="fax"
                      value={draft.fax}
                      onChange={(e) => patch({ fax: e.target.value })}
                      placeholder="Fax"
                      autoComplete="off"
                      className={modalInput}
                    />
                  </div>
                </div>
              </div>
            )}

            {tab === 'additional' && (
              <div className="space-y-3">
                <div>
                  <label className={modalLabel}>Additional address line</label>
                  <input
                    value={draft.line3}
                    onChange={(e) => patch({ line3: e.target.value })}
                    placeholder="Suite, unit, etc."
                    className={modalInput}
                  />
                </div>
                <p className="text-sm text-[#64748b]">More custom fields can be added here later.</p>
              </div>
            )}

            {tab === 'defaults' && (
              <p className="text-sm text-[#64748b]">
                Default document settings for this contact will be available in a future update.
              </p>
            )}
          </div>

          <footer className="flex shrink-0 justify-end gap-2 border-t border-[#e2e8f0] bg-[#fafafa] px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Submit
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
