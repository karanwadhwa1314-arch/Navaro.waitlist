'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'

import BolContactModal from '@/components/tools/export-docs/bill-of-lading/BolContactModal'
import SignatureModal, { getSavedBolSignature } from '@/components/tools/export-docs/SignatureModal'
import {
  contactDisplayName,
  contactPreviewLines,
  defaultBillOfLadingState,
  emptyContact,
  formatBolTotal,
  newContainerLine,
  newGoodsLine,
  parseBolNum,
  type BillOfLadingState,
  signatureDefaultName,
  type BolContact,
  type BolContainerLine,
  type BolGoodsLine,
  type BolSignature,
} from '@/components/tools/export-docs/bill-of-lading/billOfLadingTypes'

const INCOTERMS = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DPU', 'DAP', 'DDP'] as const
const FREIGHT_OPTIONS = ['Prepaid', 'Collect'] as const
const CONTAINER_TYPES = ["20' GP", "40' GP", "40' HC", "45' HC", 'Reefer', 'Open Top', 'Flat Rack', 'Tank'] as const

const BOL_HTML_URL = '/templates/bill-of-landing.html?embed=1'

type BolHtmlWindow = Window & {
  renderBillOfLadingDocument?: (data: BillOfLadingState) => void
  downloadBillOfLadingPdf?: () => Promise<Blob>
  bolPdfTemplateReady?: Promise<void>
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

function bolTemplateUrl() {
  return new URL(BOL_HTML_URL, window.location.origin).href
}

async function waitForBolPdfIframe(iframe: HTMLIFrameElement, timeoutMs = 30000): Promise<BolHtmlWindow> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const win = iframe.contentWindow as BolHtmlWindow | null
    if (
      win &&
      typeof win.renderBillOfLadingDocument === 'function' &&
      typeof win.downloadBillOfLadingPdf === 'function'
    ) {
      try {
        await win.bolPdfTemplateReady
        return win
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to initialize PDF template.')
      }
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50))
  }

  throw new Error(
    'Bill of Lading HTML PDF helpers not available. The template may have failed to load — refresh the page and try again.',
  )
}

async function downloadBolPdfViaHtmlTemplate(data: BillOfLadingState, filename: string) {
  const templateUrl = bolTemplateUrl()
  const response = await fetch(templateUrl, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(
      `Bill of Lading template could not be loaded (${response.status}). Expected ${templateUrl}`,
    )
  }
  const html = await response.text()
  if (!html.includes('renderBillOfLadingDocument')) {
    throw new Error('Bill of Lading template is invalid or incomplete.')
  }

  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', 'Bill of Lading PDF')
  iframe.setAttribute('aria-hidden', 'true')
  // Must stay visible for html2canvas; opacity:0 produces a blank PDF.
  iframe.style.cssText =
    'position:fixed;left:-12000px;top:0;width:794px;min-height:1200px;border:0;opacity:1;visibility:visible;pointer-events:none;z-index:0;'

  document.body.appendChild(iframe)
  iframe.src = templateUrl

  try {
    const win = await waitForBolPdfIframe(iframe)
    win.renderBillOfLadingDocument!(data)
    await new Promise((resolve) => window.setTimeout(resolve, 150))
    const blob = await win.downloadBillOfLadingPdf!()
    const pdfBlob =
      blob instanceof Blob
        ? blob
        : blob != null && typeof (blob as Blob).size === 'number'
          ? new Blob([blob as BlobPart], { type: 'application/pdf' })
          : null
    if (!pdfBlob || pdfBlob.size < 500) {
      throw new Error('Generated PDF was empty. Try again or refresh the page.')
    }
    triggerPdfDownload(pdfBlob, filename)
  } finally {
    iframe.remove()
  }
}

const SAMPLE_PORTS = [
  'Dubai',
  'Jebel Ali',
  'Shanghai',
  'Singapore',
  'Hong Kong',
  'Rotterdam',
  'Hamburg',
  'Los Angeles',
  'New York',
  'Vancouver',
  'Montreal',
  'Toronto',
  'Busan',
  'Sydney',
  'Felixstowe',
  'Antwerp',
]

