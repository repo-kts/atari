import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
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
} from 'lucide-react'
import { Breadcrumbs } from '../../components/common/Breadcrumbs'
import { getBreadcrumbsForPath } from '../../config/route'
import { useAuth } from '@/contexts/AuthContext'
import type { ModuleImageRow } from '@/services/moduleImagesApi'
import { API_BASE_URL } from '@/config/api'
import {
  useGallerySource,
  type GallerySource,
} from '@/hooks/useGallerySource'

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
  const breadcrumbs = getBreadcrumbsForPath(location.pathname)
  const { user } = useAuth()

  const showKvkFilter = user?.role !== 'kvk_admin' && user?.role !== 'kvk_user'

  // Indian fiscal year: Apr-Mar. Today's fiscal year = current calendar year if
  // month >= April, else previous calendar year.
  const today = new Date()
  const currentYear =
    today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1
  const [source, setSource] = useState<GallerySource>('forms')
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
      moduleId: source === 'modules' ? moduleId : undefined,
      formCode: source === 'forms' ? selectedFormCode : undefined,
      search: debouncedSearch || undefined,
    }),
    [year, kvkId, moduleId, selectedFormCode, debouncedSearch, source]
  )

  const sourceResult = useGallerySource(source, filters, showKvkFilter)
  const images: ModuleImageRow[] = sourceResult.images
  const total = sourceResult.total
  const categoriesQuery = { data: sourceResult.categories } as { data: typeof sourceResult.categories }
  const kvksQuery = { data: sourceResult.kvks } as { data: typeof sourceResult.kvks }
  const imagesQuery = { isLoading: sourceResult.isLoading } as { isLoading: boolean }

  const yearOptions = useMemo(() => {
    const arr: number[] = []
    for (let y = currentYear + 1; y >= currentYear - 6; y -= 1) arr.push(y)
    return arr
  }, [currentYear])

  const moduleCounts = useMemo(() => {
    const counts = new Map<number, number>()
    for (const img of images) counts.set(img.moduleId, (counts.get(img.moduleId) ?? 0) + 1)
    return counts
  }, [images])

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
    const map = new Map<string, ModuleImageRow[]>()
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

  const flatOrder: ModuleImageRow[] = useMemo(() => {
    const list: ModuleImageRow[] = []
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
    (img: ModuleImageRow) => {
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
      const m =
        categoriesQuery.data?.find(x =>
          source === 'forms' ? x.moduleCode === selectedFormCode : x.moduleId === moduleId,
        )
      chips.push({
        key: 'module',
        label: `${source === 'forms' ? 'Form' : 'Module'}: ${m?.label ?? selectedFormCode ?? moduleId}`,
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
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      {breadcrumbs.length > 0 && (
        <div className="px-4 sm:px-6 pt-4">
          <Breadcrumbs
            items={breadcrumbs.map((b, i) => ({ ...b, level: i }))}
            showHome={false}
          />
        </div>
      )}

      {/* Top bar */}
      <div className="px-4 sm:px-6 pt-3 pb-3 bg-[#F5F5F5] sticky top-0 z-20 border-b border-black/5">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setRailOpen(o => !o)}
            className="hidden lg:inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-black/10 hover:bg-black/5 text-[#487749]"
            aria-label={railOpen ? 'Hide module rail' : 'Show module rail'}
            title={railOpen ? 'Hide modules' : 'Show modules'}
          >
            {railOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          <div className="relative flex-1 min-w-[220px] max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search captions, KVK, module..."
              className="w-full pl-9 pr-9 py-2 text-sm rounded-xl bg-white border border-black/10 focus:outline-none focus:border-[#487749] focus:ring-2 focus:ring-[#487749]/20"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/5 text-black/40"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center rounded-xl border border-black/10 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setSource('forms')
                setModuleId(undefined)
                setSelectedFormCode(undefined)
              }}
              className={`px-3 py-2 text-sm transition-colors ${
                source === 'forms' ? 'bg-[#487749] text-white' : 'text-black/60 hover:bg-black/5'
              }`}
              title="Form attachments"
            >
              Forms
            </button>
            <button
              type="button"
              onClick={() => {
                setSource('modules')
                setModuleId(undefined)
                setSelectedFormCode(undefined)
              }}
              className={`px-3 py-2 text-sm transition-colors ${
                source === 'modules' ? 'bg-[#487749] text-white' : 'text-black/60 hover:bg-black/5'
              }`}
              title="Module images"
            >
              Modules
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="text-sm bg-white border border-black/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#487749]"
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
                className="text-sm bg-white border border-black/10 rounded-xl px-3 py-2 max-w-[180px] focus:outline-none focus:border-[#487749]"
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
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-black/10 text-sm"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          <div className="ml-auto inline-flex rounded-xl border border-black/10 bg-white overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-2 ${viewMode === 'grid' ? 'bg-[#487749] text-white' : 'text-black/60 hover:bg-black/5'}`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-2.5 py-2 ${viewMode === 'compact' ? 'bg-[#487749] text-white' : 'text-black/60 hover:bg-black/5'}`}
              title="Compact view"
              aria-label="Compact view"
            >
              <Rows3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
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
            <button onClick={clearAll} className="text-xs text-black/50 hover:text-black/80 underline">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {railOpen && (
          <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-black/5 bg-white overflow-y-auto">
            <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-black/40">
                {source === 'forms' ? 'Form modules' : 'Modules'}
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
                  onClick={() =>
                    setCollapsedGroups(new Set(groupedCategories.map(g => g.menuName)))
                  }
                  className="text-[10px] text-black/40 hover:text-black/70 hover:underline"
                >
                  Collapse all
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setModuleId(undefined)
                setSelectedFormCode(undefined)
              }}
              className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                moduleId === undefined && selectedFormCode === undefined
                  ? 'bg-[#487749]/10 text-[#3d6540] font-semibold'
                  : 'hover:bg-black/5 text-black/75'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <ImageIcon className="w-4 h-4 opacity-60" /> {source === 'forms' ? 'All forms' : 'All modules'}
              </span>
              <span className="text-xs text-black/40">{total}</span>
            </button>
            <div className="py-1">
              {groupedCategories.map(group => {
                const collapsed = collapsedGroups.has(group.menuName)
                const groupActive = activeGroupName === group.menuName
                return (
                  <div key={group.menuName} className="mb-0.5">
                    <button
                      onClick={() => toggleGroup(group.menuName)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                        groupActive
                          ? 'text-[#3d6540]'
                          : 'text-black/55 hover:text-black/80 hover:bg-black/5'
                      }`}
                      aria-expanded={!collapsed}
                    >
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            collapsed ? '-rotate-90' : ''
                          }`}
                        />
                        <FolderOpen className="w-3.5 h-3.5 opacity-60" />
                        <span className="truncate">{group.menuName}</span>
                      </span>
                      <span
                        className={`text-[10px] font-medium ml-2 shrink-0 ${
                          group.total === 0 ? 'text-black/25' : 'text-black/45'
                        }`}
                      >
                        {group.total}
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        collapsed ? 'max-h-0 opacity-0' : 'max-h-[1500px] opacity-100'
                      }`}
                    >
                      {group.items.map(c => {
                        const count = moduleCounts.get(c.moduleId) ?? 0
                        const active =
                          source === 'modules'
                            ? moduleId === c.moduleId
                            : selectedFormCode === c.moduleCode
                        return (
                          <button
                            key={c.moduleId}
                            onClick={() => {
                              if (source === 'modules') {
                                setModuleId(c.moduleId)
                                setSelectedFormCode(undefined)
                              } else {
                                setModuleId(c.moduleId)
                                setSelectedFormCode(c.moduleCode ?? undefined)
                              }
                            }}
                            className={`w-full flex items-center justify-between pl-9 pr-4 py-1.5 text-sm transition-colors ${
                              active
                                ? 'bg-[#487749]/10 text-[#3d6540] font-semibold border-l-2 border-[#487749]'
                                : 'hover:bg-black/5 text-black/70 border-l-2 border-transparent'
                            }`}
                            title={c.subMenuName}
                          >
                            <span className="truncate text-left">{c.subMenuName}</span>
                            <span
                              className={`text-xs ml-2 shrink-0 ${
                                count === 0 ? 'text-black/25' : 'text-black/45'
                              }`}
                            >
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
          </aside>
        )}

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
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
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1 rounded hover:bg-black/5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="block text-xs font-medium text-black/60 mb-1">Year</label>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="w-full mb-3 text-sm bg-white border border-black/10 rounded-xl px-3 py-2"
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
                  className="w-full mb-3 text-sm bg-white border border-black/10 rounded-xl px-3 py-2"
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
            <label className="block text-xs font-medium text-black/60 mb-1">Module</label>
            <select
              value={moduleId ?? ''}
              onChange={e => setModuleId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full mb-3 text-sm bg-white border border-black/10 rounded-xl px-3 py-2"
            >
              <option value="">All modules</option>
              {(categoriesQuery.data ?? []).map(c => (
                <option key={c.moduleId} value={c.moduleId}>
                  {c.label}
                </option>
              ))}
            </select>
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
    <div className="sticky top-0 -mx-1 px-1 py-2 mb-3 bg-[#F5F5F5]/95 backdrop-blur z-10 flex items-baseline justify-between">
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
  images: ModuleImageRow[]
  onOpen: (img: ModuleImageRow) => void
}> = ({ images, onOpen }) => (
  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
    {images.map(img => (
      <button
        key={img.imageId}
        onClick={() => onOpen(img)}
        className="group relative shrink-0 w-44 h-32 rounded-xl overflow-hidden bg-black/5 ring-1 ring-black/5 hover:ring-[#487749]/40 transition-all"
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
  images: ModuleImageRow[]
  onOpen: (img: ModuleImageRow) => void
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
  img: ModuleImageRow
  onOpen: (img: ModuleImageRow) => void
  compact?: boolean
}> = ({ img, onOpen, compact }) => {
  return (
    <button
      onClick={() => onOpen(img)}
      className="group relative mb-3 w-full break-inside-avoid rounded-xl overflow-hidden bg-black/5 ring-1 ring-black/5 hover:ring-[#487749]/50 hover:shadow-lg transition-all duration-200 block"
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
          className="mb-3 w-full rounded-xl bg-black/5 animate-pulse break-inside-avoid"
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
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black/5 mb-4">
        <ImageIcon className="w-7 h-7 text-black/30" />
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
  img: ModuleImageRow
  index: number
  total: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}> = ({ img, index, total, onClose, onNext, onPrev }) => {
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
      <div className="flex items-center justify-between px-4 py-3 text-white">
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

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center px-4 relative min-h-0">
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
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Info strip */}
      {showInfo && (
        <div className="px-4 py-3 bg-black/60 text-white text-sm flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="font-medium truncate max-w-md">
            {img.caption || img.categoryLabel || 'Untitled'}
          </span>
          <span className="text-white/70 text-xs">
            <span className="text-white/40">Module:</span> {img.categoryLabel}
          </span>
          <span className="text-white/70 text-xs">
            <span className="text-white/40">KVK:</span> {img.kvkName}
          </span>
          <span className="text-white/70 text-xs">
            <span className="text-white/40">Date:</span> {formatDate(img.imageDate || img.createdAt)}
          </span>
          <span className="text-white/70 text-xs">
            <span className="text-white/40">Year:</span> {img.reportingYear}
          </span>
          {img.uploadedBy && (
            <span className="text-white/70 text-xs">
              <span className="text-white/40">By:</span> {img.uploadedBy.name}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default Gallery
