'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'

import BolContactModal from '@/components/tools/export-docs/bill-of-lading/BolContactModal'
import SignatureModal, { getSavedBolSignature } from '@/components/tools/export-docs/SignatureModal'
import {
  contactDisplayName,
  contactPreviewLines,
  emptyContact,
  signatureDefaultName,
  type BolContact,
  type BolSignature,
} from '@/components/tools/export-docs/bill-of-lading/billOfLadingTypes'
import {
  amountToWords,
  BOE_CURRENCIES,
  currencySymbol,
  defaultBillOfExchangeState,
  formatBoeAmount,
  parseBoeAmount,
  sanitizeBoeAmountInput,
  type BillOfExchangeState,
} from '@/components/tools/export-docs/bill-of-exchange/billOfExchangeTypes'

const BOE_HTML_URL = '/templates/bill-exchange.html?embed=1'

type BoeHtmlWindow = Window & {
  renderBillOfExchangeDocument?: (data: BillOfExchangeState) => void
  downloadBillOfExchangePdf?: () => Promise<Blob>
  boePdfTemplateReady?: Promise<void>
}

function triggerPdfDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function boeTemplateUrl() {
  return new URL(BOE_HTML_URL, window.location.origin).href
}

async function waitForBoePdfIframe(iframe: HTMLIFrameElement, timeoutMs = 30000): Promise<BoeHtmlWindow> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const win = iframe.contentWindow as BoeHtmlWindow | null
    if (
      win &&
      typeof win.renderBillOfExchangeDocument === 'function' &&
      typeof win.downloadBillOfExchangePdf === 'function'
    ) {
      try {
        await win.boePdfTemplateReady
        return win
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to initialize PDF template.')
      }
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50))
  }

  throw new Error(
    'Bill of Exchange HTML PDF helpers not available. The template may have failed to load — refresh the page and try again.',
  )
}

async function downloadBoePdfViaHtmlTemplate(data: BillOfExchangeState, filename: string) {
  const templateUrl = boeTemplateUrl()
  const response = await fetch(templateUrl, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(
      `Bill of Exchange template could not be loaded (${response.status}). Expected ${templateUrl}`,
    )
  }
  const html = await response.text()
  if (!html.includes('renderBillOfExchangeDocument')) {
    throw new Error('Bill of Exchange template is invalid or incomplete.')
  }

  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', 'Bill of Exchange PDF')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText =
    'position:fixed;left:-12000px;top:0;width:794px;min-height:1200px;border:0;opacity:1;visibility:visible;pointer-events:none;z-index:0;'

  document.body.appendChild(iframe)
  iframe.src = templateUrl

  try {
    const win = await waitForBoePdfIframe(iframe)
    win.renderBillOfExchangeDocument!(data)
    await new Promise((resolve) => window.setTimeout(resolve, 200))
    let raw: unknown
    try {
      raw = await win.downloadBillOfExchangePdf!()
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'PDF export failed inside the template.'
      throw new Error(msg)
    }

    let pdfBlob: Blob | null = null
    if (raw instanceof Blob) {
      pdfBlob = new Blob([await raw.arrayBuffer()], { type: 'application/pdf' })
    } else if (raw != null && typeof (raw as Blob).size === 'number') {
      pdfBlob = new Blob([raw as BlobPart], { type: 'application/pdf' })
    }

    if (!pdfBlob || pdfBlob.size < 500) {
      throw new Error('Generated PDF was empty. Try again or refresh the page.')
    }
    triggerPdfDownload(pdfBlob, filename)
  } finally {
    iframe.remove()
  }
}

const border = 'border-[#c5d0dc]'
const cell = `p-3 ${border}`
const gridInput =
  'w-full rounded bg-[#eef1f4] px-2.5 py-2 text-sm text-[#1e3a5f] outline-none placeholder:text-[#94a3b8] focus:bg-[#e8ecf1] focus:ring-1 focus:ring-[#3b82f6]/30'
const gridTextarea = `${gridInput} min-h-[2.25rem] resize-y`

function IconChevron() {
  return (
    <svg className="ml-0.5 inline h-3 w-3 shrink-0 text-[#64748b]" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M3.48 4.5 2 5.887 8 11.5 14 5.887 12.52 4.5 8 8.726" />
    </svg>
  )
}

function CellLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-semibold leading-tight text-[#334155]">
      {children}
      <IconChevron />
    </div>
  )
}

function IconEdit() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M12.98 0a1.62 1.62 0 00-1.187.64l-2.057 2.74H3.883L0 12.632V16h3.368L15.753 3.615a1.62 1.62 0 000-2.329L13.575.247A1.62 1.62 0 0012.98 0zm0 2.033L13.967 3.02l-1.089 1.089-1.087-1.088 1.089-1.089zm-2.28 2.28 1.087 1.087-9.016 9.016H1.684v-1.087L10.7 4.313z" />
    </svg>
  )
}

function CurrencySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)

  useEffect(() => {
    setQuery(value)
  }, [value])

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase()
    if (!q) return BOE_CURRENCIES.slice(0, 12)
    return BOE_CURRENCIES.filter((c) => c.includes(q)).slice(0, 20)
  }, [query])

  return (
    <div className="relative w-[5.5rem] shrink-0">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value.toUpperCase())
          onChange(e.target.value.toUpperCase())
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
        className={`${gridInput} text-center font-semibold`}
        aria-label="Currency"
      />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 top-full z-30 mt-1 max-h-44 w-28 overflow-y-auto rounded border border-[#c5d0dc] bg-white py-1 shadow-lg">
          {filtered.map((c) => (
            <button
              key={c}
              type="button"
              className={`w-full px-3 py-1.5 text-left text-sm hover:bg-[#f1f5f9] ${c === value ? 'bg-[#eff6ff] font-semibold text-[#2563eb]' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(c)
                setQuery(c)
                setOpen(false)
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ContactField({
  label,
  contact,
  onChange,
  showAddressPreview = false,
  className = '',
}: {
  label: string
  contact: BolContact
  onChange: (next: BolContact) => void
  showAddressPreview?: boolean
  className?: string
}) {
  const [query, setQuery] = useState(() => contactDisplayName(contact))
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDraft, setModalDraft] = useState<BolContact>(contact)

  useEffect(() => {
    setQuery(contactDisplayName(contact))
  }, [contact])

  const applyContact = (next: BolContact) => {
    onChange(next)
    setQuery(contactDisplayName(next))
    setDropdownOpen(false)
  }

  const previewLines = contactPreviewLines(contact, { omitCompanyWhenLogo: true })

  return (
    <>
      <div className={className}>
        <CellLabel>{label}</CellLabel>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                onChange({ ...contact, name: e.target.value, companyName: e.target.value })
                setDropdownOpen(true)
              }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => window.setTimeout(() => setDropdownOpen(false), 150)}
              placeholder="Enter contact name..."
              autoComplete="off"
              className={gridInput}
            />
            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-44 overflow-y-auto rounded border border-[#c5d0dc] bg-white py-1 shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[#2563eb] hover:bg-[#f1f5f9]"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setModalDraft(emptyContact())
                    setModalOpen(true)
                    setDropdownOpen(false)
                  }}
                >
                  <span className="text-base leading-none">+</span>
                  Add new contact
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            title="Edit contact details"
            className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center text-[#2563eb] transition hover:opacity-80"
            onClick={() => {
              setModalDraft({ ...contact })
              setModalOpen(true)
            }}
          >
            <IconEdit />
          </button>
        </div>
        {showAddressPreview && (
          <div className="mt-2 min-h-[4.5rem] text-sm leading-relaxed text-[#64748b]">
            {previewLines.length > 0 ? (
              previewLines.map((line) => <p key={line}>{line}</p>)
            ) : (
              <p className="italic text-[#94a3b8]">—</p>
            )}
          </div>
        )}
      </div>

      <BolContactModal
        open={modalOpen}
        initial={modalDraft}
        onClose={() => setModalOpen(false)}
        onSubmit={(next) => {
          applyContact(next)
          setModalOpen(false)
        }}
      />
    </>
  )
}

function SignatureBlock({
  label,
  signature,
  defaultName,
  onOpen,
  onAutofill,
}: {
  label: string
  signature: BolSignature | null
  defaultName: string
  onOpen: () => void
  onAutofill: () => void
}) {
  return (
    <div>
      <CellLabel>{label}</CellLabel>
      {signature?.imageDataUrl ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full flex-col items-center rounded border border-[#e2e8f0] bg-white px-3 py-3 transition hover:border-[#2563eb]/40"
        >
          <img src={signature.imageDataUrl} alt="Signature" className="max-h-16 max-w-full object-contain" />
          <span className="mt-2 text-xs font-semibold text-[#2563eb]">Change signature</span>
        </button>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={onOpen}
            className="flex w-full items-center justify-center gap-2 rounded bg-[#eff6ff] px-4 py-6 text-sm font-semibold text-[#2563eb] transition hover:bg-[#dbeafe]"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M11.389.004a1.618 1.618 0 00-1.187.639l-2.057 2.74H3.883L0 16l12.617-3.883V7.831l2.602-2.17a1.644 1.644 0 00.175-2.453l-2.74-2.74a1.618 1.618 0 00-1.265-.464zm.114 1.616l2.74 2.739-.015.012-2.375 1.978-2.23-2.229 1.88-2.5zm-6.42 3.39h3.13l2.777 2.777v3.13L4.12 13.03l2.384-2.385c.137.038.278.057.42.058a1.627 1.627 0 10-1.572-1.206L2.969 11.88l2.115-6.87z" />
            </svg>
            Click here to sign
          </button>
          <button
            type="button"
            onClick={onAutofill}
            className="w-full text-center text-xs font-semibold text-[#2563eb] hover:underline"
          >
            Autofill my signature
          </button>
        </div>
      )}
    </div>
  )
}

function ExchangeDocumentBlock({
  value,
  patch,
  onAmountBlur,
  onOpenDraweeSignature,
  onOpenDrawerSignature,
  onAutofillDraweeSignature,
  onAutofillDrawerSignature,
  copyLabel,
}: {
  value: BillOfExchangeState
  patch: (partial: Partial<BillOfExchangeState>) => void
  onAmountBlur: () => void
  onOpenDraweeSignature: () => void
  onOpenDrawerSignature: () => void
  onAutofillDraweeSignature: () => void
  onAutofillDrawerSignature: () => void
  copyLabel?: string
}) {
  return (
    <div className={`overflow-hidden rounded-sm border ${border} bg-white`}>
      <div className={`border-b ${border} bg-[#f8fafc] px-4 py-3 text-center`}>
        <h3 className="text-base font-bold tracking-wide text-[#1e3a5f]">BILL OF EXCHANGE</h3>
        {copyLabel ? <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-[#64748b]">{copyLabel}</p> : null}
      </div>

      <div className={`grid grid-cols-1 border-b ${border} lg:grid-cols-[1fr_1.2fr]`}>
        <div className={`${cell} border-b lg:border-b-0 lg:border-r`}>
          <CellLabel>Reference No.</CellLabel>
          <input
            name="reference"
            value={value.reference}
            onChange={(e) => patch({ reference: e.target.value })}
            className={gridInput}
          />
        </div>
        <div className={cell}>
          <CellLabel>Amount in figures</CellLabel>
          <div className="flex gap-2">
            <CurrencySelect value={value.currency} onChange={(currency) => patch({ currency })} />
            <div
              className={`${gridInput} flex min-w-0 flex-1 items-center justify-end gap-1 focus-within:bg-[#e8ecf1] focus-within:ring-1 focus-within:ring-[#3b82f6]/30`}
            >
              <span className="shrink-0 text-sm font-semibold tabular-nums text-[#64748b]" aria-hidden>
                {currencySymbol(value.currency)}
              </span>
              <input
                name="order.totals.amount"
                type="text"
                value={value.amount}
                onChange={(e) => patch({ amount: sanitizeBoeAmountInput(e.target.value) })}
                onBlur={onAmountBlur}
                inputMode="decimal"
                autoComplete="off"
                style={{ width: `${Math.max(4, value.amount.length + 1)}ch` }}
                className="max-w-full min-w-[4ch] shrink-0 border-0 bg-transparent p-0 text-right text-sm tabular-nums text-[#1e3a5f] outline-none placeholder:text-[#94a3b8]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 border-b ${border} sm:grid-cols-3`}>
        <div className={`${cell} border-b sm:border-b-0 sm:border-r`}>
          <CellLabel>B/L Date (if applicable)</CellLabel>
          <input
            type="date"
            value={value.blDate}
            onChange={(e) => patch({ blDate: e.target.value })}
            className={gridInput}
          />
        </div>
        <div className={`${cell} border-b sm:border-b-0 sm:border-r`}>
          <CellLabel>Place of issue</CellLabel>
          <input
            name="place"
            value={value.placeOfIssue}
            onChange={(e) => patch({ placeOfIssue: e.target.value })}
            className={gridInput}
          />
        </div>
        <div className={cell}>
          <CellLabel>Date of issue</CellLabel>
          <input
            type="date"
            value={value.dateOfIssue}
            onChange={(e) => patch({ dateOfIssue: e.target.value })}
            className={gridInput}
          />
        </div>
      </div>

      <div className={`border-b ${border} ${cell}`}>
        <CellLabel>At</CellLabel>
        <textarea
          name="at"
          value={value.at}
          onChange={(e) => patch({ at: e.target.value })}
          rows={2}
          className={gridTextarea}
        />
      </div>

      <div className={`grid grid-cols-1 border-b ${border} lg:grid-cols-[1.4fr_1fr]`}>
        <ContactField
          label="Pay to the order of"
          contact={value.payToOrderOf}
          onChange={(payToOrderOf) => patch({ payToOrderOf })}
          className={cell}
        />
        <div className={`${cell} border-t lg:border-l lg:border-t-0`}>
          <CellLabel>The sum of (amount in words)</CellLabel>
          <input
            name="amountInWords"
            value={value.amountInWords}
            onChange={(e) => patch({ amountInWords: e.target.value })}
            className={gridInput}
          />
        </div>
      </div>

      <div className={`grid grid-cols-1 border-b ${border} sm:grid-cols-2`}>
        <div className={`${cell} border-b sm:border-b-0 sm:border-r`}>
          <CellLabel>Drawn under</CellLabel>
          <input
            name="drawnUnder"
            value={value.drawnUnder}
            onChange={(e) => patch({ drawnUnder: e.target.value })}
            className={gridInput}
          />
        </div>
        <div className={cell}>
          <CellLabel>Dated</CellLabel>
          <input
            type="date"
            value={value.drawnDate}
            onChange={(e) => patch({ drawnDate: e.target.value })}
            className={gridInput}
          />
        </div>
      </div>

      <ContactField
        label="Issued by"
        contact={value.issuedBy}
        onChange={(issuedBy) => patch({ issuedBy })}
        className={`border-b ${border} ${cell}`}
      />

      <div className={`grid grid-cols-1 border-b ${border} lg:grid-cols-2`}>
        <ContactField
          label="Signed for and on behalf of Drawee"
          contact={value.drawee}
          onChange={(drawee) => patch({ drawee })}
          showAddressPreview
          className={`${cell} border-b lg:border-b-0 lg:border-r`}
        />
        <ContactField
          label="Signed for and on behalf of Drawer"
          contact={value.drawer}
          onChange={(drawer) => patch({ drawer })}
          showAddressPreview
          className={cell}
        />
      </div>

      <div className={`grid grid-cols-1 border-b ${border} lg:grid-cols-2`}>
        <div className={`${cell} border-b lg:border-b-0 lg:border-r`}>
          <CellLabel>Name of authorized signatory</CellLabel>
          <div className="grid grid-cols-2 gap-2">
            <input
              name="declaration.drawee.name.first"
              placeholder="First"
              value={value.draweeFirstName}
              onChange={(e) => patch({ draweeFirstName: e.target.value })}
              className={gridInput}
            />
            <input
              name="declaration.drawee.name.last"
              placeholder="Last"
              value={value.draweeLastName}
              onChange={(e) => patch({ draweeLastName: e.target.value })}
              className={gridInput}
            />
          </div>
        </div>
        <div className={cell}>
          <CellLabel>Name of authorized signatory</CellLabel>
          <div className="grid grid-cols-2 gap-2">
            <input
              name="declaration.drawer.name.first"
              placeholder="First"
              value={value.drawerFirstName}
              onChange={(e) => patch({ drawerFirstName: e.target.value })}
              className={gridInput}
            />
            <input
              name="declaration.drawer.name.last"
              placeholder="Last"
              value={value.drawerLastName}
              onChange={(e) => patch({ drawerLastName: e.target.value })}
              className={gridInput}
            />
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2`}>
        <div className={`${cell} border-b lg:border-b-0 lg:border-r`}>
          <SignatureBlock
            label="signature"
            signature={value.draweeSignature}
            defaultName={signatureDefaultName(value.draweeFirstName, value.draweeLastName)}
            onOpen={onOpenDraweeSignature}
            onAutofill={onAutofillDraweeSignature}
          />
        </div>
        <div className={cell}>
          <SignatureBlock
            label="Signature"
            signature={value.drawerSignature}
            defaultName={signatureDefaultName(value.drawerFirstName, value.drawerLastName)}
            onOpen={onOpenDrawerSignature}
            onAutofill={onAutofillDrawerSignature}
          />
        </div>
      </div>
    </div>
  )
}

type Props = {
  value: BillOfExchangeState
  onChange: (next: BillOfExchangeState) => void
  onBack?: () => void
}

type SignatureTarget = 'drawee' | 'drawer' | null

export default function BillOfExchangeForm({ value, onChange, onBack }: Props) {
  const [signatureTarget, setSignatureTarget] = useState<SignatureTarget>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const patch = (partial: Partial<BillOfExchangeState>) => onChange({ ...value, ...partial })

  const handleDownloadPdf = async () => {
    setPdfError(null)
    setPdfLoading(true)
    try {
      const ref = value.reference.trim() || 'bill-of-exchange'
      const safe = ref.replace(/[^\w.-]+/g, '_')
      await downloadBoePdfViaHtmlTemplate(value, `${safe}.pdf`)
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Failed to generate PDF.')
    } finally {
      setPdfLoading(false)
    }
  }

  const handleAmountBlur = () => {
    const n = parseBoeAmount(value.amount)
    const formatted = formatBoeAmount(n)
    const updates: Partial<BillOfExchangeState> = { amount: formatted }
    if (!value.amountInWords.trim() && n > 0) {
      updates.amountInWords = amountToWords(n, value.currency)
    }
    patch(updates)
  }

  const openSignature = (target: SignatureTarget) => setSignatureTarget(target)

  const autofillSignature = (target: 'drawee' | 'drawer') => {
    const saved = getSavedBolSignature()
    if (saved?.imageDataUrl) {
      patch(target === 'drawee' ? { draweeSignature: saved } : { drawerSignature: saved })
      return
    }
    setSignatureTarget(target)
  }

  const activeSignature =
    signatureTarget === 'drawee' ? value.draweeSignature : signatureTarget === 'drawer' ? value.drawerSignature : null

  const activeDefaultName =
    signatureTarget === 'drawee'
      ? signatureDefaultName(value.draweeFirstName, value.draweeLastName)
      : signatureDefaultName(value.drawerFirstName, value.drawerLastName)

  const blockProps = {
    value,
    patch,
    onAmountBlur: handleAmountBlur,
    onOpenDraweeSignature: () => openSignature('drawee'),
    onOpenDrawerSignature: () => openSignature('drawer'),
    onAutofillDraweeSignature: () => autofillSignature('drawee'),
    onAutofillDrawerSignature: () => autofillSignature('drawer'),
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#1e3a5f]">Bill of Exchange</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#9D59D1] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
          >
            {pdfLoading ? 'Generating PDF…' : 'Download PDF'}
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-[#c5d0dc] bg-white px-4 py-2 text-sm font-semibold text-[#334155] hover:bg-[#f8fafc]"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {pdfError && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {pdfError}
        </p>
      )}

      <ExchangeDocumentBlock {...blockProps} copyLabel="" />
      <ExchangeDocumentBlock {...blockProps} copyLabel="" />

      <SignatureModal
        open={signatureTarget !== null}
        defaultName={activeDefaultName}
        initial={activeSignature}
        onClose={() => setSignatureTarget(null)}
        onSave={(signature: BolSignature) => {
          if (signatureTarget === 'drawee') patch({ draweeSignature: signature })
          else if (signatureTarget === 'drawer') patch({ drawerSignature: signature })
          setSignatureTarget(null)
        }}
      />
    </div>
  )
}

export { defaultBillOfExchangeState }
