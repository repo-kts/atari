import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Loader2,
    CheckCircle2,
    Circle,
    ChevronDown,
    ChevronRight,
    Search,
    Lock,
    ArrowUpRight,
    LayoutGrid,
    Table as TableIcon,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useFormSummary } from '../../hooks/useFormSummary'
import { ApiError } from '../../services/api'
import {
    isAllKvkSummary,
    type FormModuleRow,
    type FormModuleMeta,
    type KvkFormSummary,
    type AllKvkFormSummary,
    type FormStatus,
} from '../../types/formSummary'

const THEME = {
    primary: '#487749',
    primarySoft: '#E8F5E9',
    primaryBorder: '#C8E6C9',
    cardBg: '#FAF9F6',
    border: '#E0E0E0',
    mutedText: '#757575',
    neutralBg: '#F5F5F5',
} as const

function progressTone(pct: number): string {
    if (pct >= 80) return THEME.primary
    if (pct >= 40) return '#5c9a5e'
    if (pct > 0) return '#7ab37c'
    return '#E0E0E0'
}

function ProgressBar({ value }: { value: number }) {
    const tone = progressTone(value)
    return (
        <div className="w-full h-1.5 rounded-full bg-[#F0F0F0] overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: tone }}
            />
        </div>
    )
}

function StatusPill({ status, count }: { status: FormStatus; count: number }) {
    if (status === 'completed') {
        return (
            <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border"
                style={{
                    backgroundColor: THEME.primarySoft,
                    color: THEME.primary,
                    borderColor: THEME.primaryBorder,
                }}
            >
                <CheckCircle2 className="w-3 h-3" />
                {count} {count === 1 ? 'entry' : 'entries'}
            </span>
        )
    }
    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-[#F5F5F5] text-[#9e9e9e] border-[#E0E0E0]"
        >
            <Circle className="w-3 h-3" />
            Not started
        </span>
    )
}

function groupByCategory<T extends { category: string; subcategory: string | null }>(
    rows: T[],
    categoryOrder: string[],
) {
    const byCat = new Map<string, Map<string | null, T[]>>()
    for (const r of rows) {
        if (!byCat.has(r.category)) byCat.set(r.category, new Map())
        const subMap = byCat.get(r.category)!
        const sub = r.subcategory || null
        if (!subMap.has(sub)) subMap.set(sub, [])
        subMap.get(sub)!.push(r)
    }
    const ordered: { category: string; groups: { subcategory: string | null; items: T[] }[] }[] = []
    const seen = new Set<string>()
    for (const cat of categoryOrder) {
        if (byCat.has(cat)) {
            seen.add(cat)
            ordered.push({ category: cat, groups: subMapToArray(byCat.get(cat)!) })
        }
    }
    for (const [cat, subMap] of byCat.entries()) {
        if (!seen.has(cat)) ordered.push({ category: cat, groups: subMapToArray(subMap) })
    }
    return ordered
}

function subMapToArray<T>(subMap: Map<string | null, T[]>) {
    return Array.from(subMap.entries()).map(([subcategory, items]) => ({ subcategory, items }))
}

/* ────────────────────────────────────────────────────────────────────────── */

