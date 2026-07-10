import React, { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import {
    analyticsApi,
    type AnalyticsMetricKey,
    type AnalyticsKvkOption,
} from '../../services/analyticsApi'
import { StatChartPanel, type SegmentDef } from './shared/StatChartPanel'
import { DashboardPanelsSkeleton } from './shared/DashboardSkeletons'

const METRIC_KEYS: AnalyticsMetricKey[] = ['oft', 'fld', 'training', 'extension']

function isMetricKey(value: string | undefined): value is AnalyticsMetricKey {
    return !!value && (METRIC_KEYS as string[]).includes(value)
}

/** Palette reused across breakdowns; index-matched to the breakdown's keys. */
const SEGMENT_PALETTE = [
    '#487749',
    '#F2A61F',
    '#4C7FA8',
    '#A85C4C',
    '#7E57A2',
    '#BDBDBD',
]

const SEGMENT_LABELS: Record<string, string> = {
    ongoing: 'Ongoing',
    completed: 'Completed',
    notStarted: 'Not started',
    male: 'Male',
    female: 'Female',
    general: 'General',
    obc: 'OBC',
    sc: 'SC',
    st: 'ST',
    onCampus: 'On campus',
    offCampus: 'Off campus',
    beneficiaries: 'Farmers',
    officials: 'Officials',
}

/** The status stack keeps its established colours; others take the palette. */
function toSegmentDefs(keys: string[]): SegmentDef[] {
    const statusColors: Record<string, string> = {
        ongoing: '#F2A61F',
        completed: '#487749',
        notStarted: '#BDBDBD',
    }
    return keys.map((key, i) => ({
        key,
        label: SEGMENT_LABELS[key] ?? key,
        color: statusColors[key] ?? SEGMENT_PALETTE[i % SEGMENT_PALETTE.length],
    }))
}

type Filters = {
    reportingYear: string
    zoneId: string
    stateId: string
    districtId: string
    orgId: string
    kvkId: string
}

const EMPTY_FILTERS: Filters = {
    reportingYear: 'all',
    zoneId: 'all',
    stateId: 'all',
    districtId: 'all',
    orgId: 'all',
    kvkId: 'all',
}

const SELECT_CLASS =
    'h-8 w-full min-w-[120px] px-2 text-xs font-medium border border-[#E0E0E0] ' +
    'rounded-md bg-white text-[#212121] focus:outline-none focus:ring-1 ' +
    'focus:ring-[#487749]/30'

const FilterSelect: React.FC<{
    label: string
    value: string
    onChange: (v: string) => void
    options: Array<{ value: string; label: string }>
}> = ({ label, value, onChange, options }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-[#487749] uppercase tracking-wide">
            {label}
        </span>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className={SELECT_CLASS}
        >
            <option value="all">All</option>
            {options.map(o => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    </div>
)

/** Distinct {id,name} pairs from the flat KVK list, sorted by name. */
function distinctBy(
    kvks: AnalyticsKvkOption[],
    idKey: keyof AnalyticsKvkOption,
    nameKey: keyof AnalyticsKvkOption
) {
    const seen = new Map<string, string>()
    for (const k of kvks) {
        seen.set(String(k[idKey]), String(k[nameKey]))
    }
    return [...seen.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label))
}

export const AnalyticsDetail: React.FC = () => {
    const { metric } = useParams<{ metric: string }>()
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
    const [groupBy, setGroupBy] = useState('zone')
    const [breakdown, setBreakdown] = useState('status')

    const { data: filterOptions } = useQuery({
        queryKey: ['analytics-filters'],
        queryFn: analyticsApi.getFilterOptions,
        // The hierarchy changes about never; refetching it on every mount just
        // adds latency to the page the user came here to see.
        staleTime: 60 * 60 * 1000,
    })

    const valid = isMetricKey(metric)

    const { data, isPending, isFetching, isError, error } = useQuery({
        queryKey: ['analytics', metric, groupBy, filters],
        enabled: valid,
        queryFn: () =>
            analyticsApi.getMetric(metric as AnalyticsMetricKey, {
                groupBy,
                reportingYear:
                    filters.reportingYear === 'all'
                        ? 'all'
                        : Number(filters.reportingYear),
                zoneId:
                    filters.zoneId === 'all' ? undefined : Number(filters.zoneId),
                stateId:
                    filters.stateId === 'all'
                        ? undefined
                        : Number(filters.stateId),
                districtId:
                    filters.districtId === 'all'
                        ? undefined
                        : Number(filters.districtId),
                orgId: filters.orgId === 'all' ? undefined : Number(filters.orgId),
                kvkId: filters.kvkId === 'all' ? undefined : Number(filters.kvkId),
            }),
        placeholderData: previousData => previousData,
    })

    // Each dropdown narrows the ones below it, computed from the flat list that
    // was fetched once. Changing a filter costs zero network calls.
    const kvks = filterOptions?.kvks ?? []
    const cascaded = useMemo(() => {
        const byZone = kvks.filter(
            k => filters.zoneId === 'all' || String(k.zoneId) === filters.zoneId
        )
        const byState = byZone.filter(
            k => filters.stateId === 'all' || String(k.stateId) === filters.stateId
        )
        const byDistrict = byState.filter(
            k =>
                filters.districtId === 'all' ||
                String(k.districtId) === filters.districtId
        )
        const byOrg = byDistrict.filter(
            k => filters.orgId === 'all' || String(k.orgId) === filters.orgId
        )
        return {
            zones: distinctBy(kvks, 'zoneId', 'zoneName'),
            states: distinctBy(byZone, 'stateId', 'stateName'),
            districts: distinctBy(byState, 'districtId', 'districtName'),
            orgs: distinctBy(byDistrict, 'orgId', 'orgName'),
            kvks: distinctBy(byOrg, 'kvkId', 'kvkName'),
        }
    }, [kvks, filters])

    /** Clearing a parent must clear its children, or the query sends a contradiction. */
    const update = (key: keyof Filters, value: string) => {
        setFilters(prev => {
            const next = { ...prev, [key]: value }
            const chain: Array<keyof Filters> = [
                'zoneId',
                'stateId',
                'districtId',
                'orgId',
                'kvkId',
            ]
            const idx = chain.indexOf(key)
            if (idx >= 0) {
                for (const child of chain.slice(idx + 1)) next[child] = 'all'
            }
            return next
        })
    }

    const activeBreakdown = useMemo(
        () => data?.breakdowns.find(b => b.key === breakdown) ?? data?.breakdowns[0],
        [data, breakdown]
    )

    const segmentDefs = useMemo(
        () => (activeBreakdown ? toSegmentDefs(activeBreakdown.keys) : undefined),
        [activeBreakdown]
    )

    // Re-project each row's measures onto the chosen breakdown's keys. All the
    // numbers are already in the payload, so switching breakdown never refetches.
    const rows = useMemo(() => {
        if (!data || !activeBreakdown) return []
        return data.rows.map(row => ({
            id: row.id,
            name: row.name,
            status: row.status,
            primary: row.measures.records,
            secondary: row.measures.records,
            segments: Object.fromEntries(
                activeBreakdown.keys.map(k => [k, row.measures[k] ?? 0])
            ),
        }))
    }, [data, activeBreakdown])

    if (!valid) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                Unknown metric &quot;{metric}&quot;.
            </div>
        )
    }

    if (isError) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {(error as Error).message || 'Failed to load analytics'}
            </div>
        )
    }

    const groupByLabel =
        data?.groupBy &&
        filterOptions?.metrics
            .find(m => m.key === metric)
            ?.groupBy.find(g => g.key === data.groupBy)?.label

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#757575] hover:text-[#487749]"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-[#487749] mt-1">
                        {data?.label ?? 'Analytics'} — detailed analytics
                    </h1>
                    <p className="text-sm text-[#757575] font-medium">
                        Filter by year, zone, state, district, institute and KVK
                    </p>
                </div>
                {isFetching && (
                    <Loader2
                        className="w-4 h-4 text-[#487749] animate-spin shrink-0"
                        aria-label="Updating"
                    />
                )}
            </div>

            <Card className="border-[#E0E0E0] shadow-none">
                <CardContent className="p-3">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
                        <FilterSelect
                            label="Year"
                            value={filters.reportingYear}
                            onChange={v => update('reportingYear', v)}
                            options={(filterOptions?.yearOptions ?? []).map(y => ({
                                value: String(y),
                                label: String(y),
                            }))}
                        />
                        <FilterSelect
                            label="Zone"
                            value={filters.zoneId}
                            onChange={v => update('zoneId', v)}
                            options={cascaded.zones}
                        />
                        <FilterSelect
                            label="State"
                            value={filters.stateId}
                            onChange={v => update('stateId', v)}
                            options={cascaded.states}
                        />
                        <FilterSelect
                            label="District"
                            value={filters.districtId}
                            onChange={v => update('districtId', v)}
                            options={cascaded.districts}
                        />
                        <FilterSelect
                            label="Institute"
                            value={filters.orgId}
                            onChange={v => update('orgId', v)}
                            options={cascaded.orgs}
                        />
                        <FilterSelect
                            label="KVK"
                            value={filters.kvkId}
                            onChange={v => update('kvkId', v)}
                            options={cascaded.kvks}
                        />
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[#487749] uppercase tracking-wide">
                                Group by
                            </span>
                            <select
                                value={groupBy}
                                onChange={e => setGroupBy(e.target.value)}
                                className={SELECT_CLASS}
                            >
                                {(
                                    filterOptions?.metrics.find(
                                        m => m.key === metric
                                    )?.groupBy ?? []
                                ).map(g => (
                                    <option key={g.key} value={g.key}>
                                        {g.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[#487749] uppercase tracking-wide">
                                Breakdown
                            </span>
                            <select
                                value={breakdown}
                                onChange={e => setBreakdown(e.target.value)}
                                className={SELECT_CLASS}
                            >
                                {(data?.breakdowns ?? []).map(b => (
                                    <option key={b.key} value={b.key}>
                                        {b.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setFilters(EMPTY_FILTERS)}
                            className="text-[11px] font-semibold text-[#757575] hover:text-[#487749]"
                        >
                            Reset filters
                        </button>
                    </div>
                </CardContent>
            </Card>

            {isPending && !data && <DashboardPanelsSkeleton />}

            {data && (
                <div
                    className={`space-y-3 transition-opacity ${isFetching ? 'opacity-70' : ''}`}
                >
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
                        {data.measures.map(m => (
                            <Card
                                key={m.key}
                                className="border-[#E0E0E0] shadow-none"
                            >
                                <CardContent className="p-3">
                                    <p className="text-[10px] font-bold text-[#757575] uppercase tracking-wide mb-0.5 leading-tight">
                                        {m.label}
                                    </p>
                                    <p className="text-xl font-bold text-[#212121] leading-tight">
                                        {(
                                            data.totals[m.key] ?? 0
                                        ).toLocaleString(undefined, {
                                            maximumFractionDigits: 2,
                                        })}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <StatChartPanel
                        title={`${data.label} by ${groupByLabel ?? data.groupBy}`}
                        subtitle={activeBreakdown?.label}
                        mode="count"
                        primaryLabel="records"
                        rows={rows}
                        segmentDefs={segmentDefs}
                        entityLabel={groupByLabel ?? data.groupBy}
                    />
                </div>
            )}
        </div>
    )
}
