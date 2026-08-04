'use client'

import { Suspense, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

function ShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const adminPage = pathname.startsWith('/admin')

  if (adminPage) {
    return <>{children}</>
  }

  return <>{children}</>
}

export default function ShellProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-[#FDFBF0]">{children}</div>}>
      <ShellInner>{children}</ShellInner>
    </Suspense>
  )
}
