import React from 'react'

export interface ResultTableColumn {
    columnKey: string
    columnLabel: string
    isMandatory: boolean
    sortOrder: number
}

export interface ResultTableRow {
    rowLabel: string
    sortOrder: number
    cells: Record<string, string>
}

export interface ResultTable {
    tableTitle: string
    sortOrder: number
    columns: ResultTableColumn[]
    rows: ResultTableRow[]
}

interface DynamicReportTableBuilderProps {
    tables: ResultTable[]
    onChange: (tables: ResultTable[]) => void
}

const FIRST_COLUMN_KEY = 'tech_option'
const PROPOSED_COLUMN_KEY = 'proposed'
const ACTUAL_COLUMN_KEY = 'actual'
const DEFAULT_FIRST_COLUMN = {
    columnKey: FIRST_COLUMN_KEY,
    columnLabel: 'Technology options with detailed treatments',
    isMandatory: true,
    sortOrder: 1,
}

const defaultRow = (label: string, sortOrder: number): ResultTableRow => ({
    rowLabel: label,
    sortOrder,
    cells: { [FIRST_COLUMN_KEY]: label },
})

const createDefaultTable = (sortOrder: number): ResultTable => ({
    tableTitle: `Table ${sortOrder}`,
    sortOrder,
    columns: [
        { ...DEFAULT_FIRST_COLUMN },
        { columnKey: PROPOSED_COLUMN_KEY, columnLabel: 'Proposed', isMandatory: false, sortOrder: 2 },
        { columnKey: ACTUAL_COLUMN_KEY, columnLabel: 'Actual', isMandatory: false, sortOrder: 3 },
    ],
    rows: [defaultRow('Farmer Practice', 1), defaultRow('TO1', 2), defaultRow('TO2', 3)],
})

export const DynamicReportTableBuilder: React.FC<DynamicReportTableBuilderProps> = ({ tables, onChange }) => {
    const safeTables = tables.length > 0 ? tables : [createDefaultTable(1)]

    const patchTable = (tableIndex: number, updater: (table: ResultTable) => ResultTable) => {
        const next = safeTables.map((table, idx) => (idx === tableIndex ? updater(table) : table))
        onChange(next.map((table, idx) => ({ ...table, sortOrder: idx + 1 })))
    }

    const addTable = () => onChange([...safeTables, createDefaultTable(safeTables.length + 1)])
    const removeTable = (tableIndex: number) => onChange(safeTables.filter((_, idx) => idx !== tableIndex))

    const addColumn = (tableIndex: number) => {
        patchTable(tableIndex, (table) => {
            const key = `col_${table.columns.length + 1}`
            const column = {
                columnKey: key,
                columnLabel: `Column ${table.columns.length + 1}`,
                isMandatory: false,
                sortOrder: table.columns.length + 1,
            }
            return {
                ...table,
                columns: [...table.columns, column],
                rows: table.rows.map((row) => ({ ...row, cells: { ...row.cells, [key]: '' } })),
            }
        })
    }

    const removeColumn = (tableIndex: number, columnKey: string) => {
        if (columnKey === FIRST_COLUMN_KEY) return
        patchTable(tableIndex, (table) => ({
            ...table,
            columns: table.columns.filter((c) => c.columnKey !== columnKey),
            rows: table.rows.map((row) => {
                const cells = { ...row.cells }
                delete cells[columnKey]
                return { ...row, cells }
            }),
        }))
    }

    const addRow = (tableIndex: number) => {
        patchTable(tableIndex, (table) => ({
            ...table,
            rows: [...table.rows, { rowLabel: `Row ${table.rows.length + 1}`, sortOrder: table.rows.length + 1, cells: {} }],
        }))
    }

    const removeRow = (tableIndex: number, rowIndex: number) => {
        patchTable(tableIndex, (table) => ({
            ...table,
            rows: table.rows.filter((_, idx) => idx !== rowIndex).map((row, idx) => ({ ...row, sortOrder: idx + 1 })),
        }))
    }

    return (
        <div className="space-y-6 w-full">
            {safeTables.map((table, tableIndex) => (
                <div key={`table-${tableIndex}`} className="w-full border border-gray-300 rounded-xl p-4 space-y-3 bg-white">
                    <div className="flex items-center gap-2 w-full">
                        <input
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                            value={table.tableTitle}
                            onChange={(e) => patchTable(tableIndex, (t) => ({ ...t, tableTitle: e.target.value }))}
                            placeholder="Table title"
                        />
                        <button type="button" className="px-3 py-2 text-sm border border-gray-300 rounded-lg" onClick={() => addColumn(tableIndex)}>Add Column</button>
                        <button type="button" className="px-3 py-2 text-sm border border-gray-300 rounded-lg" onClick={() => addRow(tableIndex)}>Add Row</button>
                        <button type="button" className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-red-600" onClick={() => removeTable(tableIndex)}>Remove Table</button>
                    </div>
                    <div className="overflow-x-auto w-full border border-gray-300 rounded-xl">
                        <table className="w-full min-w-full table-fixed border-separate border-spacing-0">
                            <thead className="bg-gray-50">
                                <tr>
                                    {table.columns.map((column, colIdx) => (
                                        <th key={column.columnKey} className="border-b border-r border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                    value={column.columnLabel}
                                                    onChange={(e) => patchTable(tableIndex, (t) => ({
                                                        ...t,
                                                        columns: t.columns.map((col) => col.columnKey === column.columnKey ? { ...col, columnLabel: e.target.value } : col),
                                                    }))}
                                                />
                                                {colIdx > 0 && (
                                                    <button type="button" className="text-xs text-red-600" onClick={() => removeColumn(tableIndex, column.columnKey)}>X</button>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="border-b border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {table.rows.map((row, rowIndex) => (
                                    <tr key={`${tableIndex}-${rowIndex}`}>
                                        {table.columns.map((column) => (
                                            <td key={`${rowIndex}-${column.columnKey}`} className="border-b border-r border-gray-300 px-3 py-2">
                                                <input
                                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                                    value={row.cells?.[column.columnKey] || ''}
                                                    onChange={(e) => patchTable(tableIndex, (t) => ({
                                                        ...t,
                                                        rows: t.rows.map((r, idx) => idx === rowIndex
                                                            ? {
                                                                ...r,
                                                                rowLabel: column.columnKey === FIRST_COLUMN_KEY ? e.target.value : r.rowLabel,
                                                                cells: { ...r.cells, [column.columnKey]: e.target.value },
                                                            }
                                                            : r),
                                                    }))}
                                                />
                                            </td>
                                        ))}
                                        <td className="border-b border-gray-300 px-3 py-2">
                                            <button type="button" className="text-xs text-red-600" onClick={() => removeRow(tableIndex, rowIndex)}>Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
            <button type="button" className="px-3 py-2 border border-gray-300 rounded-lg" onClick={addTable}>Add Table</button>
        </div>
    )
}
