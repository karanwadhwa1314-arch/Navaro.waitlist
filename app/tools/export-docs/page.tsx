import type { Metadata } from 'next'
import ExportDocsFlow from '@/components/tools/export-docs/ExportDocsFlow'

export const metadata: Metadata = {
  title: 'Export Docs',
  description: 'Create export document sets and manage references.',
}

export default function ExportDocsPage() {
  return (
    <main className="min-h-screen bg-navaro-cream px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <ExportDocsFlow showBackLink />
      </div>
    </main>
  )
}
