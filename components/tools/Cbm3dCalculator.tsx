'use client'

import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'

interface BoxRow {
  id: number
  length: string
  width: string
  height: string
  qty: string
}

interface Container {
  name: string
  volume: number
  L: number
  W: number
  H: number
}

export default function CBM3DCalculator() {
  const [unit, setUnit] = useState<'cm' | 'm'>('cm')
  const [container, setContainer] = useState<Container>({
    name: '20ft Standard',
    volume: 33.2,
    L: 5.9,
    W: 2.35,
    H: 2.39,
  })
  const [rows, setRows] = useState<BoxRow[]>([
    { id: 1, length: '50', width: '40', height: '30', qty: '1' },
  ])
  const [nextId, setNextId] = useState(2)
  const [threeLoaded, setThreeLoaded] = useState(false)

  const viewerRef = useRef<HTMLDivElement>(null)
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const sceneRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const containerWireRef = useRef<any>(null)
  const placedGroupRef = useRef<any>(null)
  const wireframeModeRef = useRef(false)
  const is3DInitializedRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const sceneAliveRef = useRef(false)
  const listenersCleanupRef = useRef<(() => void) | null>(null)
  
  // Refs to always get latest values
  const rowsRef = useRef(rows)
  const containerRef = useRef(container)
  const unitRef = useRef(unit)

  const mouseDownRef = useRef(false)
  const lastMouseXRef = useRef(0)
  const lastMouseYRef = useRef(0)
  const cameraDistanceRef = useRef(15)
  const cameraAngleXRef = useRef(0.8)
  const cameraAngleYRef = useRef(0.5)

  const containers: Container[] = [
    { name: '20ft Standard', volume: 33.2, L: 5.9, W: 2.35, H: 2.39 },
    { name: '40ft Standard', volume: 67.7, L: 12.03, W: 2.35, H: 2.39 },
    { name: '40ft High Cube', volume: 76.3, L: 12.03, W: 2.35, H: 2.69 },
    { name: '45ft High Cube', volume: 86.0, L: 13.56, W: 2.35, H: 2.69 },
  ]

  const toMeters = (val: string | number): number => {
    const n = parseFloat(String(val))
    if (isNaN(n)) return 0
    return unit === 'cm' ? n / 100 : n
  }

  const rowCBM = (row: BoxRow): number => {
    const L = toMeters(row.length)
    const W = toMeters(row.width)
    const H = toMeters(row.height)
    const Q = parseInt(row.qty) || 0
    return L * W * H * Q
  }

  const totalCBM = rows.reduce((sum, row) => sum + rowCBM(row), 0)
  const containersNeeded = totalCBM > 0 ? Math.ceil(totalCBM / container.volume) : 0
  const fillPercent = container.volume > 0 ? Math.min(100, (totalCBM / container.volume) * 100) : 0

  // Keep refs in sync with state
  useEffect(() => {
    rowsRef.current = rows
  }, [rows])
  
  useEffect(() => {
    containerRef.current = container
  }, [container])
  
  useEffect(() => {
    unitRef.current = unit
  }, [unit])

  const updateRow = (id: number, field: keyof BoxRow, value: string) => {
    const newRows = rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    rowsRef.current = newRows
    setRows(newRows)
  }

  const addBox = () => {
    const newRows = [...rows, { id: nextId, length: '50', width: '40', height: '30', qty: '1' }]
    rowsRef.current = newRows
    setRows(newRows)
    setNextId(nextId + 1)
  }

  const removeBox = (id: number) => {
    const newRows = rows.filter((r) => r.id !== id)
    rowsRef.current = newRows
    setRows(newRows)
  }

  const reset = () => {
    const newRows = [{ id: 1, length: '50', width: '40', height: '30', qty: '1' }]
    rowsRef.current = newRows
    setRows(newRows)
    setNextId(2)
  }

  const exportCSV = () => {
    const lines = [['length', 'width', 'height', 'unit', 'qty', 'cbm']]
    rows.forEach((r) => {
      lines.push([r.length, r.width, r.height, unit, r.qty, rowCBM(r).toFixed(6)])
    })
    const csv = lines.map((l) => l.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cbm_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleContainerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = containers[parseInt(e.target.value)]
    setContainer(selected)
  }

  // THREE may already be on window after client navigation; Script onLoad does not re-fire
  useEffect(() => {
    if ((window as any).THREE) setThreeLoaded(true)
  }, [])

  const dispose3D = () => {
    sceneAliveRef.current = false
    if (animationFrameRef.current != null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (rendererRef.current) {
      const dom = rendererRef.current.domElement
      rendererRef.current.dispose()
      dom?.remove()
      rendererRef.current = null
    }

    if (sceneRef.current) {
      sceneRef.current.traverse((child: { geometry?: { dispose: () => void }; material?: unknown }) => {
        child.geometry?.dispose()
        const mat = child.material
        if (Array.isArray(mat)) mat.forEach((m: { dispose: () => void }) => m.dispose())
        else if (mat && typeof mat === 'object' && 'dispose' in mat)
          (mat as { dispose: () => void }).dispose()
      })
      sceneRef.current = null
    }

    containerWireRef.current = null
    placedGroupRef.current = null
    cameraRef.current = null
    is3DInitializedRef.current = false

    delete (window as { fitToView?: unknown }).fitToView
    delete (window as { toggleWireframe?: unknown }).toggleWireframe
    delete (window as { takeScreenshot?: unknown }).takeScreenshot
    delete (window as { updateCBM3D?: unknown }).updateCBM3D

    listenersCleanupRef.current?.()
    listenersCleanupRef.current = null

    if (viewerRef.current) viewerRef.current.innerHTML = ''
  }

  // Initialize Three.js and setup
  useEffect(() => {
    if (!threeLoaded || is3DInitializedRef.current) return

    let cancelled = false

    const runInit = () => {
      if (cancelled || is3DInitializedRef.current || !viewerRef.current) return

      const viewer = viewerRef.current
      if (viewer.clientWidth === 0 || viewer.clientHeight === 0) {
        requestAnimationFrame(runInit)
        return
      }

      const THREE = (window as any).THREE
      if (!THREE) return

      // Initialize refs with current values
      rowsRef.current = rows
      containerRef.current = container
      unitRef.current = unit

      viewer.innerHTML = ''

      const scene = new THREE.Scene()
      sceneRef.current = scene
      scene.background = new THREE.Color(0xfff9ec)

    // Camera
    const fov = 50
    const aspect = viewer.clientWidth / viewer.clientHeight
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000)
    cameraRef.current = camera
    
    // Define updateCameraPosition before using it
    const updateCameraPosition = () => {
      const cam = cameraRef.current
      if (!cam) return
      cam.position.x =
        cameraDistanceRef.current *
        Math.sin(cameraAngleYRef.current) *
        Math.cos(cameraAngleXRef.current)
      cam.position.y = cameraDistanceRef.current * Math.sin(cameraAngleXRef.current)
      cam.position.z =
        cameraDistanceRef.current *
        Math.cos(cameraAngleYRef.current) *
        Math.cos(cameraAngleXRef.current)
      cam.lookAt(0, 2, 0)
    }
    
    // Set initial camera position
    updateCameraPosition()

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(viewer.clientWidth, viewer.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    viewer.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Mouse controls
    const handleMouseDown = (e: MouseEvent) => {
      mouseDownRef.current = true
      lastMouseXRef.current = e.clientX
      lastMouseYRef.current = e.clientY
      viewer.style.cursor = 'grabbing'
    }

    const handleMouseUp = () => {
      mouseDownRef.current = false
      viewer.style.cursor = 'grab'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseDownRef.current) return

      const deltaX = e.clientX - lastMouseXRef.current
      const deltaY = e.clientY - lastMouseYRef.current

      cameraAngleYRef.current += deltaX * 0.01
      cameraAngleXRef.current = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, cameraAngleXRef.current - deltaY * 0.01)
      )

      updateCameraPosition()

      lastMouseXRef.current = e.clientX
      lastMouseYRef.current = e.clientY
    }

    const handleWheel = (e: WheelEvent) => {
      cameraDistanceRef.current = Math.max(
        5,
        Math.min(50, cameraDistanceRef.current + e.deltaY * 0.01)
      )
      updateCameraPosition()
    }

    viewer.addEventListener('mousedown', handleMouseDown)
    viewer.addEventListener('mouseup', handleMouseUp)
    viewer.addEventListener('mousemove', handleMouseMove)
    viewer.addEventListener('wheel', handleWheel)
    viewer.style.cursor = 'grab'

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.72)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.55)
    directionalLight.position.set(10, 20, 10)
    scene.add(directionalLight)

    // Placed group
    const placedGroup = new THREE.Group()
    scene.add(placedGroup)
    placedGroupRef.current = placedGroup

    const createContainerWire = () => {
      const currentScene = sceneRef.current
      if (!currentScene) {
        console.error('Scene not available in createContainerWire')
        return
      }

      // Always read from ref to get latest value
      const c = containerRef.current
      if (!c) {
        console.error('Container ref not available')
        return
      }
      const L = c.L
      const W = c.W
      const H = c.H

      if (containerWireRef.current) {
        currentScene.remove(containerWireRef.current)
        if (containerWireRef.current.geometry) containerWireRef.current.geometry.dispose()
        if (containerWireRef.current.material) containerWireRef.current.material.dispose()
        containerWireRef.current = null
      }

      const oldFloor = currentScene.children.find((child: any) => child.userData?.isFloor)
      if (oldFloor) {
        currentScene.remove(oldFloor)
        if (oldFloor.geometry) oldFloor.geometry.dispose()
        if (oldFloor.material) oldFloor.material.dispose()
      }

      const geom = new THREE.BoxGeometry(L, H, W)
      const edges = new THREE.EdgesGeometry(geom)
      const mat = new THREE.LineBasicMaterial({ color: 0x1b4332 })
      const containerWire = new THREE.LineSegments(edges, mat)
      containerWire.position.set(0, H / 2, 0)
      currentScene.add(containerWire)
      containerWireRef.current = containerWire

      const floorGeo = new THREE.PlaneGeometry(L * 1.2, W * 1.2)
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0xc4a574,
        opacity: 0.12,
        transparent: true,
        side: THREE.DoubleSide,
      })
      const floor = new THREE.Mesh(floorGeo, floorMat)
      floor.rotation.x = -Math.PI / 2
      floor.position.y = 0
      floor.userData.isFloor = true
      currentScene.add(floor)
    }

    const placeBoxesSimple = () => {
      const currentScene = sceneRef.current
      if (!currentScene || !placedGroupRef.current) {
        console.error('Scene or placedGroup not available in placeBoxesSimple')
        return
      }

      // Safely remove children without breaking the group
      const childrenToRemove = [...placedGroupRef.current.children]
      childrenToRemove.forEach((old) => {
        placedGroupRef.current.remove(old)
        if (old.geometry) old.geometry.dispose()
        if (old.material) {
          if (Array.isArray(old.material)) {
            old.material.forEach((m: any) => m.dispose())
          } else {
            old.material.dispose()
          }
        }
      })

      // Always read from refs to get latest values
      const c = containerRef.current
      const currentRows = rowsRef.current
      const currentUnit = unitRef.current
      
      if (!c || !currentRows) {
        console.error('Container or rows refs not available')
        return
      }
      
      const L = c.L
      const W = c.W
      const H = c.H

      const toMetersLocal = (val: string | number): number => {
        const n = parseFloat(String(val))
        if (isNaN(n)) return 0
        return currentUnit === 'cm' ? n / 100 : n
      }

      const items: Array<{ L: number; W: number; H: number; src: number }> = []
      currentRows.forEach((r) => {
        const qty = parseInt(r.qty) || 0
        for (let i = 0; i < qty; i++) {
          items.push({
            L: toMetersLocal(r.length),
            W: toMetersLocal(r.width),
            H: toMetersLocal(r.height),
            src: r.id,
          })
        }
      })

      if (items.length === 0) return

      items.sort((a, b) => b.L * b.W * b.H - a.L * a.W * a.H)

      const placed: Array<{
        x: number
        y: number
        z: number
        lx: number
        ly: number
        lz: number
      }> = []
      const step = 0.02
      const adaptiveStep = Math.max(step, Math.min(L, W) / 40)

      const overlaps = (
        a: typeof placed[0],
        b: typeof placed[0]
      ) => {
        return (
          Math.abs(a.x - b.x) * 2 < a.lx + b.lx &&
          Math.abs(a.y - b.y) * 2 < a.ly + b.ly &&
          Math.abs(a.z - b.z) * 2 < a.lz + b.lz
        )
      }

      const layers: Array<{ y: number; height: number }> = []
      layers.push({ y: 0, height: 0 })

      items.forEach((it) => {
        const lx = Math.max(0.0001, it.L)
        const lz = Math.max(0.0001, it.W)
        const ly = Math.max(0.0001, it.H)

        let placedThis = false

        for (let li = 0; li < layers.length && !placedThis; li++) {
          const layer = layers[li]
          // Only the maximum box height in the current layer matters for "fit".
          // Using (layer.height + ly) incorrectly double-counts and can under-pack.
          if (layer.y + Math.max(layer.height, ly) > H + 1e-9) continue

          const stepXZ = adaptiveStep
          for (let x = -L / 2 + lx / 2; x <= L / 2 - lx / 2 + 1e-9; x += stepXZ) {
            if (placedThis) break
            for (let z = -W / 2 + lz / 2; z <= W / 2 - lz / 2 + 1e-9; z += stepXZ) {
              const y = layer.y + ly / 2
              const candidate = { x, y, z, lx, ly, lz }
              let ok = true
              for (const p of placed) {
                if (overlaps(candidate, p)) {
                  ok = false
                  break
                }
              }
              if (!ok) continue
              placed.push(candidate)
              if (!layer.height || ly > layer.height) layer.height = ly
              placedThis = true
              break
            }
            if (placedThis) break
          }
        }

        if (!placedThis) {
          const newLayerY = layers.reduce((s, Lr) => Math.max(s, Lr.y + Lr.height), 0)
          if (newLayerY + ly <= H + 1e-9) {
            const layer = { y: newLayerY, height: ly }
            layers.push(layer)
            const x = -L / 2 + lx / 2
            const z = -W / 2 + lz / 2
            const candidate = { x, y: layer.y + ly / 2, z, lx, ly, lz }
            let ok = true
            for (const p of placed) {
              if (overlaps(candidate, p)) {
                ok = false
                break
              }
            }
            if (ok) placed.push(candidate)
            else placed.push({ x: 0, y: layer.y + ly / 2, z: 0, lx, ly, lz })
          }
        }
      })

      placed.forEach((p) => {
        const geom = new THREE.BoxGeometry(p.lx, p.ly, p.lz)
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xc384f2),
          roughness: 0.65,
          metalness: 0.08,
          wireframe: wireframeModeRef.current,
        })
        const mesh = new THREE.Mesh(geom, mat)
        mesh.position.set(p.x, p.y, p.z)

        const edges = new THREE.EdgesGeometry(geom)
        const lineMat = new THREE.LineBasicMaterial({ color: 0x1b4332, linewidth: 1 })
        const lines = new THREE.LineSegments(edges, lineMat)
        lines.position.copy(mesh.position)

        placedGroupRef.current.add(mesh)
        placedGroupRef.current.add(lines)
      })
    }

    const update3D = () => {
      try {
        if (!THREE) {
          console.error('THREE.js not available')
          return
        }
        createContainerWire()
        placeBoxesSimple()
      } catch (error) {
        console.error('Error in update3D:', error)
      }
    }

    const fitToView = () => {
      cameraDistanceRef.current = 15
      cameraAngleXRef.current = 0.8
      cameraAngleYRef.current = 0.5
      updateCameraPosition()
    }

    const toggleWireframe = () => {
      wireframeModeRef.current = !wireframeModeRef.current
      if (placedGroupRef.current) {
        placedGroupRef.current.children.forEach((child: any) => {
          if (child.material && child.material.wireframe !== undefined) {
            child.material.wireframe = wireframeModeRef.current
          }
        })
      }
    }

    const takeScreenshot = () => {
      if (!rendererRef.current) return
      rendererRef.current.domElement.toBlob((blob: Blob | null) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'cbm_scene.png'
        a.click()
        URL.revokeObjectURL(url)
      })
    }

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return
      const w = viewer.clientWidth
      const h = viewer.clientHeight
      rendererRef.current.setSize(w, h)
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)

    // Store functions globally for button handlers
    ;(window as any).fitToView = fitToView
    ;(window as any).toggleWireframe = toggleWireframe
    ;(window as any).takeScreenshot = takeScreenshot
    ;(window as any).updateCBM3D = update3D

    updateCameraPosition()
    createContainerWire()
    placeBoxesSimple()

    sceneAliveRef.current = true
    const animate = () => {
      if (!sceneAliveRef.current) return
      animationFrameRef.current = requestAnimationFrame(animate)
      const currentScene = sceneRef.current
      if (rendererRef.current && currentScene && cameraRef.current) {
        rendererRef.current.render(currentScene, cameraRef.current)
      }
    }
    animate()

    listenersCleanupRef.current = () => {
      window.removeEventListener('resize', handleResize)
      viewer.removeEventListener('mousedown', handleMouseDown)
      viewer.removeEventListener('mouseup', handleMouseUp)
      viewer.removeEventListener('mousemove', handleMouseMove)
      viewer.removeEventListener('wheel', handleWheel)
    }

    is3DInitializedRef.current = true
    }

    runInit()

    return () => {
      cancelled = true
      listenersCleanupRef.current?.()
      listenersCleanupRef.current = null
      dispose3D()
    }
  }, [threeLoaded])

  // Update 3D when data changes - use separate effect to avoid recreating scene
  useEffect(() => {
    if (is3DInitializedRef.current && (window as any).updateCBM3D) {
      // Small delay to ensure refs are updated
      setTimeout(() => {
        if ((window as any).updateCBM3D) {
          ;(window as any).updateCBM3D()
        }
      }, 10)
    }
  }, [rows, container, unit])

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"
        onLoad={() => setThreeLoaded(true)}
        onReady={() => setThreeLoaded(true)}
        strategy="afterInteractive"
      />
      <main className="min-h-screen bg-[#FFF9EC] px-4 py-8 text-[#1B4332] sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6 font-sans">
          <header className="border-b border-[#1B4332]/10 pb-6">
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-neutral-900 sm:text-4xl">
              CBM calculator{' '}
              <span className="text-[#1B4332]">3D edition</span>
            </h1>
            <p className="mt-2 text-base text-[#64748b]">Visualise your shipment in real-time 3D.</p>
          </header>

          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#1B4332]">
                Units:
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 'cm' | 'm')}
                  className="cursor-pointer rounded-lg border border-[#1B4332]/20 bg-[#FDF2B3] px-3 py-2 text-sm font-medium text-[#1B4332] outline-none transition focus:border-[#C384F2] focus:ring-2 focus:ring-[#C384F2]/30"
                >
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-sm font-semibold text-[#1B4332]">
                Container:
                <select
                  id="container"
                  value={containers.findIndex((c) => c.name === container.name)}
                  onChange={handleContainerChange}
                  className="max-w-xs cursor-pointer rounded-lg border border-[#1B4332]/20 bg-[#FDF2B3] px-3 py-2 text-sm font-medium text-[#1B4332] outline-none transition focus:border-[#C384F2] focus:ring-2 focus:ring-[#C384F2]/30 sm:max-w-md"
                >
                  {containers.map((c, idx) => (
                    <option key={idx} value={idx}>
                      {c.name === '20ft Standard' && '20′ Standard — 33.2 m³'}
                      {c.name === '40ft Standard' && '40′ Standard — 67.7 m³'}
                      {c.name === '40ft High Cube' && '40′ High Cube — 76.3 m³'}
                      {c.name === '45ft High Cube' && '45′ High Cube — 86.0 m³'}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-2 lg:ml-auto">
              <button
                type="button"
                onClick={addBox}
                className="rounded-lg bg-[#C384F2] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#b06ee8]"
              >
                Add Box
              </button>
              <button
                type="button"
                onClick={exportCSV}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 shadow-sm transition hover:bg-neutral-50"
              >
                Export
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 shadow-sm transition hover:bg-neutral-50"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-[#1B4332]/12 bg-[#FFFBF2] shadow-sm">
            <div className="overflow-x-auto">
              <table id="boxTable" className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#1B4332] text-left text-white">
                      <th className="px-3 py-3 font-bold sm:px-4">#</th>
                      <th className="px-3 py-3 font-bold sm:px-4">Length</th>
                      <th className="px-3 py-3 font-bold sm:px-4">Width</th>
                      <th className="px-3 py-3 font-bold sm:px-4">Height</th>
                      <th className="px-3 py-3 font-bold sm:px-4">Quantity</th>
                      <th className="px-3 py-3 font-bold sm:px-4">Total CBM</th>
                      <th className="px-3 py-3 font-bold sm:px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody ref={tbodyRef}>
                    {rows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className="border-b border-[#1B4332]/10 bg-[#FFFBF7] transition-colors hover:bg-[#FDF2B3]/50"
                      >
                        <td className="px-3 py-3 text-center font-semibold text-[#64748b] sm:px-4">{idx + 1}</td>
                        <td className="px-3 py-3 sm:px-4">
                          <input
                            data-id={row.id}
                            data-field="length"
                            type="number"
                            value={row.length}
                            onChange={(e) => updateRow(row.id, 'length', e.target.value)}
                            className="w-20 rounded-lg border border-[#1B4332]/20 bg-[#FEF9DC] px-2 py-2 text-[#1B4332] outline-none focus:ring-2 focus:ring-[#C384F2]/35 sm:w-24"
                          />
                        </td>
                        <td className="px-3 py-3 sm:px-4">
                          <input
                            data-id={row.id}
                            data-field="width"
                            type="number"
                            value={row.width}
                            onChange={(e) => updateRow(row.id, 'width', e.target.value)}
                            className="w-20 rounded-lg border border-[#1B4332]/20 bg-[#FEF9DC] px-2 py-2 text-[#1B4332] outline-none focus:ring-2 focus:ring-[#C384F2]/35 sm:w-24"
                          />
                        </td>
                        <td className="px-3 py-3 sm:px-4">
                          <input
                            data-id={row.id}
                            data-field="height"
                            type="number"
                            value={row.height}
                            onChange={(e) => updateRow(row.id, 'height', e.target.value)}
                            className="w-20 rounded-lg border border-[#1B4332]/20 bg-[#FEF9DC] px-2 py-2 text-[#1B4332] outline-none focus:ring-2 focus:ring-[#C384F2]/35 sm:w-24"
                          />
                        </td>
                        <td className="px-3 py-3 sm:px-4">
                          <input
                            data-id={row.id}
                            data-field="qty"
                            type="number"
                            value={row.qty}
                            onChange={(e) => updateRow(row.id, 'qty', e.target.value)}
                            className="w-16 rounded-lg border border-[#1B4332]/20 bg-[#FEF9DC] px-2 py-2 text-[#1B4332] outline-none focus:ring-2 focus:ring-[#C384F2]/35 sm:w-20"
                          />
                        </td>
                        <td className="cbm px-3 py-3 text-center text-sm font-bold text-[#1B4332] sm:px-4">
                          {rowCBM(row).toFixed(6)}
                        </td>
                        <td className="px-3 py-3 sm:px-4">
                          <button
                            type="button"
                            onClick={() => removeBox(row.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 shadow-sm transition hover:bg-neutral-50"
                          >
                            <span className="text-base leading-none text-neutral-500">×</span>
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>

          {/* 3D view */}
          <section className="relative overflow-hidden rounded-2xl border border-[#1B4332]/12 bg-[#FFF5E6] shadow-sm">
            <div className="absolute right-3 top-3 z-10 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if ((window as any).takeScreenshot) (window as any).takeScreenshot()
                }}
                className="rounded-lg bg-[#C384F2] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#b06ee8]"
              >
                Screenshot
              </button>
              <button
                type="button"
                onClick={() => {
                  if ((window as any).toggleWireframe) (window as any).toggleWireframe()
                }}
                className="rounded-lg border border-[#1B4332]/20 bg-[#FDF2B3] px-3 py-2 text-xs font-bold text-[#1B4332] shadow-sm transition hover:bg-[#f5e89a]"
              >
                Wireframe
              </button>
              <button
                type="button"
                onClick={() => {
                  if ((window as any).fitToView) (window as any).fitToView()
                }}
                className="rounded-lg border border-[#1B4332]/20 bg-[#FDF2B3] px-3 py-2 text-xs font-bold text-[#1B4332] shadow-sm transition hover:bg-[#f5e89a]"
              >
                Reset view
              </button>
            </div>
            <div
              ref={viewerRef}
              className="mx-auto mt-12 h-[min(60vh,640px)] min-h-[320px] w-full max-w-full rounded-xl border border-[#1B4332]/10 bg-[#FFF5E6] sm:mt-14"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1B4332]/10 px-4 py-3">
              <p className="text-xs text-[#64748b]">Rotate: drag · Zoom: scroll</p>
              <span className="text-[10px] font-medium tracking-wide text-[#1B4332]/35">#FEF6D1</span>
            </div>
          </section>

          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#1B4332]/10 bg-[#FDF2B3]/90 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Total CBM</div>
              <div id="totalCbm" className="mt-1 text-xl font-bold text-[#1B4332] sm:text-2xl">
                {totalCBM.toFixed(6)} m³
              </div>
            </div>
            <div className="rounded-xl border border-[#1B4332]/10 bg-[#FDF2B3]/90 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Container volume</div>
              <div id="containerVolume" className="mt-1 text-xl font-bold text-[#1B4332] sm:text-2xl">
                {container.volume.toFixed(3)} m³
              </div>
            </div>
            <div className="rounded-xl border border-[#1B4332]/10 bg-[#FDF2B3]/90 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Containers needed</div>
              <div id="containersNeeded" className="mt-1 text-xl font-bold text-[#1B4332] sm:text-2xl">
                {containersNeeded}
              </div>
            </div>
            <div className="rounded-xl border border-[#1B4332]/10 bg-[#FDF2B3]/90 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Fill</div>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <div id="fillPercent" className="text-xl font-bold text-[#1B4332] sm:text-2xl">
                  {fillPercent.toFixed(2)}%
                </div>
                <div className="h-2 min-w-[120px] flex-1 rounded-full bg-[#1B4332]/10">
                  <div
                    id="fillBar"
                    className="h-full rounded-full bg-[#1B4332] transition-[width] duration-300"
                    style={{ width: `${Math.min(100, fillPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#64748b]">
            Note: the 3D view uses a simple placement algorithm (grid/shelf style). It&apos;s a visual aid — not an
            industrial packing optimizer.
          </p>
        </div>
      </main>
    </>
  )
}