function SingleKvkView({ data }: { data: KvkFormSummary }) {
    const [query, setQuery] = useState('')

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return data.modules
        return data.modules.filter(
            m =>
                m.title.toLowerCase().includes(q) ||
                m.category.toLowerCase().includes(q) ||
                (m.subcategory?.toLowerCase().includes(q) ?? false),
        )
    }, [data.modules, query])

    const grouped = useMemo(
        () => groupByCategory(filtered, data.categoryOrder),
        [filtered, data.categoryOrder],
    )

    return (
        <div className="space-y-6">
            {/* Summary header */}
            <div
                className="rounded-xl p-5"
                style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}` }}
            >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <div className="text-xs font-medium uppercase tracking-wider" style={{ color: THEME.mutedText }}>
                            {data.kvkName || 'Your KVK'}
                        </div>
                        <div className="mt-1 flex items-baseline gap-3">
                            <span className="text-3xl font-bold" style={{ color: THEME.primary }}>
                                {data.completed}
                            </span>
                            <span className="text-sm" style={{ color: THEME.mutedText }}>
                                of {data.total} forms filled
                            </span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold" style={{ color: progressTone(data.progress) }}>
                            {data.progress}%
                        </span>
                        <span className="text-xs" style={{ color: THEME.mutedText }}>
                            complete
                        </span>
                    </div>
                </div>
                <div className="mt-4">
                    <ProgressBar value={data.progress} />
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: THEME.mutedText }}
                />
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Filter forms..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white border focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{
                        borderColor: THEME.border,
                        // @ts-expect-error — CSS custom property
                        '--tw-ring-color': THEME.primary,
                    }}
                />
            </div>

            {/* Grouped list */}
            {grouped.length === 0 ? (
                <div
                    className="rounded-xl p-8 text-center text-sm"
                    style={{ backgroundColor: THEME.cardBg, color: THEME.mutedText }}
                >
                    No forms match your search.
                </div>
            ) : (
                grouped.map(({ category, groups }) => (
                    <section key={category}>
                        <h3
                            className="text-xs font-semibold uppercase tracking-wider mb-3"
                            style={{ color: THEME.mutedText }}
                        >
                            {category}
                        </h3>
                        <div className="space-y-4">
                            {groups.map(({ subcategory, items }) => (
                                <div key={subcategory ?? '_'}>
                                    {subcategory && (
                                        <div
                                            className="text-[11px] font-medium mb-2 ml-0.5"
                                            style={{ color: THEME.mutedText }}
                                        >
                                            {subcategory}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {items.map(m => (
                                            <FormTile key={m.key} row={m as FormModuleRow} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))
            )}
        </div>
    )
}

function FormTile({ row }: { row: FormModuleRow }) {
    const isDone = row.status === 'completed'
    const content = (
        <>
            <div className="min-w-0 flex-1 flex items-center gap-1.5">
                <span className="text-sm font-medium text-[#2c2c2c] truncate" title={row.title}>
                    {row.title}
                </span>
                {row.path && (
                    <ArrowUpRight
                        className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: THEME.primary }}
                    />
                )}
            </div>
            <StatusPill status={row.status} count={row.count} />
        </>
    )

    const baseClass =
        'group rounded-lg px-3 py-2.5 flex items-center justify-between gap-3 transition-all'
    const style: React.CSSProperties = {
        backgroundColor: THEME.cardBg,
        border: `1px solid ${isDone ? THEME.primaryBorder : THEME.border}`,
    }

    if (row.path) {
        return (
            <Link
                to={row.path}
                className={`${baseClass} hover:shadow-sm hover:-translate-y-0.5`}
                style={style}
                onMouseEnter={e => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = THEME.primary
                }}
                onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = isDone
                        ? THEME.primaryBorder
                        : THEME.border
                }}
            >
                {content}
            </Link>
        )
    }

    return (
        <div className={baseClass} style={style}>
            {content}
        </div>
    )
}

/* ────────────────────────────────────────────────────────────────────────── */

type SuperAdminView = 'by_kvk' | 'matrix'

function AllKvkView({ data }: { data: AllKvkFormSummary }) {
    const [view, setView] = useState<SuperAdminView>('by_kvk')
    const [expandedKvkId, setExpandedKvkId] = useState<number | null>(null)
    const [query, setQuery] = useState('')

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return data.kvks
        return data.kvks.filter(k => k.kvkName.toLowerCase().includes(q))
    }, [data.kvks, query])

    const overall = useMemo(() => {
        const total = data.kvks.reduce((s, k) => s + k.total, 0)
        const completed = data.kvks.reduce((s, k) => s + k.completed, 0)
        return {
            completed,
            total,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0,
            kvkCount: data.kvks.length,
            formCount: data.modules.length,
        }
    }, [data])

    return (
        <div className="space-y-6">
            {/* Overall header */}
            <div
                className="rounded-xl p-5"
                style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}` }}
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Stat label="KVKs" value={overall.kvkCount} />
                    <Stat label="Forms tracked" value={overall.formCount} />
                    <Stat
                        label="Entries filled"
                        value={`${overall.completed.toLocaleString()} / ${overall.total.toLocaleString()}`}
                    />
                    <Stat
                        label="Overall progress"
                        value={`${overall.progress}%`}
                        valueColor={progressTone(overall.progress)}
                    />
                </div>
                <div className="mt-4">
                    <ProgressBar value={overall.progress} />
                </div>
            </div>

            {/* View toggle + search */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <ViewToggle value={view} onChange={setView} />
                <div className="relative flex-1 max-w-sm min-w-[220px]">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: THEME.mutedText }}
                    />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={view === 'matrix' ? 'Filter KVKs (columns)…' : 'Filter KVKs…'}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white border focus:outline-none focus:ring-2"
                        style={{
                            borderColor: THEME.border,
                            // @ts-expect-error — CSS custom property
                            '--tw-ring-color': THEME.primary,
                        }}
                    />
                </div>
            </div>

            {view === 'matrix' ? (
                <MatrixView
                    modules={data.modules}
                    kvks={filtered}
                    categoryOrder={data.categoryOrder}
                />
            ) : (
                <ByKvkList
                    filtered={filtered}
                    modules={data.modules}
                    categoryOrder={data.categoryOrder}
                    expandedKvkId={expandedKvkId}
                    setExpandedKvkId={setExpandedKvkId}
                />
            )}
        </div>
    )
}

