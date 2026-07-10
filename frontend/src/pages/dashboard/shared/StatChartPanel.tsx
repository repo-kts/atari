import React, { useId, useMemo, useState } from 'react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import {
    BarChart3,
    ChevronLeft,
    ChevronRight,
    LineChart as LineIcon,
    ListChecks,
    Maximize2,
} from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/Card'

export type StatSegments = Record<string, number>

export type StatRow = {
    id: number | string
    name: string
    status: string
    primary: number
    secondary?: number
    segments?: StatSegments
}

/** One stacked series. Defaults to ongoing/completed/notStarted. */
export type SegmentDef = {
    key: string
    label: string
    color: string
}

type Mode = 'pair' | 'count'
type View = 'progress' | 'bar' | 'area'

type Props = {
    title: string
    subtitle?: string
    rows: StatRow[]
    mode: Mode
    primaryLabel: string
    secondaryLabel?: string
    unit?: string
    /** Overrides the default status stack, e.g. gender or social category. */
    segmentDefs?: SegmentDef[]
    /** Renders a "Detailed" link in the header when set. */
    detailHref?: string
    /** Label for the grouped entity in the "N of M with entries" strip. */
    entityLabel?: string
}

const STATUS_BADGE: Record<string, string> = {
    complete: 'bg-[#E8F5E9] text-[#487749] border border-[#C8E6C9]',
    active: 'bg-[#E8F5E9] text-[#487749] border border-[#C8E6C9]',
    'in-progress': 'bg-[#F1F8E9] text-[#487749] border border-[#DCEDC8]',
    over: 'bg-[#FFF3E0] text-[#F57C00] border border-[#FFE0B2]',
    pending: 'bg-[#F5F5F5] text-[#757575] border border-[#E0E0E0]',
}

const STATUS_BAR: Record<string, string> = {
    complete: 'bg-[#487749]',
    active: 'bg-[#487749]',
    'in-progress': 'bg-[#5c9a5e]',
    over: 'bg-amber-500',
    pending: 'bg-gray-300',
}

const SEG_COLOR = {
    completed: '#487749',
    ongoing: '#F2A61F',
    notStarted: '#BDBDBD',
}

/** Status stack, used when the caller passes no segmentDefs. */
const DEFAULT_SEGMENT_DEFS: SegmentDef[] = [
    { key: 'ongoing', label: 'Ongoing', color: SEG_COLOR.ongoing },
    { key: 'completed', label: 'Completed', color: SEG_COLOR.completed },
    { key: 'notStarted', label: 'Not started', color: SEG_COLOR.notStarted },
]

const COLOR_GRID = '#E0E0E0'
const COLOR_AXIS = '#757575'

// Cap each view to 10 rows at a time; the rest is reachable via paging so the
// chart stays readable instead of cramming 60+ bars into one frame.
const PAGE_SIZE = 10

function pct(num: number, den: number) {
    if (den <= 0) return 0
    return Math.min((num / den) * 100, 100)
}

function truncate(s: string, n = 14) {
    return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

const ChartTooltip = ({
    active,
    payload,
    unit,
    labels,
}: {
    active?: boolean
    payload?: Array<{
        name: string
        value: number
        color: string
        payload: { fullName?: string }
    }>
    unit?: string
    labels: Record<string, string>
}) => {
    if (!active || !payload || payload.length === 0) return null
    const fullName = payload[0]?.payload?.fullName ?? ''
    const total = payload.reduce((sum, p) => sum + (p.value || 0), 0)
    const ordered = [...payload].reverse()
    return (
        <div className="rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 shadow-lg min-w-[180px]">
            <div className="text-[11px] font-bold text-[#212121] mb-1.5 line-clamp-2">
                {fullName}
            </div>
            <div className="space-y-1">
                {ordered.map(p => (
                    <div
                        key={p.name}
                        className="flex items-center justify-between gap-3 text-[11px]"
                    >
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: p.color }}
                            />
                            <span className="text-[#757575] font-medium truncate">
                                {labels[p.name] ?? p.name}
                            </span>
                        </div>
                        <span className="text-[#212121] font-bold shrink-0">
                            {p.value.toLocaleString()}
                            {unit ? ` ${unit}` : ''}
                        </span>
                    </div>
                ))}
                <div className="pt-1 mt-1 border-t border-[#E0E0E0] flex items-center justify-between text-[11px]">
                    <span className="text-[#757575] font-medium">Total</span>
                    <span className="text-[#487749] font-bold">
                        {total.toLocaleString()}
                        {unit ? ` ${unit}` : ''}
                    </span>
                </div>
            </div>
        </div>
    )
}

