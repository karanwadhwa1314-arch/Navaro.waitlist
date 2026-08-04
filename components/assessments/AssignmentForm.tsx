'use client'

import { useState } from 'react'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

export default function AssignmentForm({
  onSubmit,
  loading,
  disabled,
  initialValue = '',
}: {
  onSubmit: (contentText: string) => void
  loading?: boolean
  disabled?: boolean
  initialValue?: string
}) {
  const [content, setContent] = useState(initialValue)
  const valid = content.trim().length >= 10

  return (
    <div className="rounded-2xl border border-[#D1CEC9] bg-white p-6">
      <label className="mb-2 block text-sm font-semibold text-[#054742]" style={deck} htmlFor="assignment-content">
        Your answer
      </label>
      <textarea
        id="assignment-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={disabled || loading}
        rows={10}
        className="min-h-[200px] w-full resize-y rounded-xl border border-[#D1CEC9] px-4 py-3 text-sm text-[#2D4F4A] outline-none focus:border-[#054742] disabled:bg-[#F5F5F5]"
        style={deck}
        placeholder="Write your assignment answer here (minimum 10 characters)…"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className={`text-xs ${valid ? 'text-[#087A48]' : 'text-[#054742]/50'}`} style={deck}>
          {content.trim().length} characters {valid ? '' : '(min 10)'}
        </p>
        <button
          type="button"
          onClick={() => onSubmit(content.trim())}
          disabled={!valid || disabled || loading}
          className="rounded-full bg-[#054742] px-6 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          style={deck}
        >
          {loading ? 'Submitting…' : 'Submit assignment'}
        </button>
      </div>
    </div>
  )
}
