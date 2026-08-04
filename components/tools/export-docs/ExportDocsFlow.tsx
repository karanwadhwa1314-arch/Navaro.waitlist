'use client'

import Link from 'next/link'
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type MouseEvent } from 'react'

import BillOfExchangeForm, { defaultBillOfExchangeState } from '@/components/tools/export-docs/bill-of-exchange/BillOfExchangeForm'
import type { BillOfExchangeState } from '@/components/tools/export-docs/bill-of-exchange/billOfExchangeTypes'
import BillOfLadingForm, { defaultBillOfLadingState } from '@/components/tools/export-docs/bill-of-lading/BillOfLadingForm'
import type { BillOfLadingState } from '@/components/tools/export-docs/bill-of-lading/billOfLadingTypes'

const DOC_OPTIONS = [
  'Bill of Exchange',
  'Bill of Lading',
  'CMR Carrier',
  'CMR Consignee',
  'Credit Note',
  'T-MEC',
  'Origin Certificate',
  'Bill of Leden Exchange',
] as const

type DocTemplateId = (typeof DOC_OPTIONS)[number]

type ModalPhase = null | 'select-set' | 'add-reference' | 'duplicate-shipment' | 'edit-reference'

export type DocumentSetRow = {
  id: string
  reference: string
  consignee: string
  destination: string
  createdAt: Date
  archived: boolean
}

export type SetFileRow = {
  id: string
  name: string
  kind: 'folder' | 'file'
  templateId?: DocTemplateId
  createdAt: Date
}

function newFileId(prefix = 'doc') {
  return `${prefix}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 10) : String(Date.now())}`
}

function isBillOfLadingFile(file: SetFileRow) {
  return file.templateId === 'Bill of Lading' || file.name === 'Bill of Lading'
}

function isBillOfExchangeFile(file: SetFileRow) {
  return file.templateId === 'Bill of Exchange' || file.name === 'Bill of Exchange'
}

function isEditableExportDoc(file: SetFileRow) {
  return file.kind === 'file' && (isBillOfLadingFile(file) || isBillOfExchangeFile(file))
}

function filesFromSelectedDocs(labels: string[]): SetFileRow[] {
  const createdAt = new Date()
  const docs: SetFileRow[] = labels.map((label) => ({
    id: newFileId('doc'),
    name: label,
    kind: 'file' as const,
    templateId: label as DocTemplateId,
    createdAt,
  }))
  return [{ id: newFileId('mf'), name: 'Master File', kind: 'folder', createdAt }, ...docs]
}

function formatCreated(d: Date) {
  const day = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleDateString('en-GB', { month: 'short' })
  const year = d.getFullYear()
  return `${day} ${month}, ${year}`
}

function IconUpload({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5 5 5M12 5v12" />
    </svg>
  )
}

function IconDocumentFile({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H8a2 2 0 00-2 2v16a2 2 0 002 2h8a2 2 0 002-2V7l-4-5z"
        fill="#E8E4DC"
        stroke="#64748B"
        strokeWidth="1.25"
      />
      <path d="M14 2v5h4" stroke="#64748B" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h4" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function defaultSetFileRows(): SetFileRow[] {
  const uid = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 10) : `t-${Date.now()}`
  const createdAt = new Date('2026-05-01')
  const u = uid()
  return [
    { id: `mf-${u}`, name: 'Master File', kind: 'folder', createdAt },
    { id: `ci-${u}-1`, name: 'Commercial invoice', kind: 'file', createdAt },
    { id: `ci-${u}-2`, name: 'Commercial invoice', kind: 'file', createdAt },
    { id: `ci-${u}-3`, name: 'Commercial invoice', kind: 'file', createdAt },
  ]
}

function IconFolder({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 7.5A2.5 2.5 0 015.5 5H9l2 2h7.5A2.5 2.5 0 0121 9.5v9a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 013 18.5v-11z"
        fill="#3B82F6"
      />
      <path d="M3 9.5h18v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 18.5v-9z" fill="#2563EB" fillOpacity="0.35" />
    </svg>
  )
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
    </svg>
  )
}

function IconDuplicate({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 8v8M8 12h8" />
    </svg>
  )
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-9 0h10" />
    </svg>
  )
}

function IconPencil({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5L14.732 3.732z" />
    </svg>
  )
}

