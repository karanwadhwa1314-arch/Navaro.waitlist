'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import CatalogCourseCard from '@/components/catalog/CatalogCourseCard'
import CatalogToast, { CatalogPageShell, CatalogSkeletonGrid } from '@/components/catalog/CatalogUi'
import { useCatalogAuth } from '@/hooks/useCatalogAuth'
import { catalogApi } from '@/lib/lms/catalog-api'
import type { CatalogCategory, CourseListItem } from '@/lib/lms/catalog-types'

const deck = { fontFamily: '"TASA Orbiter Deck", sans-serif' }

const LEVEL_OPTIONS = [
  ['', 'All levels'],
  ['BEGINNER', 'Beginner'],
  ['INTERMEDIATE', 'Intermediate'],
  ['ADVANCED', 'Advanced'],
] as const

function CoursesCatalogPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { accessToken, authVersion } = useCatalogAuth()

  const page = Math.max(1, Number(searchParams.get('page') || '1') || 1)
  const limit = Math.max(1, Number(searchParams.get('limit') || '12') || 12)
  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const level = searchParams.get('level') || ''

  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)
  const [toast, setToast] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) params.delete(key)
        else params.set(key, value)
      })
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams],
  )

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      const result = await catalogApi.getCategories()
      if (cancelled || !result.success) return
      setCategories(result.data.categories.filter((item) => item.isActive))
    }

    void loadCategories()
    return () => {
      cancelled = true
    }
  }, [])

  const loadCourses = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true)
    }

    const result = await catalogApi.getCourses(
      {
        page,
        limit,
        search: search || undefined,
        categoryId: categoryId || undefined,
        level: level || undefined,
      },
      accessToken,
    )

    if (!result.success) {
      setCourses([])
      setTotal(0)
      setToast(result.error)
      setLoading(false)
      return
    }

    setCourses(result.data.courses)
    setTotal(result.data.total)
    setLoading(false)
  }, [page, limit, search, categoryId, level, accessToken])

  useEffect(() => {
    void loadCourses()
  }, [loadCourses, authVersion])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== search) {
        updateQuery({ search: searchInput.trim() || null, page: '1' })
      }
    }, 350)

    return () => window.clearTimeout(timer)
  }, [searchInput, search, updateQuery])

  return (
    <>
      <CatalogPageShell
        title="Course Catalog"
        subtitle="Browse courses without signing in. Sign in and enroll to unlock full content."
      >
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-[#D1CEC9] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#054742]" style={deck}>
              Filters
            </h2>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-semibold text-[#666]" style={deck}>Search</span>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search courses..."
                className="w-full rounded-[9px] border border-[#ddd] px-3 py-2.5 text-sm outline-none focus:border-[#00433E]"
                style={deck}
              />
            </label>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-semibold text-[#666]" style={deck}>Category</span>
              <select
                value={categoryId}
                onChange={(event) => updateQuery({ categoryId: event.target.value || null, page: '1' })}
                className="w-full rounded-[9px] border border-[#ddd] px-3 py-2.5 text-sm outline-none focus:border-[#00433E]"
                style={deck}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#666]" style={deck}>Level</span>
              <select
                value={level}
                onChange={(event) => updateQuery({ level: event.target.value || null, page: '1' })}
                className="w-full rounded-[9px] border border-[#ddd] px-3 py-2.5 text-sm outline-none focus:border-[#00433E]"
                style={deck}
              >
                {LEVEL_OPTIONS.map(([value, label]) => (
                  <option key={value || 'all'} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </aside>

          <section>
            {loading && <CatalogSkeletonGrid />}

            {!loading && courses.length === 0 && (
              <div className="rounded-3xl border border-[#E8E4DC] bg-white px-6 py-16 text-center">
                <p className="text-sm text-[#888]" style={deck}>No courses match your filters.</p>
              </div>
            )}

            {!loading && courses.length > 0 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {courses.map((course) => (
                    <CatalogCourseCard
                      key={course.id}
                      course={course}
                      onThumbnailError={() => void loadCourses({ silent: true })}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => updateQuery({ page: String(page - 1) })}
                      className="rounded-xl border border-[#D1CEC9] bg-white px-4 py-2 text-sm font-semibold text-[#054742] disabled:opacity-40"
                      style={deck}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-[#2D4F4A]" style={deck}>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => updateQuery({ page: String(page + 1) })}
                      className="rounded-xl border border-[#D1CEC9] bg-white px-4 py-2 text-sm font-semibold text-[#054742] disabled:opacity-40"
                      style={deck}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </CatalogPageShell>

      <CatalogToast message={toast} onClose={() => setToast(null)} />
    </>
  )
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <CatalogPageShell title="Course Catalog" subtitle="Loading courses...">
          <CatalogSkeletonGrid />
        </CatalogPageShell>
      }
    >
      <CoursesCatalogPage />
    </Suspense>
  )
}
