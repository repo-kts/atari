import { useState } from 'react'
import { FkCell } from '../components/FkCell'
import {
    collectColumns,
    formatCell,
    isEmpty,
    toIndexedRows,
    type FkEditing,
} from './tableUtils'

interface MatrixViewProps {
    data: unknown
    fk?: FkEditing
    idPrefix?: string
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

/**
 * Transposed view: one FIELD per row, one record per column. Best for reviewing
 * how each field mapped across a handful of records (the common migration case:
 * few rows, many fields) — scan a single field down the page.
 */
export function MatrixView({ data, fk, idPrefix = 'raw' }: MatrixViewProps) {
    const rows = toIndexedRows(data)
    if (rows.length === 0) {
        return <p className="p-3 text-sm text-gray-400">No rows to pivot.</p>
    }
    const fields = collectColumns(rows.map(r => r.row))
    const fkMeta = (f: string) => fk?.foreignKeys[f]

    return (
        <table className="w-full border-separate border-spacing-0 text-xs">
            <thead className="sticky top-0 z-20 bg-gray-50">
                <tr>
                    <th className="sticky left-0 z-30 bg-gray-100 border-b border-r border-gray-200 px-3 py-2 text-left font-semibold text-gray-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        field
                    </th>
                    {rows.map(({ index }) => (
                        <th
                            key={index}
                            id={`col-th-${idPrefix}-rec-${index}`}
                            className="border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold whitespace-nowrap text-gray-500"
                        >
                            rec #{index}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {fields.map(f => {
                    const meta = fkMeta(f)
                    return (
                        <tr key={f} className="group hover:bg-blue-50/40">
                            <td
                                id={`col-th-${idPrefix}-${f}`}
                                className="sticky left-0 z-10 bg-white border-b border-r border-gray-200 px-3 py-2 font-mono font-medium whitespace-nowrap text-gray-700 group-hover:bg-blue-50/80 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                            >
                                {f}
                                {meta && <span className="ml-1 text-blue-500">↗</span>}
                            </td>
                            {rows.map(({ row, index }) => {
                                if (meta && fk) {
                                    return (
                                        <td key={index} className="border-b border-r border-gray-200 px-2 py-1.5">
                                            <FkCell
                                                value={(row[f] as number) ?? null}
                                                options={fk.fkOptions[meta.master] || []}
                                                otherText={
                                                    meta.otherField
                                                        ? (row[meta.otherField] as string)
                                                        : null
                                                }
                                                onChange={v => fk.onEditCell(index, f, v)}
                                            />
                                        </td>
                                    )
                                }
                                return (
                                    <td
                                        key={index}
                                        className="border-b border-r border-gray-200 px-3 py-2"
                                    >
                                        <CollapsibleCell value={row[f]} />
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
