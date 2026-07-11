import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import {
    analyticsApi,
    type AnalyticsMetricKey,
    type AnalyticsQuery,
} from '../../../services/analyticsApi'

const THEME = {
    primary: '#487749',
    primarySoft: '#E8F5E9',
    primaryBorder: '#C8E6C9',
    cardBg: '#FAF9F6',
    border: '#E0E0E0',
    mutedText: '#757575',
} as const

/** Green-tinted percentage tone, mirroring the Form Summary matrix header. */
function pctTone(pct: number): string {
    if (pct >= 20) return THEME.primary
    if (pct >= 10) return '#5c9a5e'
    if (pct > 0) return '#7ab37c'
    return THEME.mutedText
}

type Props = {
    metric: AnalyticsMetricKey
    /** Shared filters + groupBy; drives the pivot's rows. */
    query: AnalyticsQuery
    /** Human label for the row dimension (e.g. "Thematic area"). */
    groupByLabel: string
}

/**
 * (dimension × KVK) pivot rendered in the Form Summary matrix style: a sticky
 * row header, sticky column header carrying each KVK's share, and green cells
 * for the ones that have entries.
 */
export const AnalyticsKvkMatrix: React.FC<Props> = ({
    metric,
    query,
    groupByLabel,
}) => {
    const [kvkSearch, setKvkSearch] = useState('')

    const { data, isPending, isError, error } = useQuery({
        queryKey: ['analytics-matrix', metric, query],
        queryFn: () => analyticsApi.getMatrix(metric, query),
        placeholderData: previousData => previousData,
    })

    // Column search filters the KVKs (columns), like the Form Summary matrix.
    const kvks = useMemo(() => {
        if (!data) return []
        const q = kvkSearch.trim().toLowerCase()
        if (!q) return data.kvks
        return data.kvks.filter(k => k.name.toLowerCase().includes(q))
    }, [data, kvkSearch])

    if (isPending && !data) {
        return (
            <div
                className="flex items-center justify-center py-16 text-sm"
                style={{ color: THEME.mutedText }}
            >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading KVK matrix…
            </div>
        )
    }

    if (isError) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {(error as Error)?.message || 'Failed to load KVK matrix'}
            </div>
        )
    }

    if (!data || data.groups.length === 0 || data.kvks.length === 0) {
        return (
            <div
                className="rounded-lg p-8 text-center text-sm"
                style={{
                    backgroundColor: THEME.cardBg,
                    color: THEME.mutedText,
                    border: `1px solid ${THEME.border}`,
                }}
            >
                No KVK data for this grouping yet.
            </div>
        )
    }

    // Fixed-width columns with sticky #, row-label and header row.
    const firstColW = 44
    const rowLabelW = 240
    const kvkColW = 120
    const rowH = 34

    return (
        <div className="space-y-2">
            <div className="relative max-w-xs">
                <Search
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                    style={{ color: THEME.mutedText }}
                />
                <input
                    type="text"
                    value={kvkSearch}
                    onChange={e => setKvkSearch(e.target.value)}
                    placeholder="Filter KVKs (columns)…"
                    className="h-8 w-full rounded-md border pl-8 pr-2 text-xs focus:outline-none focus:ring-1"
                    style={{
                        borderColor: THEME.border,
                        // @ts-expect-error — CSS custom property
                        '--tw-ring-color': THEME.primary,
                    }}
                />
            </div>

            <div
                className="rounded-lg overflow-hidden"
                style={{ border: `1px solid ${THEME.border}`, backgroundColor: 'white' }}
            >
                <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
                    <table
                        className="border-collapse text-sm"
                        style={{
                            minWidth: firstColW + rowLabelW + kvkColW * kvks.length,
                        }}
                    >
                        <thead>
                            <tr>
                                <th
                                    className="px-2 text-left text-[11px] font-semibold uppercase tracking-wider"
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
                                    className="px-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                                    style={{
                                        position: 'sticky',
                                        top: 0,
                                        left: firstColW,
                                        zIndex: 3,
                                        width: rowLabelW,
                                        minWidth: rowLabelW,
                                        height: rowH,
                                        backgroundColor: THEME.cardBg,
                                        color: THEME.mutedText,
                                        borderBottom: `1px solid ${THEME.border}`,
                                        borderRight: `2px solid ${THEME.border}`,
                                    }}
                                >
                                    {groupByLabel}
                                </th>
                                {kvks.map(kvk => (
                                    <th
                                        key={kvk.id}
                                        className="px-2 text-center text-[11px] font-semibold"
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
                                        title={`${kvk.total} entries · ${kvk.pct}% of total`}
                                    >
                                        <div className="truncate">{kvk.name}</div>
                                        <div
                                            className="text-[10px] font-normal"
                                            style={{ color: pctTone(kvk.pct) }}
                                        >
                                            {kvk.pct}%
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.groups.map((group, i) => (
                                <tr key={group.id}>
                                    <td
                                        className="px-2 text-right text-[12px] tabular-nums"
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
                                            width: rowLabelW,
                                            minWidth: rowLabelW,
                                            height: rowH,
                                            backgroundColor: 'white',
                                            borderBottom: `1px solid ${THEME.border}`,
                                            borderRight: `2px solid ${THEME.border}`,
                                        }}
                                    >
                                        <span
                                            className="block truncate text-sm"
                                            style={{ color: '#2c2c2c' }}
                                            title={group.name}
                                        >
                                            {group.name}
                                        </span>
                                    </td>
                                    {kvks.map(kvk => {
                                        const count =
                                            data.cells[group.id]?.[kvk.id] || 0
                                        const filled = count > 0
                                        return (
                                            <td
                                                key={kvk.id}
                                                className="text-center"
                                                style={{
                                                    width: kvkColW,
                                                    minWidth: kvkColW,
                                                    height: rowH,
                                                    backgroundColor: filled
                                                        ? THEME.primarySoft
                                                        : 'white',
                                                    color: filled
                                                        ? THEME.primary
                                                        : THEME.mutedText,
                                                    fontWeight: filled ? 600 : 400,
                                                    fontSize: filled ? 13 : 12,
                                                    borderBottom: `1px solid ${THEME.border}`,
                                                    borderRight: `1px solid ${THEME.border}`,
                                                }}
                                                title={
                                                    filled
                                                        ? `${count} · ${group.name} · ${kvk.name}`
                                                        : `No entries · ${kvk.name}`
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
                <div
                    className="flex items-center justify-between gap-4 px-3 py-1.5 text-[11px]"
                    style={{
                        borderTop: `1px solid ${THEME.border}`,
                        backgroundColor: THEME.cardBg,
                        color: THEME.mutedText,
                    }}
                >
                    <span className="inline-flex items-center gap-1.5">
                        <span
                            className="inline-block h-3 w-3 rounded"
                            style={{
                                backgroundColor: THEME.primarySoft,
                                border: `1px solid ${THEME.primaryBorder}`,
                            }}
                        />
                        Has entries — cell shows the count
                    </span>
                    <span className="tabular-nums">
                        {data.groups.length} {groupByLabel.toLowerCase()} ×{' '}
                        {kvks.length} KVKs · {data.grandTotal.toLocaleString()} total
                    </span>
                </div>
            </div>
        </div>
    )
}
