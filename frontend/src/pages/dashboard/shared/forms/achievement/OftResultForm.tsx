import React, { useEffect, useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { DynamicReportTableBuilder, ResultTable } from '@/components/common/dynamic-table/DynamicReportTableBuilder'
import { FormInput, FormTextArea, FormSection } from '../shared/FormComponents'

export interface OftResultFormValue {
    finalRecommendation: string
    constraintsFeedback: string
    farmersParticipationProcess: string
    resultText: string
    remark: string
    supplementaryDatasheetSize?: number
    supplementaryDatasheetName?: string
    supplementaryDatasheetMime?: string
    photographSize?: number
    photographName?: string
    photographMime?: string
    tables: ResultTable[]
}

interface OftResultFormProps {
    mode: 'create' | 'edit'
    initialValue?: Partial<OftResultFormValue>
    onClose: () => void
    onSubmit: (value: OftResultFormValue) => Promise<void>
    embedded?: boolean
    sourceRows?: Array<{ optionKey: string; optionName: string }>
}

const defaultValue: OftResultFormValue = {
    finalRecommendation: '',
    constraintsFeedback: '',
    farmersParticipationProcess: '',
    resultText: '',
    remark: '',
    tables: [],
}

function normalizeInitialValue(
    initialValue?: Partial<OftResultFormValue>,
    sourceRows: Array<{ optionKey: string; optionName: string }> = []
): OftResultFormValue {
    const merged: any = { ...defaultValue, ...(initialValue || {}) }
    const rawTables = Array.isArray(merged.tables) ? merged.tables : []

    const normalizedTables = rawTables.map((table: any, tableIndex: number) => {
        const columns = Array.isArray(table.columns) ? table.columns : []
        const rows = Array.isArray(table.rows) ? table.rows : []
        const columnIdToKey = new Map<number, string>()
        const safeColumns = columns.map((col: any, colIndex: number) => {
            const key = String(col.columnKey || `col_${colIndex + 1}`)
            if (col.oftResultTableColumnId) {
                columnIdToKey.set(Number(col.oftResultTableColumnId), key)
            }
            return {
                columnKey: key,
                columnLabel: String(col.columnLabel || key),
                isMandatory: Boolean(col.isMandatory),
                sortOrder: Number(col.sortOrder || colIndex + 1),
            }
        })

        const safeRows = rows.map((row: any, rowIndex: number) => {
            const cellsObject: Record<string, string> = {}
            if (Array.isArray(row.cells)) {
                row.cells.forEach((cell: any) => {
                    const key = columnIdToKey.get(Number(cell.oftResultTableColumnId))
                    if (key) cellsObject[key] = String(cell.value ?? '')
                })
            } else if (row.cells && typeof row.cells === 'object') {
                Object.entries(row.cells).forEach(([k, v]) => {
                    cellsObject[k] = String(v ?? '')
                })
            }
            return {
                optionKey: row.optionKey ? String(row.optionKey) : undefined,
                rowLabel: String(row.rowLabel || `Row ${rowIndex + 1}`),
                sortOrder: Number(row.sortOrder || rowIndex + 1),
                cells: cellsObject,
            }
        })

        return {
            tableTitle: String(table.tableTitle || `Table ${tableIndex + 1}`),
            sortOrder: Number(table.sortOrder || tableIndex + 1),
            columns: safeColumns,
            rows: safeRows,
        }
    })

    const withRowsReconciled = normalizedTables.map((table: any) => {
        if (!sourceRows.length) return table
        const byKey = new Map((table.rows || []).map((row: any) => [String(row.optionKey || ''), row]))
        const rows = sourceRows.map((src, idx) => {
            const existing: any = byKey.get(src.optionKey)
            return {
                optionKey: src.optionKey,
                rowLabel: src.optionName,
                sortOrder: idx + 1,
                cells: { ...(existing?.cells || {}), tech_option: src.optionName },
            }
        })
        return { ...table, rows }
    })

    return {
        ...merged,
        tables: withRowsReconciled,
    }
}

export const OftResultForm: React.FC<OftResultFormProps> = ({ mode, initialValue, onClose, onSubmit, embedded = false, sourceRows = [] }) => {
    const [submitting, setSubmitting] = useState(false)
    const [value, setValue] = useState<OftResultFormValue>(normalizeInitialValue(initialValue, sourceRows))

    const title = useMemo(() => mode === 'create' ? 'Add OFT Result' : 'Edit OFT Result', [mode])

    useEffect(() => {
        setValue(normalizeInitialValue(initialValue, sourceRows))
    }, [initialValue, mode, sourceRows])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await onSubmit(value)
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormTextArea
                    label="Final recommendation for micro level situation"
                    required
                    value={value.finalRecommendation}
                    onChange={(e) => setValue((v) => ({ ...v, finalRecommendation: e.target.value }))}
                />
                <FormTextArea
                    label="Constraints identified and feedback for research"
                    required
                    value={value.constraintsFeedback}
                    onChange={(e) => setValue((v) => ({ ...v, constraintsFeedback: e.target.value }))}
                />
                <FormTextArea
                    label="Process of farmers participation and their reaction"
                    required
                    value={value.farmersParticipationProcess}
                    onChange={(e) => setValue((v) => ({ ...v, farmersParticipationProcess: e.target.value }))}
                />
                <FormTextArea
                    label="Result"
                    required
                    value={value.resultText}
                    onChange={(e) => setValue((v) => ({ ...v, resultText: e.target.value }))}
                />
                <FormTextArea
                    label="Remark"
                    value={value.remark}
                    onChange={(e) => setValue((v) => ({ ...v, remark: e.target.value }))}
                />
                <div>
                    <FormInput
                        label="Supplementary Datasheet (max 2 MB)"
                        type="file"
                        helperText={`Selected: ${value.supplementaryDatasheetName || 'None'}`}
                        onChange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            setValue((v) => ({
                                ...v,
                                supplementaryDatasheetName: file?.name,
                                supplementaryDatasheetSize: file?.size,
                                supplementaryDatasheetMime: file?.type,
                            }))
                        }}
                    />
                </div>
                <div>
                    <FormInput
                        label="Photograph (max 1 MB)"
                        type="file"
                        helperText={`Selected: ${value.photographName || 'None'}`}
                        onChange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            setValue((v) => ({
                                ...v,
                                photographName: file?.name,
                                photographSize: file?.size,
                                photographMime: file?.type,
                            }))
                        }}
                    />
                </div>
            </div>
            <FormSection title="Dynamic Result Tables">
                <DynamicReportTableBuilder
                    tables={value.tables || []}
                    onChange={(tables) => setValue((v) => ({ ...v, tables }))}
                    sourceRows={sourceRows}
                    lockSourceRows
                />
            </FormSection>

            <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="px-4 py-2 border rounded-lg" onClick={onClose} disabled={submitting}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#487749] text-white rounded-lg disabled:opacity-60" disabled={submitting}>
                    {submitting ? 'Saving...' : mode === 'create' ? 'Create Result' : 'Update Result'}
                </button>
            </div>
        </form>
    )

    if (embedded) {
        return formContent
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={title} size="lg">
            {formContent}
        </Modal>
    )
}
