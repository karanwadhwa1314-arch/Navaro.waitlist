import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import WaitlistAdminLogin from '@/components/admin/WaitlistAdminLogin'
import WaitlistAdminTable from '@/components/admin/WaitlistAdminTable'
import { ADMIN_COOKIE, getAdminPassword, isAdminRequest } from '@/lib/waitlist/admin-auth'
import { readEntries } from '@/lib/waitlist/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Waitlist Admin',
  robots: { index: false, follow: false },
}

export default async function WaitlistAdminPage() {
  const configured = getAdminPassword() !== null
  const cookieStore = await cookies()
  const authenticated = isAdminRequest(cookieStore.get(ADMIN_COOKIE)?.value)

  if (!authenticated) {
    return <WaitlistAdminLogin configured={configured} />
  }

  const entries = await readEntries()
  // Newest first.
  entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return <WaitlistAdminTable entries={entries} />
}