const Legend: React.FC<{ defs: SegmentDef[] }> = ({ defs }) => (
    <div className="flex items-center gap-3 flex-wrap">
        {defs.map(def => (
            <div key={def.key} className="flex items-center gap-1.5">
                <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: def.color }}
                />
                <span className="text-[10px] font-medium text-[#757575] uppercase tracking-wide">
                    {def.label}
                </span>
            </div>
        ))}
    </div>
)

const ViewToggle: React.FC<{ view: View; onChange: (v: View) => void }> = ({
    view,
    onChange,
}) => {
    // #174: default tab order is Bar > List > Area, with Bar active by default.
    const items: Array<{ key: View; label: string; icon: React.ReactNode }> = [
        {
            key: 'bar',
            label: 'Bar',
            icon: <BarChart3 className="w-3 h-3" />,
        },
        {
            key: 'progress',
            label: 'List',
            icon: <ListChecks className="w-3 h-3" />,
        },
        {
            key: 'area',
            label: 'Area',
            icon: <LineIcon className="w-3 h-3" />,
        },
    ]
    return (
        <div
            className="inline-flex items-center gap-0.5 rounded-md border border-[#E0E0E0] bg-white p-0.5"
            role="tablist"
        >
            {items.map(item => {
                const isActive = view === item.key
                return (
                    <button
                        key={item.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(item.key)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-colors ${
                            isActive
                                ? 'bg-[#487749] text-white'
                                : 'text-[#757575] hover:text-[#487749]'
                        }`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                )
            })}
        </div>
    )
}

export const StatChartPanel: React.FC<Props> = ({
    title,
    subtitle,
    rows,
    mode,
    primaryLabel,
    secondaryLabel,
    unit,
    segmentDefs,
    detailHref,
    entityLabel = 'KVKs',
}) => {
    // #174: Bar is the default view (was 'progress').
    const [view, setView] = useState<View>('bar')

    // useId emits colons, which are not valid inside an SVG url(#…) reference.
    const gradientId = `grad-${useId().replace(/:/g, '')}`

    const defs = segmentDefs ?? DEFAULT_SEGMENT_DEFS
    const segKeys = useMemo(() => defs.map(d => d.key), [defs])
    const segLabels = useMemo(
        () => Object.fromEntries(defs.map(d => [d.key, d.label])),
        [defs]
    )

    // With 60+ KVKs most have no entries ("not started"), so the chart is a wall
    // of identical grey bars and the labels overlap into noise. Default to only
    // the KVKs that actually have activity, sorted busiest-first, and collapse the
    // rest into a count the user can expand on demand.
    const [activeOnly, setActiveOnly] = useState(true)

    // "notStarted" is a placeholder bar, not activity — excluding it is what
    // makes the active-only filter mean anything.
    const rowActivity = (r: StatRow) =>
        segKeys
            .filter(k => k !== 'notStarted')
            .reduce((sum, k) => sum + (r.segments?.[k] ?? 0), 0) +
        Math.max(r.primary ?? 0, 0)
    const rowHasEntries = (r: StatRow) => rowActivity(r) > 0

    const activeCount = useMemo(
        () => rows.filter(rowHasEntries).length,
        [rows, segKeys]
    )
    const emptyCount = rows.length - activeCount

    const sortedRows = useMemo(() => {
        const base = activeOnly ? rows.filter(rowHasEntries) : rows
        // Busiest KVKs first so the meaningful bars cluster at the left.
        return [...base].sort((a, b) => rowActivity(b) - rowActivity(a))
    }, [rows, activeOnly, segKeys])

    // Page the sorted list into batches of PAGE_SIZE (top 10 first).
    const [page, setPage] = useState(0)
    const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE))
    // Keep the page in range when the underlying list shrinks (filter toggle,
    // refetch with fewer rows, etc.).
    const safePage = Math.min(page, pageCount - 1)
    if (safePage !== page) setPage(safePage)

    const visibleRows = useMemo(
        () =>
            sortedRows.slice(
                safePage * PAGE_SIZE,
                safePage * PAGE_SIZE + PAGE_SIZE
            ),
        [sortedRows, safePage]
    )

    const chartData = useMemo(
        () =>
            visibleRows.map(r => {
                const segs: Record<string, number> = {}
                for (const key of segKeys) segs[key] = r.segments?.[key] ?? 0
                return {
                    id: r.id,
                    name: truncate(r.name),
                    fullName: r.name,
                    primary: r.primary,
                    secondary: r.secondary ?? 0,
                    status: r.status,
                    ...segs,
                }
            }),
        [visibleRows, segKeys]
    )

    const showStacked = chartData.some(d =>
        segKeys.some(k => ((d as Record<string, unknown>)[k] as number) > 0)
    )

    return (
        <Card className="border-[#E0E0E0] shadow-none">
            <CardContent className="p-0">
                <div className="flex items-start justify-between gap-2 border-b border-[#E0E0E0] bg-[#FAF9F6] px-3 py-2">
                    <div className="min-w-0">
                        <h3 className="text-xs font-bold text-[#487749] uppercase tracking-wider">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-[10px] text-[#757575] mt-0.5">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <ViewToggle view={view} onChange={setView} />
                        {detailHref && (
                            <Link
                                to={detailHref}
                                className="flex items-center gap-1 rounded-md border border-[#E0E0E0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#487749] transition-colors hover:bg-[#F5F5F5]"
                            >
                                <Maximize2 className="w-3 h-3" />
                                <span>Detailed</span>
                            </Link>
                        )}
                    </div>
                </div>

                {emptyCount > 0 && (
                    <div className="flex items-center justify-between gap-2 border-b border-[#E0E0E0] px-3 py-1.5">
                        <span className="text-[10px] text-[#757575]">
                            <span className="font-bold text-[#212121]">
                                {activeCount}
                            </span>{' '}
                            of {rows.length} {entityLabel} with entries
                            <span className="text-[#9E9E9E]">
                                {' '}
                                · {emptyCount} not started
                            </span>
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveOnly(v => !v)
                                setPage(0)
                            }}
                            className="shrink-0 rounded-md border border-[#E0E0E0] px-2 py-0.5 text-[10px] font-semibold text-[#487749] hover:bg-[#F5F5F5] transition-colors"
                        >
                            {activeOnly
                                ? `Show all (${rows.length})`
                                : 'Active only'}
                        </button>
                    </div>
                )}

                {view === 'progress' && (
                    <div className="space-y-3 max-h-[min(420px,50vh)] overflow-y-auto p-3">
                        {visibleRows.map(row => {
                            const total = segKeys.reduce(
                                (sum, k) => sum + (row.segments?.[k] ?? 0),
                                0
                            )
                            const useSegments = total > 0
                            const fallbackProgress =
                                mode === 'pair'
                                    ? pct(row.primary, row.secondary ?? 0)
                                    : 100
                            return (
                                <div key={row.id} className="space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-xs font-bold text-[#212121] line-clamp-2">
                                            {row.name}
                                        </span>
                                        <div className="text-right shrink-0">
                                            {useSegments ? (
                                                <div className="flex items-center gap-1.5">
                                                    {defs.map(def => {
                                                        const v =
                                                            row.segments?.[
                                                                def.key
                                                            ] ?? 0
                                                        return (
                                                            <span
                                                                key={def.key}
                                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                                                                style={{
                                                                    backgroundColor: `${def.color}1A`,
                                                                    color: def.color,
                                                                }}
                                                                title={`${def.label}: ${v}`}
                                                            >
                                                                <span
                                                                    className="w-1.5 h-1.5 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            def.color,
                                                                    }}
                                                                />
                                                                {v}
                                                            </span>
                                                        )
                                                    })}
                                                    <span className="ml-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F5F5F5] text-[#212121] border border-[#E0E0E0]">
                                                        Σ {total}
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${STATUS_BADGE[row.status] ?? STATUS_BADGE.pending}`}
                                                    >
                                                        {mode === 'pair'
                                                            ? `${row.primary} / ${row.secondary ?? 0}`
                                                            : `${row.primary}${unit ? ` ${unit}` : ''}`}
                                                    </span>
                                                    {mode === 'pair' && (
                                                        <p className="text-[9px] text-[#757575] mt-0.5 leading-tight">
                                                            {primaryLabel} /{' '}
                                                            {secondaryLabel}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {useSegments ? (
                                        <div className="w-full flex h-1.5 rounded-full overflow-hidden border border-[#E0E0E0]/50 bg-[#F5F5F5]">
                                            {defs.map(def => {
                                                const v =
                                                    row.segments?.[def.key] ?? 0
                                                if (v <= 0) return null
                                                const w = (v / total) * 100
                                                return (
                                                    <div
                                                        key={def.key}
                                                        className="h-full transition-all duration-700 ease-out"
                                                        style={{
                                                            width: `${w}%`,
                                                            backgroundColor:
                                                                def.color,
                                                        }}
                                                        title={`${def.label}: ${v}`}
                                                    />
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="w-full bg-[#F5F5F5] rounded-full h-1.5 border border-[#E0E0E0]/50">
                                            <div
                                                className={`h-1.5 rounded-full ${STATUS_BAR[row.status] ?? STATUS_BAR.pending} transition-all duration-700 ease-out`}
                                                style={{
                                                    width: `${fallbackProgress}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {view === 'bar' && (
                    <div className="p-3">
                        {showStacked && (
                            <div className="mb-2 flex justify-end">
                                <Legend defs={defs} />
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 8,
                                    right: 8,
                                    left: -16,
                                    bottom: 8,
                                }}
                                barCategoryGap={20}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={COLOR_GRID}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    tick={{
                                        fontSize: 10,
                                        fill: COLOR_AXIS,
                                    }}
                                    tickLine={false}
                                    axisLine={{ stroke: COLOR_GRID }}
                                    interval={0}
                                    angle={-25}
                                    textAnchor="end"
                                    height={50}
                                />
                                <YAxis
                                    tick={{
                                        fontSize: 10,
                                        fill: COLOR_AXIS,
                                    }}
                                    tickLine={false}
                                    axisLine={{ stroke: COLOR_GRID }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{
                                        fill: '#487749',
                                        fillOpacity: 0.06,
                                    }}
                                    content={
                                        <ChartTooltip
                                            unit={unit}
                                            labels={segLabels}
                                        />
                                    }
                                />
                                {showStacked ? (
                                    defs.map((def, i) => (
                                        <Bar
                                            key={def.key}
                                            dataKey={def.key}
                                            name={def.key}
                                            stackId="seg"
                                            fill={def.color}
                                            // Only the top of the stack is rounded.
                                            radius={
                                                i === defs.length - 1
                                                    ? [4, 4, 0, 0]
                                                    : undefined
                                            }
                                            maxBarSize={36}
                                        />
                                    ))
                                ) : (
                                    <Bar
                                        dataKey="primary"
                                        name="primary"
                                        fill={SEG_COLOR.completed}
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={36}
                                    />
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {view === 'area' && chartData.length < 2 && (
                    <div className="p-6">
                        {chartData.length === 0 ? (
                            <div className="text-center text-[#757575] text-sm py-12">
                                No data to chart yet.
                            </div>
                        ) : (
                            <div className="rounded-xl border border-[#E0E0E0] bg-[#FAF9F6] p-5">
                                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9E9E9E] mb-2">
                                    Single data point
                                </div>
                                <div className="text-base font-bold text-[#212121] mb-3">
                                    {chartData[0].fullName}
                                </div>
                                {showStacked ? (
                                    <div className="flex flex-wrap gap-3">
                                        {defs.map((def) => (
                                            <div
                                                key={def.key}
                                                className="flex items-center gap-2 rounded-lg bg-white border border-[#E0E0E0] px-3 py-1.5"
                                            >
                                                <span
                                                    className="w-2.5 h-2.5 rounded-sm"
                                                    style={{ backgroundColor: def.color }}
                                                />
                                                <span className="text-[11px] uppercase tracking-wide text-[#757575]">
                                                    {def.label}
                                                </span>
                                                <span className="text-sm font-bold text-[#212121]">
                                                    {(
                                                        (chartData[0] as Record<string, unknown>)[
                                                            def.key
                                                        ] as number
                                                    ).toLocaleString()}
                                                    {unit ? ` ${unit}` : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-[#487749]">
                                            {chartData[0].primary.toLocaleString()}
                                        </span>
                                        {unit && (
                                            <span className="text-sm text-[#757575]">{unit}</span>
                                        )}
                                    </div>
                                )}
                                <div className="mt-3 text-xs text-[#9E9E9E]">
                                    Area chart needs at least 2 entries — switch to Bar or List for single rows.
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {view === 'area' && chartData.length >= 2 && (
                    <div className="p-3">
                        {showStacked && (
                            <div className="mb-2 flex justify-end">
                                <Legend defs={defs} />
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart
                                data={chartData}
                                margin={{
                                    top: 8,
                                    right: 8,
                                    left: -16,
                                    bottom: 8,
                                }}
                            >
                                <defs>
                                    {/* Gradient ids are scoped per panel instance;
                                        several panels share a page. */}
                                    {defs.map(def => (
                                        <linearGradient
                                            key={def.key}
                                            id={`${gradientId}-${def.key}`}
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor={def.color}
                                                stopOpacity={0.55}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor={def.color}
                                                stopOpacity={0.05}
                                            />
                                        </linearGradient>
                                    ))}
                                    <linearGradient
                                        id={`${gradientId}-primary`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor={SEG_COLOR.completed}
                                            stopOpacity={0.55}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor={SEG_COLOR.completed}
                                            stopOpacity={0.05}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={COLOR_GRID}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    tick={{
                                        fontSize: 10,
                                        fill: COLOR_AXIS,
                                    }}
                                    tickLine={false}
                                    axisLine={{ stroke: COLOR_GRID }}
                                    interval={0}
                                    angle={-25}
                                    textAnchor="end"
                                    height={50}
                                />
                                <YAxis
                                    tick={{
                                        fontSize: 10,
                                        fill: COLOR_AXIS,
                                    }}
                                    tickLine={false}
                                    axisLine={{ stroke: COLOR_GRID }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{
                                        stroke: '#487749',
                                        strokeOpacity: 0.4,
                                        strokeWidth: 1,
                                    }}
                                    content={
                                        <ChartTooltip
                                            unit={unit}
                                            labels={segLabels}
                                        />
                                    }
                                />
                                {showStacked ? (
                                    defs.map(def => (
                                        <Area
                                            key={def.key}
                                            type="monotone"
                                            dataKey={def.key}
                                            name={def.key}
                                            stackId="seg"
                                            stroke={def.color}
                                            strokeWidth={2}
                                            fill={`url(#${gradientId}-${def.key})`}
                                            activeDot={{
                                                r: 4,
                                                stroke: '#fff',
                                                strokeWidth: 2,
                                            }}
                                        />
                                    ))
                                ) : (
                                    <Area
                                        type="monotone"
                                        dataKey="primary"
                                        name="primary"
                                        stroke={SEG_COLOR.completed}
                                        strokeWidth={2}
                                        fill={`url(#${gradientId}-primary)`}
                                        activeDot={{
                                            r: 4,
                                            stroke: '#fff',
                                            strokeWidth: 2,
                                        }}
                                    />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {pageCount > 1 && (
                    <div className="flex items-center justify-between gap-2 border-t border-[#E0E0E0] px-3 py-1.5">
                        <span className="text-[10px] text-[#757575]">
                            Showing{' '}
                            <span className="font-bold text-[#212121]">
                                {safePage * PAGE_SIZE + 1}–
                                {safePage * PAGE_SIZE + visibleRows.length}
                            </span>{' '}
                            of {sortedRows.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={safePage === 0}
                                className="flex items-center gap-0.5 rounded-md border border-[#E0E0E0] px-2 py-0.5 text-[10px] font-semibold text-[#487749] hover:bg-[#F5F5F5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-3 h-3" />
                                Prev
                            </button>
                            <span className="text-[10px] font-semibold text-[#757575] tabular-nums">
                                {safePage + 1}/{pageCount}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    setPage(p =>
                                        Math.min(pageCount - 1, p + 1)
                                    )
                                }
                                disabled={safePage === pageCount - 1}
                                className="flex items-center gap-0.5 rounded-md border border-[#E0E0E0] px-2 py-0.5 text-[10px] font-semibold text-[#487749] hover:bg-[#F5F5F5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