function IconArchiveBox({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8m18 0l-1.4-2.8A2 2 0 0015.7 4H8.3a2 2 0 00-1.8 1.2L3 8m18 0H3m6 3h6" />
    </svg>
  )
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function IconDotsHorizontal({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="19" cy="12" r="1.75" />
    </svg>
  )
}

const hubCheckboxClass =
  'h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-slate-300 text-[#2563EB] accent-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/35 focus:ring-offset-0'

export default function ExportDocsFlow({ showBackLink }: { showBackLink?: boolean }) {
  const formId = useId()
  const [modal, setModal] = useState<ModalPhase>(null)
  const [documentSets, setDocumentSets] = useState<DocumentSetRow[]>([])
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(['Bill of Exchange', 'Bill of Lading', 'CMR Carrier', 'CMR Consignee']),
  )
  const [referenceName, setReferenceName] = useState('')
  const [duplicateSourceId, setDuplicateSourceId] = useState<string | null>(null)
  const [duplicateShipmentRef, setDuplicateShipmentRef] = useState('')
  const [editSourceId, setEditSourceId] = useState<string | null>(null)
  const [editReferenceInput, setEditReferenceInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [rowSelection, setRowSelection] = useState<Set<string>>(() => new Set())
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [bulkMoreOpen, setBulkMoreOpen] = useState(false)
  const [listFilter, setListFilter] = useState<'active' | 'archived'>('active')
  const [rowMenuAnchor, setRowMenuAnchor] = useState<null | { id: string; top: number; left: number }>(null)
  const [openSetId, setOpenSetId] = useState<string | null>(null)
  const [setFiles, setSetFiles] = useState<Record<string, SetFileRow[]>>({})
  const [fileRowMenu, setFileRowMenu] = useState<null | { setId: string; docId: string; top: number; left: number }>(null)
  const [fileSelection, setFileSelection] = useState<Set<string>>(() => new Set())
  const [editingDocId, setEditingDocId] = useState<string | null>(null)
  const [bolDataByDocId, setBolDataByDocId] = useState<Record<string, BillOfLadingState>>({})
  const [boeDataByDocId, setBoeDataByDocId] = useState<Record<string, BillOfExchangeState>>({})
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const fileSelectAllRef = useRef<HTMLInputElement>(null)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const selectedCount = selected.size
  const selectedLabels = useMemo(() => Array.from(selected), [selected])

  const filteredSets = useMemo(() => {
    const byStatus = documentSets.filter((r) => (listFilter === 'active' ? !r.archived : r.archived))
    const q = searchQuery.trim().toLowerCase()
    if (!q) return byStatus
    return byStatus.filter(
      (r) =>
        r.reference.toLowerCase().includes(q) ||
        r.consignee.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q),
    )
  }, [documentSets, searchQuery, listFilter])

  const filteredIds = useMemo(() => filteredSets.map((r) => r.id), [filteredSets])
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => rowSelection.has(id))
  const someFilteredSelected = filteredIds.some((id) => rowSelection.has(id))

  const activeSet = useMemo(() => documentSets.find((r) => r.id === openSetId) ?? null, [documentSets, openSetId])

  useEffect(() => {
    if (openSetId && !activeSet) {
      setOpenSetId(null)
      setFileRowMenu(null)
      setFileSelection(new Set())
      setEditingDocId(null)
      setSearchQuery('')
    }
  }, [openSetId, activeSet])

  const fileRowsForOpenSet = useMemo(() => {
    if (!openSetId) return []
    return setFiles[openSetId] ?? defaultSetFileRows()
  }, [openSetId, setFiles])

  const filteredFileRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return fileRowsForOpenSet
    return fileRowsForOpenSet.filter((f) => f.name.toLowerCase().includes(q))
  }, [fileRowsForOpenSet, searchQuery])

  const editingFile = useMemo(() => {
    if (!openSetId || !editingDocId) return null
    return fileRowsForOpenSet.find((f) => f.id === editingDocId) ?? null
  }, [openSetId, editingDocId, fileRowsForOpenSet])

  const bolFormValue = useMemo(() => {
    if (!editingDocId) return defaultBillOfLadingState()
    return bolDataByDocId[editingDocId] ?? defaultBillOfLadingState()
  }, [editingDocId, bolDataByDocId])

  const boeFormValue = useMemo(() => {
    if (!editingDocId) return defaultBillOfExchangeState()
    return boeDataByDocId[editingDocId] ?? defaultBillOfExchangeState()
  }, [editingDocId, boeDataByDocId])

  const showBolEditor = Boolean(
    openSetId && editingDocId && editingFile && isBillOfLadingFile(editingFile),
  )

  const showBoeEditor = Boolean(
    openSetId && editingDocId && editingFile && isBillOfExchangeFile(editingFile),
  )

  const showDocEditor = showBolEditor || showBoeEditor

  const editingDocTitle = editingFile
    ? isBillOfLadingFile(editingFile)
      ? 'Bill of Lading'
      : isBillOfExchangeFile(editingFile)
        ? 'Bill of Exchange'
        : editingFile.name
    : ''

  const fileFilteredIds = useMemo(() => filteredFileRows.map((f) => f.id), [filteredFileRows])
  const allFilesSelected =
    Boolean(openSetId) && fileFilteredIds.length > 0 && fileFilteredIds.every((id) => fileSelection.has(id))
  const someFilesSelected =
    Boolean(openSetId) && fileFilteredIds.some((id) => fileSelection.has(id)) && !allFilesSelected

  useEffect(() => {
    const el = fileSelectAllRef.current
    if (!el) return
    el.indeterminate = someFilesSelected && !allFilesSelected
  }, [someFilesSelected, allFilesSelected, openSetId])

  useEffect(() => {
    setFileSelection(new Set())
    setEditingDocId(null)
  }, [openSetId])

  useEffect(() => {
    const el = selectAllRef.current
    if (!el) return
    el.indeterminate = someFilteredSelected && !allFilteredSelected
  }, [someFilteredSelected, allFilteredSelected])

  useEffect(() => {
    const valid = new Set(documentSets.map((r) => r.id))
    setRowSelection((prev) => {
      const next = new Set<string>()
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id)
      })
      if (next.size === prev.size) {
        for (const id of Array.from(prev)) {
          if (!next.has(id)) return next
        }
        return prev
      }
      return next
    })
  }, [documentSets])

  const toggleDoc = useCallback((label: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }, [])

  const closeSelectModal = useCallback(() => {
    setModal(null)
  }, [])

  const onAddDocs = useCallback(() => {
    if (selectedCount === 0) return
    setModal('add-reference')
  }, [selectedCount])

  const openNewDocumentFlow = () => {
    setBulkMoreOpen(false)
    setRowMenuAnchor(null)
    setFileRowMenu(null)
    setModal('select-set')
    setSelected(new Set(['Bill of Exchange', 'Bill of Lading', 'CMR Carrier', 'CMR Consignee']))
  }

  const onContinueReference = useCallback(() => {
    const name = referenceName.trim()
    if (!name) return
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `set-${Date.now()}`
    setDocumentSets((prev) => [
      {
        id,
        reference: name,
        consignee: '',
        destination: '',
        createdAt: new Date(),
        archived: false,
      },
      ...prev,
    ])
    const newFiles = filesFromSelectedDocs(selectedLabels)
    setSetFiles((prev) => ({
      ...prev,
      [id]: newFiles,
    }))
    setReferenceName('')
    setModal(null)
    setRowSelection((prev) => new Set(prev).add(id))
    setOpenSetId(id)
    const bolFile = newFiles.find(isBillOfLadingFile)
    const boeFile = newFiles.find(isBillOfExchangeFile)
    if (bolFile) {
      setEditingDocId(bolFile.id)
      setBolDataByDocId((prev) => ({ ...prev, [bolFile.id]: defaultBillOfLadingState() }))
    } else if (boeFile) {
      setEditingDocId(boeFile.id)
      setBoeDataByDocId((prev) => ({ ...prev, [boeFile.id]: defaultBillOfExchangeState() }))
    }
  }, [referenceName, selectedLabels])

  useEffect(() => {
    if (modal) {
      setRowMenuAnchor(null)
      setFileRowMenu(null)
    }
  }, [modal])

  const closeRowMenu = useCallback(() => {
    setRowMenuAnchor(null)
  }, [])

  const closeFileRowMenu = useCallback(() => {
    setFileRowMenu(null)
  }, [])

  const openIntoSet = (setId: string) => {
    setRowMenuAnchor(null)
    setFileRowMenu(null)
    setBulkMoreOpen(false)
    setFilterMenuOpen(false)
    setOpenSetId(setId)
    setSetFiles((prev) => (prev[setId] ? prev : { ...prev, [setId]: defaultSetFileRows() }))
    setSearchQuery('')
  }

  const closeIntoSet = () => {
    setOpenSetId(null)
    setFileRowMenu(null)
    setFileSelection(new Set())
    setEditingDocId(null)
    setSearchQuery('')
  }

  const openDocumentEditor = (file: SetFileRow) => {
    if (file.kind !== 'file') return
    setFileRowMenu(null)
    setFileSelection(new Set())
    if (isBillOfLadingFile(file)) {
      setEditingDocId(file.id)
      setBolDataByDocId((prev) =>
        prev[file.id] ? prev : { ...prev, [file.id]: defaultBillOfLadingState() },
      )
      return
    }
    if (isBillOfExchangeFile(file)) {
      setEditingDocId(file.id)
      setBoeDataByDocId((prev) =>
        prev[file.id] ? prev : { ...prev, [file.id]: defaultBillOfExchangeState() },
      )
    }
  }

  const closeDocumentEditor = () => {
    setEditingDocId(null)
  }

  const updateBolForm = useCallback((next: BillOfLadingState) => {
    if (!editingDocId) return
    setBolDataByDocId((prev) => ({ ...prev, [editingDocId]: next }))
  }, [editingDocId])

  const updateBoeForm = useCallback((next: BillOfExchangeState) => {
    if (!editingDocId) return
    setBoeDataByDocId((prev) => ({ ...prev, [editingDocId]: next }))
  }, [editingDocId])

  const toggleSelectAllFiltered = () => {
    setRowSelection((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        filteredIds.forEach((id) => next.delete(id))
      } else {
        filteredIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const downloadRowsByIds = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      const rows = documentSets.filter((r) => ids.includes(r.id))
      const payload = rows.map((r) => ({
        reference: r.reference,
        consignee: r.consignee,
        destination: r.destination,
        dateCreated: formatCreated(r.createdAt),
      }))
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `document-sets-${rows.length}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
    [documentSets],
  )

  const handleDownloadSet = () => {
    if (rowSelection.size === 0) return
    setBulkMoreOpen(false)
    downloadRowsByIds(Array.from(rowSelection))
  }

  const openRowMenuFromButton = (e: MouseEvent<HTMLButtonElement>, rowId: string) => {
    e.stopPropagation()
    setBulkMoreOpen(false)
    setFileRowMenu(null)
    const rect = e.currentTarget.getBoundingClientRect()
    const menuWidth = 200
    const vw = typeof window !== 'undefined' ? window.innerWidth : 800
    const left = Math.max(8, Math.min(rect.right - menuWidth, vw - menuWidth - 8))
    const top = rect.bottom + 4
    setRowMenuAnchor((cur) => (cur?.id === rowId ? null : { id: rowId, top, left }))
  }

  const rowMenuDownloadOne = () => {
    if (!rowMenuAnchor) return
    downloadRowsByIds([rowMenuAnchor.id])
    closeRowMenu()
  }

  const rowMenuDuplicateOne = () => {
    if (!rowMenuAnchor) return
    const source = documentSets.find((r) => r.id === rowMenuAnchor.id)
    if (!source) return
    closeRowMenu()
    setDuplicateSourceId(source.id)
    setDuplicateShipmentRef(`${source.reference} (copy)`)
    setModal('duplicate-shipment')
  }

  const rowMenuEditOne = () => {
    if (!rowMenuAnchor) return
    const source = documentSets.find((r) => r.id === rowMenuAnchor.id)
    if (!source) return
    closeRowMenu()
    setEditSourceId(source.id)
    setEditReferenceInput(source.reference)
    setModal('edit-reference')
  }

  const rowMenuArchiveOne = () => {
    if (!rowMenuAnchor) return
    const id = rowMenuAnchor.id
    closeRowMenu()
    setDocumentSets((prev) => prev.map((r) => (r.id === id ? { ...r, archived: true } : r)))
  }

  const rowMenuDeleteOne = () => {
    if (!rowMenuAnchor) return
    const id = rowMenuAnchor.id
    closeRowMenu()
    if (openSetId === id) {
      closeIntoSet()
    }
    setDocumentSets((prev) => prev.filter((r) => r.id !== id))
    setRowSelection((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const openFileMenuFromButton = (e: MouseEvent<HTMLButtonElement>, setId: string, docId: string) => {
    e.stopPropagation()
    setBulkMoreOpen(false)
    setRowMenuAnchor(null)
    const rect = e.currentTarget.getBoundingClientRect()
    const menuWidth = 200
    const vw = typeof window !== 'undefined' ? window.innerWidth : 800
    const left = Math.max(8, Math.min(rect.right - menuWidth, vw - menuWidth - 8))
    const top = rect.bottom + 4
    setFileRowMenu((cur) => (cur?.setId === setId && cur?.docId === docId ? null : { setId, docId, top, left }))
  }

  const handleBulkFileRemove = () => {
    if (!openSetId || fileSelection.size === 0) return
    setBulkMoreOpen(false)
    const sid = openSetId
    setSetFiles((prev) => ({
      ...prev,
      [sid]: (prev[sid] ?? []).filter((f) => !fileSelection.has(f.id)),
    }))
    setFileSelection(new Set())
  }

  const handleToolbarDownload = () => {
    setBulkMoreOpen(false)
    if (openSetId) {
      if (fileSelection.size === 0) return
      const rows = fileRowsForOpenSet.filter((f) => fileSelection.has(f.id))
      const payload = rows.map((f) => ({
        name: f.name,
        kind: f.kind,
        date: formatCreated(f.createdAt),
      }))
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `documents-${rows.length}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      handleDownloadSet()
    }
  }

  const handleToolbarUploadClick = () => {
    if (!openSetId) return
    uploadInputRef.current?.click()
  }

  const onUploadInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!openSetId) return
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    setSetFiles((prev) => {
      const cur = prev[openSetId] ?? defaultSetFileRows()
      const added: SetFileRow[] = files.map((file) => ({
        id: `up-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 12) : String(Date.now())}-${file.name.slice(0, 24)}`,
        name: file.name,
        kind: 'file',
        createdAt: new Date(),
      }))
      return { ...prev, [openSetId]: [...added, ...cur] }
    })
  }

  const handleToolbarNewDocument = () => {
    setRowMenuAnchor(null)
    setFileRowMenu(null)
    setBulkMoreOpen(false)
    if (openSetId) {
      const sid = openSetId
      setSetFiles((prev) => {
        const cur = prev[sid] ?? defaultSetFileRows()
        const nid = `ci-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 10) : String(Date.now())}`
        const row: SetFileRow = {
          id: nid,
          name: 'Bill of Lading',
          kind: 'file',
          templateId: 'Bill of Lading',
          createdAt: new Date(),
        }
        setEditingDocId(nid)
        setBolDataByDocId((prevBol) =>
          prevBol[nid] ? prevBol : { ...prevBol, [nid]: defaultBillOfLadingState() },
        )
        return { ...prev, [sid]: [row, ...cur] }
      })
    } else {
      setModal('select-set')
      setSelected(new Set(['Bill of Exchange', 'Bill of Lading', 'CMR Carrier', 'CMR Consignee']))
    }
  }

  const toggleSelectAllFiles = () => {
    setFileSelection((prev) => {
      const next = new Set(prev)
      if (allFilesSelected) {
        fileFilteredIds.forEach((id) => next.delete(id))
      } else {
        fileFilteredIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const toggleFileRowSelect = (fileId: string) => {
    setFileRowMenu(null)
    setFileSelection((prev) => {
      const next = new Set(prev)
      if (next.has(fileId)) next.delete(fileId)
      else next.add(fileId)
      return next
    })
  }

  const fileMenuDownloadOne = () => {
    if (!fileRowMenu) return
    const { setId, docId } = fileRowMenu
    const row = (setFiles[setId] ?? []).find((f) => f.id === docId)
    if (!row) {
      closeFileRowMenu()
      return
    }
    closeFileRowMenu()
    const blob = new Blob(
      [JSON.stringify({ name: row.name, kind: row.kind, date: formatCreated(row.createdAt) }, null, 2)],
      { type: 'application/json' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${row.name.replace(/[^\w.-]+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const fileMenuDuplicateOne = () => {
    if (!fileRowMenu) return
    const { setId, docId } = fileRowMenu
    const row = (setFiles[setId] ?? []).find((f) => f.id === docId)
    closeFileRowMenu()
    if (!row) return
    const nid = `copy-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 10) : String(Date.now())}`
    const copy: SetFileRow = {
      ...row,
      id: nid,
      name: `${row.name} (copy)`,
      createdAt: new Date(),
    }
    setSetFiles((prev) => {
      const cur = prev[setId] ?? []
      const idx = cur.findIndex((f) => f.id === docId)
      const next = [...cur]
      next.splice(Math.max(0, idx + 1), 0, copy)
      return { ...prev, [setId]: next }
    })
  }

  const fileMenuDeleteOne = () => {
    if (!fileRowMenu) return
    const { setId, docId } = fileRowMenu
    closeFileRowMenu()
    setSetFiles((prev) => {
      const cur = prev[setId] ?? []
      return { ...prev, [setId]: cur.filter((f) => f.id !== docId) }
    })
    setFileSelection((prev) => {
      const next = new Set(prev)
      next.delete(docId)
      return next
    })
  }

  const fileMenuEditOne = () => {
    if (!fileRowMenu) return
    const { setId, docId } = fileRowMenu
    const row = (setFiles[setId] ?? []).find((f) => f.id === docId)
    closeFileRowMenu()
    if (!row) return
    if (isEditableExportDoc(row)) {
      openDocumentEditor(row)
      return
    }
    const nextName = typeof window !== 'undefined' ? window.prompt('Document name', row.name) : null
    if (!nextName || !nextName.trim()) return
    setSetFiles((prev) => ({
      ...prev,
      [setId]: (prev[setId] ?? []).map((f) => (f.id === docId ? { ...f, name: nextName.trim() } : f)),
    }))
  }

  const fileMenuArchiveOne = () => {
    if (!fileRowMenu) return
    const { setId, docId } = fileRowMenu
    closeFileRowMenu()
    setSetFiles((prev) => ({
      ...prev,
      [setId]: (prev[setId] ?? []).filter((f) => f.id !== docId),
    }))
    setFileSelection((prev) => {
      const next = new Set(prev)
      next.delete(docId)
      return next
    })
  }

  const handleDuplicate = () => {
    if (rowSelection.size !== 1) return
    setBulkMoreOpen(false)
    setRowMenuAnchor(null)
    setFileRowMenu(null)
    const sourceId = Array.from(rowSelection)[0]
    const source = documentSets.find((r) => r.id === sourceId)
    if (!source) return
    setDuplicateSourceId(sourceId)
    setDuplicateShipmentRef(`${source.reference} (copy)`)
    setModal('duplicate-shipment')
  }

  const closeDuplicateModal = () => {
    setModal(null)
    setDuplicateSourceId(null)
    setDuplicateShipmentRef('')
  }

  const confirmDuplicateShipment = () => {
    const name = duplicateShipmentRef.trim()
    if (!name || !duplicateSourceId) return
    const source = documentSets.find((r) => r.id === duplicateSourceId)
    if (!source) {
      closeDuplicateModal()
      return
    }
    const newId =
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `set-${Date.now()}`
    setDocumentSets((prev) => [
      {
        ...source,
        id: newId,
        reference: name,
        createdAt: new Date(),
        archived: false,
      },
      ...prev,
    ])
    closeDuplicateModal()
    setRowSelection(new Set([newId]))
  }

  const openEditReferenceModal = () => {
    if (rowSelection.size !== 1) return
    const sourceId = Array.from(rowSelection)[0]
    const source = documentSets.find((r) => r.id === sourceId)
    if (!source) return
    setEditSourceId(sourceId)
    setEditReferenceInput(source.reference)
    setModal('edit-reference')
    setBulkMoreOpen(false)
    setRowMenuAnchor(null)
    setFileRowMenu(null)
  }

  const handleDelete = () => {
    if (rowSelection.size === 0) return
    if (openSetId && rowSelection.has(openSetId)) {
      closeIntoSet()
    }
    setDocumentSets((prev) => prev.filter((r) => !rowSelection.has(r.id)))
    setRowSelection(new Set())
    setBulkMoreOpen(false)
    setRowMenuAnchor(null)
    setFileRowMenu(null)
  }

  const handleArchiveSelected = () => {
    if (rowSelection.size === 0) return
    setDocumentSets((prev) =>
      prev.map((r) => (rowSelection.has(r.id) ? { ...r, archived: true } : r)),
    )
    setRowSelection(new Set())
    setBulkMoreOpen(false)
    setRowMenuAnchor(null)
    setFileRowMenu(null)
  }

  const closeEditReferenceModal = () => {
    setModal(null)
    setEditSourceId(null)
    setEditReferenceInput('')
  }

  const confirmEditReference = () => {
    const name = editReferenceInput.trim()
    if (!name || !editSourceId) return
    setDocumentSets((prev) =>
      prev.map((r) => (r.id === editSourceId ? { ...r, reference: name } : r)),
    )
    closeEditReferenceModal()
  }

  const toggleRowSelect = (id: string) => {
    setRowMenuAnchor(null)
    setFileRowMenu(null)
    setRowSelection((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const showWelcome = documentSets.length === 0
  const toolbarMenusHidden = rowMenuAnchor !== null || fileRowMenu !== null

  return (
    <div className="relative flex min-h-[min(520px,calc(100dvh-11rem))] w-full flex-col">
      {showBackLink && (
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navaro-forest/80 underline-offset-4 hover:text-navaro-forest hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>
      )}

      {showWelcome ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
          <h1 className="max-w-lg text-2xl font-bold tracking-tight text-navaro-forest sm:text-[1.75rem]">
            Export documentation in a flash
          </h1>
          <p className="mt-3 max-w-md text-base text-navaro-forest/55">
            Rapidly create export documents and manage them here
          </p>
          <button
            type="button"
            onClick={openNewDocumentFlow}
            className="mt-8 w-full max-w-xs rounded-2xl bg-[#C686F0] px-6 py-3.5 text-base font-semibold text-navaro-forest shadow-md transition hover:brightness-105 focus-visible:outline focus-visible:ring-2 focus-visible:ring-navaro-forest/25"
          >
            + New Document Set
          </button>
        </div>
      ) : (
        <div className="flex w-full flex-1 flex-col gap-6 rounded-2xl border border-navaro-forest/10 bg-[#FFFBF0] p-5 text-navaro-forest shadow-sm sm:p-8">
          <input ref={uploadInputRef} type="file" multiple className="hidden" onChange={onUploadInputChange} aria-hidden />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              {openSetId && activeSet ? (
                <nav className="flex flex-wrap items-center gap-2 text-lg font-bold tracking-tight text-navaro-forest lg:text-[1.35rem]" aria-label="Breadcrumb">
                  <button
                    type="button"
                    onClick={closeIntoSet}
                    className="font-semibold text-navaro-forest/60 transition hover:text-navaro-forest hover:underline"
                  >
                    Export Docs
                  </button>
                  <span className="text-navaro-forest/35" aria-hidden>
                    {'>'}
                  </span>
                  {showDocEditor ? (
                    <>
                      <button
                        type="button"
                        onClick={closeDocumentEditor}
                        className="truncate font-semibold text-navaro-forest/60 transition hover:text-navaro-forest hover:underline"
                      >
                        {activeSet.reference}
                      </button>
                      <span className="text-navaro-forest/35" aria-hidden>
                        {'>'}
                      </span>
                      <span className="truncate">{editingDocTitle}</span>
                    </>
                  ) : (
                    <span className="truncate">{activeSet.reference}</span>
                  )}
                </nav>
              ) : (
                <h1 className="text-2xl font-bold tracking-tight lg:text-[1.65rem]">Export Docs</h1>
              )}
            </div>
            <div className="relative w-full lg:max-w-md">
              <label htmlFor={`${formId}-search`} className="sr-only">
                {openSetId ? 'Search documents' : 'Search document sets'}
              </label>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navaro-forest/40" aria-hidden>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </span>
              <input
                id={`${formId}-search`}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={openSetId ? 'Search documents' : 'Search document sets'}
                className="w-full rounded-xl border border-navaro-forest/12 bg-white py-2.5 pl-10 pr-4 text-sm text-navaro-forest placeholder:text-navaro-forest/40 focus:border-navaro-forest/25 focus:outline-none focus:ring-2 focus:ring-navaro-forest/10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setRowMenuAnchor(null)
                  setFileRowMenu(null)
                  setFilterMenuOpen((o) => !o)
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-navaro-forest/18 bg-white px-4 py-2.5 text-sm font-semibold text-navaro-forest shadow-sm transition hover:bg-[#f4f7f4]"
                aria-expanded={filterMenuOpen}
                aria-haspopup="listbox"
              >
                {listFilter === 'active' ? 'Active' : 'Archived'}
                <svg className="h-4 w-4 text-navaro-forest/55" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {filterMenuOpen && (
                <>
                  <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Close menu" onClick={() => setFilterMenuOpen(false)} />
                  <ul
                    role="listbox"
                    className="absolute left-0 top-full z-20 mt-1 min-w-[10rem] rounded-xl border border-navaro-forest/10 bg-white py-1 shadow-lg"
                  >
                    <li>
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm font-medium text-navaro-forest hover:bg-[#f4f7f4]"
                        onClick={() => {
                          setListFilter('active')
                          setFilterMenuOpen(false)
                        }}
                      >
                        Active
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm text-navaro-forest/60 hover:bg-[#eef2ef]"
                        onClick={() => {
                          setListFilter('archived')
                          setFilterMenuOpen(false)
                        }}
                      >
                        Archived
                      </button>
                    </li>
                  </ul>
                </>
              )}
            </div>
            <div className="relative flex flex-wrap items-center justify-end gap-2">
              {!toolbarMenusHidden && (
                <>
                  <button
                    type="button"
                    disabled={!openSetId}
                    title={!openSetId ? 'Open a document set to upload files' : undefined}
                    onClick={() => {
                      setBulkMoreOpen(false)
                      setRowMenuAnchor(null)
                      setFileRowMenu(null)
                      handleToolbarUploadClick()
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-navaro-forest/20 bg-white px-3 py-2 text-sm font-semibold text-navaro-forest shadow-sm transition hover:bg-[#f4f7f4] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <IconUpload />
                    Upload files
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRowMenuAnchor(null)
                      setFileRowMenu(null)
                      setBulkMoreOpen(false)
                      handleToolbarNewDocument()
                    }}
                    className="inline-flex items-center justify-center rounded-xl bg-[#9D59D1] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
                  >
                    New Document Set +
                  </button>
                  <button
                    type="button"
                    disabled={openSetId ? fileSelection.size === 0 : rowSelection.size === 0}
                    onClick={() => {
                      setBulkMoreOpen(false)
                      setRowMenuAnchor(null)
                      setFileRowMenu(null)
                      handleToolbarDownload()
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-navaro-forest/20 bg-white px-3 py-2 text-sm font-semibold text-navaro-forest shadow-sm transition hover:bg-[#f4f7f4] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <IconDownload />
                    Download set
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setRowMenuAnchor(null)
                        setFileRowMenu(null)
                        setBulkMoreOpen((o) => !o)
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-navaro-forest/20 bg-white px-3 py-2 text-sm font-semibold text-navaro-forest shadow-sm transition hover:bg-[#f4f7f4]"
                      aria-expanded={bulkMoreOpen}
                      aria-haspopup="menu"
                    >
                      More
                      <IconChevronDown className={`shrink-0 transition-transform ${bulkMoreOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {bulkMoreOpen && (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-[15] cursor-default"
                          aria-label="Close menu"
                          onClick={() => setBulkMoreOpen(false)}
                        />
                        <ul
                          role="menu"
                          className="absolute right-0 top-full z-[25] mt-1 min-w-[14rem] rounded-xl border border-navaro-forest/10 bg-white py-1 shadow-lg ring-1 ring-black/5"
                        >
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              disabled={Boolean(openSetId) || rowSelection.size !== 1}
                              onClick={openEditReferenceModal}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-navaro-forest transition enabled:hover:bg-[#f4f7f4] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <IconPencil className="shrink-0 text-navaro-forest/70" />
                              Edit reference
                            </button>
                          </li>
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              disabled={Boolean(openSetId) || rowSelection.size !== 1}
                              title={
                                openSetId
                                  ? 'Duplicate is available from the document list'
                                  : rowSelection.size > 1
                                    ? 'Select only one document set to duplicate'
                                    : undefined
                              }
                              onClick={() => {
                                setBulkMoreOpen(false)
                                handleDuplicate()
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-navaro-forest transition enabled:hover:bg-[#f4f7f4] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <IconDuplicate className="shrink-0 text-navaro-forest/70" />
                              Duplicate
                            </button>
                          </li>
                          {!openSetId && (
                            <li role="none">
                              <button
                                type="button"
                                role="menuitem"
                                disabled={rowSelection.size === 0}
                                onClick={handleArchiveSelected}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-navaro-forest transition enabled:hover:bg-[#f4f7f4] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <IconArchiveBox className="shrink-0 text-navaro-forest/70" />
                                Archive
                              </button>
                            </li>
                          )}
                          <li role="none" className="border-t border-navaro-forest/8">
                            <button
                              type="button"
                              role="menuitem"
                              disabled={openSetId ? fileSelection.size === 0 : rowSelection.size === 0}
                              onClick={() => {
                                setBulkMoreOpen(false)
                                if (openSetId) handleBulkFileRemove()
                                else handleDelete()
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-700 transition enabled:hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <IconTrash className="shrink-0" />
                              {openSetId ? 'Remove selected' : 'Delete'}
                            </button>
                          </li>
                        </ul>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {showBolEditor ? (
            <div className="rounded-xl border border-navaro-forest/10 bg-white/90 p-4 shadow-sm sm:p-6">
              <BillOfLadingForm value={bolFormValue} onChange={updateBolForm} onBack={closeDocumentEditor} />
            </div>
          ) : showBoeEditor ? (
            <div className="rounded-xl border border-navaro-forest/10 bg-white/90 p-4 shadow-sm sm:p-6">
              <BillOfExchangeForm value={boeFormValue} onChange={updateBoeForm} onBack={closeDocumentEditor} />
            </div>
          ) : (
          <div className="overflow-hidden rounded-xl border border-navaro-forest/10 bg-white/70 shadow-sm">
            <div className="overflow-x-auto">
              {openSetId && activeSet ? (
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-navaro-forest/10 bg-[#f7faf8]">
                      <th className="w-12 px-3 py-3" scope="col">
                        <input
                          ref={fileSelectAllRef}
                          type="checkbox"
                          checked={allFilesSelected}
                          onChange={toggleSelectAllFiles}
                          className={hubCheckboxClass}
                          aria-label="Select all documents in view"
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold text-navaro-forest" scope="col">
                        <span className="inline-flex items-center gap-1">
                          Document Name
                          <svg className="h-3.5 w-3.5 text-navaro-forest/45" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </th>
                      <th className="px-4 py-3 font-semibold text-navaro-forest" scope="col">
                        Date
                      </th>
                      <th className="w-14 px-3 py-3" scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFileRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-navaro-forest/50">
                          {searchQuery.trim() ? 'No documents match your search.' : 'No documents in this set.'}
                        </td>
                      </tr>
                    ) : (
                      filteredFileRows.map((file, index) => {
                        const stripe = index % 2 === 0 ? 'bg-[#eef4f0]/55' : 'bg-white/90'
                        const checked = fileSelection.has(file.id)
                        const rowBg = checked ? 'bg-[#d8e6dc]/90' : stripe
                        return (
                          <tr
                            key={file.id}
                            className={`border-b border-navaro-forest/[0.07] last:border-0 ${rowBg}`}
                          >
                            <td className="px-3 py-3 align-middle">
                              <input
                                type="checkbox"
                                checked={fileSelection.has(file.id)}
                                onChange={() => toggleFileRowSelect(file.id)}
                                className={hubCheckboxClass}
                                aria-label={`Select ${file.name}`}
                              />
                            </td>
                            <td className="px-4 py-3 align-middle">
                              {file.kind === 'file' && isEditableExportDoc(file) ? (
                                <button
                                  type="button"
                                  onClick={() => openDocumentEditor(file)}
                                  className="inline-flex max-w-full items-center gap-2 text-left font-medium text-navaro-forest underline-offset-2 transition hover:underline"
                                >
                                  <IconDocumentFile className="shrink-0" />
                                  <span className="truncate">{file.name}</span>
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-2 font-medium text-navaro-forest">
                                  {file.kind === 'folder' ? (
                                    <IconFolder className="shrink-0" />
                                  ) : (
                                    <IconDocumentFile className="shrink-0" />
                                  )}
                                  {file.name}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 align-middle tabular-nums text-navaro-forest/80">
                              {formatCreated(file.createdAt)}
                            </td>
                            <td className="px-2 py-3 align-middle text-right">
                              <button
                                type="button"
                                aria-expanded={
                                  fileRowMenu?.docId === file.id && fileRowMenu?.setId === openSetId
                                }
                                aria-haspopup="menu"
                                onClick={(e) => openFileMenuFromButton(e, openSetId, file.id)}
                                className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-navaro-forest/10 bg-slate-200/75 text-navaro-forest/60 shadow-sm transition hover:bg-slate-200 hover:text-navaro-forest ${
                                  fileRowMenu?.docId === file.id && fileRowMenu?.setId === openSetId
                                    ? 'ring-2 ring-navaro-forest/25'
                                    : ''
                                }`}
                                aria-label={`More actions for ${file.name}`}
                              >
                                <IconDotsHorizontal className="h-[17px] w-[17px]" />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-navaro-forest/10 bg-[#f7faf8]">
                      <th className="w-12 px-3 py-3" scope="col">
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={toggleSelectAllFiltered}
                          className={hubCheckboxClass}
                          aria-label="Select all document sets in view"
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold text-navaro-forest" scope="col">
                        Reference
                      </th>
                      <th className="px-4 py-3 font-semibold text-navaro-forest" scope="col">
                        Consignee
                      </th>
                      <th className="px-4 py-3 font-semibold text-navaro-forest" scope="col">
                        Destination
                      </th>
                      <th className="px-4 py-3 font-semibold text-navaro-forest" scope="col">
                        <span className="inline-flex items-center gap-1">
                          Date Created
                          <svg className="h-3.5 w-3.5 text-navaro-forest/45" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </th>
                      <th className="w-14 px-3 py-3" scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-navaro-forest/50">
                          {searchQuery.trim()
                            ? 'No document sets match your search.'
                            : listFilter === 'active'
                              ? 'No active document sets.'
                              : 'No archived document sets.'}
                        </td>
                      </tr>
                    ) : (
                      filteredSets.map((row, index) => {
                        const checked = rowSelection.has(row.id)
                        const stripe = index % 2 === 0 ? 'bg-[#eef4f0]/55' : 'bg-white/90'
                        const rowBg = checked ? 'bg-[#d8e6dc]/90' : stripe
                        return (
                          <tr
                            key={row.id}
                            className={`border-b border-navaro-forest/[0.07] last:border-0 ${rowBg}`}
                          >
                            <td className="px-3 py-3 align-middle">
                              <input
                                type="checkbox"
                                checked={rowSelection.has(row.id)}
                                onChange={() => toggleRowSelect(row.id)}
                                className={hubCheckboxClass}
                                aria-label={`Select ${row.reference}`}
                              />
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <button
                                type="button"
                                onClick={() => openIntoSet(row.id)}
                                className="inline-flex max-w-full items-center gap-2 text-left font-medium text-navaro-forest underline-offset-2 transition hover:text-navaro-forest hover:underline"
                              >
                                <IconFolder className="shrink-0" />
                                <span className="truncate">{row.reference}</span>
                              </button>
                            </td>
                            <td className="px-4 py-3 align-middle text-navaro-forest/45">{row.consignee || '—'}</td>
                            <td className="px-4 py-3 align-middle text-navaro-forest/45">{row.destination || '—'}</td>
                            <td className="px-4 py-3 align-middle">
                              <span className="inline-flex items-center gap-2 tabular-nums text-navaro-forest/80">
                                {formatCreated(row.createdAt)}
                                <span
                                  className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ring-1 ${
                                    row.archived
                                      ? 'bg-navaro-forest/25 ring-navaro-forest/10'
                                      : 'bg-[#FACC15] ring-yellow-200/80'
                                  }`}
                                  title={row.archived ? 'Archived' : 'Active'}
                                  aria-hidden
                                />
                              </span>
                            </td>
                            <td className="px-2 py-3 align-middle text-right">
                              <button
                                type="button"
                                aria-expanded={rowMenuAnchor?.id === row.id}
                                aria-haspopup="menu"
                                onClick={(e) => openRowMenuFromButton(e, row.id)}
                                className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-navaro-forest/10 bg-slate-200/75 text-navaro-forest/60 shadow-sm transition hover:bg-slate-200 hover:text-navaro-forest ${
                                  rowMenuAnchor?.id === row.id ? 'ring-2 ring-navaro-forest/25' : ''
                                }`}
                                aria-label={`More actions for ${row.reference}`}
                              >
                                <IconDotsHorizontal className="h-[17px] w-[17px]" />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          )}
        </div>
      )}

      {rowMenuAnchor && (
        <>
          <div className="fixed inset-0 z-[60]" aria-hidden onClick={closeRowMenu} />
          <ul
            role="menu"
            style={{ top: rowMenuAnchor.top, left: rowMenuAnchor.left }}
            className="fixed z-[70] min-w-[200px] rounded-lg border-2 border-navaro-forest/25 bg-white py-1 shadow-xl"
          >
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={rowMenuEditOne}
                className="flex w-full items-center gap-3 bg-[#FEF9C7]/90 px-3 py-2.5 text-left text-sm font-medium text-navaro-forest transition hover:bg-[#FEF08A]/90"
              >
                <IconPencil className="shrink-0 text-navaro-forest/70" />
                Edit reference
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={rowMenuDownloadOne}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-navaro-forest transition hover:bg-[#f4f7f4]"
              >
                <IconDownload className="shrink-0 text-navaro-forest/70" />
                Download set
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={rowMenuDuplicateOne}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-navaro-forest transition hover:bg-[#f4f7f4]"
              >
                <IconDuplicate className="shrink-0 text-navaro-forest/70" />
                Duplicate
              </button>
            </li>
            <li role="none" className="border-t border-navaro-forest/15">
              <button
                type="button"
                role="menuitem"
                onClick={rowMenuArchiveOne}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-navaro-forest transition hover:bg-[#f4f7f4]"
              >
                <IconArchiveBox className="shrink-0 text-navaro-forest/70" />
                Archive
              </button>
            </li>
            <li role="none" className="border-t border-navaro-forest/15">
              <button
                type="button"
                role="menuitem"
                onClick={rowMenuDeleteOne}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                <IconTrash className="shrink-0" />
                Delete
              </button>
            </li>
          </ul>
        </>
      )}

      {fileRowMenu && (
        <>
          <div className="fixed inset-0 z-[60]" aria-hidden onClick={closeFileRowMenu} />
          <ul
            role="menu"
            style={{ top: fileRowMenu.top, left: fileRowMenu.left }}
            className="fixed z-[70] min-w-[200px] rounded-lg border-2 border-navaro-forest/25 bg-white py-1 shadow-xl"
          >
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={fileMenuEditOne}
                className="flex w-full items-center gap-3 bg-[#FEF9C7]/90 px-3 py-2.5 text-left text-sm font-medium text-navaro-forest transition hover:bg-[#FEF08A]/90"
              >
                <IconPencil className="shrink-0 text-navaro-forest/70" />
                {(() => {
                  const row = fileRowMenu
                    ? (setFiles[fileRowMenu.setId] ?? []).find((f) => f.id === fileRowMenu.docId)
                    : null
                  return row && isEditableExportDoc(row) ? 'Edit document' : 'Rename'
                })()}
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={fileMenuDownloadOne}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-navaro-forest transition hover:bg-[#f4f7f4]"
              >
                <IconDownload className="shrink-0 text-navaro-forest/70" />
                Download
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={fileMenuDuplicateOne}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-navaro-forest transition hover:bg-[#f4f7f4]"
              >
                <IconDuplicate className="shrink-0 text-navaro-forest/70" />
                Duplicate
              </button>
            </li>
            <li role="none" className="border-t border-navaro-forest/15">
              <button
                type="button"
                role="menuitem"
                onClick={fileMenuArchiveOne}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-navaro-forest transition hover:bg-[#f4f7f4]"
              >
                <IconArchiveBox className="shrink-0 text-navaro-forest/70" />
                Archive
              </button>
            </li>
            <li role="none" className="border-t border-navaro-forest/15">
              <button
                type="button"
                role="menuitem"
                onClick={fileMenuDeleteOne}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                <IconTrash className="shrink-0" />
                Delete
              </button>
            </li>
          </ul>
        </>
      )}

      {modal === 'select-set' && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navaro-forest/25 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={closeSelectModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${formId}-select-title`}
            className="flex max-h-[min(520px,85vh)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-navaro-forest/10 bg-white shadow-[0_20px_50px_rgba(0,45,45,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex shrink-0 items-center justify-between border-b border-navaro-forest/10 px-5 py-4">
              <h2 id={`${formId}-select-title`} className="text-lg font-semibold text-navaro-forest">
                Select Document Set
              </h2>
              <button
                type="button"
                onClick={closeSelectModal}
                className="rounded-lg p-2 text-navaro-forest/45 transition hover:bg-navaro-cream hover:text-navaro-forest"
                aria-label="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-navaro-forest/50 [&::-webkit-scrollbar-track]:bg-navaro-forest/8 [&::-webkit-scrollbar]:w-2">
              <ul className="space-y-0.5">
                {DOC_OPTIONS.map((label) => {
                  const on = selected.has(label)
                  return (
                    <li key={label}>
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition ${
                          on ? 'bg-navaro-cream/80' : 'hover:bg-navaro-cream/50'
                        }`}
                      >
                        <input type="checkbox" checked={on} onChange={() => toggleDoc(label)} className="sr-only" />
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs font-bold ${
                            on
                              ? 'border-navaro-forest bg-navaro-forest text-white'
                              : 'border-navaro-forest/25 bg-white text-transparent'
                          }`}
                          aria-hidden
                        >
                          ✓
                        </span>
                        <span className={`text-left text-sm font-medium ${on ? 'text-navaro-forest' : 'text-navaro-forest/35'}`}>
                          {label}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
            <footer className="shrink-0 border-t border-navaro-forest/10 p-4">
              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={onAddDocs}
                className="w-full rounded-2xl bg-[#C686F0] px-4 py-3.5 text-sm font-semibold text-navaro-forest shadow-md transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:ring-2 focus-visible:ring-navaro-forest/20"
              >
                + Add {selectedCount} Doc{selectedCount === 1 ? '' : 's'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {modal === 'add-reference' && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-navaro-forest/25 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${formId}-ref-title`}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-navaro-forest/10 bg-white shadow-[0_20px_50px_rgba(0,45,45,0.18)]"
          >
            <header className="flex items-center justify-between border-b border-navaro-forest/10 px-5 py-4">
              <h2 id={`${formId}-ref-title`} className="text-lg font-bold text-navaro-forest">
                Add Reference
              </h2>
              <button
                type="button"
                onClick={() => setModal('select-set')}
                className="rounded-lg p-2 text-navaro-forest/45 transition hover:bg-navaro-cream hover:text-navaro-forest"
                aria-label="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </header>
            <div className="space-y-3 px-5 py-5">
              <label htmlFor={`${formId}-ref-input`} className="block text-sm font-medium text-navaro-forest">
                Enter your Reference name<span className="text-red-600">*</span>
              </label>
              <input
                id={`${formId}-ref-input`}
                type="text"
                value={referenceName}
                onChange={(e) => setReferenceName(e.target.value)}
                placeholder="Minni Sajja"
                className="w-full rounded-xl border border-navaro-forest/15 bg-[#FDFBF7] px-4 py-3 text-sm text-navaro-forest placeholder:text-navaro-forest/35 focus:border-navaro-forest/40 focus:outline-none focus:ring-2 focus:ring-navaro-forest/15"
              />
              <p className="text-xs text-navaro-forest/45">
                {selectedLabels.length} document{selectedLabels.length === 1 ? '' : 's'} selected: {selectedLabels.join(', ')}
              </p>
            </div>
            <footer className="border-t border-navaro-forest/10 p-4">
              <button
                type="button"
                onClick={onContinueReference}
                disabled={!referenceName.trim()}
                className="w-full rounded-2xl bg-[#9D59D1] px-4 py-3.5 text-sm font-semibold text-white shadow-md transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:ring-2 focus-visible:ring-navaro-purple-cta/40"
              >
                Continue
              </button>
            </footer>
          </div>
        </div>
      )}

      {modal === 'duplicate-shipment' && duplicateSourceId && (
        <div
          className="fixed inset-0 z-[115] flex items-center justify-center bg-navaro-forest/25 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={closeDuplicateModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${formId}-dup-title`}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-navaro-forest/10 bg-[#FEFDFB] shadow-[0_20px_50px_rgba(0,45,45,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-navaro-forest/10 px-5 py-4">
              <h2 id={`${formId}-dup-title`} className="text-lg font-semibold text-navaro-forest">
                Duplicate Shipment
              </h2>
              <button
                type="button"
                onClick={closeDuplicateModal}
                className="rounded-lg p-2 text-navaro-forest/45 transition hover:bg-navaro-cream hover:text-navaro-forest"
                aria-label="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </header>
            <div className="space-y-3 px-5 py-5">
              <label htmlFor={`${formId}-dup-ref`} className="block text-sm font-medium text-navaro-forest/55">
                Reference<span className="text-red-600">*</span>
              </label>
              <input
                id={`${formId}-dup-ref`}
                type="text"
                value={duplicateShipmentRef}
                onChange={(e) => setDuplicateShipmentRef(e.target.value)}
                placeholder="Minni Sajja"
                className="w-full rounded-xl border border-navaro-forest/15 bg-white px-4 py-3 text-sm text-navaro-forest placeholder:text-navaro-forest/40 focus:border-navaro-forest/35 focus:outline-none focus:ring-2 focus:ring-navaro-forest/10"
              />
            </div>
            <footer className="border-t border-navaro-forest/10 p-4">
              <button
                type="button"
                onClick={confirmDuplicateShipment}
                disabled={!duplicateShipmentRef.trim()}
                className="w-full rounded-2xl bg-[#C686F0] px-4 py-3.5 text-sm font-semibold text-navaro-forest shadow-md transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:ring-2 focus-visible:ring-navaro-forest/20"
              >
                Duplicate
              </button>
            </footer>
          </div>
        </div>
      )}

      {modal === 'edit-reference' && editSourceId && (
        <div
          className="fixed inset-0 z-[116] flex items-center justify-center bg-navaro-forest/25 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={closeEditReferenceModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${formId}-edit-ref-title`}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-navaro-forest/10 bg-[#FEFDFB] shadow-[0_20px_50px_rgba(0,45,45,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-navaro-forest/10 px-5 py-4">
              <h2 id={`${formId}-edit-ref-title`} className="text-lg font-semibold text-navaro-forest">
                Edit reference
              </h2>
              <button
                type="button"
                onClick={closeEditReferenceModal}
                className="rounded-lg p-2 text-navaro-forest/45 transition hover:bg-navaro-cream hover:text-navaro-forest"
                aria-label="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </header>
            <div className="space-y-3 px-5 py-5">
              <label htmlFor={`${formId}-edit-ref-input`} className="block text-sm font-medium text-navaro-forest/55">
                Reference<span className="text-red-600">*</span>
              </label>
              <input
                id={`${formId}-edit-ref-input`}
                type="text"
                value={editReferenceInput}
                onChange={(e) => setEditReferenceInput(e.target.value)}
                placeholder="Minni Sajja"
                className="w-full rounded-xl border border-navaro-forest/15 bg-white px-4 py-3 text-sm text-navaro-forest placeholder:text-navaro-forest/40 focus:border-navaro-forest/35 focus:outline-none focus:ring-2 focus:ring-navaro-forest/10"
              />
            </div>
            <footer className="border-t border-navaro-forest/10 p-4">
              <button
                type="button"
                onClick={confirmEditReference}
                disabled={!editReferenceInput.trim()}
                className="w-full rounded-2xl bg-[#C686F0] px-4 py-3.5 text-sm font-semibold text-navaro-forest shadow-md transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:ring-2 focus-visible:ring-navaro-forest/20"
              >
                Save
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
