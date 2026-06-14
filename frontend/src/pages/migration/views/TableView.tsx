import { useState } from 'react'
import { FkCell } from '../components/FkCell'
import {
    collectColumns,
    formatCell,
    isEmpty,
    toIndexedRows,
    type FkEditing,
} from './tableUtils'
import type { RowAction } from '../../../services/migrationApi'

const ACTION_STYLES: Record<RowAction, { bg: string; text: string; label: string }> = {
    created: { bg: 'bg-green-100', text: 'text-green-700', label: 'created' },
    updated: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'updated' },
    skipped: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'skipped' },
    failed:  { bg: 'bg-red-100',  text: 'text-red-700',  label: 'failed'  },
}

interface TableViewProps {
    data: unknown
    fk?: FkEditing
    idPrefix?: string
    rowActions?: RowAction[]
}

function CollapsibleCell({ value }: { value: unknown }) {
    const [expanded, setExpanded] = useState(false)
    const formatted = formatCell(value)
    const isLongText = typeof value === 'string' && value.length > 40

    if (!isLongText) {
        return (
            <span className={isEmpty(value) ? 'text-gray-300' : 'text-gray-800'}>
                {formatted}
            </span>
        )
    }

    const text = String(value)

    return (
        <div className="flex flex-col gap-1 max-w-[320px]">
            <div
                className={`text-gray-800 transition-all text-xs font-mono break-words ${
                    expanded ? 'whitespace-normal' : 'truncate'
                }`}
                title={text}
            >
                {expanded ? text : text.slice(0, 40) + '...'}
            </div>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    setExpanded(!expanded)
                }}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 self-start mt-0.5 select-none"
            >
                {expanded ? 'Collapse' : 'Expand'}
            </button>
        </div>
    )
}

/** Spreadsheet view: one record per row, one field per column. */
export function TableView({ data, fk, idPrefix = 'raw', rowActions }: TableViewProps) {
    const rows = toIndexedRows(data)
    if (rows.length === 0) {
        return <p className="p-3 text-sm text-gray-400">No tabular rows.</p>
    }
    const cols = collectColumns(rows.map(r => r.row))
    const fkMeta = (c: string) => fk?.foreignKeys[c]

    return (
        <table className="w-full border-separate border-spacing-0 text-xs">
            <thead className="sticky top-0 z-20 bg-gray-50">
                <tr>
                    <th className="sticky left-0 z-30 bg-gray-100 border-b border-r border-gray-200 px-3 py-2 text-left font-semibold text-gray-500 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        #
                    </th>
                    {cols.map(c => (
                        <th
                            key={c}
                            id={`col-th-${idPrefix}-${c}`}
                            className="border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-left font-mono font-semibold whitespace-nowrap text-gray-600"
                        >
                            {c}
                            {fkMeta(c) && <span className="ml-1 text-blue-500">↗</span>}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map(({ row, index }) => {
                    const isPlaceholder = row._status != null
                    return (
                        <tr
                            key={index}
                            className={`group ${
                                isPlaceholder
                                    ? 'bg-red-50/60'
                                    : 'hover:bg-blue-50/40'
                            }`}
                        >
                            <td className={`sticky left-0 z-10 border-b border-r border-gray-200 px-2 py-2 group-hover:bg-blue-50/80 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${
                                isPlaceholder ? 'bg-red-50' : 'bg-white'
                            }`}>
                                <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-gray-400 text-xs">{index}</span>
                                    {rowActions?.[index] && (() => {
                                        const s = ACTION_STYLES[rowActions[index]]
                                        return (
                                            <span className={`rounded px-1 py-0 text-[10px] font-semibold ${s.bg} ${s.text}`}>
                                                {s.label}
                                            </span>
                                        )
                                    })()}
                                </div>
                            </td>
                            {cols.map(c => {
                                const meta = fkMeta(c)
                                if (meta && fk) {
                                    return (
                                        <td key={c} className="border-b border-r border-gray-200 px-2 py-1.5">
                                            <FkCell
                                                value={(row[c] as number) ?? null}
                                                options={fk.fkOptions[meta.master] || []}
                                                otherText={
                                                    meta.otherField
                                                        ? (row[meta.otherField] as string)
                                                        : null
                                                }
                                                onChange={v => fk.onEditCell(index, c, v)}
                                            />
                                        </td>
                                    )
                                }
                                return (
                                    <td
                                        key={c}
                                        className="border-b border-r border-gray-200 px-3 py-2"
                                    >
                                        <CollapsibleCell value={row[c]} />
                                    </td>
                                )
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}
