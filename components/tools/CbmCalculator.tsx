'use client'

import { useState, useEffect } from 'react'

export interface CBMItem {
  length: number | ''
  width: number | ''
  height: number | ''
  unit: string
  qty: number | ''
  weight: number | ''
}

const LENGTH_TO_M: { [key: string]: number } = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  in: 0.0254,
  ft: 0.3048,
}

const CONTAINER_CAPACITIES: { [key: string]: number } = {
  '20GP': 33.0,
  '40GP': 67.0,
  '40HC': 76.0,
}

const DEFAULT_ITEMS: CBMItem[] = [
  { length: 1.2, width: 1.0, height: 1.0, unit: 'm', qty: 5, weight: 500 },
  { length: 0.8, width: 0.6, height: 0.4, unit: 'm', qty: 10, weight: 200 },
]

function NumberStepper({
  value,
  onChange,
  step = 0.1,
  min,
  isInteger = false,
  placeholder,
  width = 'w-[100px]',
}: {
  value: number | ''
  onChange: (v: number | '') => void
  step?: number
  min?: number
  isInteger?: boolean
  placeholder?: string
  width?: string
}) {
  const currentNum = typeof value === 'number' ? value : 0

  const formatValue = (n: number): number => {
    if (isInteger) return Math.round(n)
    return Math.round(n * 1000) / 1000
  }

  const handleIncrement = () => {
    onChange(formatValue(currentNum + step))
  }

  const handleDecrement = () => {
    const newVal = currentNum - step
    if (min !== undefined && newVal < min) {
      onChange(formatValue(min))
      return
    }
    onChange(formatValue(newVal))
  }

  return (
    <div className={`inline-flex items-center ${width} h-9 border border-gray-200 rounded-md bg-white pl-2 pr-1.5`}>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          const val = e.target.value
          if (val === '') {
            onChange('')
            return
          }
          const parsed = isInteger ? parseInt(val, 10) : parseFloat(val)
          if (!Number.isNaN(parsed)) onChange(parsed)
        }}
        className="flex-1 w-full min-w-0 py-1 bg-transparent text-sm font-semibold text-[#134e4a] outline-none"
      />
      <div className="h-5 w-px bg-gray-200 mx-1.5" />
      <div className="flex flex-col bg-[#fde68a] rounded-[3px] h-7 overflow-hidden flex-shrink-0">
        <button
          type="button"
          onClick={handleIncrement}
          tabIndex={-1}
          aria-label="Increase"
          className="flex-1 w-5 flex items-center justify-center hover:bg-[#fcd34d] transition-colors"
        >
          <svg className="w-2.5 h-2.5 text-[#78350f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          tabIndex={-1}
          aria-label="Decrease"
          className="flex-1 w-5 flex items-center justify-center hover:bg-[#fcd34d] transition-colors"
        >
          <svg className="w-2.5 h-2.5 text-[#78350f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export interface CBMCalculatorProps {
  initialItems?: CBMItem[]
  showHeader?: boolean
  className?: string
}

