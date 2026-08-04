import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Shipping Fundamentals',
  description:
    'Master shipping fundamentals with structured modules, hands-on tools, and expert instructors — from global networks to documentation and logistics planning.',
}

export default function InsideCourseLayout({ children }: { children: ReactNode }) {
  return children
}
