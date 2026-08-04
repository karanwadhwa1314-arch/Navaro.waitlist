export type PayableType = 'COURSE' | 'CARGO_RFQ'

export interface CoursePaymentDetails {
  courseId: string
  courseTitle: string
  courseSlug: string
  amount: number
  currency: string
  paymentRequired: boolean
  isEnrolled: boolean
}

export interface CargoRFQPaymentDetails {
  cargoRfqId: string
  rfqStatus: string
  quoteId?: string
  quoteStatus?: string
  amount: number
  currency: string
  paymentRequired: boolean
}

export interface InitiatePaymentResponse {
  transactionId: string
  orderId: string
  payableType: PayableType
  courseSlug?: string
  cargoRfqId?: string
  paymentUrl: string
  encRequest?: string
  accessCode?: string
  mockMode?: boolean
  mockCompleteUrl?: string
}