const MOCK_CONTACTS: BolContact[] = [
  {
    ...emptyContact(),
    name: 'Aj',
    companyName: 'Aj',
    email: 'Aj@gmail.com',
    line1: '123 Harbor Way',
    city: 'Dubai',
    country: 'United Arab Emirates',
  },
  {
    ...emptyContact(),
    name: 'Navaro Logistics',
    companyName: 'Navaro Logistics',
    email: 'ops@navaro.example',
    line1: '45 Export Lane',
    city: 'Toronto',
    region: 'ON',
    country: 'Canada',
  },
]

const border = 'border-[#c5d0dc]'
const cell = `p-3 ${border}`
const gridInput =
  'w-full rounded bg-[#eef1f4] px-2.5 py-2 text-sm text-[#1e3a5f] outline-none placeholder:text-[#94a3b8] focus:bg-[#e8ecf1] focus:ring-1 focus:ring-[#3b82f6]/30'
const gridTextarea = `${gridInput} min-h-[7rem] resize-y`

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

function ContactCell({
  label,
  contact,
  onChange,
  className = '',
}: {
  label: string
  contact: BolContact
  onChange: (next: BolContact) => void
  className?: string
}) {
  const [query, setQuery] = useState(() => contactDisplayName(contact))
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDraft, setModalDraft] = useState<BolContact>(contact)
  const [modalTitle, setModalTitle] = useState('Create Contact')

  useEffect(() => {
    setQuery(contactDisplayName(contact))
  }, [contact])

  const filtered = MOCK_CONTACTS.filter((c) => {
    const q = query.toLowerCase()
    return (
      contactDisplayName(c).toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    )
  })

  const applyContact = (next: BolContact) => {
    onChange(next)
    setQuery(contactDisplayName(next))
    setDropdownOpen(false)
  }

  const openCreateModal = () => {
    setModalDraft(emptyContact())
    setModalTitle('Create Contact')
    setModalOpen(true)
    setDropdownOpen(false)
  }

  const openEditModal = () => {
    setModalDraft({ ...contact })
    setModalTitle(contactDisplayName(contact) ? 'Edit Contact' : 'Create Contact')
    setModalOpen(true)
  }

  const previewLines = contactPreviewLines(contact, { omitCompanyWhenLogo: true })

  return (
    <>
      <div className={`${cell} flex min-h-[11rem] flex-col ${className}`}>
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
              placeholder="Find or add a contact..."
              autoComplete="off"
              className={gridInput}
            />
            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-44 overflow-y-auto rounded border border-[#c5d0dc] bg-white py-1 shadow-lg">
                {filtered.map((c) => (
                  <button
                    key={`${c.email}-${contactDisplayName(c)}`}
                    type="button"
                    className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-[#f1f5f9]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyContact(c)}
                  >
                    <span className="font-medium text-[#1e3a5f]">{contactDisplayName(c)}</span>
                    {c.email ? <span className="text-xs text-[#64748b]">{c.email}</span> : null}
                  </button>
                ))}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 border-t border-[#e2e8f0] px-3 py-2 text-left text-xs font-medium text-[#2563eb] hover:bg-[#f1f5f9]"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={openCreateModal}
                >
                  + Add new contact
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            title="Edit contact details"
            className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center text-[#2563eb] transition hover:opacity-80"
            onClick={openEditModal}
          >
            <IconEdit />
          </button>
        </div>
        <div className="mt-3 flex min-h-[5.5rem] flex-1 items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-sm leading-relaxed text-[#64748b]">
            {previewLines.length > 0 ? (
              previewLines.map((line) => <p key={line}>{line}</p>)
            ) : (
              <p className="italic text-[#94a3b8]">—</p>
            )}
          </div>
          {contact.logoDataUrl ? (
            <img
              src={contact.logoDataUrl}
              alt=""
              className="max-h-10 max-w-[140px] shrink-0 object-contain object-right"
            />
          ) : null}
        </div>
      </div>

      <BolContactModal
        open={modalOpen}
        title={modalTitle}
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

function SimpleCell({
  label,
  children,
  className = '',
}: {
  label: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`${cell} ${className}`}>
      <CellLabel>{label}</CellLabel>
      {children}
    </div>
  )
}

function PortInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return SAMPLE_PORTS.slice(0, 10)
    return SAMPLE_PORTS.filter((p) => p.toLowerCase().includes(q)).slice(0, 15)
  }, [value])

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
        className={gridInput}
      />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-40 overflow-y-auto rounded border border-[#c5d0dc] bg-white py-1 shadow-lg">
          {filtered.map((port) => (
            <button
              key={port}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-[#f1f5f9]"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(port)
                setOpen(false)
              }}
            >
              {port}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function IncotermsInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const filtered = INCOTERMS.filter((t) => t.toLowerCase().includes(value.toLowerCase()))

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        placeholder="Term"
        autoComplete="off"
        className={gridInput}
      />
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded border border-[#c5d0dc] bg-white py-1 shadow-lg">
          {(filtered.length ? filtered : INCOTERMS).map((term) => (
            <button
              key={term}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-[#f1f5f9]"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(term)
                setOpen(false)
              }}
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function FreightInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        className={gridInput}
      />
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded border border-[#c5d0dc] bg-white py-1 shadow-lg">
          {FREIGHT_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-[#f1f5f9]"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function LineButton({
  children,
  onClick,
  primary,
}: {
  children: ReactNode
  onClick?: () => void
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold transition ${
        primary
          ? 'border-[#bfdbfe] bg-white text-[#2563eb] hover:bg-[#eff6ff]'
          : 'border-[#e2e8f0] bg-white text-[#2563eb] hover:bg-[#f8fafc]'
      }`}
    >
      <span className="text-sm leading-none">+</span>
      {children}
    </button>
  )
}

type Props = {
  value: BillOfLadingState
  onChange: (next: BillOfLadingState) => void
  onBack?: () => void
}

export default function BillOfLadingForm({ value, onChange, onBack }: Props) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [signatureModalOpen, setSignatureModalOpen] = useState(false)

  const patch = (partial: Partial<BillOfLadingState>) => onChange({ ...value, ...partial })

  const defaultSignatureName = signatureDefaultName(
    value.declarationFirstName,
    value.declarationLastName,
  )

  const handleAutofillSignature = () => {
    const saved = getSavedBolSignature()
    if (saved?.imageDataUrl) {
      patch({ signature: saved })
      return
    }
    setSignatureModalOpen(true)
  }

  const handleDownloadPdf = async () => {
    setPdfError(null)
    setPdfLoading(true)
    try {
      const ref = value.bolNumber.trim() || value.shippersReference.trim() || 'bill-of-lading'
      const safe = ref.replace(/[^\w.-]+/g, '_')
      await downloadBolPdfViaHtmlTemplate(value, `${safe}.pdf`)
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Failed to generate PDF.')
    } finally {
      setPdfLoading(false)
    }
  }

  const totals = useMemo(() => {
    let net = 0
    let gross = 0
    let cbm = 0
    for (const line of value.goodsLines) {
      net += parseBolNum(line.netWeight)
      gross += parseBolNum(line.grossWeight)
      cbm += parseBolNum(line.measurements)
    }
    return { net, gross, cbm }
  }, [value.goodsLines])

  const updateGoods = (id: string, partial: Partial<BolGoodsLine>) => {
    patch({
      goodsLines: value.goodsLines.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    })
  }

  const updateContainer = (id: string, partial: Partial<BolContainerLine>) => {
    patch({
      containerLines: value.containerLines.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#1e3a5f]">Bill Of Lading</h2>
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

      {/* Main grid form — matches reference document layout */}
      <div className={`overflow-hidden rounded-sm border ${border} bg-white`}>
        {/* Row 1: Shipper | References */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <ContactCell
            label="Shipper"
            contact={value.shipper}
            onChange={(shipper) => patch({ shipper })}
            className="border-b lg:border-b-0 lg:border-r"
          />
          <div className={`${cell} flex flex-col border-b lg:border-b-0`}>
            <div className="mb-3 flex items-start justify-end gap-2 text-right">
              <div>
                <div className="text-[11px] font-semibold text-[#334155]">Pages</div>
                <input
                  type="text"
                  value={value.pages}
                  onChange={(e) => patch({ pages: e.target.value })}
                  className="mt-1 w-20 rounded bg-[#eef1f4] px-2 py-1 text-right text-sm text-[#1e3a5f] outline-none focus:ring-1 focus:ring-[#3b82f6]/30"
                />
              </div>
            </div>
            <div className="grid flex-1 grid-cols-2 auto-rows-fr border border-[#c5d0dc]">
              <div className="border-b border-r border-[#c5d0dc] p-2.5">
                <CellLabel>Shipper&apos;s Reference</CellLabel>
                <input
                  name="shippersReference"
                  value={value.shippersReference}
                  onChange={(e) => patch({ shippersReference: e.target.value })}
                  className={gridInput}
                />
              </div>
              <div className="border-b border-[#c5d0dc] p-2.5">
                <CellLabel>Bill of Lading Number</CellLabel>
                <input
                  name="bolNumber"
                  value={value.bolNumber}
                  onChange={(e) => patch({ bolNumber: e.target.value })}
                  className={gridInput}
                />
              </div>
              <div className="col-span-2 border-b border-[#c5d0dc] p-2.5">
                <CellLabel>Carrier&apos;s Reference</CellLabel>
                <input
                  name="carriersReference"
                  value={value.carriersReference}
                  onChange={(e) => patch({ carriersReference: e.target.value })}
                  className={gridInput}
                />
              </div>
              <div className="col-span-2 p-2.5">
                <CellLabel>Unique Consignment Reference</CellLabel>
                <input
                  name="consignmentReference"
                  value={value.consignmentReference}
                  onChange={(e) => patch({ consignmentReference: e.target.value })}
                  className={gridInput}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Consignee | Carrier */}
        <div className={`grid grid-cols-1 border-t ${border} lg:grid-cols-2`}>
          <ContactCell
            label="Consignee"
            contact={value.consignee}
            onChange={(consignee) => patch({ consignee })}
            className="border-b lg:border-b-0 lg:border-r"
          />
          <ContactCell
            label="Carrier Name"
            contact={value.carrier}
            onChange={(carrier) => patch({ carrier })}
          />
        </div>

        {/* Row 3: Notify parties */}
        <div className={`grid grid-cols-1 border-t ${border} lg:grid-cols-2`}>
          <ContactCell
            label="Notify Party (If not Consignee)"
            contact={value.notifyParty}
            onChange={(notifyParty) => patch({ notifyParty })}
            className="min-h-[9rem] border-b lg:min-h-[11rem] lg:border-b-0 lg:border-r"
          />
          <ContactCell
            label="Additional Notify Party"
            contact={value.additionalNotifyParty}
            onChange={(additionalNotifyParty) => patch({ additionalNotifyParty })}
            className="min-h-[9rem] lg:min-h-[11rem]"
          />
        </div>

        {/* Row 4: Transport + Additional Information */}
        <div className={`grid border-t ${border} lg:grid-cols-[1fr_minmax(12rem,38%)]`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-[1fr_1fr_1.15fr] lg:grid-rows-2">
            <SimpleCell label="Pre-Carriage By" className="border-b border-r sm:col-span-2 lg:col-span-1 lg:row-start-1">
              <input
                name="precarriageBy"
                value={value.precarriageBy}
                onChange={(e) => patch({ precarriageBy: e.target.value })}
                className={gridInput}
              />
            </SimpleCell>
            <SimpleCell label="Place of Receipt" className="border-b sm:col-span-2 lg:col-span-1 lg:border-r lg:row-start-1">
              <input
                name="placeOfReceipt"
                value={value.placeOfReceipt}
                onChange={(e) => patch({ placeOfReceipt: e.target.value })}
                className={gridInput}
              />
            </SimpleCell>
            <SimpleCell label="Vessel / Aircraft" className="border-b border-r lg:row-start-2">
              <input
                name="vessel"
                value={value.vessel}
                onChange={(e) => patch({ vessel: e.target.value })}
                className={gridInput}
              />
            </SimpleCell>
            <SimpleCell label="Voyage No" className="border-b border-r lg:row-start-2">
              <input
                name="voyage"
                value={value.voyage}
                onChange={(e) => patch({ voyage: e.target.value })}
                className={gridInput}
              />
            </SimpleCell>
            <SimpleCell
              label="Port of Loading"
              className="border-b sm:col-span-2 lg:col-span-1 lg:border-r-0 lg:row-start-2"
            >
              <PortInput value={value.portOfLoading} onChange={(portOfLoading) => patch({ portOfLoading })} />
            </SimpleCell>
          </div>
          <SimpleCell label="Additional Information" className="min-h-[8.5rem] border-t lg:border-l lg:border-t-0">
            <textarea
              value={value.additionalInformation}
              onChange={(e) => patch({ additionalInformation: e.target.value })}
              placeholder="Type something here..."
              className={gridTextarea}
            />
          </SimpleCell>
        </div>

        {/* Row 5: Ports */}
        <div className={`grid grid-cols-1 border-t ${border} sm:grid-cols-3`}>
          <SimpleCell label="Port of Discharge" className="border-b sm:border-b-0 sm:border-r">
            <PortInput value={value.portOfDischarge} onChange={(portOfDischarge) => patch({ portOfDischarge })} />
          </SimpleCell>
          <SimpleCell label="Place of Delivery" className="border-b sm:border-b-0 sm:border-r">
            <input
              name="placeOfDelivery"
              value={value.placeOfDelivery}
              onChange={(e) => patch({ placeOfDelivery: e.target.value })}
              className={gridInput}
            />
          </SimpleCell>
          <SimpleCell label="Final Destination">
            <input
              name="finalDestination"
              value={value.finalDestination}
              onChange={(e) => patch({ finalDestination: e.target.value })}
              className={gridInput}
            />
          </SimpleCell>
        </div>

        {/* Goods table */}
        <div className={`border-t ${border}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#c5d0dc]">
                  <th className={`${cell} w-[18%] text-left font-semibold`}>
                    <CellLabel>Marks &amp; Numbers</CellLabel>
                  </th>
                  <th className={`${cell} w-[16%] text-left font-semibold`}>
                    <CellLabel>Kind &amp; No of Packages</CellLabel>
                  </th>
                  <th className={`${cell} w-[26%] text-left font-semibold`}>
                    <CellLabel>Description of Goods</CellLabel>
                  </th>
                  <th className={`${cell} w-[13%] text-left font-semibold`}>
                    <CellLabel>Net Weight (Kg)</CellLabel>
                  </th>
                  <th className={`${cell} w-[13%] text-left font-semibold`}>
                    <CellLabel>Gross Weight (Kg)</CellLabel>
                  </th>
                  <th className={`${cell} w-[14%] text-left font-semibold`}>
                    <CellLabel>Measurements (m³)</CellLabel>
                  </th>
                </tr>
              </thead>
              <tbody>
                {value.goodsLines.map((line) => (
                  <tr key={line.id} className="border-b border-[#c5d0dc]">
                    <td className="p-2 align-top">
                      <input
                        value={line.marks}
                        onChange={(e) => updateGoods(line.id, { marks: e.target.value })}
                        className={gridInput}
                      />
                    </td>
                    <td className="p-2 align-top">
                      <input
                        value={line.packages}
                        onChange={(e) => updateGoods(line.id, { packages: e.target.value })}
                        className={gridInput}
                      />
                    </td>
                    <td className="p-2 align-top">
                      <input
                        value={line.description}
                        onChange={(e) => updateGoods(line.id, { description: e.target.value })}
                        className={gridInput}
                      />
                    </td>
                    <td className="p-2 align-top">
                      <input
                        value={line.netWeight}
                        onChange={(e) => updateGoods(line.id, { netWeight: e.target.value })}
                        className={gridInput}
                      />
                    </td>
                    <td className="p-2 align-top">
                      <input
                        value={line.grossWeight}
                        onChange={(e) => updateGoods(line.id, { grossWeight: e.target.value })}
                        className={gridInput}
                      />
                    </td>
                    <td className="p-2 align-top">
                      <input
                        value={line.measurements}
                        onChange={(e) => updateGoods(line.id, { measurements: e.target.value })}
                        className={gridInput}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 border-b border-[#c5d0dc] px-3 py-2.5">
            <LineButton primary onClick={() => patch({ goodsLines: [...value.goodsLines, newGoodsLine()] })}>
              Add another line
            </LineButton>
            <LineButton>Import lines</LineButton>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,minmax(5rem,1fr))] border-b border-[#c5d0dc] text-sm">
            <div className="flex items-center px-4 py-2.5 font-semibold text-[#334155]">Consignment Total</div>
            <div className="border-l border-[#c5d0dc] p-2">
              <input readOnly value={formatBolTotal(totals.net)} className={`${gridInput} bg-[#f1f5f9]`} />
            </div>
            <div className="border-l border-[#c5d0dc] p-2">
              <input readOnly value={formatBolTotal(totals.gross)} className={`${gridInput} bg-[#f1f5f9]`} />
            </div>
            <div className="border-l border-[#c5d0dc] p-2">
              <input readOnly value={formatBolTotal(totals.cbm)} className={`${gridInput} bg-[#f1f5f9]`} />
            </div>
          </div>
        </div>

        {/* Container table */}
        <div className={`border-t ${border}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#c5d0dc]">
                  <th className={`${cell} w-[28%] text-left`}>
                    <CellLabel>Container No(s)</CellLabel>
                  </th>
                  <th className={`${cell} w-[22%] text-left`}>
                    <CellLabel>Seal No(s)</CellLabel>
                  </th>
                  <th className={`${cell} w-[50%] text-left`}>
                    <CellLabel>Container Type</CellLabel>
                  </th>
                </tr>
              </thead>
              <tbody>
                {value.containerLines.map((line) => (
                  <tr key={line.id} className="border-b border-[#c5d0dc]">
                    <td className="p-2">
                      <input
                        value={line.containerNo}
                        onChange={(e) => updateContainer(line.id, { containerNo: e.target.value })}
                        className={gridInput}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={line.sealNo}
                        onChange={(e) => updateContainer(line.id, { sealNo: e.target.value })}
                        className={gridInput}
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={line.containerType}
                        onChange={(e) => updateContainer(line.id, { containerType: e.target.value })}
                        className={gridInput}
                      >
                        <option value="">Select type</option>
                        {CONTAINER_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 border-b border-[#c5d0dc] px-3 py-2.5">
            <LineButton
              primary
              onClick={() => patch({ containerLines: [...value.containerLines, newContainerLine()] })}
            >
              Add another line
            </LineButton>
            <LineButton>Import lines</LineButton>
          </div>
        </div>

        {/* Containers in words */}
        <SimpleCell label="Total No of Containers or other packages or units (in words)" className={`border-t ${border}`}>
          <input
            name="numberOfContainers"
            value={value.numberOfContainers}
            onChange={(e) => patch({ numberOfContainers: e.target.value })}
            className={gridInput}
          />
        </SimpleCell>

        {/* Footer 5 columns */}
        <div className={`grid grid-cols-2 border-t ${border} sm:grid-cols-3 lg:grid-cols-5`}>
          <SimpleCell label="No. of original Bills of Lading" className="border-b sm:border-b lg:border-b-0 lg:border-r">
            <input
              name="numberOfOriginalBol"
              value={value.numberOfOriginalBol}
              onChange={(e) => patch({ numberOfOriginalBol: e.target.value })}
              className={gridInput}
            />
          </SimpleCell>
          <SimpleCell label="Incoterms® 2020" className="border-b sm:border-b lg:border-b-0 lg:border-r">
            <IncotermsInput value={value.incoterms} onChange={(incoterms) => patch({ incoterms })} />
          </SimpleCell>
          <SimpleCell label="Payable at" className="border-b sm:border-b-0 sm:border-r lg:border-b-0">
            <input
              name="payableAt"
              value={value.payableAt}
              onChange={(e) => patch({ payableAt: e.target.value })}
              className={gridInput}
            />
          </SimpleCell>
          <SimpleCell label="Freight Charges" className="border-b sm:border-r lg:border-b-0">
            <FreightInput value={value.freightCharges} onChange={(freightCharges) => patch({ freightCharges })} />
          </SimpleCell>
          <SimpleCell label="Shipped on Board Date" className="col-span-2 sm:col-span-1">
            <input
              type="date"
              value={value.shippedOnBoardDate}
              onChange={(e) => patch({ shippedOnBoardDate: e.target.value })}
              className={gridInput}
            />
          </SimpleCell>
        </div>

        {/* Terms | Declaration */}
        <div className={`grid border-t ${border} lg:grid-cols-[1.5fr_1fr]`}>
          <div className={`${cell} min-h-[10rem] border-b lg:border-b-0 lg:border-r`}>
            <CellLabel>Terms and Conditions</CellLabel>
            <textarea
              value={value.termsAndConditions}
              onChange={(e) => patch({ termsAndConditions: e.target.value })}
              className={`${gridTextarea} min-h-[8rem]`}
            />
          </div>
          <div className="flex flex-col">
            <SimpleCell label="Place and Date of Issue" className="border-b">
              <div className="grid grid-cols-[1fr_minmax(7rem,0.45fr)] gap-2">
                <input
                  name="declaration.place"
                  placeholder="Place"
                  value={value.declarationPlace}
                  onChange={(e) => patch({ declarationPlace: e.target.value })}
                  className={gridInput}
                />
                <input
                  type="date"
                  value={value.declarationDate}
                  onChange={(e) => patch({ declarationDate: e.target.value })}
                  className={gridInput}
                />
              </div>
            </SimpleCell>
            <SimpleCell label="Signatory Company" className="border-b">
              <input
                name="declaration.companyName"
                value={value.declarationCompanyName}
                onChange={(e) => patch({ declarationCompanyName: e.target.value })}
                className={gridInput}
              />
            </SimpleCell>
            <SimpleCell label="Name of Authorized Signatory" className="border-b">
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="declaration.name.first"
                  placeholder="First Name"
                  value={value.declarationFirstName}
                  onChange={(e) => patch({ declarationFirstName: e.target.value })}
                  className={gridInput}
                />
                <input
                  name="declaration.name.last"
                  placeholder="Last Name"
                  value={value.declarationLastName}
                  onChange={(e) => patch({ declarationLastName: e.target.value })}
                  className={gridInput}
                />
              </div>
            </SimpleCell>
            <div className={cell}>
              <CellLabel>Signature</CellLabel>
              {value.signature?.imageDataUrl ? (
                <button
                  type="button"
                  onClick={() => setSignatureModalOpen(true)}
                  className="flex w-full flex-col items-center rounded border border-[#e2e8f0] bg-white px-3 py-3 transition hover:border-[#2563eb]/40 hover:bg-[#f8fafc]"
                >
                  <img
                    src={value.signature.imageDataUrl}
                    alt="Your signature"
                    className="max-h-16 max-w-full object-contain"
                  />
                  <span className="mt-2 text-xs font-semibold text-[#2563eb]">Change signature</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSignatureModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded bg-[#eff6ff] px-4 py-8 text-sm font-semibold text-[#2563eb] transition hover:bg-[#dbeafe]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <path d="M11.389.004a1.618 1.618 0 00-1.187.639l-2.057 2.74H3.883L0 16l12.617-3.883V7.831l2.602-2.17a1.644 1.644 0 00.175-2.453l-2.74-2.74a1.618 1.618 0 00-1.265-.464zm.114 1.616l2.74 2.739-.015.012-2.375 1.978-2.23-2.229 1.88-2.5zm-6.42 3.39h3.13l2.777 2.777v3.13L4.12 13.03l2.384-2.385c.137.038.278.057.42.058a1.627 1.627 0 10-1.572-1.206L2.969 11.88l2.115-6.87z" />
                  </svg>
                  Click here to sign
                </button>
              )}
              
            </div>
          </div>
        </div>
      </div>

      <SignatureModal
        open={signatureModalOpen}
        defaultName={defaultSignatureName}
        initial={value.signature}
        onClose={() => setSignatureModalOpen(false)}
        onSave={(signature: BolSignature) => patch({ signature })}
      />
    </div>
  )
}

export { defaultBillOfLadingState }
