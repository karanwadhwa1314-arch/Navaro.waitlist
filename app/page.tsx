'use client'

/**
 * Serves the static marketing site at / while keeping the app shell (chat widget, etc.).
 * Landing assets live at /landing/index.html unchanged.
 */
export default function HomePage() {
  return (
    <iframe
      src="/landing/index.html"
      title="Navaro"
      className="fixed inset-0 h-[100dvh] w-full border-0"
    />
  )
}
