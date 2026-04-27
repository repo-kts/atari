import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Info,
  LayoutGrid,
  Rows3,
  Calendar,
  Image as ImageIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Filter,
  FolderOpen,
  Trash2,
} from 'lucide-react'
import { Breadcrumbs } from '../../components/common/Breadcrumbs'
import { Card, CardContent } from '../../components/ui/Card'
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/route'
import { useAuth } from '@/contexts/AuthContext'
import type { ModuleImageRow } from '@/services/moduleImagesApi'
import { API_BASE_URL } from '@/config/api'
import { useGallerySource, type GalleryItem } from '@/hooks/useGallerySource'
import { useQueryClient } from '@tanstack/react-query'
import { formAttachmentsApi } from '@/services/formAttachmentsApi'

type ViewMode = 'grid' | 'compact'

const PAGE_LIMIT = 200

function buildFileUrl(path: string): string {
  try {
    return new URL(path, API_BASE_URL).toString()
  } catch {
    return path
  }
}

function formatMonthKey(iso?: string | null): string {
  if (!iso) return 'Undated'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Undated'
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

function formatDate(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function isRecent(iso?: string | null, days = 7): boolean {
  if (!iso) return false
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return false
  const diff = Date.now() - d.getTime()
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000
}

async function downloadImage(downloadUrl: string, fileName?: string | null) {
  try {
    const url = buildFileUrl(downloadUrl)
    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) throw new Error('Download failed')
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = fileName || 'image'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  } catch {
    window.open(buildFileUrl(downloadUrl), '_blank')
  }
}

export const Gallery: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const breadcrumbs = getBreadcrumbsForPath(location.pathname)
  const routeConfig = getRouteConfig(location.pathname)
  const { user } = useAuth()

  const showKvkFilter = user?.role !== 'kvk_admin' && user?.role !== 'kvk_user'

  // Indian fiscal year: Apr-Mar. Today's fiscal year = current calendar year if
  // month >= April, else previous calendar year.
  const today = new Date()
  const currentYear =
    today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [year, setYear] = useState<number>(currentYear)
  const [kvkId, setKvkId] = useState<number | undefined>(undefined)
  const [moduleId, setModuleId] = useState<number | undefined>(undefined)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [railOpen, setRailOpen] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [treeSearch, setTreeSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 250)
    return () => clearTimeout(t)
  }, [searchInput])

  const [selectedFormCode, setSelectedFormCode] = useState<string | undefined>(undefined)

  const filters = useMemo(
    () => ({
      page: 1,
      limit: PAGE_LIMIT,
      reportingYear: year,
      kvkId,
      moduleId,
      formCode: selectedFormCode,
      search: debouncedSearch || undefined,
    }),
    [year, kvkId, moduleId, selectedFormCode, debouncedSearch]
  )

  const sourceResult = useGallerySource(filters, showKvkFilter)
  const images: GalleryItem[] = sourceResult.images
  const total = sourceResult.total
  const categoriesQuery = { data: sourceResult.categories } as { data: typeof sourceResult.categories }
  const kvksQuery = { data: sourceResult.kvks } as { data: typeof sourceResult.kvks }
  const imagesQuery = { isLoading: sourceResult.isLoading } as { isLoading: boolean }

  const yearOptions = useMemo(() => {
    const arr: number[] = []
    for (let y = currentYear + 1; y >= currentYear - 6; y -= 1) arr.push(y)
    return arr
  }, [currentYear])

  // Counts come from unfiltered queries inside useGallerySource so the sidebar
  // numbers stay stable when one category is selected (otherwise the filtered
  // images list shrinks to one module and other modules would all read 0).
  const moduleCounts = sourceResult.categoryCounts

  const groupedCategories = useMemo(() => {
    const cats = categoriesQuery.data ?? []
    const map = new Map<string, typeof cats>()
    for (const c of cats) {
      const key = c.menuName || 'Other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(c)
    }
    return Array.from(map.entries()).map(([menuName, items]) => ({
      menuName,
      items: [...items].sort((a, b) => a.subMenuName.localeCompare(b.subMenuName)),
      total: items.reduce((sum, it) => sum + (moduleCounts.get(it.moduleId) ?? 0), 0),
    }))
  }, [categoriesQuery.data, moduleCounts])

  const filteredGroups = useMemo(() => {
    const q = treeSearch.trim().toLowerCase()
    if (!q) return groupedCategories
    return groupedCategories
      .map(g => ({
        ...g,
        items: g.items.filter(
          it =>
            it.subMenuName.toLowerCase().includes(q) ||
            it.label.toLowerCase().includes(q) ||
            (it.moduleCode ?? '').toLowerCase().includes(q),
        ),
      }))
      .filter(g => g.items.length > 0 || g.menuName.toLowerCase().includes(q))
  }, [groupedCategories, treeSearch])

  const activeGroupName = useMemo(() => {
    if (moduleId === undefined) return null
    const c = (categoriesQuery.data ?? []).find(x => x.moduleId === moduleId)
    return c?.menuName ?? null
  }, [moduleId, categoriesQuery.data])

  useEffect(() => {
    if (activeGroupName) {
      setCollapsedGroups(prev => {
        if (!prev.has(activeGroupName)) return prev
        const next = new Set(prev)
        next.delete(activeGroupName)
        return next
      })
    }
  }, [activeGroupName])

  const toggleGroup = (menuName: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(menuName)) next.delete(menuName)
      else next.add(menuName)
      return next
    })
  }

  const recent = useMemo(() => images.filter(i => isRecent(i.imageDate || i.createdAt)), [images])

  const groupedByMonth = useMemo(() => {
    const map = new Map<string, GalleryItem[]>()
    for (const img of images) {
      const key = formatMonthKey(img.imageDate || img.createdAt)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(img)
    }
    return Array.from(map.entries()).sort(([, a], [, b]) => {
      const ad = new Date(a[0]?.imageDate || a[0]?.createdAt || 0).getTime()
      const bd = new Date(b[0]?.imageDate || b[0]?.createdAt || 0).getTime()
      return bd - ad
    })
  }, [images])

  const flatOrder: GalleryItem[] = useMemo(() => {
    const list: GalleryItem[] = []
    if (recent.length) list.push(...recent)
    for (const [, arr] of groupedByMonth) list.push(...arr)
    const seen = new Set<number>()
    return list.filter(i => {
      if (seen.has(i.imageId)) return false
      seen.add(i.imageId)
      return true
    })
  }, [recent, groupedByMonth])

  const openLightbox = useCallback(
    (img: GalleryItem) => {
      const idx = flatOrder.findIndex(i => i.imageId === img.imageId)
      setLightboxIdx(idx >= 0 ? idx : 0)
    },
    [flatOrder]
  )

  const closeLightbox = useCallback(() => setLightboxIdx(null), [])
  const nextLightbox = useCallback(
    () => setLightboxIdx(idx => (idx === null ? null : (idx + 1) % flatOrder.length)),
    [flatOrder.length]
  )
  const prevLightbox = useCallback(
    () =>
      setLightboxIdx(idx =>
        idx === null ? null : (idx - 1 + flatOrder.length) % flatOrder.length
      ),
    [flatOrder.length]
  )

  // FORM_ID_OFFSET in useGallerySource is 1_000_000; subtract to recover the
  // original attachmentId from the synthetic galleryItem.imageId.
  const FORM_ID_OFFSET = 1_000_000
  const qc = useQueryClient()
  const handleDelete = useCallback(
    async (img: ModuleImageRow & { source?: 'module' | 'form' }) => {
      if (img.source !== 'form') {
        alert('Module images can only be deleted from the Module Images admin page.')
        return
      }
      const attachmentId = img.imageId - FORM_ID_OFFSET
      if (!confirm('Delete this image? This cannot be undone.')) return
      try {
        await formAttachmentsApi.remove(attachmentId)
        qc.invalidateQueries({ queryKey: ['form-attachments'] })
        qc.invalidateQueries({ queryKey: ['form-attachments-gallery'] })
        qc.invalidateQueries({ queryKey: ['form-attachments-gallery-forms'] })
        qc.invalidateQueries({ queryKey: ['form-attachments-gallery-kvks'] })
        // Advance or close depending on remaining length.
        setLightboxIdx((idx) => {
          if (idx === null) return null
          if (flatOrder.length <= 1) return null
          return idx >= flatOrder.length - 1 ? Math.max(0, idx - 1) : idx
        })
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Delete failed')
      }
    },
    [qc, flatOrder.length],
  )

  useEffect(() => {
    if (lightboxIdx === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowRight') nextLightbox()
      else if (e.key === 'ArrowLeft') prevLightbox()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIdx, closeLightbox, nextLightbox, prevLightbox])

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = []
    if (debouncedSearch) {
      chips.push({
        key: 'search',
        label: `Search: "${debouncedSearch}"`,
        clear: () => setSearchInput(''),
      })
    }
    if (kvkId) {
      const k = kvksQuery.data?.find(x => x.kvkId === kvkId)
      chips.push({
        key: 'kvk',
        label: `KVK: ${k?.kvkName ?? kvkId}`,
        clear: () => setKvkId(undefined),
      })
    }
    if (moduleId || selectedFormCode) {
      const m = categoriesQuery.data?.find(x =>
        selectedFormCode ? x.moduleCode === selectedFormCode : x.moduleId === moduleId,
      )
      const isForm = Boolean(selectedFormCode)
      chips.push({
        key: 'module',
        label: `${isForm ? 'Form' : 'Module'}: ${m?.label ?? selectedFormCode ?? moduleId}`,
        clear: () => {
          setModuleId(undefined)
          setSelectedFormCode(undefined)
        },
      })
    }
    if (year !== currentYear) {
      chips.push({ key: 'year', label: `Year: ${year}`, clear: () => setYear(currentYear) })
    }
    return chips
  }, [debouncedSearch, kvkId, moduleId, year, currentYear, kvksQuery.data, categoriesQuery.data])

  const clearAll = () => {
    setSearchInput('')
    setKvkId(undefined)
    setModuleId(undefined)
    setSelectedFormCode(undefined)
    setYear(currentYear)
  }

  const isLoading = imagesQuery.isLoading
  const isEmpty = !isLoading && images.length === 0

  return (
    <div className="bg-white rounded-2xl p-1">
      {/* Back + Breadcrumbs */}
      <div className="mb-6 flex items-center gap-4 px-6 pt-4">
        <button
          onClick={() => {
            if (routeConfig?.parent) navigate(routeConfig.parent)
            else navigate('/dashboard')
          }}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs.map((b, i) => ({ ...b, level: i }))} showHome={false} />
        )}
      </div>

      <Card className="bg-[#FAF9F6]">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#487749]">Gallery</h2>
              <p className="text-sm text-[#757575] mt-1">
                Browse module and form attachments across KVKs and reporting years
              </p>
            </div>
            <div className="inline-flex rounded-xl border border-[#E0E0E0] bg-white overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-[#487749] text-white' : 'text-[#757575] hover:bg-[#F5F5F5]'}`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-2 ${viewMode === 'compact' ? 'bg-[#487749] text-white' : 'text-[#757575] hover:bg-[#F5F5F5]'}`}
                title="Compact view"
                aria-label="Compact view"
              >
                <Rows3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              onClick={() => setRailOpen(o => !o)}
              className="hidden lg:inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-[#E0E0E0] hover:bg-[#F5F5F5] text-[#487749]"
              aria-label={railOpen ? 'Hide module rail' : 'Show module rail'}
              title={railOpen ? 'Hide modules' : 'Show modules'}
            >
              {railOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#757575]" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search captions, KVK, module..."
                className="w-full pl-10 pr-9 py-2 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749] bg-white text-[#212121] placeholder-[#9E9E9E] transition-all duration-200 hover:border-[#BDBDBD]"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#F5F5F5] text-[#757575]"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="text-sm bg-white border border-[#E0E0E0] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>
                    {y}-{String((y + 1) % 100).padStart(2, '0')}
                  </option>
                ))}
              </select>

              {showKvkFilter && (
                <select
                  value={kvkId ?? ''}
                  onChange={e => setKvkId(e.target.value ? Number(e.target.value) : undefined)}
                  className="text-sm bg-white border border-[#E0E0E0] rounded-xl px-3 py-2 max-w-[180px] focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749]"
                >
                  <option value="">All KVKs</option>
                  {(kvksQuery.data ?? []).map(k => (
                    <option key={k.kvkId} value={k.kvkId}>
                      {k.kvkName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E0E0E0] text-sm text-[#212121]"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {activeChips.map(c => (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#487749]/10 text-[#3d6540] text-xs font-medium"
                >
                  {c.label}
                  <button
                    onClick={c.clear}
                    className="ml-0.5 hover:bg-[#487749]/20 rounded-full p-0.5"
                    aria-label={`Clear ${c.key}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button onClick={clearAll} className="text-xs text-[#757575] hover:text-[#212121] underline">
                Clear all
              </button>
            </div>
          )}

          {/* Body: sidebar + grid */}
          <div className="flex gap-4 min-h-[400px]">
            {railOpen && (
              <aside className="hidden lg:flex flex-col w-64 shrink-0 rounded-xl border border-[#E0E0E0] bg-white overflow-hidden max-h-[calc(100vh-300px)]">
                <ModulesTree
                  groups={filteredGroups}
                  total={total}
                  moduleId={moduleId}
                  selectedFormCode={selectedFormCode}
                  collapsedGroups={collapsedGroups}
                  toggleGroup={toggleGroup}
                  setCollapsedGroups={setCollapsedGroups}
                  groupedCategories={groupedCategories}
                  activeGroupName={activeGroupName}
                  moduleCounts={moduleCounts}
                  treeSearch={treeSearch}
                  setTreeSearch={setTreeSearch}
                  onSelectAll={() => {
                    setModuleId(undefined)
                    setSelectedFormCode(undefined)
                  }}
                  onSelectModule={(c) => {
                    const isFormCategory = c.moduleId >= 1_000_000
                    if (isFormCategory) {
                      setSelectedFormCode(c.moduleCode ?? undefined)
                      setModuleId(undefined)
                    } else {
                      setModuleId(c.moduleId)
                      setSelectedFormCode(undefined)
                    }
                  }}
                />
              </aside>
            )}

            <main className="flex-1 min-w-0 overflow-y-auto rounded-xl border border-[#E0E0E0] bg-white p-4 max-h-[calc(100vh-300px)]">
              {isLoading && <SkeletonGrid mode={viewMode} />}

              {isEmpty && (
                <EmptyState
                  activeChips={activeChips.length}
                  onClearAll={clearAll}
                />
              )}

              {!isLoading && !isEmpty && (
                <>
                  {recent.length > 0 && (
                    <Section title="Recent uploads" subtitle={`Last 7 days · ${recent.length}`}>
                      <HorizontalStrip images={recent} onOpen={openLightbox} />
                    </Section>
                  )}

                  {groupedByMonth.map(([monthKey, arr]) => (
                    <Section
                      key={monthKey}
                      title={monthKey}
                      subtitle={`${arr.length} ${arr.length === 1 ? 'image' : 'images'}`}
                      icon={<Calendar className="w-3.5 h-3.5" />}
                    >
                      <Masonry images={arr} onOpen={openLightbox} mode={viewMode} />
                    </Section>
                  ))}
                </>
              )}
            </main>
          </div>
        </CardContent>
      </Card>

      {/* Mobile filters sheet */}
      {mobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex items-end" onClick={() => setMobileFiltersOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1 rounded hover:bg-[#F5F5F5]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="block text-xs font-medium text-black/60 mb-1">Year</label>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="w-full mb-3 text-sm bg-white border border-[#E0E0E0] rounded-xl px-3 py-2"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>
                  {y}-{String((y + 1) % 100).padStart(2, '0')}
                </option>
              ))}
            </select>
            {showKvkFilter && (
              <>
                <label className="block text-xs font-medium text-black/60 mb-1">KVK</label>
                <select
                  value={kvkId ?? ''}
                  onChange={e => setKvkId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full mb-3 text-sm bg-white border border-[#E0E0E0] rounded-xl px-3 py-2"
                >
                  <option value="">All KVKs</option>
                  {(kvksQuery.data ?? []).map(k => (
                    <option key={k.kvkId} value={k.kvkId}>
                      {k.kvkName}
                    </option>
                  ))}
                </select>
              </>
            )}
            <label className="block text-xs font-medium text-black/60 mb-1">Modules &amp; Forms</label>
            <div className="rounded-xl border border-[#E0E0E0] overflow-hidden">
              <ModulesTree
                groups={filteredGroups}
                total={total}
                moduleId={moduleId}
                selectedFormCode={selectedFormCode}
                collapsedGroups={collapsedGroups}
                toggleGroup={toggleGroup}
                setCollapsedGroups={setCollapsedGroups}
                groupedCategories={groupedCategories}
                activeGroupName={activeGroupName}
                moduleCounts={moduleCounts}
                treeSearch={treeSearch}
                setTreeSearch={setTreeSearch}
                onSelectAll={() => {
                  setModuleId(undefined)
                  setSelectedFormCode(undefined)
                  setMobileFiltersOpen(false)
                }}
                onSelectModule={(c) => {
                  const isFormCategory = c.moduleId >= 1_000_000
                  if (isFormCategory) {
                    setSelectedFormCode(c.moduleCode ?? undefined)
                    setModuleId(undefined)
                  } else {
                    setModuleId(c.moduleId)
                    setSelectedFormCode(undefined)
                  }
                  setMobileFiltersOpen(false)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {lightboxIdx !== null && flatOrder[lightboxIdx] && (
        <Lightbox
          img={flatOrder[lightboxIdx]}
          index={lightboxIdx}
          total={flatOrder.length}
          onClose={closeLightbox}
          onNext={nextLightbox}
          onPrev={prevLightbox}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

const Section: React.FC<{
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
}> = ({ title, subtitle, icon, children }) => (
  <section className="mb-8">
    <div className="sticky top-0 -mx-1 px-1 py-2 mb-3 bg-white/95 backdrop-blur z-10 flex items-baseline justify-between border-b border-[#E0E0E0]">
      <h2 className="text-base font-semibold text-black/85 inline-flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {subtitle && <span className="text-xs text-black/45">{subtitle}</span>}
    </div>
    {children}
  </section>
)

const HorizontalStrip: React.FC<{
  images: GalleryItem[]
  onOpen: (img: GalleryItem) => void
}> = ({ images, onOpen }) => (
  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
    {images.map(img => (
      <button
        key={img.imageId}
        onClick={() => onOpen(img)}
        className="group relative shrink-0 w-44 h-32 rounded-xl overflow-hidden bg-gray-100 border border-[#E0E0E0] hover:border-[#487749]/40 hover:shadow-md transition-all"
      >
        <img
          src={buildFileUrl(img.fileUrl)}
          alt={img.caption}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-[11px] truncate text-left">
          {img.caption || img.categoryLabel}
        </div>
      </button>
    ))}
  </div>
)

const Masonry: React.FC<{
  images: GalleryItem[]
  onOpen: (img: GalleryItem) => void
  mode: ViewMode
}> = ({ images, onOpen, mode }) => {
  const cols =
    mode === 'compact' ? 'columns-3 sm:columns-4 md:columns-5 lg:columns-6 xl:columns-7' : 'columns-2 sm:columns-3 md:columns-4 lg:columns-4 xl:columns-5'
  return (
    <div className={`${cols} gap-3 [column-fill:_balance]`}>
      {images.map(img => (
        <Tile key={img.imageId} img={img} onOpen={onOpen} compact={mode === 'compact'} />
      ))}
    </div>
  )
}

const Tile: React.FC<{
  img: GalleryItem
  onOpen: (img: GalleryItem) => void
  compact?: boolean
}> = ({ img, onOpen, compact }) => {
  return (
    <button
      onClick={() => onOpen(img)}
      className="group relative mb-3 w-full break-inside-avoid rounded-xl overflow-hidden bg-gray-100 border border-[#E0E0E0] hover:border-[#487749]/40 hover:shadow-md transition-all duration-200 block"
    >
      <img
        src={buildFileUrl(img.fileUrl)}
        alt={img.caption}
        loading="lazy"
        className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
      />
      {!compact && (
        <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-white text-left">
          <div className="text-xs font-medium truncate">{img.caption || img.categoryLabel}</div>
          <div className="text-[10px] text-white/75 truncate">
            {img.kvkName} · {formatDate(img.imageDate || img.createdAt)}
          </div>
        </div>
      )}
    </button>
  )
}

const SkeletonGrid: React.FC<{ mode: ViewMode }> = ({ mode }) => {
  const cols =
    mode === 'compact' ? 'columns-3 sm:columns-4 md:columns-5 lg:columns-6' : 'columns-2 sm:columns-3 md:columns-4 lg:columns-4'
  const heights = [120, 180, 220, 160, 200, 140, 240, 170, 190, 150, 210, 180]
  return (
    <div className={`${cols} gap-3`}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="mb-3 w-full rounded-xl bg-gray-200 animate-pulse break-inside-avoid"
          style={{ height: h }}
        />
      ))}
    </div>
  )
}

const EmptyState: React.FC<{ activeChips: number; onClearAll: () => void }> = ({
  activeChips,
  onClearAll,
}) => (
  <div className="h-full flex items-center justify-center py-16">
    <div className="text-center max-w-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#487749]/10 mb-4">
        <ImageIcon className="w-7 h-7 text-[#487749]" />
      </div>
      <h3 className="text-base font-semibold text-black/80 mb-1">No images found</h3>
      <p className="text-sm text-black/50 mb-4">
        {activeChips > 0
          ? 'Try clearing the active filters or pick a different year.'
          : 'No images uploaded yet for the selected scope.'}
      </p>
      {activeChips > 0 && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-[#487749] text-white text-sm hover:bg-[#3d6540] transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  </div>
)

const Lightbox: React.FC<{
  img: GalleryItem
  index: number
  total: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  onDelete?: (img: GalleryItem) => void
}> = ({ img, index, total, onClose, onNext, onPrev, onDelete }) => {
  const [showInfo, setShowInfo] = useState(true)
  const overlayRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col"
      onClick={e => {
        if (e.target === overlayRef.current) onClose()
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Top bar */}
      <div
        className={`flex items-center justify-between px-4 py-3 text-white transition-[padding] duration-300 ${
          showInfo ? 'sm:pr-[24rem]' : ''
        }`}
      >
        <div className="text-sm text-white/70">
          {index + 1} <span className="text-white/40">/ {total}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(s => !s)}
            className={`p-2 rounded-lg ${showInfo ? 'bg-white/15' : 'hover:bg-white/10'}`}
            title="Toggle info (i)"
            aria-label="Toggle info"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => downloadImage(img.downloadUrl, img.fileName ?? img.caption)}
            className="p-2 rounded-lg hover:bg-white/10"
            title="Download"
            aria-label="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          {onDelete && img.source === 'form' && (
            <button
              onClick={() => onDelete(img)}
              className="p-2 rounded-lg text-red-300 hover:text-white hover:bg-red-500/40"
              title="Delete"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10"
            title="Close (Esc)"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image area — shrinks to leave room for the details panel when open. */}
      <div
        className={`flex-1 flex items-center justify-center px-4 relative min-h-0 transition-[padding] duration-300 ${
          showInfo ? 'sm:pr-96' : ''
        }`}
      >
        <button
          onClick={onPrev}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <img
          key={img.imageId}
          src={buildFileUrl(img.fileUrl)}
          alt={img.caption}
          className="max-h-full max-w-full object-contain rounded-md select-none"
          draggable={false}
        />

        <button
          onClick={onNext}
          className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-[right] duration-300 ${
            showInfo ? 'right-2 sm:right-[26rem]' : 'right-2 sm:right-6'
          }`}
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Right-side details panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl text-gray-900 transform transition-transform duration-300 z-[60] overflow-y-auto ${
          showInfo ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#487749]">Details</h3>
          <button
            onClick={() => setShowInfo(false)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-5 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Caption</div>
            <div className="font-medium text-gray-900 break-words">
              {img.caption || <span className="text-gray-400 italic">No caption</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <DetailRow label="Source" value={img.categoryLabel} />
            <DetailRow label="KVK" value={img.kvkName || '—'} />
            <DetailRow label="Captured" value={formatDate(img.imageDate)} />
            <DetailRow label="Uploaded" value={formatDate(img.createdAt)} />
            <DetailRow label="Year" value={`${img.reportingYear}-${String((img.reportingYear + 1) % 100).padStart(2, '0')}`} />
            <DetailRow label="File" value={img.fileName ?? '—'} truncate />
            <DetailRow label="Type" value={img.mimeType.split('/')[1]?.toUpperCase() ?? img.mimeType} />
            <DetailRow label="Position" value={`${index + 1} / ${total}`} />
          </div>
          {img.uploadedBy && (
            <div className="pt-3 border-t border-gray-100">
              <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Uploaded by</div>
              <div className="font-medium text-gray-900">{img.uploadedBy.name}</div>
              <div className="text-xs text-gray-500">{img.uploadedBy.email}</div>
            </div>
          )}
          <div className="pt-3 border-t border-gray-100 flex gap-2">
            <button
              onClick={() => downloadImage(img.downloadUrl, img.fileName ?? img.caption)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-[#487749] text-white hover:bg-[#3d6540] transition-colors"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <a
              href={buildFileUrl(img.fileUrl)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Open
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ModulesTreeProps {
  groups: Array<{ menuName: string; items: Array<{ moduleId: number; moduleCode: string | null; subMenuName: string; label: string }>; total: number }>
  total: number
  moduleId: number | undefined
  selectedFormCode: string | undefined
  collapsedGroups: Set<string>
  toggleGroup: (menuName: string) => void
  setCollapsedGroups: React.Dispatch<React.SetStateAction<Set<string>>>
  groupedCategories: Array<{ menuName: string }>
  activeGroupName: string | null
  moduleCounts: Map<number, number>
  treeSearch: string
  setTreeSearch: (v: string) => void
  onSelectAll: () => void
  onSelectModule: (c: { moduleId: number; moduleCode: string | null }) => void
}

const ModulesTree: React.FC<ModulesTreeProps> = ({
  groups,
  total,
  moduleId,
  selectedFormCode,
  collapsedGroups,
  toggleGroup,
  setCollapsedGroups,
  groupedCategories,
  activeGroupName,
  moduleCounts,
  treeSearch,
  setTreeSearch,
  onSelectAll,
  onSelectModule,
}) => (
  <div className="flex flex-col h-full overflow-hidden">
    <div className="px-3 py-3 border-b border-[#E0E0E0] bg-white space-y-2 sticky top-0">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#757575]">
          Modules &amp; Forms
        </div>
        {collapsedGroups.size > 0 ? (
          <button
            onClick={() => setCollapsedGroups(new Set())}
            className="text-[10px] text-[#487749] hover:underline"
          >
            Expand all
          </button>
        ) : (
          <button
            onClick={() => setCollapsedGroups(new Set(groupedCategories.map(g => g.menuName)))}
            className="text-[10px] text-[#9E9E9E] hover:text-[#212121] hover:underline"
          >
            Collapse all
          </button>
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E]" />
        <input
          value={treeSearch}
          onChange={e => setTreeSearch(e.target.value)}
          placeholder="Search modules..."
          className="w-full pl-8 pr-7 py-1.5 text-sm bg-white border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749] placeholder-[#9E9E9E]"
        />
        {treeSearch && (
          <button
            onClick={() => setTreeSearch('')}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[#F5F5F5] text-[#9E9E9E]"
            aria-label="Clear modules search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
    <div className="flex-1 overflow-y-auto">
      <button
        onClick={onSelectAll}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
          moduleId === undefined && selectedFormCode === undefined
            ? 'bg-[#487749]/10 text-[#3d6540] font-semibold'
            : 'hover:bg-[#F5F5F5] text-[#212121]'
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <ImageIcon className="w-4 h-4 opacity-60" /> All
        </span>
        <span className="text-xs text-[#9E9E9E]">{total}</span>
      </button>
      {groups.length === 0 && (
        <div className="px-4 py-6 text-center text-xs text-[#9E9E9E]">No matches.</div>
      )}
      <div className="py-1">
        {groups.map(group => {
          const collapsed = collapsedGroups.has(group.menuName)
          const groupActive = activeGroupName === group.menuName
          return (
            <div key={group.menuName} className="mb-0.5">
              <button
                onClick={() => toggleGroup(group.menuName)}
                className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                  groupActive
                    ? 'text-[#3d6540]'
                    : 'text-[#757575] hover:text-[#212121] hover:bg-[#F5F5F5]'
                }`}
                aria-expanded={!collapsed}
              >
                <span className="inline-flex items-center gap-1.5 truncate">
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
                  />
                  <FolderOpen className="w-3.5 h-3.5 opacity-60" />
                  <span className="truncate">{group.menuName}</span>
                </span>
                <span className={`text-[10px] font-medium ml-2 shrink-0 ${group.total === 0 ? 'text-[#BDBDBD]' : 'text-[#9E9E9E]'}`}>
                  {group.total}
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${collapsed ? 'max-h-0 opacity-0' : 'max-h-[1500px] opacity-100'}`}>
                {group.items.map(c => {
                  const count = moduleCounts.get(c.moduleId) ?? 0
                  const isFormCategory = c.moduleId >= 1_000_000
                  const active = isFormCategory ? selectedFormCode === c.moduleCode : moduleId === c.moduleId
                  return (
                    <button
                      key={c.moduleId}
                      onClick={() => onSelectModule(c)}
                      className={`w-full flex items-center justify-between pl-9 pr-4 py-1.5 text-sm transition-colors ${
                        active
                          ? 'bg-[#487749]/10 text-[#3d6540] font-semibold border-l-2 border-[#487749]'
                          : 'hover:bg-[#F5F5F5] text-[#212121] border-l-2 border-transparent'
                      }`}
                      title={c.subMenuName}
                    >
                      <span className="truncate text-left">{c.subMenuName}</span>
                      <span className={`text-xs ml-2 shrink-0 ${count === 0 ? 'text-[#BDBDBD]' : 'text-[#9E9E9E]'}`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  </div>
)

const DetailRow: React.FC<{ label: string; value: string; truncate?: boolean }> = ({ label, value, truncate }) => (
  <div className="min-w-0">
    <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">{label}</div>
    <div className={`font-medium text-gray-900 ${truncate ? 'truncate' : 'break-words'}`} title={value}>
      {value}
    </div>
  </div>
)

export default Gallery
