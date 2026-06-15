import { FkCell } from '../components/FkCell'
import { CollapsibleCell, EditableCell } from '../components/CellRenderers'
import { collectColumns, toIndexedRows, type FkEditing } from './tableUtils'

interface MatrixViewProps {
    data: unknown
    fk?: FkEditing
    idPrefix?: string
    /** When set, only record columns whose original index is in the set are rendered. */
    visibleIndices?: Set<number>
}

/**
 * Transposed view: one FIELD per row, one record per column. Best for reviewing
 * how each field mapped across a handful of records (the common migration case:
 * few rows, many fields) — scan a single field down the page.
 */
export function MatrixView({ data, fk, idPrefix = 'raw', visibleIndices }: MatrixViewProps) {
    const allRows = toIndexedRows(data)
    if (allRows.length === 0) {
        return <p className="p-3 text-sm text-gray-400">No rows to pivot.</p>
    }
    const fields = collectColumns(allRows.map(r => r.row))
    const rows = visibleIndices ? allRows.filter(r => visibleIndices.has(r.index)) : allRows
    if (rows.length === 0) {
        return <p className="p-3 text-sm text-gray-400">No records match the current filter.</p>
    }
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
                                                onFillUnmatched={
                                                    fk.onFillUnmatched
                                                        ? v => fk.onFillUnmatched!(f, v)
                                                        : undefined
                                                }
                                            />
                                        </td>
                                    )
                                }
                                const isPlaceholder = row._status != null
                                const canEdit = !!fk?.onEditField && !isPlaceholder
                                return (
                                    <td
                                        key={index}
                                        className="border-b border-r border-gray-200 px-3 py-2"
                                    >
                                        {canEdit ? (
                                            <EditableCell
                                                value={row[f]}
                                                onCommit={v => fk!.onEditField!(index, f, v)}
                                            />
                                        ) : (
                                            <CollapsibleCell value={row[f]} />
                                        )}
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
