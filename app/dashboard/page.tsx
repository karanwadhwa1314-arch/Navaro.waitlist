import type { Metadata } from 'next'
import { Suspense } from 'react'
import AuthUrlSessionHandler from '@/components/auth/AuthUrlSessionHandler'
import ToolsHomeDashboard from '@/components/tools/ToolsHomeDashboard'
import './dashboard-home.css'

export const metadata: Metadata = {
  title: 'Dashboard — Navaro',
  description: 'Navaro tools hub: calculators, document checks, and resources.',
}

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthUrlSessionHandler />
      </Suspense>
      <Suspense fallback={null}>
        <ToolsHomeDashboard />
      </Suspense>
    </>
  )
}
