import React, { useMemo, useState } from 'react'
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
import { BarChart3, LineChart as LineIcon, ListChecks } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/Card'

export type StatSegments = {
    ongoing: number
    completed: number
    notStarted: number
}

export type StatRow = {
    id: number | string
    name: string
    status: string
    primary: number
    secondary?: number
    segments?: StatSegments
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

const SEG_LABEL = {
    completed: 'Completed',
    ongoing: 'Ongoing',
    notStarted: 'Not started',
}

const SEG_KEYS: Array<keyof StatSegments> = [
    'ongoing',
    'completed',
    'notStarted',
]

const COLOR_GRID = '#E0E0E0'
const COLOR_AXIS = '#757575'

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
}: {
    active?: boolean
    payload?: Array<{
        name: string
        value: number
        color: string
        payload: { fullName?: string }
    }>
    unit?: string
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
                                {SEG_LABEL[p.name as keyof typeof SEG_LABEL] ??
                                    p.name}
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

const Legend: React.FC = () => (
    <div className="flex items-center gap-3 flex-wrap">
        {SEG_KEYS.map(k => (
            <div key={k} className="flex items-center gap-1.5">
                <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: SEG_COLOR[k] }}
                />
                <span className="text-[10px] font-medium text-[#757575] uppercase tracking-wide">
                    {SEG_LABEL[k]}
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
}) => {
    // #174: Bar is the default view (was 'progress').
    const [view, setView] = useState<View>('bar')

    const chartData = useMemo(
        () =>
            rows.map(r => ({
                id: r.id,
                name: truncate(r.name),
                fullName: r.name,
                primary: r.primary,
                secondary: r.secondary ?? 0,
                completed: r.segments?.completed ?? 0,
                ongoing: r.segments?.ongoing ?? 0,
                notStarted: r.segments?.notStarted ?? 0,
                status: r.status,
            })),
        [rows]
    )

    const showStacked = chartData.some(
        d => d.completed + d.ongoing + d.notStarted > 0
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
                    <ViewToggle view={view} onChange={setView} />
                </div>

                {view === 'progress' && (
                    <div className="space-y-3 max-h-[min(420px,50vh)] overflow-y-auto p-3">
                        {rows.map(row => {
                            const total =
                                (row.segments?.completed ?? 0) +
                                (row.segments?.ongoing ?? 0) +
                                (row.segments?.notStarted ?? 0)
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
                                                    {SEG_KEYS.map(k => {
                                                        const v =
                                                            row.segments?.[k] ??
                                                            0
                                                        return (
                                                            <span
                                                                key={k}
                                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                                                                style={{
                                                                    backgroundColor: `${SEG_COLOR[k]}1A`,
                                                                    color: SEG_COLOR[
                                                                        k
                                                                    ],
                                                                }}
                                                                title={`${SEG_LABEL[k]}: ${v}`}
                                                            >
                                                                <span
                                                                    className="w-1.5 h-1.5 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            SEG_COLOR[
                                                                                k
                                                                            ],
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
                                            {SEG_KEYS.map(k => {
                                                const v = row.segments?.[k] ?? 0
                                                if (v <= 0) return null
                                                const w = (v / total) * 100
                                                return (
                                                    <div
                                                        key={k}
                                                        className="h-full transition-all duration-700 ease-out"
                                                        style={{
                                                            width: `${w}%`,
                                                            backgroundColor:
                                                                SEG_COLOR[k],
                                                        }}
                                                        title={`${SEG_LABEL[k]}: ${v}`}
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
                                <Legend />
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
                                    content={<ChartTooltip unit={unit} />}
                                />
                                {showStacked ? (
                                    <>
                                        <Bar
                                            dataKey="ongoing"
                                            name="ongoing"
                                            stackId="seg"
                                            fill={SEG_COLOR.ongoing}
                                            maxBarSize={36}
                                        />
                                        <Bar
                                            dataKey="completed"
                                            name="completed"
                                            stackId="seg"
                                            fill={SEG_COLOR.completed}
                                            maxBarSize={36}
                                        />
                                        <Bar
                                            dataKey="notStarted"
                                            name="notStarted"
                                            stackId="seg"
                                            fill={SEG_COLOR.notStarted}
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={36}
                                        />
                                    </>
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

                {view === 'area' && (
                    <div className="p-3">
                        {showStacked && (
                            <div className="mb-2 flex justify-end">
                                <Legend />
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
                                    <linearGradient
                                        id="gradCompleted"
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
                                    <linearGradient
                                        id="gradOngoing"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor={SEG_COLOR.ongoing}
                                            stopOpacity={0.5}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor={SEG_COLOR.ongoing}
                                            stopOpacity={0.05}
                                        />
                                    </linearGradient>
                                    <linearGradient
                                        id="gradNotStarted"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor={SEG_COLOR.notStarted}
                                            stopOpacity={0.5}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor={SEG_COLOR.notStarted}
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
                                    content={<ChartTooltip unit={unit} />}
                                />
                                {showStacked ? (
                                    <>
                                        <Area
                                            type="monotone"
                                            dataKey="ongoing"
                                            name="ongoing"
                                            stackId="seg"
                                            stroke={SEG_COLOR.ongoing}
                                            strokeWidth={2}
                                            fill="url(#gradOngoing)"
                                            activeDot={{
                                                r: 4,
                                                stroke: '#fff',
                                                strokeWidth: 2,
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="completed"
                                            name="completed"
                                            stackId="seg"
                                            stroke={SEG_COLOR.completed}
                                            strokeWidth={2}
                                            fill="url(#gradCompleted)"
                                            activeDot={{
                                                r: 4,
                                                stroke: '#fff',
                                                strokeWidth: 2,
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="notStarted"
                                            name="notStarted"
                                            stackId="seg"
                                            stroke={SEG_COLOR.notStarted}
                                            strokeWidth={2}
                                            fill="url(#gradNotStarted)"
                                            activeDot={{
                                                r: 4,
                                                stroke: '#fff',
                                                strokeWidth: 2,
                                            }}
                                        />
                                    </>
                                ) : (
                                    <Area
                                        type="monotone"
                                        dataKey="primary"
                                        name="primary"
                                        stroke={SEG_COLOR.completed}
                                        strokeWidth={2}
                                        fill="url(#gradCompleted)"
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
            </CardContent>
        </Card>
    )
}
