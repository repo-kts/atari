import React, { useEffect, useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { DynamicReportTableBuilder, ResultTable } from '@/components/common/dynamic-table/DynamicReportTableBuilder'
import { FormTextArea, FormSection } from '../shared/FormComponents'
import { MultiAttachmentUploader } from '@/components/common/MultiAttachmentUploader'
import { useFormAttachments } from '@/hooks/useFormAttachments'
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
    embedded?: boolean
    sourceRows?: Array<{ optionKey: string; optionName: string }>
    kvkId?: number | null
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
    embedded = false,
    sourceRows = [],
    kvkId,
}) => {
    const [submitting, setSubmitting] = useState(false)
    const [value, setValue] = useState<OftResultFormValue>(normalizeInitialValue(initialValue, sourceRows))
    const recordId = (initialValue?.oftResultReportId ?? null) as number | null

    const title = useMemo(() => mode === 'create' ? 'Add OFT Result' : 'Edit OFT Result', [mode])

    useEffect(() => {
        setValue(normalizeInitialValue(initialValue, sourceRows))
    }, [initialValue, mode, sourceRows])

    const initialPhotos = (initialValue?.photos ?? []) as FormAttachmentRow[]
    const initialDatasheets = (initialValue?.datasheets ?? []) as FormAttachmentRow[]

    const photosQuery = useFormAttachments({
        formCode: FORM_CODE,
        recordId,
        kvkId: kvkId ?? undefined,
        kind: 'PHOTO',
        enabled: Boolean(kvkId && recordId),
    })
    const datasheetsQuery = useFormAttachments({
        formCode: FORM_CODE,
        recordId,
        kvkId: kvkId ?? undefined,
        kind: 'DATASHEET',
        enabled: Boolean(kvkId && recordId),
    })

    const [orphanPhotos, setOrphanPhotos] = useState<FormAttachmentRow[]>(
        recordId ? [] : initialPhotos.filter((p) => p.recordId == null),
    )
    const [orphanDatasheets, setOrphanDatasheets] = useState<FormAttachmentRow[]>(
        recordId ? [] : initialDatasheets.filter((d) => d.recordId == null),
    )

    const photos = recordId ? (photosQuery.data ?? initialPhotos) : orphanPhotos
    const datasheets = recordId ? (datasheetsQuery.data ?? initialDatasheets) : orphanDatasheets

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!kvkId) {
            alert('KVK context missing — cannot save attachments.')
            return
        }
        setSubmitting(true)
        try {
            const attachmentIds = [...photos, ...datasheets]
                .filter((a) => !a.recordId)
                .map((a) => a.attachmentId)
            await onSubmit({ ...value, attachmentIds })
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
            </div>

            {kvkId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSection title="Photographs">
                        <MultiAttachmentUploader
                            formCode={FORM_CODE}
                            kind="PHOTO"
                            kvkId={kvkId}
                            recordId={recordId}
                            attachments={photos}
                            showCaption
                            onChange={recordId ? undefined : setOrphanPhotos}
                        />
                    </FormSection>

                    <FormSection title="Supplementary Datasheets">
                        <MultiAttachmentUploader
                            formCode={FORM_CODE}
                            kind="DATASHEET"
                            kvkId={kvkId}
                            recordId={recordId}
                            attachments={datasheets}
                            showCaption={false}
                            onChange={recordId ? undefined : setOrphanDatasheets}
                        />
                    </FormSection>
                </div>
            ) : (
                <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    KVK context not available — attachment uploads are disabled. Save the result first; you can add photos/datasheets after.
                </div>
            )}

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
