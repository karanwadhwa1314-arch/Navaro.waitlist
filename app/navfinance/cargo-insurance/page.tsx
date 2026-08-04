import type { Metadata } from 'next'
import { Suspense } from 'react'

import CargoInsuranceContent from '@/components/navfinance/CargoInsuranceContent'

export const metadata: Metadata = {
  title: 'Cargo Insurance',
  description:
    'Protect your cargo in four simple steps. Compare quotes from top-rated providers and get covered in minutes.',
}

export default function CargoInsurancePage() {
  return (
    <Suspense fallback={null}>
      <CargoInsuranceContent variant="standalone" />
    </Suspense>
  )
}
