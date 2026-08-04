'use client'

import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'

import {
  buildCargoInsuranceDocumentTitle,
  CARGO_INVOICE_ACCEPTED_TYPES,
  CARGO_INVOICE_DESCRIPTION_MAX_LENGTH,
  CARGO_INVOICE_MAX_FILE_SIZE_MB,
  updateCargoInsuranceDocument,
  validateCargoInsuranceDocument,
  validateCargoInsuranceDocumentDescription,
  validateCargoInsuranceDocumentTitle,
} from '@/lib/navfinance/cargo-insurance-document'
import {
  createCargoRfq,
  type CargoRfqDocumentType,
  uploadCargoRfqDocument,
} from '@/lib/navfinance/cargo-rfq'
import {
  bodyFont,
  CargoInsuranceFileRow,
  displayFont,
  formatCargoInsuranceFileSize,
} from '@/lib/navfinance/cargo-insurance-ui'

type MarineRfqDetails = {
  policyType: 'marine-open' | 'specific-marine'
  pospDetails: string
  insuredName: string
  communicationAddress: string
  gst: string
  businessDescription: string
  businessType: string
  riskStartDate: string
  isRollover: string
  transitType: string
  totalProjectedTurnover: string
  initialSumInsured: string
  perSendingLimit: string
  perLocationLimit: string
  packaging: string
  voyageFrom: string
  voyageTo: string
  conveyance: string
  safetyMeasures: string
  lossHistory: string
  newBusiness: string
  selfInsuredHistory: string
  previousLossDetails: string
  pastStats: string
}

const initialMarineRfqDetails: MarineRfqDetails = {
  policyType: 'marine-open',
  pospDetails: '',
  insuredName: '',
  communicationAddress: '',
  gst: '',
  businessDescription: '',
  businessType: '',
  riskStartDate: '',
  isRollover: 'No',
  transitType: '',
  totalProjectedTurnover: '',
  initialSumInsured: '',
  perSendingLimit: '',
  perLocationLimit: '',
  packaging: '',
  voyageFrom: '',
  voyageTo: '',
  conveyance: '',
  safetyMeasures: '',
  lossHistory: '',
  newBusiness: '',
  selfInsuredHistory: '',
  previousLossDetails: '',
  pastStats: '',
}

const inputClassName =
  'w-full rounded-[9px] border border-[#ddd] bg-white px-3 py-2.5 text-[13px] text-[#1a1a1a] outline-none transition focus:border-[#00433E] disabled:cursor-not-allowed disabled:opacity-60'

function MarineRfqField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  disabled?: boolean
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#666]" style={bodyFont}>
        {label} {required && <span className="text-[#B91C1C]">*</span>}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClassName}
        style={bodyFont}
      />
    </label>
  )
}

function MarineRfqSelect({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  required?: boolean
  disabled?: boolean
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#666]" style={bodyFont}>
        {label} {required && <span className="text-[#B91C1C]">*</span>}
      </span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={inputClassName}
        style={bodyFont}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function MarineRfqTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#666]" style={bodyFont}>
        {label} {required && <span className="text-[#B91C1C]">*</span>}
      </span>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder={placeholder}
        disabled={disabled}
        className={`${inputClassName} resize-none`}
        style={bodyFont}
      />
    </label>
  )
}

