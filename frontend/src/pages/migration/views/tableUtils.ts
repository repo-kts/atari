/** Shared helpers for the tabular/matrix record views. */

export type Row = Record<string, unknown>

export interface IndexedRow {
    row: Row
    index: number
}

/** Nested objects from atariams.org DataTables rows → flat columns for tables. */
const NESTED_FLATTEN: Record<string, string[]> = {
    kvks: ['kvk_name'],
    kvk: ['kvk_name'],
    subject_name: ['oft_subject'],
    cropcategory: ['title'],
    crop: ['crop_name', 'name'],
}

/** Keys too noisy for spreadsheet views (HTML blobs, row counters). */
const HIDDEN_TABLE_KEYS = new Set(['action', 'DT_RowIndex'])

/**
 * Pull the record array out of any migration payload shape:
 *  - plain array (mapped records)
 *  - DataTables `{ data: [...] }`
 *  - transform result `{ records: [...] }`
 *  - accidental `{ raw: { data: [...] } }` wrapper
 */
export function extractRecordArray(data: unknown): unknown[] {
    if (Array.isArray(data)) return data
    if (!data || typeof data !== 'object') return []

    const obj = data as Row

    if (Array.isArray(obj.records)) return obj.records as unknown[]

    if (Array.isArray(obj.data)) return obj.data as unknown[]

    if (obj.raw && typeof obj.raw === 'object') {
        const inner = extractRecordArray(obj.raw)
        if (inner.length > 0) return inner
    }

    // DataTables metadata wrapper with no rows — not a single record.
    if ('draw' in obj || 'recordsTotal' in obj || 'recordsFiltered' in obj) {
        return Array.isArray(obj.data) ? (obj.data as unknown[]) : []
    }

    return [data]
}

/** Flatten nested relation blobs and strip HTML-only columns for table/matrix. */
export function flattenRowForDisplay(row: Row): Row {
    const flat: Row = { ...row }

    for (const [key, fields] of Object.entries(NESTED_FLATTEN)) {
        const nested = row[key]
        if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
            for (const f of fields) {
                flat[`${key}.${f}`] = (nested as Row)[f]
            }
        }
    }

    // Flatten resultReport fields for dashboard spreadsheet view
    const resultReport = row.resultReport
    if (resultReport && typeof resultReport === 'object' && !Array.isArray(resultReport)) {
        const reportObj = resultReport as Row
        flat.finalRecommendation = reportObj.finalRecommendation
        flat.constraintsFeedback = reportObj.constraintsFeedback
        flat.farmersParticipationProcess = reportObj.farmersParticipationProcess
        flat.resultText = reportObj.resultText
        flat.remark = reportObj.remark
        flat.photographName = reportObj.photographName
    }

    // Flatten fldResult fields for dashboard spreadsheet view
    const fldResult = row.fldResult
    if (fldResult && typeof fldResult === 'object' && !Array.isArray(fldResult)) {
        const resultObj = fldResult as Row
        flat.demoYield = resultObj.demoYield
        flat.checkYield = resultObj.checkYield
        flat.increasePercent = resultObj.increasePercent
        flat.demoGrossCost = resultObj.demoGrossCost
        flat.demoGrossReturn = resultObj.demoGrossReturn
        flat.demoNetReturn = resultObj.demoNetReturn
        flat.demoBcr = resultObj.demoBcr
        flat.checkGrossCost = resultObj.checkGrossCost
        flat.checkGrossReturn = resultObj.checkGrossReturn
        flat.checkNetReturn = resultObj.checkNetReturn
        flat.checkBcr = resultObj.checkBcr
    }

    for (const k of HIDDEN_TABLE_KEYS) delete flat[k]

    if (typeof flat.progress_status === 'string' && flat.progress_status.includes('<')) {
        flat.progress_status = flat.progress_status.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    }

    return flat
}

/**
 * Coerce any api payload into rows tagged with their ORIGINAL array index, so
 * edits map back to the right element. Null/failed rows become visible placeholders.
 */
export function toIndexedRows(data: unknown, opts?: { flatten?: boolean }): IndexedRow[] {
    const arr = extractRecordArray(data)
    const flatten = opts?.flatten !== false
    const out: IndexedRow[] = []

    arr.forEach((r, index) => {
        if (r === null || r === undefined) {
            out.push({
                row: { _status: 'not mapped', _issues: '(transform returned null)' },
                index,
            })
            return
        }
        if (typeof r === 'object' && !Array.isArray(r)) {
            const row = flatten ? flattenRowForDisplay(r as Row) : (r as Row)
            out.push({ row, index })
        }
    })

    return out
}

/** Coerce any api payload into a flat array of record objects. */
export function toRows(data: unknown): Row[] {
    return toIndexedRows(data).map(r => r.row)
}

/** Union of all keys across rows, preserving first-seen order. */
export function collectColumns(rows: Row[]): string[] {
    const cols: string[] = []
    const seen = new Set<string>()
    for (const r of rows) {
        for (const k of Object.keys(r)) {
            if (!seen.has(k)) {
                seen.add(k)
                cols.push(k)
            }
        }
    }
    return cols
}

/** FK-editing config threaded into the table/matrix views (mapped pane only). */
export interface FkEditing {
    foreignKeys: Record<string, { master: string; otherField?: string }>
    fkOptions: Record<string, { value: number; label: string }[]>
    /** Pick an FK master id for one cell. */
    onEditCell: (rowIndex: number, field: string, value: number | null) => void
    /** Edit any non-FK scalar cell (writes into the shared records state). */
    onEditField?: (rowIndex: number, field: string, value: unknown) => void
    /** Copy an FK value into every still-unmatched row in the same column. */
    onFillUnmatched?: (field: string, value: number) => void
}

/** Render one cell value compactly: nested objects collapse to JSON, null shows ·. */
export function formatCell(value: unknown): string {
    if (value === null || value === undefined) return '·'
    if (typeof value === 'object') {
        const s = JSON.stringify(value)
        return s.length > 80 ? s.slice(0, 77) + '…' : s
    }
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    return String(value)
}

/** True when the value should read as "empty" for subtle styling. */
export function isEmpty(value: unknown): boolean {
    return value === null || value === undefined || value === ''
}

/** True when tabular views have at least one row to render. */
export function hasTabularRows(data: unknown): boolean {
    return toIndexedRows(data).length > 0
}
