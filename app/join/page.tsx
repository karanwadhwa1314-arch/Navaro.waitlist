import type { Metadata } from 'next'
import WaitlistForm from '@/components/waitlist/WaitlistForm'

export const metadata: Metadata = {
  title: 'Join the Waitlist',
  description:
    'An integrated import-export ecosystem that takes you from complexity to clarity. Join the Navaro waitlist.',
}

export default function JoinPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#62CDBE] px-4 py-12">
      <WaitlistForm />
    </main>
  )
}
