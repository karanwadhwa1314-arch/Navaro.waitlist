import type { InitiatePaymentResponse } from '@/lib/payments/types'

/**
 * Handles mock (local) and real CCAvenue (production) payment redirect.
 * Call after initiateCoursePayment or initiateCargoRFQPayment.
 */
export function startPayment(init: InitiatePaymentResponse) {
  if (init.mockMode) {
    window.location.href = init.paymentUrl
    return
  }

  if (!init.encRequest || !init.accessCode) {
    throw new Error('Payment gateway response incomplete')
  }

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = init.paymentUrl

  const enc = document.createElement('input')
  enc.type = 'hidden'
  enc.name = 'encRequest'
  enc.value = init.encRequest
  form.appendChild(enc)

  const access = document.createElement('input')
  access.type = 'hidden'
  access.name = 'access_code'
  access.value = init.accessCode
  form.appendChild(access)

  document.body.appendChild(form)
  form.submit()
}