export default function CBMCalculator({
  initialItems = DEFAULT_ITEMS,
  showHeader = true,
  className = '',
}: CBMCalculatorProps = {}) {
  const [items, setItems] = useState<CBMItem[]>(initialItems)
  const [precision, setPrecision] = useState('0.01')
  const [actualWeight, setActualWeight] = useState(0)
  const [results, setResults] = useState({
    rawCbm: 0,
    billedCbm: 0,
    volWeight: 0,
    chargeableWeight: 0,
    container: '—',
    containerUtil: '—',
  })

  const computeCbm = (l: number, w: number, h: number, unit: string = 'm'): number => {
    if (!l || !w || !h) return 0
    const f = LENGTH_TO_M[unit] || 1
    return (l * f) * (w * f) * (h * f)
  }

  const roundUp = (value: number, precision: number): number => {
    if (!precision || precision <= 0) return value
    return Math.ceil(value / precision) * precision
  }

  const suggestContainer = (totalCbm: number): { container: string; util: string } => {
    const caps = CONTAINER_CAPACITIES
    const keys = Object.keys(caps).sort((a, b) => caps[a] - caps[b])

    for (const k of keys) {
      if (totalCbm <= caps[k]) {
        const util = (totalCbm / caps[k]) * 100
        return { container: k, util: util.toFixed(1) }
      }
    }

    const cap = caps['40HC']
    return { container: 'Multiple (40HC base)', util: ((totalCbm / cap) * 100).toFixed(1) }
  }

  const calculate = () => {
    if (items.length === 0) {
      setResults({
        rawCbm: 0,
        billedCbm: 0,
        volWeight: 0,
        chargeableWeight: actualWeight,
        container: '—',
        containerUtil: '—',
      })
      return
    }

    const rawCbm = items.reduce(
      (sum, item) =>
        sum +
        computeCbm(
          Number(item.length) || 0,
          Number(item.width) || 0,
          Number(item.height) || 0,
          item.unit
        ) *
          (Number(item.qty) || 0),
      0
    )
    const precisionNum = parseFloat(precision)
    const billed = roundUp(rawCbm, precisionNum)
    const volWeight = billed * 1000
    const chargeable = Math.max(actualWeight, volWeight)
    const container = suggestContainer(billed)

    setResults({
      rawCbm,
      billedCbm: billed,
      volWeight,
      chargeableWeight: chargeable,
      container: container.container,
      containerUtil: container.util + ' %',
    })
  }

  useEffect(() => {
    calculate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, precision, actualWeight])

  const addRow = () => {
    setItems([...items, { length: 0, width: 0, height: 0, unit: 'm', qty: 1, weight: 0 }])
  }

  const removeRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof CBMItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const clearAll = () => {
    setItems([])
    setActualWeight(0)
    setResults({
      rawCbm: 0,
      billedCbm: 0,
      volWeight: 0,
      chargeableWeight: 0,
      container: '—',
      containerUtil: '—',
    })
  }

  const exportJson = () => {
    const data = {
      items,
      rawCbm: results.rawCbm,
      billedCbm: results.billedCbm,
      volWeight: results.volWeight,
      chargeable: results.chargeableWeight,
      container: results.container,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cbm_items.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        let importedItems: CBMItem[] = []

        if (Array.isArray(parsed)) {
          importedItems = parsed
        } else if (parsed.items && Array.isArray(parsed.items)) {
          importedItems = parsed.items
        } else {
          alert('JSON format not recognized. Provide an array or {items:[...]}')
          return
        }

        setItems(importedItems)
      } catch (e) {
        alert('Invalid JSON')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const sumItemsWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0)

  const chargeableDisplay = Math.round(results.volWeight) > sumItemsWeight ? Math.round(results.volWeight) : Math.round(sumItemsWeight)

  return (
    <div className={`w-full ${className}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10 bg-[#f6f1e7]">
        {showHeader && (
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#134e4a] tracking-tight uppercase">
              CBM Calculator
            </h1>
            <p className="text-sm text-gray-600 mt-2 max-w-3xl">
              Calculate cubic meters, volume, weight and get container recommendations for FCL & LCL shipments
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={addRow}
            className="px-5 py-2 bg-[#c4b5fd] hover:bg-[#a78bfa] text-[#1f2937] rounded-md font-semibold text-sm transition-colors shadow-sm"
          >
            Add Item
          </button>
          <button
            onClick={clearAll}
            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="md:hidden p-3">
            {items.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="font-semibold">No items added yet</p>
                <p className="text-sm mt-1">Click &quot;Add Item&quot; to start</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => {
                  const cbmSingle = computeCbm(
                    Number(item.length) || 0,
                    Number(item.width) || 0,
                    Number(item.height) || 0,
                    item.unit
                  )
                  const cbmTotal = cbmSingle * (Number(item.qty) || 0)
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-md p-3 bg-white"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-[#134e4a] text-sm">
                          # {index + 1}
                        </span>
                        <button
                          onClick={() => removeRow(index)}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors text-xs font-semibold"
                          title="Remove"
                        >
                          × Cancel
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-2">Dimensions (L/W/H)</div>
                          <div className="flex flex-wrap gap-2">
                            <NumberStepper
                              value={item.length}
                              onChange={(v) => updateItem(index, 'length', v)}
                              step={0.1}
                              min={0}
                              placeholder="L"
                              width="w-[100px]"
                            />
                            <NumberStepper
                              value={item.width}
                              onChange={(v) => updateItem(index, 'width', v)}
                              step={0.1}
                              min={0}
                              placeholder="W"
                              width="w-[100px]"
                            />
                            <NumberStepper
                              value={item.height}
                              onChange={(v) => updateItem(index, 'height', v)}
                              step={0.1}
                              min={0}
                              placeholder="H"
                              width="w-[100px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-600">Unit</label>
                            <select
                              value={item.unit}
                              onChange={(e) => updateItem(index, 'unit', e.target.value)}
                              className="w-full h-9 px-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#134e4a] focus:border-[#134e4a] outline-none text-sm bg-white font-semibold text-[#134e4a]"
                            >
                              <option value="m">m</option>
                              <option value="cm">cm</option>
                              <option value="mm">mm</option>
                              <option value="in">in</option>
                              <option value="ft">ft</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-600">Qty</label>
                            <NumberStepper
                              value={item.qty}
                              onChange={(v) => updateItem(index, 'qty', v)}
                              step={1}
                              min={1}
                              isInteger
                              width="w-full"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-600">Weight/item</label>
                          <NumberStepper
                            value={item.weight}
                            onChange={(v) => updateItem(index, 'weight', v)}
                            step={1}
                            min={0}
                            width="w-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <div className="text-[11px] font-semibold text-gray-600">CBM</div>
                            <div className="text-[#134e4a] font-semibold text-sm">{cbmSingle.toFixed(4)}</div>
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold text-gray-600">Total CBM</div>
                            <div className="text-[#134e4a] font-bold text-sm">{cbmTotal.toFixed(4)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-[#134e4a]">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-white tracking-wide w-[5%]">#</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-white tracking-wide w-[26%]">Dimensions</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-white tracking-wide w-[9%]">Unit</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-white tracking-wide w-[9%]">Qty</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-white tracking-wide w-[12%]">Total Weight</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-white tracking-wide w-[9%]">CBM</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-white tracking-wide w-[11%]">Total CBM</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-white tracking-wide w-[10%]">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {items.map((item, index) => {
                  const cbmSingle = computeCbm(
                    Number(item.length) || 0,
                    Number(item.width) || 0,
                    Number(item.height) || 0,
                    item.unit
                  )
                  const cbmTotal = cbmSingle * (Number(item.qty) || 0)
                  return (
                    <tr key={index} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <NumberStepper
                            value={item.length}
                            onChange={(v) => updateItem(index, 'length', v)}
                            step={0.1}
                            min={0}
                            placeholder="L"
                            width="w-[95px]"
                          />
                          <NumberStepper
                            value={item.width}
                            onChange={(v) => updateItem(index, 'width', v)}
                            step={0.1}
                            min={0}
                            placeholder="W"
                            width="w-[95px]"
                          />
                          <NumberStepper
                            value={item.height}
                            onChange={(v) => updateItem(index, 'height', v)}
                            step={0.1}
                            min={0}
                            placeholder="H"
                            width="w-[95px]"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          className="w-[75px] h-9 px-2 border border-gray-200 rounded-md bg-white text-sm font-semibold text-[#134e4a] focus:ring-1 focus:ring-[#134e4a] focus:border-[#134e4a] outline-none"
                        >
                          <option value="m">m</option>
                          <option value="cm">cm</option>
                          <option value="mm">mm</option>
                          <option value="in">in</option>
                          <option value="ft">ft</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <NumberStepper
                          value={item.qty}
                          onChange={(v) => updateItem(index, 'qty', v)}
                          step={1}
                          min={1}
                          isInteger
                          width="w-[90px]"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <NumberStepper
                          value={item.weight}
                          onChange={(v) => updateItem(index, 'weight', v)}
                          step={1}
                          min={0}
                          width="w-[95px]"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700 text-sm">
                          {cbmSingle.toFixed(4)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[#134e4a] font-bold text-sm">
                          {cbmTotal.toFixed(4)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => removeRow(index)}
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-500 rounded hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors text-xs font-medium"
                          title="Remove"
                        >
                          × Cancel
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400">
                      <p className="font-semibold">No items added yet</p>
                      <p className="text-sm mt-1">Click &quot;Add Item&quot; to start</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-[#f6f1e7]">
            <p className="text-xs text-gray-500">
              Supported Units: M, Cm, Mm, In, Ft
            </p>
          </div>
        </div>

        <div className="bg-[#fde68a]/70 rounded-md p-6 mb-6 border border-[#fcd34d]/40">
          <h3 className="text-lg font-bold text-[#134e4a] mb-4 uppercase tracking-wide">Shipment Summary</h3>

          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1.5 text-gray-700">Total Weight (in kg)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Enter Weight"
              value={actualWeight || ''}
              onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#134e4a] focus:border-[#134e4a] outline-none bg-white text-sm text-[#134e4a] font-medium placeholder-gray-400"
            />
          </div>

          <div className="bg-white rounded-md overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <span className="text-sm text-gray-700">Raw CBM</span>
              <strong className="text-[#134e4a] text-sm font-bold">{results.rawCbm.toFixed(4)}m</strong>
            </div>
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <span className="text-sm text-gray-700">Billing CBM</span>
              <strong className="text-[#134e4a] text-sm font-bold">{results.billedCbm.toFixed(4)}m</strong>
            </div>
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <span className="text-sm text-gray-700">Volume Weight</span>
              <strong className="text-[#134e4a] text-sm font-bold">{Math.round(results.volWeight)} kg</strong>
            </div>
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <span className="text-sm text-gray-700">Actual Weight</span>
              <strong className="text-[#134e4a] text-sm font-bold">{Math.round(sumItemsWeight)}kg</strong>
            </div>
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <span className="text-sm text-gray-700">Chargeable Weight</span>
              <strong className="text-[#134e4a] text-sm font-bold">{chargeableDisplay}kg</strong>
            </div>
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <span className="text-sm text-gray-700">Container</span>
              <strong className="text-[#134e4a] text-sm font-bold">{results.container}</strong>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-gray-700">Utilisation</span>
              <strong className="text-[#134e4a] text-sm font-bold">{results.containerUtil}</strong>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-5 border border-gray-200 mb-6">
          <h4 className="font-semibold text-[#134e4a] mb-3 text-xs uppercase tracking-wide">Data Management</h4>
          <div className="space-y-2">
            <button
              onClick={exportJson}
              className="w-full px-4 py-2.5 bg-[#c4b5fd] hover:bg-[#a78bfa] text-[#1f2937] rounded-md font-semibold transition-colors text-sm"
            >
              Export JSON
            </button>
            <label className="block w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-50 transition-colors text-sm cursor-pointer text-center">
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-md p-5 border border-gray-200">
          <h4 className="font-semibold text-[#134e4a] mb-3 text-xs uppercase tracking-wide">Quick Info</h4>
          <div className="space-y-1.5 text-xs text-gray-700 leading-relaxed">
            <p>
              <span className="font-semibold">Formula:</span> L*W*H (In Metres)
            </p>
            <p>
              <span className="font-semibold">LCL:</span> Charged On Higher Of Weight Or Volume
            </p>
            <p>
              <span className="font-semibold">Containers:</span> 20&apos;GP (33m³), 40&apos; (67m³), 40&apos;HC (76m³)
            </p>
          </div>
        </div>

        <select
          value={precision}
          onChange={(e) => setPrecision(e.target.value)}
          className="hidden"
        >
          <option value="0.01">0.01 m³</option>
          <option value="0.1">0.1 m³</option>
          <option value="1">1 m³</option>
        </select>
      </div>
    </div>
  )
}