function ByKvkList({
    filtered,
    modules,
    categoryOrder,
    expandedKvkId,
    setExpandedKvkId,
}: {
    filtered: AllKvkFormSummary['kvks']
    modules: FormModuleMeta[]
    categoryOrder: string[]
    expandedKvkId: number | null
    setExpandedKvkId: (id: number | null) => void
}) {
    return (
        <>
            {/* KVK table */}
            <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}` }}
            >
                <div
                    className="grid grid-cols-[minmax(0,1fr)_100px_minmax(0,1.3fr)_90px] md:grid-cols-[minmax(0,2fr)_120px_minmax(0,2fr)_100px] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: THEME.mutedText, borderBottom: `1px solid ${THEME.border}` }}
                >
                    <div>KVK</div>
                    <div className="text-right">Filled</div>
                    <div>Progress</div>
                    <div className="text-right">%</div>
                </div>
                {filtered.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm" style={{ color: THEME.mutedText }}>
                        No KVKs match.
                    </div>
                ) : (
                    filtered.map(kvk => {
                        const isOpen = expandedKvkId === kvk.kvkId
                        return (
                            <div key={kvk.kvkId} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                                <button
                                    onClick={() =>
                                        setExpandedKvkId(isOpen ? null : kvk.kvkId)
                                    }
                                    className="w-full grid grid-cols-[minmax(0,1fr)_100px_minmax(0,1.3fr)_90px] md:grid-cols-[minmax(0,2fr)_120px_minmax(0,2fr)_100px] gap-4 items-center px-5 py-3 text-left hover:bg-white/50 transition-colors"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        {isOpen ? (
                                            <ChevronDown className="w-4 h-4 shrink-0" style={{ color: THEME.mutedText }} />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: THEME.mutedText }} />
                                        )}
                                        <span className="text-sm font-medium text-[#2c2c2c] truncate">
                                            {kvk.kvkName}
                                        </span>
                                    </div>
                                    <div className="text-sm text-right tabular-nums" style={{ color: THEME.mutedText }}>
                                        {kvk.completed}/{kvk.total}
                                    </div>
                                    <div>
                                        <ProgressBar value={kvk.progress} />
                                    </div>
                                    <div
                                        className="text-sm font-semibold text-right tabular-nums"
                                        style={{ color: progressTone(kvk.progress) }}
                                    >
                                        {kvk.progress}%
                                    </div>
                                </button>

                                {isOpen && (
                                    <KvkModuleBreakdown
                                        modules={modules}
                                        counts={kvk.countsByKey}
                                        categoryOrder={categoryOrder}
                                    />
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </>
    )
}

function ViewToggle({
    value,
    onChange,
}: {
    value: SuperAdminView
    onChange: (v: SuperAdminView) => void
}) {
    const btn = (mode: SuperAdminView, label: string, Icon: typeof LayoutGrid) => {
        const active = value === mode
        return (
            <button
                type="button"
                onClick={() => onChange(mode)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                style={{
                    backgroundColor: active ? 'white' : 'transparent',
                    color: active ? THEME.primary : THEME.mutedText,
                    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.04)' : undefined,
                }}
            >
                <Icon className="w-4 h-4" />
                {label}
            </button>
        )
    }
    return (
        <div
            className="inline-flex items-center gap-1 p-1 rounded-lg"
            style={{ backgroundColor: THEME.neutralBg, border: `1px solid ${THEME.border}` }}
        >
            {btn('by_kvk', 'By KVK', LayoutGrid)}
            {btn('matrix', 'Matrix', TableIcon)}
        </div>
    )
}

/* ───── Matrix View (forms × KVKs pivot) ──────────────────────────────── */

function MatrixView({
    modules,
    kvks,
    categoryOrder,
}: {
    modules: FormModuleMeta[]
    kvks: AllKvkFormSummary['kvks']
    categoryOrder: string[]
}) {
    // Sort modules so they group visually by category (matching the byKvk view order).
    const orderedModules = useMemo(() => {
        const idx = (c: string) => {
            const i = categoryOrder.indexOf(c)
            return i === -1 ? categoryOrder.length : i
        }
        return [...modules].sort((a, b) => {
            const d = idx(a.category) - idx(b.category)
            if (d !== 0) return d
            const s = (a.subcategory || '').localeCompare(b.subcategory || '')
            if (s !== 0) return s
            return 0
        })
    }, [modules, categoryOrder])

    if (kvks.length === 0) {
        return (
            <div
                className="rounded-xl p-8 text-center text-sm"
                style={{
                    backgroundColor: THEME.cardBg,
                    color: THEME.mutedText,
                    border: `1px solid ${THEME.border}`,
                }}
            >
                No KVKs match.
            </div>
        )
    }

    // Design: fixed-width columns, sticky #, form-name, and header row.
    const firstColW = 48
    const formNameColW = 280
    const kvkColW = 130
    const rowH = 36

    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{ border: `1px solid ${THEME.border}`, backgroundColor: 'white' }}
        >
            <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                <table
                    className="border-collapse text-sm"
                    style={{ minWidth: firstColW + formNameColW + kvkColW * kvks.length }}
                >
                    <thead>
                        <tr>
                            <th
                                className="text-[11px] font-semibold uppercase tracking-wider text-left px-3"
                                style={{
                                    position: 'sticky',
                                    top: 0,
                                    left: 0,
                                    zIndex: 3,
                                    width: firstColW,
                                    minWidth: firstColW,
                                    height: rowH,
                                    backgroundColor: THEME.cardBg,
                                    color: THEME.mutedText,
                                    borderBottom: `1px solid ${THEME.border}`,
                                    borderRight: `1px solid ${THEME.border}`,
                                }}
                            >
                                #
                            </th>
                            <th
                                className="text-[11px] font-semibold uppercase tracking-wider text-left px-3"
                                style={{
                                    position: 'sticky',
                                    top: 0,
                                    left: firstColW,
                                    zIndex: 3,
                                    width: formNameColW,
                                    minWidth: formNameColW,
                                    height: rowH,
                                    backgroundColor: THEME.cardBg,
                                    color: THEME.mutedText,
                                    borderBottom: `1px solid ${THEME.border}`,
                                    borderRight: `2px solid ${THEME.border}`,
                                }}
                            >
                                Form name
                            </th>
                            {kvks.map(kvk => (
                                <th
                                    key={kvk.kvkId}
                                    className="text-[11px] font-semibold text-center px-2"
                                    style={{
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2,
                                        width: kvkColW,
                                        minWidth: kvkColW,
                                        height: rowH,
                                        backgroundColor: THEME.cardBg,
                                        color: '#2c2c2c',
                                        borderBottom: `1px solid ${THEME.border}`,
                                        borderRight: `1px solid ${THEME.border}`,
                                    }}
                                    title={`${kvk.completed}/${kvk.total} · ${kvk.progress}%`}
                                >
                                    <div className="truncate">{kvk.kvkName}</div>
                                    <div
                                        className="text-[10px] font-normal"
                                        style={{ color: progressTone(kvk.progress) }}
                                    >
                                        {kvk.progress}%
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {orderedModules.map((mod, i) => (
                            <tr key={mod.key} className="group">
                                <td
                                    className="text-[12px] tabular-nums text-right px-3"
                                    style={{
                                        position: 'sticky',
                                        left: 0,
                                        zIndex: 1,
                                        width: firstColW,
                                        minWidth: firstColW,
                                        height: rowH,
                                        backgroundColor: 'white',
                                        color: THEME.mutedText,
                                        borderBottom: `1px solid ${THEME.border}`,
                                        borderRight: `1px solid ${THEME.border}`,
                                    }}
                                >
                                    {i + 1}
                                </td>
                                <td
                                    className="px-3"
                                    style={{
                                        position: 'sticky',
                                        left: firstColW,
                                        zIndex: 1,
                                        width: formNameColW,
                                        minWidth: formNameColW,
                                        height: rowH,
                                        backgroundColor: 'white',
                                        borderBottom: `1px solid ${THEME.border}`,
                                        borderRight: `2px solid ${THEME.border}`,
                                    }}
                                >
                                    {mod.path ? (
                                        <Link
                                            to={mod.path}
                                            className="text-sm truncate block hover:underline"
                                            style={{ color: THEME.primary }}
                                            title={mod.title}
                                        >
                                            {mod.title}
                                        </Link>
                                    ) : (
                                        <span
                                            className="text-sm truncate block"
                                            style={{ color: '#2c2c2c' }}
                                            title={mod.title}
                                        >
                                            {mod.title}
                                        </span>
                                    )}
                                </td>
                                {kvks.map(kvk => {
                                    const count = kvk.countsByKey[mod.key] || 0
                                    const filled = count > 0
                                    return (
                                        <td
                                            key={kvk.kvkId}
                                            className="text-center"
                                            style={{
                                                width: kvkColW,
                                                minWidth: kvkColW,
                                                height: rowH,
                                                backgroundColor: filled ? THEME.primarySoft : 'white',
                                                color: filled ? THEME.primary : THEME.mutedText,
                                                fontWeight: filled ? 600 : 400,
                                                borderBottom: `1px solid ${THEME.border}`,
                                                borderRight: `1px solid ${THEME.border}`,
                                                fontSize: filled ? 13 : 12,
                                            }}
                                            title={
                                                filled
                                                    ? `${count} ${count === 1 ? 'entry' : 'entries'} · ${kvk.kvkName}`
                                                    : `Not filled · ${kvk.kvkName}`
                                            }
                                        >
                                            {filled ? count : '—'}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Legend */}
            <div
                className="flex items-center justify-between gap-4 px-4 py-2 text-[11px]"
                style={{
                    borderTop: `1px solid ${THEME.border}`,
                    backgroundColor: THEME.cardBg,
                    color: THEME.mutedText,
                }}
            >
                <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                        <span
                            className="inline-block w-3 h-3 rounded"
                            style={{
                                backgroundColor: THEME.primarySoft,
                                border: `1px solid ${THEME.primaryBorder}`,
                            }}
                        />
                        Filled — number of entries
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span
                            className="inline-block w-3 h-3 rounded"
                            style={{
                                backgroundColor: 'white',
                                border: `1px solid ${THEME.border}`,
                            }}
                        />
                        Not filled yet
                    </span>
                </div>
                <div className="tabular-nums">
                    {orderedModules.length} forms × {kvks.length} KVKs
                </div>
            </div>
        </div>
    )
}

function Stat({
    label,
    value,
    valueColor,
}: {
    label: string
    value: React.ReactNode
    valueColor?: string
}) {
    return (
        <div>
            <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: THEME.mutedText }}>
                {label}
            </div>
            <div className="mt-1 text-2xl font-bold" style={{ color: valueColor ?? '#2c2c2c' }}>
                {value}
            </div>
        </div>
    )
}

function KvkModuleBreakdown({
    modules,
    counts,
    categoryOrder,
}: {
    modules: FormModuleMeta[]
    counts: Record<string, number>
    categoryOrder: string[]
}) {
    const rows: FormModuleRow[] = useMemo(
        () =>
            modules.map(m => {
                const count = counts[m.key] || 0
                return { ...m, count, status: count > 0 ? 'completed' : 'not_started' }
            }),
        [modules, counts],
    )
    const grouped = useMemo(() => groupByCategory(rows, categoryOrder), [rows, categoryOrder])

    return (
        <div
            className="px-5 py-4 space-y-4"
            style={{ backgroundColor: '#FDFCFA', borderTop: `1px solid ${THEME.border}` }}
        >
            {grouped.map(({ category, groups }) => (
                <div key={category}>
                    <div
                        className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                        style={{ color: THEME.mutedText }}
                    >
                        {category}
                    </div>
                    <div className="space-y-3">
                        {groups.map(({ subcategory, items }) => (
                            <div key={subcategory ?? '_'}>
                                {subcategory && (
                                    <div
                                        className="text-[10px] mb-1 ml-0.5"
                                        style={{ color: THEME.mutedText }}
                                    >
                                        {subcategory}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                                    {items.map(m => (
                                        <FormTile key={m.key} row={m} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

/* ────────────────────────────────────────────────────────────────────────── */

function ErrorState({ error, isSuperAdmin }: { error: unknown; isSuperAdmin: boolean }) {
    const status = error instanceof ApiError ? error.status : 0
    const message = (error as Error)?.message || 'Unknown error'
    const isForbidden = status === 403 || /insufficient permission/i.test(message)

    if (isForbidden) {
        return (
            <div
                className="rounded-xl p-8 text-center max-w-xl mx-auto"
                style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}` }}
            >
                <div
                    className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4"
                    style={{ backgroundColor: THEME.primarySoft }}
                >
                    <Lock className="w-5 h-5" style={{ color: THEME.primary }} />
                </div>
                <h2 className="text-base font-semibold text-[#2c2c2c] mb-2">
                    Access not yet enabled
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: THEME.mutedText }}>
                    {isSuperAdmin ? (
                        <>
                            The <span className="font-medium">Form Summary</span> module is new. Run{' '}
                            <code className="px-1.5 py-0.5 rounded bg-[#F0F0F0] text-[12px] font-mono">
                                npm run seed:permissions
                            </code>{' '}
                            on the backend to register it, then refresh this page.
                        </>
                    ) : (
                        <>
                            The <span className="font-medium">Form Summary</span> module isn’t yet enabled for your role.
                            Ask your <span className="font-medium">super admin</span> to grant{' '}
                            <code className="px-1.5 py-0.5 rounded bg-[#F0F0F0] text-[12px] font-mono">
                                form_summary_status
                            </code>{' '}
                            VIEW access, then refresh this page.
                        </>
                    )}
                </p>
            </div>
        )
    }

    return (
        <div
            className="rounded-xl p-6 text-sm"
            style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}
        >
            Failed to load summary: {message}
        </div>
    )
}

