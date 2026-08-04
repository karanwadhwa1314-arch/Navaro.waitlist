import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Course Catalog',
  description: 'Browse Navaro courses and start learning shipping, logistics, and trade skills.',
}

export default function CoursesLayout({ children }: { children: ReactNode }) {
  return children
}
