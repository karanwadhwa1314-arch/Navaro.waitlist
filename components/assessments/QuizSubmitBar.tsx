'use client'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function QuizSubmitBar({
  onSubmit,
  disabled,
  loading,
}: {
  onSubmit: () => void
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-[#D1CEC9] bg-[#FDFBF7]/95 px-4 py-4 backdrop-blur md:-mx-0 md:rounded-2xl md:border md:px-6">
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || loading}
        className="w-full rounded-full bg-[#C486F1] px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        style={deck}
      >
        {loading ? 'Submitting…' : 'Submit quiz'}
      </button>
    </div>
  )
}
