'use client'

import { useState, useRef, useEffect } from 'react'
import Script from 'next/script'

interface PDFFields {
  shipper: string
  consignee: string
  notify: string
  booking: string
  vessel: string
  pol: string
  pod: string
  container: string
  weight: string
  hs: string
}

interface ComparisonResult {
  field: string
  pdf1Value: string
  pdf2Value: string
  status: 'MATCH' | 'MISMATCH' | 'MISSING'
}

// Add DOC parsing function using FileReader (best-effort)
const parseDocFile = async (file: File): Promise<string> => {
  // Attempt to read binary and decode text. This is a best-effort fallback;
  // accurate .doc parsing in-browser is limited without a server-side converter.
  try {
    const arrayBuffer = await file.arrayBuffer()

    // If file is actually a ZIP (docx) return early so caller can try DOCX path
    const header = new Uint8Array(arrayBuffer.slice(0, 4))
    if (header[0] === 0x50 && header[1] === 0x4B) {
      throw new Error('File appears to be a DOCX/ZIP archive. Use DOCX parser or convert the file.')
    }

    // Try UTF-8 first, then fall back to windows-1252 if available
    let text = ''
    try {
      text = new TextDecoder('utf-8').decode(arrayBuffer)
      // If decoding produced lots of replacement chars, try windows-1252
      if (/�/.test(text) && typeof (TextDecoder as any) !== 'undefined') {
        try {
          text = new TextDecoder('windows-1252').decode(arrayBuffer)
        } catch (e) {
          // ignore and keep utf-8 result
        }
      }
    } catch (e) {
      // As a last resort, do a naive binary-to-ascii extraction
      const bytes = new Uint8Array(arrayBuffer)
      text = Array.from(bytes)
        .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : ' '))
        .join('')
    }

    // Basic cleanup - collapse whitespace
    text = text.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
    return text
  } catch (error: any) {
    console.warn('Failed to parse .doc file in-browser:', error)
    throw new Error(error?.message || 'Failed to parse DOC file. Consider converting to DOCX or PDF for better results.')
  }
}

// DOCX parsing using Mammoth (dynamically imported to avoid bundling on server)
const parseDocxFile = async (file: File): Promise<string> => {
  try {
    const mod = await import('mammoth')
    // mammoth may be exported as default or named; handle both
    const mammothLib = (mod && (mod.default || mod)) as any
    if (!mammothLib || typeof mammothLib.extractRawText !== 'function') {
      throw new Error('Mammoth library not available in this environment.')
    }

    const arrayBuffer = await file.arrayBuffer()
    const result = await mammothLib.extractRawText({ arrayBuffer })
    const raw = (result && result.value) ? result.value : ''

    // Guard: if output looks like raw XML/zip markers, treat as failure
    if (!raw || /word\/|<w:|<w\d:|rels|PK\!/i.test(raw)) {
      throw new Error('Mammoth produced unexpected output; file may be corrupted or not a valid DOCX.')
    }

    return raw
  } catch (error: any) {
    console.error('Error parsing DOCX with mammoth:', error)
    throw new Error(error?.message || 'Failed to parse DOCX file. Please ensure it\'s a valid Word document.')
  }
}

