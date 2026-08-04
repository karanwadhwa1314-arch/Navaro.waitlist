'use client'

import { useState, useRef, useEffect } from 'react'
import * as mammoth from 'mammoth'

export default function PDFComparison() {
  const [pdf1File, setPdf1File] = useState<File | null>(null)
  const [pdf2File, setPdf2File] = useState<File | null>(null)
  const [matchedLines, setMatchedLines] = useState<string[]>([])
  const [notMatchedLines, setNotMatchedLines] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [pdfjsLoaded, setPdfjsLoaded] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
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

  // Load PDF.js library
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.async = true
    script.onload = () => {
      console.log('PDF.js script loaded')
      setPdfjsLoaded(true)
      if ((window as any).pdfjsLib) {
        ;(window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        console.log('PDF.js worker source set')
      } else {
        console.warn('pdfjsLib not found on window after script load')
      }
    }
    script.onerror = (e) => {
      console.error('Failed to load PDF.js:', e)
      alert('Failed to load PDF.js library. Please check your internet connection and refresh the page.')
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const extractTextFromPDF = async (file: File): Promise<string> => {
    if (!(window as any).pdfjsLib) {
      throw new Error('PDF.js library not loaded')
    }

    try {
      const buffer = await file.arrayBuffer()
      console.log('Loading PDF document, size:', buffer.byteLength, 'bytes')
      
      const pdf = await (window as any).pdfjsLib.getDocument(buffer).promise
      
      console.log(`PDF loaded, pages: ${pdf.numPages}`)
      let text = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Extracting page ${i}...`)
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        
        content.items.forEach((item: any) => {
          if (item.str) {
            text += item.str + '\n'
          }
        })
      }
      
      console.log(`Text extracted, total length: ${text.length}`)
      if (text.length > 0) {
        console.log(`Sample text (first 500 chars):`, text.substring(0, 500))
      }
      return text
    } catch (error: any) {
      console.error('Error extracting text from PDF:', error)
      throw new Error(`Failed to extract text: ${error.message || 'Unknown error'}`)
    }
  }

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer()
      console.log('Loading DOCX document, size:', buffer.byteLength, 'bytes')
      
      const result = await mammoth.extractRawText({ arrayBuffer: buffer })
      const text = result.value
      
      console.log(`DOCX text extracted, total length: ${text.length}`)
      if (text.length > 0) {
        console.log(`Sample text (first 500 chars):`, text.substring(0, 500))
      }
      
      if (result.messages && result.messages.length > 0) {
        console.warn('DOCX extraction warnings:', result.messages)
      }
      
      return text
    } catch (error: any) {
      console.error('Error extracting text from DOCX:', error)
      throw new Error(`Failed to extract text from DOCX: ${error.message || 'Unknown error'}`)
    }
  }

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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Conversion failed')
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
      throw new Error(`Failed to convert .doc file: ${error.message}`)
    }
  }

  const extractText = async (file: File): Promise<string> => {
    let fileToProcess = file
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    console.log(`Extracting text from ${fileExtension?.toUpperCase()} file: ${file.name}`)
    
    // Convert .doc files to .docx first
    if (fileExtension === 'doc') {
      console.log('Detected .doc file, converting to .docx...')
      fileToProcess = await convertDocToDocx(file)
      console.log('Conversion complete, proceeding with text extraction')
    }
    
    if (fileExtension === 'pdf') {
      return await extractTextFromPDF(fileToProcess)
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      return await extractTextFromDOCX(fileToProcess)
    } else {
      throw new Error(`Unsupported file format: ${fileExtension}`)
    }
  }

  const handleCompare = async () => {
    if (!pdf1File || !pdf2File) {
      setError('Please upload both Document files')
      return
    }

    setError(null)

    console.log('Starting comparison...')
    console.log('Document 1:', pdf1File.name)
    console.log('Document 2:', pdf2File.name)

    // Check if PDF.js is available, if not try to wait a bit
    if (!(window as any).pdfjsLib) {
      console.log('PDF.js not loaded, waiting...')
      // Wait up to 5 seconds for PDF.js to load
      let attempts = 0
      while (!(window as any).pdfjsLib && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500))
        attempts++
        console.log(`Waiting for PDF.js... attempt ${attempts}`)
      }
      
      if (!(window as any).pdfjsLib) {
        setError('PDF.js library failed to load. Please refresh the page and try again.')
        console.error('PDF.js still not loaded after waiting')
        setLoading(false)
        return
      }
    }

    console.log('PDF.js loaded, starting extraction...')
    setLoading(true)
    setMatchedLines([])
    setNotMatchedLines([])

    try {
      console.log('Extracting text from Document 1...')
      const text1 = await extractText(pdf1File)
      console.log('Document 1 text extracted, length:', text1.length)
      console.log('First 200 chars of Document 1:', text1.substring(0, 200))

      console.log('Extracting text from Document 2...')
      const text2 = await extractText(pdf2File)
      console.log('Document 2 text extracted, length:', text2.length)
      console.log('First 200 chars of Document 2:', text2.substring(0, 200))

      // Check if we actually got text - but be more lenient
      if (!text1 || text1.trim().length === 0) {
        console.warn('Document 1 text is empty after extraction')
      }

      if (!text2 || text2.trim().length === 0) {
        console.warn('Document 2 text is empty after extraction')
      }

      // Split into lines and filter empty lines, but keep meaningful content
      let lines1 = text1.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0)
      let lines2 = text2.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0)

      console.log('Document 1 lines after split:', lines1.length)
      console.log('Document 2 lines after split:', lines2.length)
      console.log('Document 1 sample lines:', lines1.slice(0, 10))
      console.log('Document 2 sample lines:', lines2.slice(0, 10))

      // If no lines after filtering, the text might be all on one line or have different formatting
      // Try splitting by spaces or other delimiters as fallback
      if (lines1.length === 0 && text1.trim().length > 0) {
        console.log('Document 1: No lines found, trying alternative splitting...')
        lines1 = text1.split(/\s{2,}|[\.!?]\s+/).map((l) => l.trim()).filter((l) => l.length > 0)
        if (lines1.length === 0) {
          lines1 = text1.split(/\s+/).filter((l) => l.length > 0)
        }
        console.log('Document 1 lines after alternative split:', lines1.length)
      }

      if (lines2.length === 0 && text2.trim().length > 0) {
        console.log('Document 2: No lines found, trying alternative splitting...')
        lines2 = text2.split(/\s{2,}|[\.!?]\s+/).map((l) => l.trim()).filter((l) => l.length > 0)
        if (lines2.length === 0) {
          lines2 = text2.split(/\s+/).filter((l) => l.length > 0)
        }
        console.log('Document 2 lines after alternative split:', lines2.length)
      }

      // Final check - if still no content, show a helpful message
      if (lines1.length === 0 && lines2.length === 0) {
        console.error('No extractable text found in either document')
        setError('No extractable text found in the documents. The files might be image-based (scanned documents) or password-protected.')
        setLoading(false)
        return
      }

      const matched: string[] = []
      const notMatched: string[] = []

      // Compare lines
      lines1.forEach((line) => {
        if (lines2.includes(line)) {
          matched.push(line)
        } else {
          notMatched.push(line)
        }
      })

      // Also check lines from Document 2 that aren't in Document 1
      lines2.forEach((line) => {
        if (!lines1.includes(line) && !notMatched.includes(line)) {
          notMatched.push(line)
        }
      })

      console.log('Matched lines:', matched.length)
      console.log('Not matched lines:', notMatched.length)
      console.log('Sample matched:', matched.slice(0, 5))
      console.log('Sample not matched:', notMatched.slice(0, 5))

      // Update state
      setMatchedLines([...matched])
      setNotMatchedLines([...notMatched])
      
      console.log('State updated - Matched:', matched.length, 'Not Matched:', notMatched.length)
      console.log('Comparison complete!')
      
      if (matched.length === 0 && notMatched.length === 0 && text1.trim().length > 0 && text2.trim().length > 0) {
        console.warn('Text was extracted but no lines were found after filtering')
      }
    } catch (error) {
      console.error('Error comparing documents:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Provide more helpful error messages
      if (errorMessage.includes('Failed to convert .doc file')) {
        setError('Document not correct - Could not convert .doc file. LibreOffice may not be installed on the server, or the file is corrupted.')
      } else if (errorMessage.includes('Invalid PDF structure') || errorMessage.includes('InvalidPDFException')) {
        setError('Document not correct - The PDF file appears to be corrupted or has an invalid structure.')
      } else if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
        setError('Document not correct - The document is password-protected. Please remove the password and try again.')
      } else if (errorMessage.includes('Failed to extract text') || errorMessage.includes('Failed to load PDF')) {
        setError('Document not correct - Could not extract text from the document. The file might be image-based, corrupted, or password-protected.')
      } else if (errorMessage.includes('Unsupported file format')) {
        setError('Unsupported file format. Please upload PDF or DOCX files only.')
      } else {
        setError('Document not correct - Unable to process the files.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setPdf1File(null)
    setPdf2File(null)
    setMatchedLines([])
    setNotMatchedLines([])
    setError(null)
    if (fileInput1Ref.current) fileInput1Ref.current.value = ''
    if (fileInput2Ref.current) fileInput2Ref.current.value = ''
  }

  return (
    <>
      <main className="min-h-screen py-12 bg-gradient-to-br from-primary-50 via-cyan-50 to-blue-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Document Check (Compare 2 Documents)
            </h2>
          </div>

          {/* Upload Section - Simple Layout */}
          <div className="mb-6 space-y-4">
            {/* PDF 1 Upload */}
            <div>
               
              <input
                ref={fileInput1Ref}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => setPdf1File(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer mb-2"
              />
             
              {pdf1File && (
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {pdf1File.name}
                </p>
              )}
            </div>

            {/* PDF 2 Upload */}
            <div>
              <input
                ref={fileInput2Ref}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => setPdf2File(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer mb-2"
              />
              {pdf2File && (
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {pdf2File.name}
                </p>
              )}
              <p className="text-sm text-gray-500 my-1 mb-4 italic">
                  Supports: PDF, DOC, DOCX
                </p>
            </div>

            {/* Compare Button */}
            <div className="flex gap-4">
              <button
                onClick={handleCompare}
                disabled={loading || !pdf1File || !pdf2File}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Comparing...
                  </>
                ) : (
                  'Compare PDFs'
                )}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transform hover:scale-105 transition-all duration-200"
              >
                Reset
              </button>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Section - Two Side-by-Side Boxes */}
          <div className="flex flex-col lg:flex-row gap-6 mt-6">
            {/* Matched Content Box */}
            <div className="flex-1 bg-white border-2 border-gray-300 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600 text-xl">✅</span>
                Matching Content
                {matchedLines.length > 0 && (
                  <span className="ml-auto text-sm font-normal text-gray-500">
                    ({matchedLines.length} lines)
                  </span>
                )}
              </h3>
              <div id="matched" className="space-y-2">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="animate-spin h-6 w-6 mx-auto mb-2 text-cyan-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : matchedLines.length > 0 ? (
                  matchedLines.map((line, index) => (
                    <div
                      key={`matched-${index}-${line.substring(0, 20)}`}
                      className="p-2 text-sm text-green-700 bg-green-50 rounded border border-green-200 break-words"
                    >
                      {line}
                    </div>
                  ))
                ) : !loading && (pdf1File && pdf2File) ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No matching content found.
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No matching content yet. Upload PDFs and click Compare.
                  </div>
                )}
              </div>
            </div>

            {/* Not Matched Content Box */}
            <div className="flex-1 bg-white border-2 border-gray-300 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-red-600 text-xl">❌</span>
                Not Matching Content
                {notMatchedLines.length > 0 && (
                  <span className="ml-auto text-sm font-normal text-gray-500">
                    ({notMatchedLines.length} lines)
                  </span>
                )}
              </h3>
              <div id="notMatched" className="space-y-2">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="animate-spin h-6 w-6 mx-auto mb-2 text-cyan-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : notMatchedLines.length > 0 ? (
                  notMatchedLines.map((line, index) => (
                    <div
                      key={`notmatched-${index}-${line.substring(0, 20)}`}
                      className="p-2 text-sm text-red-700 bg-red-50 rounded border border-red-200 break-words"
                    >
                      {line}
                    </div>
                  ))
                ) : !loading && (pdf1File && pdf2File) ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    All content matches! No differences found.
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No differences found yet. Upload PDFs and click Compare.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}