function validateMarineRfqDetails(details: MarineRfqDetails) {
  const requiredFields: Array<[keyof MarineRfqDetails, string]> = [
    ['insuredName', 'Please enter insured name.'],
    ['communicationAddress', 'Please enter communication address.'],
    ['gst', 'Please enter GST number.'],
    ['businessDescription', 'Please enter business description.'],
    ['businessType', 'Please enter business type.'],
    ['riskStartDate', 'Please select risk start date.'],
    ['transitType', 'Please select transit type.'],
    ['initialSumInsured', 'Please enter initial sum insured.'],
    ['packaging', 'Please enter packaging details.'],
    ['voyageFrom', 'Please enter voyage from location.'],
    ['voyageTo', 'Please enter voyage to location.'],
    ['conveyance', 'Please select conveyance.'],
    ['safetyMeasures', 'Please enter safety measures.'],
    ['lossHistory', 'Please enter loss history for the past 3 years.'],
    ['newBusiness', 'Please confirm whether this is a new business.'],
    ['selfInsuredHistory', 'Please confirm past self-insurance/insurance history.'],
  ]

  for (const [field, message] of requiredFields) {
    if (!details[field].trim()) return message
  }

  if (details.policyType === 'marine-open') {
    const marineOpenRequiredFields: Array<[keyof MarineRfqDetails, string]> = [
      ['totalProjectedTurnover', 'Please enter total projected turnover for marine open policy.'],
      ['perSendingLimit', 'Please enter per sending limit for marine open policy.'],
      ['perLocationLimit', 'Please enter per location limit for marine open policy.'],
    ]

    for (const [field, message] of marineOpenRequiredFields) {
      if (!details[field].trim()) return message
    }
  }

  if (details.lossHistory === 'Yes' && !details.previousLossDetails.trim()) {
    return 'Please share details of previous transit losses.'
  }

  if (details.newBusiness === 'No' && !details.pastStats.trim()) {
    return 'Please provide turnover, premium, claims statistics, or confirm no past claims.'
  }

  return null
}

