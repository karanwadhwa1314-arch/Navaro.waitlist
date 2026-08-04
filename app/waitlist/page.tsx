import type { Metadata } from 'next'
import WaitlistLanding from '@/components/waitlist/WaitlistLanding'

export const metadata: Metadata = {
  title: 'Join the Waitlist',
  description:
    'An integrated import-export ecosystem that takes you from complexity to clarity. Join the Navaro waitlist.',
}

export default function WaitlistPage() {
  return <WaitlistLanding />
}
