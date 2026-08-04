'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  BOL_SAVED_SIGNATURE_KEY,
  BOL_SIGNATURE_FONTS,
  emptySignature,
  type BolSignature,
  type BolSignatureFontId,
  type BolSignatureMode,
} from '@/components/tools/export-docs/bill-of-lading/billOfLadingTypes'

const FONT_LINK =
  'https://fonts.googleapis.com/css2?family=Cedarville+Cursive&family=Homemade+Apple&family=Italianno&family=Marck+Script&family=Satisfy&family=Yellowtail&display=swap'

const modalInput =
  'w-full rounded border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#1e293b] outline-none placeholder:text-[#94a3b8] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/25'

type Props = {
  open: boolean
  defaultName?: string
  initial?: BolSignature | null
  onClose: () => void
  onSave: (signature: BolSignature, saveAsDefault: boolean) => void
}

function fontFamily(id: BolSignatureFontId) {
  return BOL_SIGNATURE_FONTS.find((f) => f.id === id)?.family ?? "'Cedarville Cursive', cursive"
}

async function renderTypedToDataUrl(text: string, fontId: BolSignatureFontId): Promise<string> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready
  }
  const canvas = document.createElement('canvas')
  canvas.width = 450
  canvas.height = 150
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.font = `50px ${fontFamily(fontId)}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  return canvas.toDataURL('image/png')
}

function loadSavedSignature(): BolSignature | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(BOL_SAVED_SIGNATURE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as BolSignature
  } catch {
    return null
  }
}

function persistSavedSignature(sig: BolSignature) {
  if (typeof window === 'undefined') return
  localStorage.setItem(BOL_SAVED_SIGNATURE_KEY, JSON.stringify(sig))
}

export function getSavedBolSignature(): BolSignature | null {
  return loadSavedSignature()
}

export default function SignatureModal({
  open,
  defaultName = '',
  initial,
  onClose,
  onSave,
}: Props) {
  const [tab, setTab] = useState<BolSignatureMode>('type')
  const [typedText, setTypedText] = useState(defaultName)
  const [fontId, setFontId] = useState<BolSignatureFontId>('cedarville')
  const [saveAsDefault, setSaveAsDefault] = useState(true)
  const [uploadPreview, setUploadPreview] = useState('')
  const [drawDirty, setDrawDirty] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!open) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONT_LINK
    link.id = 'bol-signature-fonts'
    if (!document.getElementById('bol-signature-fonts')) {
      document.head.appendChild(link)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const base = initial ?? emptySignature()
    setTab(base.mode)
    setTypedText(base.typedText || defaultName)
    setFontId(base.fontId)
    setUploadPreview(base.mode === 'upload' ? base.imageDataUrl : '')
    setSaveAsDefault(true)
    setDrawDirty(false)

    if (base.mode === 'draw' && base.imageDataUrl && canvasRef.current) {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setDrawDirty(true)
      }
      img.src = base.imageDataUrl
    }
  }, [open, initial, defaultName])

  useEffect(() => {
    if (!open || tab !== 'draw') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (!drawDirty && !initial?.imageDataUrl) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [open, tab, drawDirty, initial?.imageDataUrl])

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    drawingRef.current = true
    lastPointRef.current = getCanvasPoint(e)
    setDrawDirty(true)
  }

  const moveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const last = lastPointRef.current
    if (!canvas || !ctx || !last) return
    const point = getCanvasPoint(e)
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    lastPointRef.current = point
  }

  const endDraw = () => {
    drawingRef.current = false
    lastPointRef.current = null
  }

  const clearDraw = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setDrawDirty(false)
  }

  const canSave = useCallback(() => {
    if (tab === 'type') return typedText.trim().length > 0
    if (tab === 'upload') return uploadPreview.length > 0
    if (tab === 'draw') return drawDirty
    return false
  }, [tab, typedText, uploadPreview, drawDirty])

  const buildSignature = async (): Promise<BolSignature | null> => {
    if (tab === 'type') {
      const text = typedText.trim()
      if (!text) return null
      return {
        mode: 'type',
        typedText: text,
        fontId,
        imageDataUrl: await renderTypedToDataUrl(text, fontId),
      }
    }
    if (tab === 'upload') {
      if (!uploadPreview) return null
      return {
        mode: 'upload',
        typedText: typedText.trim(),
        fontId,
        imageDataUrl: uploadPreview,
      }
    }
    const canvas = canvasRef.current
    if (!canvas || !drawDirty) return null
    return {
      mode: 'draw',
      typedText: typedText.trim(),
      fontId,
      imageDataUrl: canvas.toDataURL('image/png'),
    }
  }

  const handleSave = async () => {
    const sig = await buildSignature()
    if (!sig) return
    if (saveAsDefault) persistSavedSignature(sig)
    onSave(sig, saveAsDefault)
    onClose()
  }

  const onUploadFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : ''
      setUploadPreview(url)
    }
    reader.readAsDataURL(file)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center bg-[#1e293b]/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bol-signature-modal-title"
        className="flex max-h-[min(90vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-lg bg-white shadow-[0_24px_48px_rgba(15,23,42,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 border-b border-[#e2e8f0] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="bol-signature-modal-title" className="text-base font-semibold text-[#1e293b]">
              Add your signature
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-[#64748b] hover:bg-[#f1f5f9]"
              aria-label="Close"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M2.974 2 2 2.974 7.026 8 2 13.026l.974.974L8 8.974 13.026 14l.974-.974L8.974 8 14 2.974 13.026 2 8 7.026 2.974 2z" />
              </svg>
            </button>
          </div>
          <hr className="mt-4 border-[#e2e8f0]" />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex border-b border-[#e2e8f0]">
            {(['draw', 'type', 'upload'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`border-b-2 px-4 py-2 text-sm font-semibold capitalize transition ${
                  tab === t
                    ? 'border-[#2563eb] text-[#2563eb]'
                    : 'border-transparent text-[#64748b] hover:text-[#334155]'
                }`}
              >
                {t === 'draw' ? 'Draw' : t === 'type' ? 'Type' : 'Upload'}
              </button>
            ))}
          </div>

          {tab === 'type' && (
            <div>
              <input
                className={`${modalInput} mb-3`}
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Your name"
              />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {BOL_SIGNATURE_FONTS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFontId(f.id)}
                    className={`h-[72px] w-[120px] shrink-0 rounded border bg-white transition ${
                      fontId === f.id
                        ? 'border-[#2563eb] ring-2 ring-[#2563eb]/25'
                        : 'border-[#e2e8f0] hover:border-[#cbd5e1]'
                    }`}
                  >
                    <span
                      className="block truncate px-2 text-2xl text-[#1e293b]"
                      style={{ fontFamily: f.family }}
                    >
                      {typedText.trim() || 'Signature'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'draw' && (
            <div>
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={clearDraw}
                  className="text-xs font-semibold text-[#64748b] hover:text-[#334155]"
                >
                  Clear
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={450}
                height={150}
                className="w-full cursor-crosshair rounded border border-[#e2e8f0] bg-white touch-none"
                onMouseDown={startDraw}
                onMouseMove={moveDraw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={moveDraw}
                onTouchEnd={endDraw}
              />
              <p className="mt-2 text-xs text-[#64748b]">Draw your signature with mouse or touch.</p>
            </div>
          )}

          {tab === 'upload' && (
            <div>
              <label className="mb-3 flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-10 transition hover:border-[#2563eb] hover:bg-[#eff6ff]/40">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => onUploadFile(e.target.files?.[0])}
                />
                <span className="text-sm font-semibold text-[#2563eb]">Choose image to upload</span>
                <span className="mt-1 text-xs text-[#64748b]">PNG, JPG, or SVG</span>
              </label>
              {uploadPreview && (
                <img
                  src={uploadPreview}
                  alt="Uploaded signature preview"
                  className="mx-auto max-h-24 max-w-full object-contain"
                />
              )}
            </div>
          )}

          <p className="mt-4 text-xs leading-relaxed text-[#64748b]">
            By signing this document with an electronic signature, I agree that such signature will be as
            valid as handwritten signatures and considered originals to the extent allowed by applicable
            law.
          </p>
        </div>

        <footer className="shrink-0 border-t border-[#e2e8f0] bg-[#fafafa] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-[#cbd5e1] text-[#2563eb] focus:ring-[#3b82f6]/30"
              />
              <span className="text-sm font-medium text-[#334155]">Save as my signature</span>
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canSave()}
                onClick={handleSave}
                className="rounded bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Save &amp; Sign
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