export default function DocumentFieldComparison() {
  const [doc1File, setDoc1File] = useState<File | null>(null)
  const [doc2File, setDoc2File] = useState<File | null>(null)
  const [results, setResults] = useState<ComparisonResult[]>([])
  const [loading, setLoading] = useState(false)
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false)
  const fileInput1Ref = useRef<HTMLInputElement>(null)
  const fileInput2Ref = useRef<HTMLInputElement>(null)

  // Check if PDF.js is already loaded or becomes available
  useEffect(() => {
    const checkPDFjs = () => {
      if ((window as any).pdfjsLib) {
        setPdfjsLoaded(true)
      }
    }
    
    // Check immediately
    checkPDFjs()
    
    // Check periodically in case it loads after component mount
    const interval = setInterval(checkPDFjs, 500)
    
    return () => clearInterval(interval)
  }, [])



  const convertDocToDocx = async (file: File): Promise<File> => {
    console.log(`Converting .doc file to .docx: ${file.name}`)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/convert-doc', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        // Try to parse response JSON for message; otherwise fall back
        let errorMsg = 'Conversion failed'
        try {
          const errorData = await response.json()
          errorMsg = errorData.error || errorMsg
        } catch (e) {
          // ignore
        }
        throw new Error(errorMsg)
      }
      
      const convertedBuffer = await response.arrayBuffer()
      const docxFileName = file.name.replace(/\.doc$/i, '.docx')
      const convertedFile = new File([convertedBuffer], docxFileName, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      
      console.log(`Successfully converted to: ${docxFileName}`)
      return convertedFile
    } catch (error: any) {
      console.error('Doc conversion error:', error)
      // If conversion fails, bubble the error so caller can decide to fallback to best-effort parsing
      throw new Error(`Failed to convert .doc file: ${error?.message || error}`)
    }
  }


  // Unified text extraction function for all formats
  const extractText = async (file: File): Promise<string> => {
     let fileToProcess = file
    const fileExtension1 = file.name.split('.').pop()?.toLowerCase()

     // Convert .doc files to .docx first
    if (fileExtension1 === 'doc') {
      console.log('Detected .doc file, converting to .docx...')
      fileToProcess = await convertDocToDocx(file)
      console.log('Conversion complete, proceeding with text extraction')
    }
      const fileExtension = fileToProcess.name.split('.').pop()?.toLowerCase()
    
    switch (fileExtension) {
      case 'pdf': {
        // PDF extraction using pdf.js
        if (!(window as any).pdfjsLib) {
          throw new Error('PDF.js library not loaded')
        }

        try {
          const buffer = await fileToProcess.arrayBuffer()
          const uint8 = new Uint8Array(buffer)
          const loadingTask = (window as any).pdfjsLib.getDocument({ data: uint8 })
          const pdf = await loadingTask.promise
          let text = ''

          // Build spatial lines from text items so we preserve table/layout structure.
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            const items = content.items as any[]

            // Group items by rounded Y coordinate (with tolerance)
            const linesMap = new Map<number, Array<{ x: number; str: string }>>()
            for (const item of items) {
              const t = item.transform || item.transformMatrix || [1,0,0,1,0,0]
              const x = t[4] ?? 0
              const y = Math.round((t[5] ?? 0))

              // find existing key within tolerance (±4)
              let key = undefined as number | undefined
              for (const k of Array.from(linesMap.keys())) {
                if (Math.abs(k - y) <= 4) {
                  key = k
                  break
                }
              }
              if (key === undefined) key = y

              if (!linesMap.has(key)) linesMap.set(key, [])
              linesMap.get(key)!.push({ x, str: item.str || '' })
            }

            // Sort lines top-to-bottom (higher y first), then items left-to-right
            const sortedYs = Array.from(linesMap.keys()).sort((a, b) => b - a)
            for (const y of sortedYs) {
              const row = linesMap.get(y)!
              row.sort((a, b) => a.x - b.x)
              const lineText = row.map(r => r.str).join(' ').replace(/\s+/g, ' ').trim()
              if (lineText) text += lineText + '\n'
            }
            // add page separator
            text += '\n'
          }

          // Normalize each line (collapse internal whitespace) but preserve line breaks
          const normalized = text
            .split('\n')
            .map(l => l.replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .join('\n')
          return normalized.toUpperCase()
        } catch (err) {
          console.error('PDF extraction error:', err)
          throw new Error('Failed to extract text from PDF. Make sure the file is not encrypted and is a valid PDF.')
        }
      }

      case 'docx': {
        // DOCX extraction using mammoth
        try {
          const text = await parseDocxFile(fileToProcess)
          const normalized = text
            .split('\n')
            .map(l => l.replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .join('\n')
          return normalized.toUpperCase()
        } catch (error) {
          console.warn('Failed to parse DOCX with mammoth, trying alternative method:', error)
          // Fallback: try to extract as plain text
          const txt = await parseDocFile(fileToProcess)
          const normalized = txt
            .split('\n')
            .map(l => l.replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .join('\n')
          return normalized.toUpperCase()
        }
      }

      case 'doc': {
        // DOC extraction (basic). Try server-side conversion first, otherwise best-effort parse.
        try {
          // Attempt to convert to DOCX if server endpoint exists
          const converted = await convertDocToDocx(fileToProcess)
          const text = await parseDocxFile(converted)
          const normalized = text
            .split('\n')
            .map(l => l.replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .join('\n')
          return normalized.toUpperCase()
        } catch (convErr) {
          console.warn('DOC conversion failed, falling back to best-effort parse:', convErr)
          const docText = await parseDocFile(fileToProcess)
          const normalized = docText
            .split('\n')
            .map(l => l.replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .join('\n')
          return normalized.toUpperCase()
        }
      }

      default:
        throw new Error(`Unsupported file format: ${fileExtension}. Please use PDF, DOC, or DOCX files.`)
    }
  }

// const clean = (val?: string) =>
//   val ? val.replace(/\s+/g, ' ').replace(/[:\-]+$/, '').trim() : ''

// const extractBlock = (text: string, start: string, endKeywords: string[]) => {
//   const startIndex = text.indexOf(start)
//   if (startIndex === -1) return ''

//   const sliced = text.slice(startIndex + start.length)

//   let endIndex = sliced.length
//   for (const key of endKeywords) {
//     const i = sliced.indexOf(key)
//     if (i !== -1 && i < endIndex) endIndex = i
//   }

//   return clean(sliced.slice(0, endIndex))
// }

// const clean = (val?: string) =>
//   val ? val.replace(/\s+/g, ' ').replace(/[:\-]+$/, '').trim() : ''

const extractByHeading = (text: string, heading: string, nextHeadings: string[]) => {
  const pattern = new RegExp(
    `${heading}[\\s\\S]*?(?=${nextHeadings.join('|')}|$)`,
    'i'
  )

  const match = text.match(pattern)
  if (!match) return ''

  const value = match[0]
    .replace(new RegExp(heading, 'i'), '')
    .trim()

  return clean(value)
}


// const clean = (val?: string) =>
//   val ? val.replace(/\s+/g, ' ').trim() : ''

const extractBlock = (text: string, start: string, stops: string[]) => {
  // Better block extraction that preserves boxed/table layouts.
  const lines = text.split('\n').map(l => l.trim())
  if (lines.length === 0) return ''

  // find a line that contains the start heading (flexible match)
  const startRegex = new RegExp(start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  let idx = lines.findIndex(l => startRegex.test(l))
  if (idx === -1) {
    // try looser match (word containment)
    idx = lines.findIndex(l => l.toLowerCase().includes(start.toLowerCase()))
  }
  if (idx === -1) return ''

  const stopsRegexes = stops.map(s => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))

  const collected: string[] = []

  // If the heading line itself contains content after the heading, capture it,
  // but avoid capturing when the same line contains another stop heading (common in table headers).
  const headingLine = lines[idx]
  const headingContent = headingLine.replace(startRegex, '').trim()
  if (headingContent && !stopsRegexes.some(rx => rx.test(headingLine))) {
    collected.push(headingContent)
  }

  // collect following lines until we hit a stop keyword (up to 30 lines for full address detail)
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) break
    let stopAt = -1
    for (const rx of stopsRegexes) {
      const m = line.match(rx)
      if (m && m[0]) {
        const idx = line.indexOf(m[0])
        if (idx >= 0 && (stopAt < 0 || idx < stopAt)) stopAt = idx
      }
    }
    if (stopAt >= 0) {
      const part = line.slice(0, stopAt).trim()
      if (part) collected.push(part)
      break
    }
    collected.push(line)
    if (collected.length >= 30) break
  }

  let result = clean(collected.join(' '))
  for (const rx of stopsRegexes) {
    const m = result.match(rx)
    if (m && m.index !== undefined && m.index > 10) {
      result = result.slice(0, m.index).trim()
      break
    }
  }
  return result
}

// Score a candidate block based on presence of address-like tokens and length
const scoreBlock = (block: string) => {
  if (!block) return 0
  let score = Math.min(block.length / 20, 20)
  const addressTokens = ['ROAD','PLOT','LAYOUT','VILLAGE','STREET','LANE','TOWER','BUILDING','AVENUE','SHOP','PLOT','BLOCK','FLOOR','INDIA','AUSTRALIA','VICTORIA','TEL','PHONE','POST','PO BOX','UNIT','NO','#',',']
  for (const t of addressTokens) {
    if (block.toUpperCase().includes(t)) score += 3
  }
  // prefer multi-line blocks
  const lines = block.split('\n').length || 1
  score += Math.min(lines, 6)
  return score
}

// Try multiple heading variants and pick the best-scoring extracted block
const findBestBlock = (text: string, variants: string[], stops: string[]) => {
  let best = ''
  let bestScore = 0
  for (const v of variants) {
    const candidate = extractBlock(text, v, stops)
    const s = scoreBlock(candidate)
    if (s > bestScore) {
      bestScore = s
      best = candidate
    }
  }
  return best
}

// Heuristic: pick a top-left block (commonly Shipper appears in top-left of BL)
const topLeftBlock = (rawText: string) => {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)
  const maxScan = Math.min(lines.length, 60)
  const candidates: string[] = []

  for (let i = 0; i < maxScan; i++) {
    const line = lines[i]
    // skip obvious headers/titles
    if (!line || /BILL OF LADING|DRAFT|BL REPORT|PAGE \d+/i.test(line)) continue

    // If a line looks like an address/company (contains address tokens or commas/numbers)
    if (/[,\d]|ROAD|PLOT|STREET|AVENUE|FLOOR|UNIT|BLOCK|MALL|VILLAGE|INDIA|AUSTRALIA/i.test(line)) {
      const collected: string[] = []
      let j = i
      while (j < maxScan && lines[j] && !/^(BILL|DRAFT|EXPORT|VOYAGE|CARRIER|CONSIGNEE|NOTIFY|PLACE OF|PORT OF)/i.test(lines[j])) {
        collected.push(lines[j])
        j++
        if (collected.length >= 8) break
      }
      if (collected.length > 0) candidates.push(collected.join(' '))
      i = j
    }
  }

  let best = ''
  let bestScore = 0
  for (const c of candidates) {
    const s = scoreBlock(c)
    if (s > bestScore) {
      bestScore = s
      best = c
    }
  }
  return best
}
 const clean = (val?: string) =>
  val ? val.replace(/\s+/g, ' ').trim() : ''

// Strip common label/prefix text from address blocks (consignee, notify, etc.)
const stripAddressPrefix = (s: string): string => {
  if (!s) return s
  return s
    .replace(/^\(?\s*IF\s+['"]?TO\s+ORDER['"]?\s+SO\s+INDICATE\s*\)?\s*/gi, '')
    .replace(/^\(?\s*NO\s+CLAIM\s+SHALL\s+ATTACH[^)]*\)\s*/gi, '')
    .replace(/^\)\s*/g, '')
    .replace(/^NOTIFY\s+PARTY[^A-Za-z]*/gi, '')
    .replace(/^PARTY\s*[^A-Za-z]*/gi, '')
    .replace(/CARRIER\s+NOT\s+TO\s+BE\s+RESPONSIBLE[^.]*\.?\s*/gi, '')
    .replace(/\s*CARRIER\s*:\s*[A-Z\s.]+(?:PTE\.?\s*LTD\.?)?\s*/gi, ' ')
    .replace(/\s*VOYAGE\s+NO\.?\s*[\w\-]*/gi, '')
    .replace(/\s+DRAFT\s*$/gi, '')
    .replace(/\s+OFBGKE[\w\-]*\s*/gi, ' ')
    .replace(/\s+PRIVATE\s+LIMITED\s*$/gi, ' PRIVATE LIMITED')
    .trim()
}

//  const extractFields = (rawText: string): PDFFields => {
//   const text = rawText.toUpperCase()
//   const flatText = rawText.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase()

//   // 1️⃣ CONTAINER – full detail: number + optional size + seal
//   let container = ''
//   const containerNumMatch = text.match(/\b([A-Z]{4}\d{6,7})\b/)
//   const containerNum = clean(containerNumMatch?.[1])
//   if (containerNum) {
//     container = containerNum
//     const idx = flatText.indexOf(containerNum)
//     const after = idx >= 0 ? flatText.slice(idx + containerNum.length, idx + containerNum.length + 60) : ''
//     const sizeGP = after.match(/\/(\d{2}GP)/i)
//     const sizeST = after.match(/(?:–|\-)\s*1x(\d{2})ST/i)
//     if (sizeGP) container += ' / ' + sizeGP[1]
//     else if (sizeST) container += ' – 1x' + sizeST[1] + 'ST'
//     const sealMatch = flatText.match(/(?:LINE\s+SEAL|SEAL)\s*[:\s]*([A-Z0-9]+)/i)
//     if (sealMatch) container += (container.includes('/') ? ' (Line Seal: ' : ' Seal: ') + clean(sealMatch[1]) + (container.includes('/') ? ')' : '')
//   }

//   // 2️⃣ HS CODE
//   const hsMatch =
//     text.match(/HS\s*CODE[:\s]*([0-9]{4,10})/i) ||
//     text.match(/HSCODE[:\s]*([0-9]{4,10})/i)
//   const hs = clean(hsMatch?.[1] || hsMatch?.[0])

//   // 3️⃣ WEIGHT: gross weight – draft BL has GROSS WEIGHT CARGO with 6905.000 on next line/column
//   let weight = ''
//   const weightNumRe = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+\.\d+|\d{4,})/
//   const isWeightLike = (n: string) => {
//     const num = n.replace(/,/g, '')
//     const v = parseFloat(num)
//     if (isNaN(v)) return false
//     if (/\.\d+/.test(n)) return v >= 500
//     return v >= 1000
//   }
//   const preferDecimal = (n: string) => /\.\d+/.test(n)
//   const toNum = (n: string) => parseFloat((n || '').replace(/,/g, '')) || 0
//   for (const marker of ['GROSS WEIGHT CARGO', 'GROSS WEIGHT', 'WEIGHT CARGO']) {
//     const idx = flatText.indexOf(marker)
//     if (idx === -1) continue
//     const after = flatText.slice(idx + marker.length, idx + marker.length + 450)
//     const matches = after.match(new RegExp(weightNumRe.source, 'g'))
//     if (matches) {
//       const decimals = matches.filter(n => isWeightLike(n) && preferDecimal(n))
//       const best = decimals.length ? decimals.reduce((a, b) => toNum(a) >= toNum(b) ? a : b) : null
//       const fallback = matches.find(n => isWeightLike(n))
//       weight = clean(best || fallback || '')
//       if (weight) break
//     }
//   }
//   if (!weight) {
//     const grossKgs = text.match(/GROSS\s*WEIGHT[:\s]*([\d,\.]+)\s*(?:KGS|KG)\b/i)
//     const anyKgs = text.match(/([\d,\.]+)\s*(?:KGS|KG)\b/i)
//     const cand = clean(grossKgs?.[1] || anyKgs?.[1])
//     if (cand && isWeightLike(cand)) weight = cand
//   }
//   if (!weight && flatText.includes('KGS')) {
//     const afterWeight = flatText.slice(flatText.indexOf('WEIGHT'))
//     const m = afterWeight.match(/([\d,\.]+)\s*(?:KGS|KG)\b/i)
//     if (m && isWeightLike(m[1])) weight = clean(m[1])
//   }
//   if (!weight) {
//     const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
//     const lineWithWeightHeader = lines.findIndex(l => {
//       const u = l.toUpperCase()
//       return u.includes('GROSS WEIGHT CARGO') || (u.includes('GROSS') && u.includes('WEIGHT'))
//     })
//     if (lineWithWeightHeader >= 0) {
//       const nextLines = lines.slice(lineWithWeightHeader, lineWithWeightHeader + 8).join(' ')
//       const matches = nextLines.match(new RegExp(weightNumRe.source, 'g'))
//       if (matches) {
//         const decimals = matches.filter(n => isWeightLike(n) && preferDecimal(n))
//         const best = decimals.length ? decimals.reduce((a, b) => toNum(a) >= toNum(b) ? a : b) : null
//         const fallback = matches.find(n => isWeightLike(n))
//         weight = clean(best || fallback || '')
//       }
//     }
//   }
//   if (!weight && text.match(/(?:KGS|KG)\s*[\d,\.]+/i)) {
//     const kgsThenNum = flatText.match(/(?:KGS|KG)\s+(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+\.\d+|\d{4,})/gi)
//     if (kgsThenNum) {
//       for (const m of kgsThenNum) {
//         const numMatch = m.match(/(\d[\d,\.]+)/)
//         const n = numMatch ? clean(numMatch[1]) : ''
//         if (n && isWeightLike(n) && (!weight || toNum(n) > toNum(weight))) weight = n
//       }
//     }
//   }
//   if (!weight) {
//     const block = extractBlock(text, 'GROSS WEIGHT CARGO', ['TARE', 'MEASUREMENT', 'CBM']) ||
//       extractBlock(text, 'GROSS WEIGHT', ['TARE', 'MEASUREMENT', 'CBM'])
//     const matches = block.match(new RegExp(weightNumRe.source, 'g'))
//     if (matches) {
//       const decimals = matches.filter(n => isWeightLike(n) && preferDecimal(n))
//       const best = decimals.length ? decimals.reduce((a, b) => toNum(a) >= toNum(b) ? a : b) : null
//       const fallback = matches.find(n => isWeightLike(n))
//       weight = clean(best || fallback || '')
//     }
//   }
//   if (!weight && flatText.includes('KGS')) {
//     const kgsRegex = /([\d,\.]+)\s*(?:KGS|KG)\b/gi
//     let m: RegExpExecArray | null
//     let best = ''
//     const weightPos = flatText.indexOf('GROSS')
//     while ((m = kgsRegex.exec(flatText)) !== null) {
//       const num = clean(m[1])
//       if (!isWeightLike(num)) continue
//       const afterNum = flatText.slice(m.index + m[0].length, m.index + m[0].length + 15)
//       if (/\bCBM\b/i.test(afterNum)) continue
//       if (weightPos >= 0 && m.index > weightPos) { best = num; break }
//       if (!best || toNum(num) > toNum(best)) best = num
//     }
//     if (best) weight = best
//   }
//   if (!weight && flatText.includes('KGS')) {
//     const kgsRegex = /([\d,\.]+)\s*(?:KGS|KG)\b/gi
//     let m: RegExpExecArray | null
//     let best = ''
//     while ((m = kgsRegex.exec(flatText)) !== null) {
//       const num = clean(m[1])
//       if (!isWeightLike(num)) continue
//       const afterNum = flatText.slice(m.index + m[0].length, m.index + m[0].length + 15)
//       if (/\bCBM\b/i.test(afterNum)) continue
//       if (!best || toNum(num) > toNum(best)) best = num
//     }
//     if (best) weight = best
//   }
//   if (!weight && /KGS|KG\b/.test(flatText)) {
//     const decimalNumRe = /(\d{1,3}(?:,\d{3})*\.\d+|\d+\.\d+)/g
//     let numM: RegExpExecArray | null
//     while ((numM = decimalNumRe.exec(flatText)) !== null) {
//       const num = numM[1]
//       if (!isWeightLike(num)) continue
//       const after = flatText.slice(numM.index + num.length, numM.index + num.length + 80)
//       const kgsPos = after.search(/\b(?:KGS|KG)\b/i)
//       const cbmPos = after.search(/\bCBM\b/i)
//       if (kgsPos >= 0 && (cbmPos < 0 || kgsPos < cbmPos)) { weight = clean(num); break }
//     }
//   }
//   if (!weight && (flatText.includes('KGS') || flatText.includes('WEIGHT') || flatText.includes('GROSS') || flatText.includes('TARE') || flatText.includes('CBM'))) {
//     const cbmPos = flatText.indexOf('CBM')
//     const searchSpan = cbmPos >= 0 ? flatText.slice(0, cbmPos + 1) : flatText
//     const idxGross = searchSpan.indexOf('GROSS')
//     const idxWeight = searchSpan.indexOf('WEIGHT')
//     const idxKgs = searchSpan.indexOf('KGS')
//     const idxTare = searchSpan.indexOf('TARE')
//     const starts = [idxGross, idxWeight, idxKgs, idxTare].filter(i => i >= 0)
//     const weightSectionStart = starts.length ? Math.min(...starts) : 0
//     const span = flatText.slice(weightSectionStart, weightSectionStart + 600)
//     let numM: RegExpExecArray | null
//     const allNums: string[] = []
//     const numRe = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d{4,})/g
//     while ((numM = numRe.exec(span)) !== null) {
//       const n = clean(numM[1])
//       if (isWeightLike(n)) allNums.push(n)
//     }
//     if (allNums.length) {
//       const best = allNums.reduce((a, b) => toNum(a) >= toNum(b) ? a : b)
//       weight = best
//     }
//   }
//   if (!weight && (flatText.includes('KGS') || flatText.includes('CBM'))) {
//     const grossWeightPattern = /(\d{4,}\.\d{2,}|\d{1,3}(?:,\d{3})*\.\d{2,})/g
//     let numM: RegExpExecArray | null
//     let best = ''
//     while ((numM = grossWeightPattern.exec(flatText)) !== null) {
//       const n = clean(numM[1])
//       const v = toNum(n)
//       if (v >= 500 && v <= 999999) {
//         const pos = numM.index
//         const context = flatText.slice(Math.max(0, pos - 80), pos + n.length + 80)
//         if (/\b(?:KGS|KG|WEIGHT|GROSS|TARE|CBM)\b/i.test(context) && (!best || v > toNum(best))) best = n
//       }
//     }
//     if (best) weight = best
//   }
//   let netWeight = ''
//   const netMatch = flatText.match(/NET\s+WEIGHT[:\s]*([\d,\.]+)(?:\s*(?:KGS|KG)\b)?/i)
//   if (netMatch && isWeightLike(netMatch[1])) netWeight = clean(netMatch[1])
//   if (weight) {
//     weight = weight + ' KGS'
//     if (netWeight) weight += ' (Net Weight: ' + netWeight + ' KGS)'
//   }

//   // 4️⃣ VESSEL: OOCL TAIPEI etc. – prefer explicit vessel name, not VOYAGE NO or CARRIER name
//   let vessel = ''
//   const knownVessels = flatText.match(/\b(OOCL\s+TAIPEI|MSC\s+[\w\-]+|MAERSK\s+[\w\-]+|CMA\s+CGM|COSCO\s+[\w\-]+|HAPAG\s+[\w\-]+|NYK\s+[\w\-]+)\b/i)
//   if (knownVessels) vessel = clean(knownVessels[0])
//   if (!vessel) {
//     const vesselLineMatch = flatText.match(/(?:VESSEL|SHIPPED\s+ON\s+BOARD)[:\s]*([A-Z]{2,6}\s+[A-Z]{2,30})/i)
//     if (vesselLineMatch) {
//       let v = clean(vesselLineMatch[1])
//       v = v.replace(/\s*(PORT\s+OF|PLACE\s+OF|FREIGHT|PRE\s+CARRIAGE|VOYAGE).*$/i, '').trim()
//       if (v && !/^PORT\s|^PLACE\s|^VOYAGE\s|^ANL\s+SINGAPORE/i.test(v)) vessel = v
//     }
//   }
//   if (!vessel) {
//     const vesselAlt = flatText.match(/\b(OOCL|MSC|MAERSK|CMA|COSCO|HAPAG|NYK|KLINE)\s+[A-Z0-9\-]{2,25}\b/i)
//     vessel = clean(vesselAlt?.[0])
//   }

//   // 5️⃣ POL / 6️⃣ POD: port names only – use known ports first, then parse after label
//   let pol = ''
//   let pod = ''
//   if (flatText.includes('NHAVA SHEVA')) {
//     pol = flatText.match(/NHAVA\s+SHEVA(?:\s*,\s*India)?/i)?.[0]?.trim() || 'NHAVA SHEVA'
//   }
//   if (flatText.includes('MELBOURNE')) {
//     pod = flatText.match(/MELBOURNE(?:\s*,\s*Australia)?/i)?.[0]?.trim() || 'MELBOURNE'
//   }
//   if (!pol) {
//     const polM = flatText.match(/PORT\s+OF\s+LOADING[:\s]*([A-Z\s,]+?)(?=PORT\s+OF\s+DISCHARGE|VESSEL|PLACE\s+OF|FREIGHT|$)/i)
//     if (polM) pol = clean(polM[1].split(',')[0].trim())
//   }
//   if (!pod) {
//     const podM = flatText.match(/PORT\s+OF\s+DISCHARGE[:\s]*([A-Z\s,]+?)(?=FINAL\s+PLACE|FREIGHT|PLACE\s+OF\s+DELIVERY|$)/i)
//     if (podM) pod = clean(podM[1].split(',')[0].trim())
//   }

//   // 7️⃣ BOOKING / BL NUMBER: full number e.g. DEL2607982, HYD0100922 (not just DEL/HYD)
//   let booking = ''
//   const blNoMatch = flatText.match(/(?:BILL\s+OF\s+LADING\s+(?:NO\.?|NUMBER)|BOOKING\s+(?:NO\.?|NUMBER))[:\s]*([A-Z]{2,4}\d{6,})/i)
//   if (blNoMatch) booking = clean(blNoMatch[1])
//   if (!booking) {
//     const alt = flatText.match(/\b(DEL\d{7,}|HYD\d{7,}|[A-Z]{3}\d{7,})\b/i)
//     if (alt) booking = clean(alt[0])
//   }

//   // 8️⃣ SHIPPER / CONSIGNEE / NOTIFY - try heading-based extraction first
//   let shipper = ''
//   let consignee = ''
//   let notify = ''

//   const shipperStops = ['CONSIGNEE', 'NOTIFY', 'EXPORT REFERENCES', 'VOYAGE NUMBER', 'BILL OF LADING', 'BILL OF LADING NO', 'BILL OF LADING NUMBER', 'CARRIER', 'DRAFT', 'TAKEN INCHARGE', 'TAKEN IN CHARGE', 'APPARENTLY GOOD', 'MTO', 'MULTIMODAL', 'REGD\\. OFF']
//   if (/SHIPPER/.test(text) || /CONSIGNOR/.test(text)) {
//     shipper = findBestBlock(
//       text,
//       ['CONSIGNOR/SHIPPER', 'CONSIGNOR - SHIPPER', 'CONSIGNOR / SHIPPER', 'CONSIGNOR', 'SHIPPER'],
//       shipperStops
//     )
//     shipper = clean(shipper
//       .replace(/\b(DEL|HYD)\d{6,}\b/gi, '')
//       .replace(/\bVOYAGE\s+NO\.?\s*[\w\-]*/gi, '')
//       .replace(/\s*[A-Z]{0,3}\d[A-Z0-9]{6,10}\b\s*/g, ' ')
//       .replace(/\s*OFBGKE[\w\-]*\s*/gi, ' ')
//       .replace(/\s*DFBGKE[\w\-]*\s*/gi, ' ')
//       .replace(/\s*0FBGKE[\w\-]*\s*/gi, ' ')
//       .replace(/\s*TAKEN\s+IN\s+CHARGE.*$/i, '')
//       .replace(/\s*BILL\s+OF\s+LADING\s+NO\..*$/i, '')
//       .replace(/\s{2,}/g, ' '))
//   }

//   if (/CONSIGNEE/.test(text)) {
//     consignee = findBestBlock(
//       text,
//       ['CONSIGNEE', 'CONSIGNEE (IF TO ORDER SO INDICATE)', 'CONSIGNEE (IF "TO ORDER" SO INDICATE)'],
//       ['NOTIFY', 'EXPORT REFERENCES', 'PRE CARRIAGE', 'PLACE OF RECEIPT', 'BILL OF LADING', 'CARRIER']
//     )
//     consignee = stripAddressPrefix(consignee)
//   }

//   if (/NOTIFY/.test(text)) {
//     notify = findBestBlock(
//       text,
//       ['NOTIFY', 'NOTIFY PARTY', 'NOTIFY PARTY (NO CLAIM SHALL ATTACH FOR FAILURE TO NOTIFY)'],
//       ['BILL OF LADING', 'EXPORT REFERENCES', 'PLACE OF RECEIPT', 'PRE CARRIAGE', 'VESSEL', 'PORT OF', 'MARKS AND NOS']
//     )
//     notify = stripAddressPrefix(notify)
//     if (!notify) notify = consignee
//   }

//   // Fallback: try to infer from nearby lines (useful for table-style BLs)
//   if (!shipper || !consignee) {
//     const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)
//     if (!shipper) {
//       const headerIdx = lines.findIndex(l => /SHIPPER/i.test(l))
//       if (headerIdx !== -1) {
//         shipper = clean(lines.slice(headerIdx + 1, headerIdx + 6).join(' '))
//       } else {
//         // fallback: top-left heuristic block (common in many BLs)
//         shipper = topLeftBlock(rawText) || shipper
//       }
//     }
//     if (!consignee) {
//       const consIdx = lines.findIndex(l => /CONSIGNEE/i.test(l))
//       if (consIdx !== -1) {
//         consignee = clean(lines.slice(consIdx + 1, consIdx + 6).join(' '))
//       } else if (shipper) {
//         // try to find a block after shipper in the top region
//         const topLines = lines.slice(0, 80)
//         const shipIdx = topLines.findIndex(l => shipper && l && shipper.includes(l))
//         if (shipIdx !== -1) {
//           // look after shipper for next address-like block
//           for (let k = shipIdx + 1; k < Math.min(topLines.length, shipIdx + 20); k++) {
//             if (/[,\d]|ROAD|PLOT|STREET|AVENUE|FLOOR|UNIT|BLOCK|INDIA|AUSTRALIA/i.test(topLines[k])) {
//               consignee = clean(topLines.slice(k, k + 6).join(' '))
//               break
//             }
//           }
//         }
//       }
//     }
//     if (!notify) {
//       const notifyIdx = lines.findIndex(l => /NOTIFY/i.test(l))
//       if (notifyIdx !== -1) notify = clean(lines.slice(notifyIdx + 1, notifyIdx + 6).join(' '))
//     }
//   }

//   if (!notify) notify = consignee

//   return {
//     shipper,
//     consignee,
//     notify,
//     booking,
//     vessel,
//     pol,
//     pod,
//     container,
//     weight,
//     hs
//   }
// }

  // Local fallback that used to parse fields directly in the browser.
  // Kept here commented-out for reference; we now rely ONLY on the API.
  // const extractFieldsLocal = (rawText: string): PDFFields => {
  //   const text = rawText.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase()
  //   const empty = (s: string) => (s ?? '').trim()
  //   const shipper = empty((rawText.match(/(?:SHIPPER|CONSIGNOR)[:\s]*([\s\S]*?)(?=CONSIGNEE|NOTIFY|$)/i)?.[1] ?? '').slice(0, 500))
  //   const consignee = empty((rawText.match(/CONSIGNEE[:\s]*([\s\S]*?)(?=NOTIFY|EXPORT|BILL|$)/i)?.[1] ?? '').slice(0, 500))
  //   const notify = empty((rawText.match(/NOTIFY[:\s]*([\s\S]*?)(?=BILL|EXPORT|VESSEL|$)/i)?.[1] ?? '').slice(0, 500)) || consignee
  //   const booking = empty(text.match(/(?:B\/L|BILL\s+OF\s+LADING|BOOKING)[\s#:]*([A-Z0-9\-]{6,})/i)?.[1] ?? '')
  //   const vessel = empty(text.match(/(?:VESSEL|SHIPPED\s+ON)[\s:]*([A-Z]{2,}\s+[A-Z0-9\-]{2,30})/i)?.[1] ?? '')
  //   const pol = empty(text.match(/PORT\s+OF\s+LOADING[\s:]*([A-Z\s,]+?)(?=PORT\s+OF\s+DISCHARGE|VESSEL|$)/i)?.[1] ?? '')
  //   const pod = empty(text.match(/PORT\s+OF\s+DISCHARGE[\s:]*([A-Z\s,]+?)(?=FINAL|FREIGHT|$)/i)?.[1] ?? '')
  //   const container = empty(text.match(/\b([A-Z]{4}\d{6,7})\b/)?.[1] ?? '')
  //   const weight = empty(text.match(/(?:GROSS\s+WEIGHT|WEIGHT)[\s:]*([\d,\.]+)\s*(?:KGS|KG)?/i)?.[1] ?? '')
  //   const hs = empty(text.match(/HS\s*CODE[\s:]*(\d{4,10})/i)?.[1] ?? '')
  //   return { shipper, consignee, notify, booking, vessel, pol, pod, container, weight, hs }
  // }

  const emptyFields = (): PDFFields => ({
    shipper: '',
    consignee: '',
    notify: '',
    booking: '',
    vessel: '',
    pol: '',
    pod: '',
    container: '',
    weight: '',
    hs: '',
  })

  const documentApiConfiguredRef = useRef<boolean | null>(null)
  const rateLimitedUntilRef = useRef<number>(0)

  const getFieldsForText = async (rawText: string): Promise<PDFFields> => {
    if (documentApiConfiguredRef.current === null) {
      try {
        const res = await fetch('/api/document-extract/status')
        const data = await res.json()
        documentApiConfiguredRef.current = !!data.configured
      } catch {
        documentApiConfiguredRef.current = false
      }
    }
    if (!documentApiConfiguredRef.current) {
      return emptyFields()
    }
    try {
      const res = await fetch('/api/document-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 429) {
          const retryAfter = parseInt(res.headers.get('Retry-After') ?? '60', 10)
          rateLimitedUntilRef.current = Date.now() + retryAfter * 1000
          throw new Error('RATE_LIMITED')
        }
        throw new Error((data as { error?: string }).error || res.statusText)
      }
      return {
        shipper: (data as PDFFields).shipper ?? '',
        consignee: (data as PDFFields).consignee ?? '',
        notify: (data as PDFFields).notify ?? '',
        booking: (data as PDFFields).booking ?? '',
        vessel: (data as PDFFields).vessel ?? '',
        pol: (data as PDFFields).pol ?? '',
        pod: (data as PDFFields).pod ?? '',
        container: (data as PDFFields).container ?? '',
        weight: (data as PDFFields).weight ?? '',
        hs: (data as PDFFields).hs ?? '',
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'RATE_LIMITED') throw err
      return emptyFields()
    }
  }

  const handleCompare = async () => {
    if (!doc1File || !doc2File) {
      alert('Please upload both documents')
      return
    }

    if (rateLimitedUntilRef.current > Date.now()) {
      const secs = Math.ceil((rateLimitedUntilRef.current - Date.now()) / 1000)
      alert(`Document extraction is rate limited. Please try again in ${secs} seconds.`)
      return
    }

    // Check if files are valid formats
    const validExtensions = ['pdf', 'doc', 'docx']
    const ext1 = doc1File.name.split('.').pop()?.toLowerCase()
    const ext2 = doc2File.name.split('.').pop()?.toLowerCase()
    
    if (!ext1 || !validExtensions.includes(ext1) || !ext2 || !validExtensions.includes(ext2)) {
      alert('Please upload PDF, DOC, or DOCX files only')
      return
    }

    // For PDF files, check if PDF.js is available
    if ((ext1 === 'pdf' || ext2 === 'pdf') && !(window as any).pdfjsLib) {
      let attempts = 0
      while (!(window as any).pdfjsLib && attempts < 6) {
        await new Promise(resolve => setTimeout(resolve, 500))
        attempts++
      }
      
      if (!(window as any).pdfjsLib) {
        alert('PDF.js library failed to load. Please refresh the page and try again.')
        return
      }
    }

    setLoading(true)
    setResults([])

    try {
      console.log('Extracting text from Document 1...')
      const text1 = await extractText(doc1File)
      console.log('Extracting text from Document 2...')
      const text2 = await extractText(doc2File)

      console.log('Extracted text from Document 1 (first 500 chars):', text1.substring(0, 500))
      console.log('Extracted text from Document 2 (first 500 chars):', text2.substring(0, 500))

      const fields1 = await getFieldsForText(text1)
      const fields2 = await getFieldsForText(text2)

      console.log('Fields from Document 1:', fields1)
      console.log('Fields from Document 2:', fields2)

      const normalizePort = (v: string) => (v || '').replace(/\s*,\s*(India|Australia|INDIA|AUSTRALIA)\s*$/i, '').trim()
      const comparisonResults: ComparisonResult[] = Object.keys(fields1).map((field) => {
        const doc1Value = fields1[field as keyof PDFFields]
        const doc2Value = fields2[field as keyof PDFFields]
        const key = field.toUpperCase()
        const v1 = doc1Value || ''
        const v2 = doc2Value || ''
        const compare1 = (key === 'POL' || key === 'POD') ? normalizePort(v1) : v1
        const compare2 = (key === 'POL' || key === 'POD') ? normalizePort(v2) : v2

        let status: 'MATCH' | 'MISMATCH' | 'MISSING'
        if (!v2) {
          status = 'MISSING'
        } else if (compare1 !== compare2) {
          status = 'MISMATCH'
        } else {
          status = 'MATCH'
        }

        return {
          field: key,
          pdf1Value: v1,
          pdf2Value: v2,
          status,
        }
      })

      setResults(comparisonResults)
      
      // Show success message
      if (comparisonResults.length > 0) {
        console.log('Comparison completed successfully')
      }
    } catch (error) {
      console.error('Error comparing documents:', error)
      if (error instanceof Error && error.message === 'RATE_LIMITED') {
        const secs = Math.ceil((rateLimitedUntilRef.current - Date.now()) / 1000)
        alert(`Document extraction is rate limited. Please try again in ${secs} seconds.`)
      } else {
        alert(`An error occurred while comparing the documents: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure the files are valid.`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setDoc1File(null)
    setDoc2File(null)
    setResults([])
    if (fileInput1Ref.current) fileInput1Ref.current.value = ''
    if (fileInput2Ref.current) fileInput2Ref.current.value = ''
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MATCH':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'MISMATCH':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'MISSING':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATCH':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            ✓ MATCH
          </span>
        )
      case 'MISMATCH':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            ✗ MISMATCH
          </span>
        )
      case 'MISSING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            ⚠ MISSING
          </span>
        )
      default:
        return null
    }
  }

  // Helper function to display file type
  const getFileType = (file: File | null) => {
    if (!file) return ''
    const ext = file.name.split('.').pop()?.toUpperCase()
    return `(${ext})`
  }

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={() => {
          setPdfjsLoaded(true)
          if ((window as any).pdfjsLib) {
            ;(window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          }
        }}
        onError={() => {
          console.error('Failed to load PDF.js')
        }}
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-[#fdfaf2] py-10 sm:py-16 font-sans">
        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <header className="text-center mb-11 sm:mb-14">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">
              DOCUMENT COMPARISON (SL vs BL)
            </h1>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Compare specific fields between documents. Extract and compare shipping related fields automatically.
            </p>
          </header>

          <div className="flex flex-col gap-7 sm:gap-8">
            {/* Document 1 */}
            <div className="rounded-[10px] border border-[#e2e2e2] bg-white p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#14532d] text-sm sm:text-[15px] leading-snug">Document 1 (BL Draft)</p>
                  <p className="mt-1.5 text-xs sm:text-sm text-gray-600">Supports: PDF, DOC, DOCX</p>
                </div>
                <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
                  <input
                    ref={fileInput1Ref}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="sr-only"
                    tabIndex={-1}
                    onChange={(e) => setDoc1File(e.target.files?.[0] || null)}
                  />
                  <button
                    type="button"
                    aria-label="Choose file for document 1 BL draft"
                    onClick={() => fileInput1Ref.current?.click()}
                    className="rounded-lg bg-[#c678dd] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:brightness-95 transition-[filter] shadow-sm"
                  >
                    Choose File
                  </button>
                  <p className="text-[11px] sm:text-xs text-[#166534] text-right break-all max-w-full sm:max-w-md leading-snug">
                    {doc1File ? (
                      <>
                        {doc1File.name}{' '}
                        <span className="text-[#166534]/80">{getFileType(doc1File)}</span>
                      </>
                    ) : (
                      'no file selected'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Document 2 */}
            <div className="rounded-[10px] border border-[#e2e2e2] bg-white p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#14532d] text-sm sm:text-[15px] leading-snug">Document 2 (SI Draft)</p>
                  <p className="mt-1.5 text-xs sm:text-sm text-gray-600">Supports: PDF, DOC, DOCX</p>
                </div>
                <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
                  <input
                    ref={fileInput2Ref}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="sr-only"
                    tabIndex={-1}
                    onChange={(e) => setDoc2File(e.target.files?.[0] || null)}
                  />
                  <button
                    type="button"
                    aria-label="Choose file for document 2 SI draft"
                    onClick={() => fileInput2Ref.current?.click()}
                    className="rounded-lg bg-[#c678dd] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:brightness-95 transition-[filter] shadow-sm"
                  >
                    Choose File
                  </button>
                  <p className="text-[11px] sm:text-xs text-[#166534] text-right break-all max-w-full sm:max-w-md leading-snug">
                    {doc2File ? (
                      <>
                        {doc2File.name}{' '}
                        <span className="text-[#166534]/80">{getFileType(doc2File)}</span>
                      </>
                    ) : (
                      'no file selected'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* How it Works — copy matches reference screen */}
            <div className="rounded-[10px] bg-[#fef0b3] px-5 py-5 sm:px-6 sm:py-6 border border-[#f5e6a8]">
              <h3 className="text-sm sm:text-base font-bold text-[#14532d] mb-3">How it Works</h3>
              <ul className="text-xs sm:text-sm text-[#14532d] space-y-2.5 list-disc list-inside leading-relaxed pl-0.5">
                <li>The tool extracts shipping related information automatically.</li>
                <li>Use PDF.js library for text extraction</li>
                <li>The tool extracts shipping related information automatically.</li>
                <li>Use PDF.js library for text extraction</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-row gap-3 items-stretch pt-1">
              <button
                type="button"
                onClick={handleCompare}
                disabled={loading || !doc1File || !doc2File}
                className="flex-1 min-h-[46px] rounded-lg bg-[#c678dd] px-4 py-3 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-[filter] flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Comparing...
                  </>
                ) : (
                  'Compare Documents'
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="shrink-0 rounded-lg border border-[#e2e2e2] bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50/80 transition-colors min-w-[5.5rem]"
              >
                Reset
              </button>
            </div>
          </div>

          {loading && (
            <div className="mt-8 rounded-[10px] border border-[#e2e2e2] bg-white p-6">
              <div className="flex items-center justify-center gap-4">
                <svg className="animate-spin h-8 w-8 text-[#c678dd]" fill="none" viewBox="0 0 24 24" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <div>
                  <p className="text-base font-semibold text-gray-900">Processing documents…</p>
                  <p className="text-sm text-gray-600">Extracting text and comparing fields</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Processing: {doc1File?.name} and {doc2File?.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-8 rounded-[10px] border border-[#e2e2e2] bg-white overflow-hidden">
              <div className="bg-[#c678dd] px-5 py-4 sm:px-6">
                <h2 className="text-lg font-bold text-white">Comparison results</h2>
                <p className="text-xs sm:text-sm text-white/90 mt-1">
                  Comparing {doc1File?.name} (BL Draft) and {doc2File?.name} (SI Draft)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50/80 border-b border-[#e2e2e2]">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Field
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        BL Draft value
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        SI Draft value
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50/80 transition-colors ${getStatusColor(result.status)}`}
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">{result.field}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 max-w-md break-words align-top">
                          <span className="text-sm text-gray-700 whitespace-pre-line">
                            {result.pdf1Value || <span className="text-gray-400 italic">—</span>}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 max-w-md break-words align-top">
                          <span className="text-sm text-gray-700 whitespace-pre-line">
                            {result.pdf2Value || <span className="text-gray-400 italic">—</span>}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{getStatusBadge(result.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}