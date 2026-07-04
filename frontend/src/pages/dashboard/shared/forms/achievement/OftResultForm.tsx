import React, { useEffect, useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { DynamicReportTableBuilder, ResultTable } from '@/components/common/dynamic-table/DynamicReportTableBuilder'
import { FormTextArea, FormSection } from '../shared/FormComponents'
import { FormAttachmentSection } from '@/components/common/FormAttachmentSection'
import type { FormAttachmentRow } from '@/services/formAttachmentsApi'

const FORM_CODE = 'oft_result'

export interface OftResultFormValue {
    finalRecommendation: string
    constraintsFeedback: string
    farmersParticipationProcess: string
    resultText: string
    remark: string
    tables: ResultTable[]
    attachmentIds?: number[]
    photos?: FormAttachmentRow[]
    datasheets?: FormAttachmentRow[]
    oftResultReportId?: number | null
}

interface OftResultFormProps {
    mode: 'create' | 'edit'
    initialValue?: Partial<OftResultFormValue>
    onClose: () => void
    onSubmit: (value: OftResultFormValue) => Promise<void>
    onMarkCompleted?: () => Promise<void>
    embedded?: boolean
    sourceRows?: Array<{ optionKey: string; optionName: string }>
    kvkId?: number | null
    isCompleted?: boolean
    canMarkCompleted?: boolean
}

const defaultValue: OftResultFormValue = {
    finalRecommendation: '',
    constraintsFeedback: '',
    farmersParticipationProcess: '',
    resultText: '',
    remark: '',
    tables: [],
}

function buildSeedTables(
    sourceRows: Array<{ optionKey: string; optionName: string }>
): ResultTable[] {
    const techColumn = {
        columnKey: 'tech_option',
        columnLabel: 'Technology options with detailed treatments',
        isMandatory: true,
        sortOrder: 1,
    }
    const proposed = { columnKey: 'proposed', columnLabel: 'Proposed', isMandatory: false, sortOrder: 2 }
    const actual = { columnKey: 'actual', columnLabel: 'Actual', isMandatory: false, sortOrder: 3 }

    const table1: ResultTable = {
        tableTitle: 'Table 1',
        sortOrder: 1,
        columns: [techColumn, proposed, actual],
        rows: sourceRows.map((src, idx) => ({
            optionKey: src.optionKey,
            rowLabel: src.optionName,
            sortOrder: idx + 1,
            cells: { tech_option: src.optionName },
        })),
    }
    const table2: ResultTable = {
        tableTitle: 'Table 2',
        sortOrder: 2,
        columns: [techColumn, proposed, actual],
        rows: [],
    }
    return [table1, table2]
}

function normalizeInitialValue(
    initialValue?: Partial<OftResultFormValue>,
    sourceRows: Array<{ optionKey: string; optionName: string }> = []
): OftResultFormValue {
    const merged: any = { ...defaultValue, ...(initialValue || {}) }
    const rawTables = Array.isArray(merged.tables) ? merged.tables : []

    const normalizedTables: ResultTable[] = rawTables.map((table: any, tableIndex: number) => {
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

        const safeRows: ResultTable['rows'] = rows.map((row: any, rowIndex: number) => {
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

        const reconciledRows = tableIndex === 0 && sourceRows.length > 0
            ? (() => {
                type Row = ResultTable['rows'][number]
                const existingByKey = new Map<string, Row>(
                    safeRows
                        .filter((row: Row) => row.optionKey)
                        .map((row: Row) => [String(row.optionKey), row])
                )
                const existingByLabel = new Map<string, Row>(
                    safeRows.map((row: Row) => [
                        String(row.rowLabel || row.cells?.tech_option || '')
                            .trim()
                            .toLowerCase(),
                        row,
                    ])
                )
                // Track which saved rows have already been bound to a source row so a
                // positional fallback never steals cells from a row that legitimately
                // belongs to a later source option.
                const usedRows = new Set<Row>()
                const claim = (row?: Row) => {
                    if (!row || usedRows.has(row)) return undefined
                    usedRows.add(row)
                    return row
                }
                const sourceAlignedRows = sourceRows.map((src, srcIndex) => {
                    // Match by optionKey → rowLabel → position. Old OFTs whose source
                    // technology was renamed drift on BOTH key and label; the positional
                    // fallback recovers their saved proposed/actual cells instead of
                    // rendering a blank seeded row (rows are ordered consistently).
                    const existing =
                        claim(existingByKey.get(String(src.optionKey))) ||
                        claim(existingByLabel.get(String(src.optionName).trim().toLowerCase())) ||
                        claim(safeRows[srcIndex])
                    return {
                        optionKey: src.optionKey,
                        rowLabel: src.optionName,
                        sortOrder: srcIndex + 1,
                        cells: {
                            ...(existing?.cells || {}),
                            tech_option: src.optionName,
                        },
                    }
                })
                const customRows = safeRows
                    .filter((row: Row) => !usedRows.has(row))
                    .map((row: Row, idx: number) => ({
                        ...row,
                        sortOrder: sourceAlignedRows.length + idx + 1,
                    }))
                return [...sourceAlignedRows, ...customRows]
            })()
            : safeRows

        return {
            tableTitle: String(table.tableTitle || `Table ${tableIndex + 1}`),
            sortOrder: Number(table.sortOrder || tableIndex + 1),
            columns: safeColumns,
            rows: reconciledRows,
        }
    })

    const tables = normalizedTables.length > 0 ? normalizedTables : buildSeedTables(sourceRows)

    return {
        ...merged,
        tables,
    }
}

export const OftResultForm: React.FC<OftResultFormProps> = ({
    mode,
    initialValue,
    onClose,
    onSubmit,
    onMarkCompleted,
    embedded = false,
    sourceRows = [],
    kvkId,
    isCompleted = false,
    canMarkCompleted = true,
}) => {
    const [submitting, setSubmitting] = useState(false)
    const [markingCompleted, setMarkingCompleted] = useState(false)
    const [hasSavedResult, setHasSavedResult] = useState(Boolean(initialValue?.oftResultReportId))
    const [value, setValue] = useState<OftResultFormValue>(normalizeInitialValue(initialValue, sourceRows))
    const [photoIds, setPhotoIds] = useState<number[]>([])
    const [datasheetIds, setDatasheetIds] = useState<number[]>([])
    const recordId = (initialValue?.oftResultReportId ?? null) as number | null

    const title = useMemo(() => mode === 'create' ? 'Add OFT Result' : 'Edit OFT Result', [mode])

    useEffect(() => {
        setValue(normalizeInitialValue(initialValue, sourceRows))
        setHasSavedResult(Boolean(initialValue?.oftResultReportId))
    }, [initialValue, mode, sourceRows])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!kvkId) {
            alert('KVK context missing — cannot save attachments.')
            return
        }
        setSubmitting(true)
        try {
            const attachmentIds = [...photoIds, ...datasheetIds]
            await onSubmit({ ...value, attachmentIds })
            setHasSavedResult(true)
        } catch {
            // Error already surfaced by the caller; keep the form open for retry.
        } finally {
            setSubmitting(false)
        }
    }

    const handleMarkCompleted = async () => {
        if (!onMarkCompleted || !hasSavedResult || isCompleted) return
        setMarkingCompleted(true)
        try {
            await onMarkCompleted()
        } finally {
            setMarkingCompleted(false)
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormAttachmentSection
                    title="Photographs"
                    formCode={FORM_CODE}
                    kind="PHOTO"
                    kvkId={kvkId}
                    recordId={recordId}
                    showCaption
                    initialAttachments={initialValue?.photos}
                    onAttachmentIdsChange={setPhotoIds}
                />
                <FormAttachmentSection
                    title="Supplementary Datasheets"
                    formCode={FORM_CODE}
                    kind="DATASHEET"
                    kvkId={kvkId}
                    recordId={recordId}
                    showCaption={false}
                    initialAttachments={initialValue?.datasheets}
                    onAttachmentIdsChange={setDatasheetIds}
                />
            </div>

            <FormSection title="Dynamic Result Tables">
                <DynamicReportTableBuilder
                    tables={value.tables || []}
                    onChange={(tables) => setValue((v) => ({ ...v, tables }))}
                    sourceRows={sourceRows}
                />
            </FormSection>

            <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="px-4 py-2 border rounded-lg" onClick={onClose} disabled={submitting}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#487749] text-white rounded-lg disabled:opacity-60" disabled={submitting}>
                    {submitting ? 'Saving...' : mode === 'create' ? 'Create Result' : 'Update Result'}
                </button>
                {canMarkCompleted && !isCompleted && onMarkCompleted && (
                    <button
                        type="button"
                        className="px-4 py-2 bg-[#2f5f34] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!hasSavedResult || submitting || markingCompleted}
                        onClick={handleMarkCompleted}
                    >
                        {markingCompleted ? 'Marking...' : 'Mark as Completed'}
                    </button>
                )}
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
