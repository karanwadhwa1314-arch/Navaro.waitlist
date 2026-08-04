'use client'

import { useCallback, useEffect, useState } from 'react'

import { getAccessToken } from '@/lib/auth/storage'
import {
  formatCargoRfqStatus,
  getCargoRfqStatusBadgeClass,
  normalizeCargoRfqStatus,
} from '@/lib/navfinance/cargo-rfq'
import { getCargoRFQPaymentDetails, initiateCargoRFQPayment } from '@/lib/payments/api'
import { startPayment } from '@/lib/payments/handlePayment'
import type { CargoRFQPaymentDetails } from '@/lib/payments/types'

const displayFont = { fontFamily: '"TASA Orbiter Display", sans-serif' }
const bodyFont = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export default function CargoRfqPaymentSection({
  rfqId,
  rfqStatus,
  onPaymentComplete,
}: {
  rfqId: string
  rfqStatus: string
  onPaymentComplete?: () => void
}) {
  const [payment, setPayment] = useState<CargoRFQPaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalizedStatus = normalizeCargoRfqStatus(rfqStatus)

  const loadPayment = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setError('Please sign in to continue')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const details = await getCargoRFQPaymentDetails(token, rfqId)
      setPayment(details)
    } catch (err) {
      setPayment(null)
      setError(err instanceof Error ? err.message : 'Failed to load payment details')
    } finally {
      setLoading(false)
    }
  }, [rfqId])

  useEffect(() => {
    if (normalizedStatus === 'PAYMENT_DONE') {
      setLoading(false)
      return
    }
    void loadPayment()
  }, [loadPayment, normalizedStatus])

  async function handlePayNow() {
    const token = getAccessToken()
    if (!token) {
      setError('Please sign in to continue')
      return
    }

    setPaying(true)
    setError(null)

    try {
      const init = await initiateCargoRFQPayment(token, rfqId)
      startPayment(init)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment')
      setPaying(false)
    }
  }

  if (normalizedStatus === 'PAYMENT_DONE') {
    return (
      <section className="rounded-[18px] border border-green-200 bg-green-50 p-5 shadow-sm">
        <p className="text-lg font-bold text-green-800" style={displayFont}>
          ✓ Payment completed
        </p>
        <p className="mt-1 text-sm text-green-700" style={bodyFont}>
          Your RFQ payment has been received.
        </p>
      </section>
    )
  }

  const showPayButton =
    payment?.paymentRequired === true ||
    normalizedStatus === 'PAYMENT_PENDING' ||
    normalizedStatus === 'PAYMENT_PROCESSING'

  if (!showPayButton && !loading && !error) return null

  return (
    <section className="rounded-[18px] border border-orange-200 bg-orange-50/50 p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-bold text-[#00433E]" style={displayFont}>
        Quote accepted — Payment required
      </h2>

      {loading && (
        <p className="text-sm text-[#888]" style={bodyFont}>
          Loading payment details...
        </p>
      )}

      {error && (
        <p className="mb-3 rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700" style={bodyFont}>
          {error}
        </p>
      )}

      {!loading && payment && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-2xl font-bold text-[#00433E]" style={displayFont}>
              {formatCurrency(payment.amount, payment.currency)}
            </p>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCargoRfqStatusBadgeClass(payment.rfqStatus)}`} style={bodyFont}>
              {formatCargoRfqStatus(payment.rfqStatus)}
            </span>
          </div>

          {normalizedStatus === 'PAYMENT_PROCESSING' && (
            <p className="text-sm text-orange-700" style={bodyFont}>
              Payment is processing. You can retry if the checkout was closed.
            </p>
          )}

          {showPayButton && (
            <button
              type="button"
              onClick={() => void handlePayNow()}
              disabled={paying}
              className="rounded-[10px] bg-[#00433E] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              style={bodyFont}
            >
              {paying ? 'Starting payment…' : 'Pay now'}
            </button>
          )}
        </div>
      )}

      {!loading && !payment && !error && onPaymentComplete && (
        <button
          type="button"
          onClick={() => void loadPayment()}
          className="text-sm font-semibold text-[#00433E] underline"
          style={bodyFont}
        >
          Refresh payment status
        </button>
      )}
    </section>
  )
}