export const FormSummary: React.FC = () => {
    const { user } = useAuth()
    const { data, isPending, isError, error } = useFormSummary()

    const title = user?.role === 'super_admin' ? 'Form Summary — All KVKs' : 'Form Summary'
    const subtitle =
        user?.role === 'super_admin'
            ? 'Track which KVKs have submitted each form'
            : 'Completion status of every form you can fill'

    return (
        <div className="bg-white rounded-2xl p-1">
            <div className="mb-6 px-6 pt-6">
                <h1 className="text-2xl font-bold" style={{ color: THEME.primary }}>
                    {title}
                </h1>
                <p className="text-sm mt-1 font-medium" style={{ color: THEME.mutedText }}>
                    {subtitle}
                </p>
            </div>

            <div className="px-6 pb-6">
                {isPending ? (
                    <div className="flex items-center justify-center py-20" style={{ color: THEME.mutedText }}>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span className="text-sm">Loading summary…</span>
                    </div>
                ) : isError ? (
                    <ErrorState error={error} isSuperAdmin={user?.role === 'super_admin'} />
                ) : data && isAllKvkSummary(data) ? (
                    <AllKvkView data={data} />
                ) : data ? (
                    <SingleKvkView data={data as KvkFormSummary} />
                ) : null}
            </div>
        </div>
    )
}
