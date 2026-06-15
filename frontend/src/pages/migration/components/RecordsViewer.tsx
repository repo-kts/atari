import { useState, useRef, type ReactNode } from 'react'
import { TableView } from '../views/TableView'
import { MatrixView } from '../views/MatrixView'
import {
    hasTabularRows,
    toIndexedRows,
    collectColumns,
    type FkEditing,
} from '../views/tableUtils'
import type { RowAction } from '../../../services/migrationApi'

type ViewMode = 'json' | 'table' | 'matrix'

const MODES: { key: ViewMode; label: string }[] = [
    { key: 'json', label: 'JSON' },
    { key: 'table', label: 'Table' },
    { key: 'matrix', label: 'Matrix' },
]

interface RecordsViewerProps {
    title: string
    data: unknown
    badge?: string
    placeholder?: string
    defaultView?: ViewMode
    fk?: FkEditing
    rowActions?: RowAction[]
    visibleIndices?: Set<number>
    /** Extra controls rendered in the header, before the Jump selector. */
    headerExtra?: ReactNode
}

/**
 * Pane with switchable views over the same records:
 *  - JSON   : raw pretty-printed payload
 *  - Table  : one record per row (spreadsheet)
 *  - Matrix : transposed — one field per row, one record per column
 * Reused for both the raw (left) and mapped (right) panes.
 */
export function RecordsViewer({
    title,
    data,
    badge,
    placeholder,
    defaultView = 'table',
    fk,
    rowActions,
    visibleIndices,
    headerExtra,
}: RecordsViewerProps) {
    const [view, setView] = useState<ViewMode>(defaultView)
    const containerRef = useRef<HTMLDivElement>(null)
    const hasData =
        data !== undefined &&
        data !== null &&
        (view === 'json' || hasTabularRows(data))

    const idPrefix = title.toLowerCase().includes('raw') ? 'raw' : 'mapped'
    const rows = hasData ? toIndexedRows(data) : []
    const cols = rows.length > 0 ? collectColumns(rows.map(r => r.row)) : []

    const scrollLeft = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
        }
    }

    const scrollRight = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
        }
    }

    return (
        <div className="flex h-full min-h-0 flex-col rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
                    {badge && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {badge}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {headerExtra}
                    {/* Quick-Jump Selector */}
                    {hasData && view !== 'json' && cols.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-gray-500 font-medium whitespace-nowrap">Jump:</span>
                            <select
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val) {
                                        const el = document.getElementById(val);
                                        if (el) {
                                            el.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'nearest',
                                                inline: 'center',
                                            });
                                        }
                                        e.target.value = ''; // reset selection
                                    }
                                }}
                                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 focus:border-blue-500 focus:outline-none max-w-[120px] md:max-w-[160px] truncate"
                            >
                                <option value="">Select column...</option>
                                {view === 'table' ? (
                                    cols.map(c => (
                                        <option key={c} value={`col-th-${idPrefix}-${c}`}>
                                            {c}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <optgroup label="Fields (Rows)">
                                            {cols.map(c => (
                                                <option key={c} value={`col-th-${idPrefix}-${c}`}>
                                                    {c}
                                                </option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Records (Cols)">
                                            {rows.map(({ index }) => (
                                                <option key={index} value={`col-th-${idPrefix}-rec-${index}`}>
                                                    Record #{index}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </>
                                )}
                            </select>
                        </div>
                    )}
                    {hasData && view !== 'json' && (
                        <div className="flex items-center gap-1 border border-gray-200 rounded-md p-0.5 bg-gray-50/50">
                            <button
                                type="button"
                                onClick={scrollLeft}
                                className="rounded px-2 py-0.5 text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-100 border border-gray-200 shadow-sm transition-colors"
                                title="Scroll left / Previous Columns"
                            >
                                ◀
                            </button>
                            <button
                                type="button"
                                onClick={scrollRight}
                                className="rounded px-2 py-0.5 text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-100 border border-gray-200 shadow-sm transition-colors"
                                title="Scroll right / Next Columns"
                            >
                                ▶
                            </button>
                        </div>
                    )}
                    <div className="flex overflow-hidden rounded-md border border-gray-200">
                        {MODES.map(m => (
                            <button
                                key={m.key}
                                type="button"
                                onClick={() => setView(m.key)}
                                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                                    view === m.key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div ref={containerRef} className="min-h-0 flex-1 overflow-auto">
                {!hasData ? (
                    <p className="p-3 text-sm text-gray-400">{placeholder || 'No data yet'}</p>
                ) : view === 'json' ? (
                    <pre className="p-3 text-xs leading-relaxed whitespace-pre-wrap break-words text-gray-800">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                ) : view === 'table' ? (
                    <TableView data={data} fk={fk} idPrefix={idPrefix} rowActions={rowActions} visibleIndices={visibleIndices} />
                ) : (
                    <MatrixView data={data} fk={fk} idPrefix={idPrefix} visibleIndices={visibleIndices} />
                )}
            </div>
        </div>
    )
}