export default function CargoInsuranceDocumentUpload({
  closeHref,
  updateDocumentId,
  onContinue,
}: {
  closeHref?: string
  updateDocumentId?: string
  onContinue: (uploadedDocumentId?: string) => void
}) {
  const isCorrectionUpload = Boolean(updateDocumentId?.trim())
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [rfqDetails, setRfqDetails] = useState<MarineRfqDetails>(initialMarineRfqDetails)
  const isSpecificMarinePolicy = rfqDetails.policyType === 'specific-marine'

  const updateRfqDetail = (field: keyof MarineRfqDetails, value: string) => {
    setRfqDetails((current) => ({ ...current, [field]: value }))
  }

  const validateAndSelect = useCallback((selected: File) => {
    setError(null)
    setSuccess(null)

    const validationError = validateCargoInsuranceDocument(selected)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(selected)
  }, [])

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    const dropped = event.dataTransfer.files[0]
    if (dropped) validateAndSelect(dropped)
  }

  const handleContinue = async () => {
    if (uploading) return

    if (!isCorrectionUpload) {
      const rfqError = validateMarineRfqDetails(rfqDetails)
      if (rfqError) {
        setError(rfqError)
        return
      }
    }

    if (!isCorrectionUpload) {
      if (!file && isSpecificMarinePolicy) {
        setError('Please upload the mandatory invoice copy for specific marine policy.')
        return
      }

      if (!file && rfqDetails.isRollover === 'Yes') {
        setError('Please upload the expiring policy copy for rollover cases.')
        return
      }

      const descriptionError = validateCargoInsuranceDocumentDescription(description)
      if (descriptionError) {
        setError(descriptionError)
        return
      }

      setError(null)
      setSuccess(null)
      setUploading(true)

      try {
        const rfqResult = await createCargoRfq({
          ...rfqDetails,
          additionalNotes: description.trim() || undefined,
        })

        if (!rfqResult.success) {
          setError(rfqResult.error)
          return
        }

        const uploadedDocument = Boolean(file)
        if (file) {
          const documentType: CargoRfqDocumentType =
            rfqDetails.policyType === 'specific-marine'
              ? 'INVOICE_COPY'
              : rfqDetails.isRollover === 'Yes'
                ? 'PREVIOUS_POLICY'
                : 'SUPPORTING_DOCUMENT'

          const uploadResult = await uploadCargoRfqDocument(rfqResult.data.id, {
            documentType,
            file,
          })

          if (!uploadResult.success) {
            setError(uploadResult.error)
            return
          }
        }

        if (uploadedDocument) {
          setSuccess('Document uploaded successfully. Your RFQ is now under review.')
          await new Promise((resolve) => window.setTimeout(resolve, 900))
        }

        onContinue(rfqResult.data.id)
      } catch {
        setError('Something went wrong while submitting your RFQ. Please try again.')
      } finally {
        setUploading(false)
      }

      return
    }

    if (!file) {
      setError('Please upload the corrected document.')
      return
    }

    const title = buildCargoInsuranceDocumentTitle(file)
    const titleError = validateCargoInsuranceDocumentTitle(title)
    if (titleError) {
      setError(titleError)
      return
    }

    const descriptionError = validateCargoInsuranceDocumentDescription(description)
    if (descriptionError) {
      setError(descriptionError)
      return
    }

    setError(null)
    setSuccess(null)
    setUploading(true)

    try {
      const payload = {
        file,
        title,
        description: description.trim() || undefined,
      }

      const result = await updateCargoInsuranceDocument(updateDocumentId!.trim(), payload)

      if (!result.success) {
        setError(result.error)
        return
      }

      onContinue(result.data.id)
    } catch {
      setError('Something went wrong while uploading. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative mx-auto max-w-[760px]">
      {closeHref && (
        <Link
          href={closeHref}
          className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-[#8E8E8E] no-underline transition hover:bg-[#F0EEE8] hover:text-[#00433E]"
          aria-label="Back to overview"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      )}

      <div className="mb-6 pr-10">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8E8E8E] md:text-sm">
          {isCorrectionUpload ? 'Correction required' : 'Marine Insurance RFQ'}
        </p>
        <h1 className="mt-2 text-[19px] font-bold text-[#00433E] md:text-xl" style={displayFont}>
          {isCorrectionUpload ? 'Re-upload corrected documents' : 'Marine Policy Request Details'}
        </h1>
        <p className="mt-1 text-[13px] text-[#888]" style={bodyFont}>
          {isCorrectionUpload
            ? 'Upload a corrected invoice to address the admin feedback on your application.'
            : 'Share insured, transit, limits, and document details so the insurer can review and generate a quote.'}
        </p>
      </div>

      {!isCorrectionUpload && (
        <div className="mb-5 space-y-5">
          <div className="rounded-[14px] border border-[#e8e8e8] bg-white p-4 md:p-5">
            <p className="mb-4 text-sm font-semibold text-[#1a1a1a]" style={bodyFont}>
              Policy & Insured Details
            </p>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => updateRfqDetail('policyType', 'marine-open')}
                disabled={uploading}
                className={`rounded-[10px] border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  rfqDetails.policyType === 'marine-open'
                    ? 'border-[#00433E] bg-[#E8F0EE] text-[#00433E]'
                    : 'border-[#e2e2e2] bg-white text-[#666] hover:border-[#00433E]'
                }`}
                style={bodyFont}
              >
                <span className="block text-sm font-semibold">Marine Open Policy</span>
                <span className="mt-1 block text-xs opacity-75">For repeated shipments over a policy period.</span>
              </button>
              <button
                type="button"
                onClick={() => updateRfqDetail('policyType', 'specific-marine')}
                disabled={uploading}
                className={`rounded-[10px] border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  rfqDetails.policyType === 'specific-marine'
                    ? 'border-[#00433E] bg-[#E8F0EE] text-[#00433E]'
                    : 'border-[#e2e2e2] bg-white text-[#666] hover:border-[#00433E]'
                }`}
                style={bodyFont}
              >
                <span className="block text-sm font-semibold">Specific Marine Policy</span>
                <span className="mt-1 block text-xs opacity-75">For one declared transit. Invoice copy is mandatory.</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <MarineRfqField
                id="cargo-posp-details"
                label="Partner POSP Code / Name / Email"
                value={rfqDetails.pospDetails}
                onChange={(value) => updateRfqDetail('pospDetails', value)}
                placeholder="POSP code, name and email"
                disabled={uploading}
              />
              <MarineRfqField
                id="cargo-insured-name"
                label="Insured Name"
                value={rfqDetails.insuredName}
                onChange={(value) => updateRfqDetail('insuredName', value)}
                placeholder="Company or insured name"
                required
                disabled={uploading}
              />
              <div className="md:col-span-2">
                <MarineRfqTextarea
                  id="cargo-communication-address"
                  label="Communication Address"
                  value={rfqDetails.communicationAddress}
                  onChange={(value) => updateRfqDetail('communicationAddress', value)}
                  placeholder="Registered / communication address"
                  required
                  disabled={uploading}
                />
              </div>
              <MarineRfqField
                id="cargo-gst"
                label="GST"
                value={rfqDetails.gst}
                onChange={(value) => updateRfqDetail('gst', value)}
                placeholder="GST number"
                required
                disabled={uploading}
              />
              <MarineRfqField
                id="cargo-business-type"
                label="Business Type"
                value={rfqDetails.businessType}
                onChange={(value) => updateRfqDetail('businessType', value)}
                placeholder="Manufacturer, trader, exporter..."
                required
                disabled={uploading}
              />
              <div className="md:col-span-2">
                <MarineRfqTextarea
                  id="cargo-business-description"
                  label="Business Description"
                  value={rfqDetails.businessDescription}
                  onChange={(value) => updateRfqDetail('businessDescription', value)}
                  placeholder="Briefly describe the goods and business activity"
                  required
                  disabled={uploading}
                />
              </div>
              <MarineRfqField
                id="cargo-risk-start-date"
                label="Risk Start Date"
                type="date"
                value={rfqDetails.riskStartDate}
                onChange={(value) => updateRfqDetail('riskStartDate', value)}
                required
                disabled={uploading}
              />
              <MarineRfqSelect
                id="cargo-rollover-policy"
                label="Policy Copy in Case of Rollover"
                value={rfqDetails.isRollover}
                onChange={(value) => updateRfqDetail('isRollover', value)}
                options={['Yes', 'No']}
                disabled={uploading}
              />
            </div>
          </div>

          <div className="rounded-[14px] border border-[#e8e8e8] bg-white p-4 md:p-5">
            <p className="mb-4 text-sm font-semibold text-[#1a1a1a]" style={bodyFont}>
              Proposal & Voyage Details
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <MarineRfqSelect
                id="cargo-transit-type"
                label="Transit Type"
                value={rfqDetails.transitType}
                onChange={(value) => updateRfqDetail('transitType', value)}
                options={['Inland', 'Export', 'Import']}
                required
                disabled={uploading}
              />
              <MarineRfqField
                id="cargo-total-turnover"
                label="Total Projected Turnover"
                value={rfqDetails.totalProjectedTurnover}
                onChange={(value) => updateRfqDetail('totalProjectedTurnover', value)}
                placeholder="Example: 1,00,00,000"
                required={rfqDetails.policyType === 'marine-open'}
                disabled={uploading}
              />
              <MarineRfqField
                id="cargo-initial-sum-insured"
                label="Initial Sum Insured"
                value={rfqDetails.initialSumInsured}
                onChange={(value) => updateRfqDetail('initialSumInsured', value)}
                placeholder="Declared value"
                required
                disabled={uploading}
              />
              <MarineRfqField
                id="cargo-per-sending-limit"
                label="Per Sending Limit"
                value={rfqDetails.perSendingLimit}
                onChange={(value) => updateRfqDetail('perSendingLimit', value)}
                placeholder="Maximum per dispatch"
                required={rfqDetails.policyType === 'marine-open'}
                disabled={uploading}
              />
              <MarineRfqField
                id="cargo-per-location-limit"
                label="Per Location Limit"
                value={rfqDetails.perLocationLimit}
                onChange={(value) => updateRfqDetail('perLocationLimit', value)}
                placeholder="Maximum at one location"
                required={rfqDetails.policyType === 'marine-open'}
                disabled={uploading}
              />
              <MarineRfqField
                id="cargo-packaging"
                label="Packaging"
                value={rfqDetails.packaging}
                onChange={(value) => updateRfqDetail('packaging', value)}
                placeholder="Cartons, pallets, containers..."
                required
                disabled={uploading}
              />
              <MarineRfqField
                id="cargo-voyage-from"
                label="Voyage From"
                value={rfqDetails.voyageFrom}
                onChange={(value) => updateRfqDetail('voyageFrom', value)}
                placeholder="Origin"
                required
                disabled={uploading}
              />
              <MarineRfqField
                id="cargo-voyage-to"
                label="Voyage To"
                value={rfqDetails.voyageTo}
                onChange={(value) => updateRfqDetail('voyageTo', value)}
                placeholder="Destination"
                required
                disabled={uploading}
              />
              <MarineRfqSelect
                id="cargo-conveyance"
                label="Conveyance"
                value={rfqDetails.conveyance}
                onChange={(value) => updateRfqDetail('conveyance', value)}
                options={['Rail', 'Road', 'Sea', 'Air', 'Courier', 'Post']}
                required
                disabled={uploading}
              />
              <MarineRfqField
                id="cargo-safety-measures"
                label="Safety Measures"
                value={rfqDetails.safetyMeasures}
                onChange={(value) => updateRfqDetail('safetyMeasures', value)}
                placeholder="Sealing, tracking, escorted cargo..."
                required
                disabled={uploading}
              />
            </div>
          </div>

          <div className="rounded-[14px] border border-[#e8e8e8] bg-white p-4 md:p-5">
            <p className="mb-1 text-sm font-semibold text-[#1a1a1a]" style={bodyFont}>
              Marine Questions for Fresh Cases
            </p>
            <p className="mb-4 text-xs text-[#888]" style={bodyFont}>
              These help the insurer understand past insurance history, turnover, premium, and claims.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <MarineRfqSelect
                id="cargo-new-business"
                label="Are insured commencing a new business?"
                value={rfqDetails.newBusiness}
                onChange={(value) => updateRfqDetail('newBusiness', value)}
                options={['Yes', 'No']}
                required
                disabled={uploading}
              />
              <MarineRfqSelect
                id="cargo-loss-history"
                label="Transit Losses in Past 3 Years?"
                value={rfqDetails.lossHistory}
                onChange={(value) => updateRfqDetail('lossHistory', value)}
                options={['No', 'Yes']}
                required
                disabled={uploading}
              />
              <div className="md:col-span-2">
                <MarineRfqTextarea
                  id="cargo-self-insured-history"
                  label="If not new, were they self insured so far?"
                  value={rfqDetails.selfInsuredHistory}
                  onChange={(value) => updateRfqDetail('selfInsuredHistory', value)}
                  placeholder="Mention business age, previous insurance/self-insurance and any transit losses"
                  required
                  disabled={uploading}
                />
              </div>
              {rfqDetails.lossHistory === 'Yes' && (
                <div className="md:col-span-2">
                  <MarineRfqTextarea
                    id="cargo-previous-loss-details"
                    label="Details of Previous Losses"
                    value={rfqDetails.previousLossDetails}
                    onChange={(value) => updateRfqDetail('previousLossDetails', value)}
                    placeholder="Share claim dates, cause, amount, and current status"
                    required
                    disabled={uploading}
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <MarineRfqTextarea
                  id="cargo-past-stats"
                  label="Past 3/5 Years Turnover, Premium, Claims Statistics"
                  value={rfqDetails.pastStats}
                  onChange={(value) => updateRfqDetail('pastStats', value)}
                  placeholder="Provide stats or confirm there have been no past claims / no past insurance history"
                  required={rfqDetails.newBusiness === 'No'}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[14px] border border-[#e8e8e8] bg-white p-4 md:p-5">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1a1a1a]" style={bodyFont}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#00433E" strokeWidth="2" aria-hidden>
            <path d="M7 18a4 4 0 01-4-4V7a2 2 0 012-2h3m4 0h3a2 2 0 012 2v7a4 4 0 01-4 4H7z" />
            <path d="M12 12v9M9 18h6" />
          </svg>
          Invoice & Supporting Documents{' '}
          {(isSpecificMarinePolicy || rfqDetails.isRollover === 'Yes') && <span className="text-[#B91C1C]">*</span>}
        </p>

        {!isCorrectionUpload && (
          <div className="mb-4 rounded-[10px] bg-[#F7F5EF] p-3 text-xs leading-relaxed text-[#666]" style={bodyFont}>
            {isSpecificMarinePolicy
              ? 'Invoice copy is mandatory for Specific Marine Policy.'
              : 'Document upload is optional for Marine Open Policy unless this is a rollover case.'}{' '}
            {rfqDetails.isRollover === 'Yes'
              ? 'Please include the expiring policy copy for rollover.'
              : 'If claims/statistics documents are required, combine them into one PDF before uploading.'}
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="cargo-document-description"
            className="mb-1.5 block text-xs font-semibold text-[#666]"
            style={bodyFont}
          >
            {isCorrectionUpload ? 'Description' : 'Additional Notes'}{' '}
            <span className="font-normal text-[#aaa]">(optional)</span>
          </label>
          <textarea
            id="cargo-document-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={CARGO_INVOICE_DESCRIPTION_MAX_LENGTH}
            disabled={uploading}
            rows={3}
            placeholder={
              isCorrectionUpload
                ? 'Briefly describe your corrected shipment document...'
                : 'Any extra instructions or remarks for the insurance team...'
            }
            className="w-full resize-none rounded-[9px] border border-[#ddd] bg-white px-3 py-2.5 text-[13px] text-[#1a1a1a] outline-none transition focus:border-[#00433E] disabled:cursor-not-allowed disabled:opacity-60"
            style={bodyFont}
          />
        </div>

        {!file ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                inputRef.current?.click()
              }
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed px-5 py-7 text-center transition ${
              dragOver
                ? 'border-[#00433E] bg-[#E8F0EE]'
                : 'border-[#d0d0d8] bg-[#fafafa] hover:border-[#00433E] hover:bg-[#E8F0EE]/50'
            }`}
          >
            <svg
              className={`mx-auto mb-2 block ${dragOver ? 'text-[#00433E]' : 'text-[#bbb]'}`}
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path d="M7 18a4 4 0 01-4-4V7a2 2 0 012-2h3m4 0h3a2 2 0 012 2v7a4 4 0 01-4 4H7z" />
              <path d="M12 12v9M9 18h6" />
            </svg>
            <p
              className={`text-sm font-semibold ${dragOver ? 'text-[#00433E]' : 'text-[#555]'}`}
              style={bodyFont}
            >
              Drag & drop or click to upload
            </p>
            <p className="mt-1 text-xs text-[#aaa]" style={bodyFont}>
              PDF, JPG, PNG, WebP — up to {CARGO_INVOICE_MAX_FILE_SIZE_MB} MB
            </p>
          </div>
        ) : (
          <div>
            <p
              className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#aaa]"
              style={bodyFont}
            >
              Selected files
            </p>
            <CargoInsuranceFileRow
              fileName={file.name}
              fileSize={formatCargoInsuranceFileSize(file.size)}
              badge={{ label: 'Ready', className: 'bg-[#EAF3DE] text-[#3B6D11]' }}
              onRemove={() => {
                setFile(null)
                setDescription('')
              }}
            />
          </div>
        )}

        {error && (
          <p className="mt-3 text-center text-xs text-red-600 md:text-sm" style={bodyFont}>
            {error}
          </p>
        )}

        {success && (
          <p className="mt-3 text-center text-xs text-emerald-700 md:text-sm" style={bodyFont}>
            {success}
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={CARGO_INVOICE_ACCEPTED_TYPES}
          className="hidden"
          onChange={(event) => {
            const selected = event.target.files?.[0]
            if (selected) validateAndSelect(selected)
            event.target.value = ''
          }}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => void handleContinue()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#00433E] px-4 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
          style={bodyFont}
        >
          {uploading
            ? 'Uploading your document...'
            : isCorrectionUpload
              ? `Re-submit document${file ? ' (1 file)' : ''}`
              : `Submit RFQ${file ? ' (1 file)' : ''}`}
        </button>
      </div>
    </div>
  )
}
