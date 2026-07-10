import { getFieldValue } from '@/utils/masterUtils'
import type { ColumnFilterState } from './ColumnFilter'

export type ColumnFilters = Record<string, ColumnFilterState>

const BLANK_TOKEN = '__blank__'

function normalizeFilterValue(value: string): string {
    return value.replace(/\s+/g, ' ').trim()
}

function filterKey(value: string): string {
    return (value || BLANK_TOKEN).toLocaleLowerCase()
}

export function valueToString(value: unknown): string {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string') return normalizeFilterValue(value)
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (value instanceof Date) return value.toISOString()
    if (typeof value === 'object') {
        const obj = value as Record<string, unknown>
        const cand = obj.name ?? obj.label ?? obj.title ?? obj.value
        if (cand !== undefined) return valueToString(cand)
        try {
            return JSON.stringify(value)
        } catch {
            return String(value)
        }
    }
    return String(value)
}

export function uniqueValuesForField(
    data: any[],
    field: string,
): string[] {
    const values = new Map<string, string>()
    for (const item of data) {
        const v = valueToString(getFieldValue(item, field))
        const key = filterKey(v)
        if (!values.has(key)) values.set(key, v)
    }
    return Array.from(values.values()).sort((a, b) => {
        if (a === '') return -1
        if (b === '') return 1
        const na = Number(a)
        const nb = Number(b)
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
        return a.localeCompare(b)
    })
}

/**
 * Row count per distinct value of `field`, keyed by the same display strings
 * `uniqueValuesForField` returns (values that differ only in case/whitespace
 * are counted together).
 */
export function valueCountsForField(
    data: any[],
    field: string,
): Map<string, number> {
    const counts = new Map<string, number>()
    const display = new Map<string, string>()
    for (const item of data) {
        const v = valueToString(getFieldValue(item, field))
        const key = filterKey(v)
        if (!display.has(key)) display.set(key, v)
        const label = display.get(key) as string
        counts.set(label, (counts.get(label) ?? 0) + 1)
    }
    return counts
}

/**
 * Group sizes for rows kept by a "unique values" column filter, keyed by the
 * surviving row object. Rewritten on every `applyColumnFilters` run; read with
 * `getUniqueCount` when rendering a cell.
 */
const uniqueCountsByRow = new WeakMap<object, Record<string, number>>()

export function getUniqueCount(item: unknown, field: string): number | undefined {
    if (!item || typeof item !== 'object') return undefined
    return uniqueCountsByRow.get(item as object)?.[field]
}

function clearUniqueCounts(data: unknown[]): void {
    for (const item of data) {
        if (item && typeof item === 'object') uniqueCountsByRow.delete(item as object)
    }
}

export function applyColumnFilters<T>(
    data: T[],
    fields: readonly string[],
    filters: ColumnFilters,
): T[] {
    const uniqueFields = fields.filter((field) => filters?.[field]?.unique)
    if (uniqueFields.length === 0) clearUniqueCounts(data)
    if (!filters || Object.keys(filters).length === 0) return data
    let result = data
    for (const field of fields) {
        const f = filters[field]
        if (!f) continue
        const hasExcluded = f.excluded && f.excluded.size > 0
        if (!hasExcluded) continue
        result = result.filter((item) => {
            const raw = valueToString(getFieldValue(item, field))
            const key = filterKey(raw)
            const excluded = Array.from(f.excluded).some((value) => filterKey(value === BLANK_TOKEN ? '' : value) === key)
            return !excluded
        })
    }

    // "Unique values": collapse rows sharing the same value(s) in the flagged
    // column(s), keeping the first row of each group and recording the group
    // size so the cell can render `Value (n)`.
    if (uniqueFields.length > 0) {
        const countsPerField = new Map<string, Map<string, number>>()
        for (const field of uniqueFields) {
            const counts = new Map<string, number>()
            for (const item of result) {
                const key = filterKey(valueToString(getFieldValue(item, field)))
                counts.set(key, (counts.get(key) ?? 0) + 1)
            }
            countsPerField.set(field, counts)
        }
        const seen = new Set<string>()
        const deduped: T[] = []
        for (const item of result) {
            const keys = uniqueFields.map((field) =>
                filterKey(valueToString(getFieldValue(item, field))),
            )
            const groupKey = keys.join('||')
            if (seen.has(groupKey)) continue
            seen.add(groupKey)
            if (item && typeof item === 'object') {
                const counts: Record<string, number> = {}
                uniqueFields.forEach((field, i) => {
                    counts[field] = countsPerField.get(field)?.get(keys[i]) ?? 1
                })
                uniqueCountsByRow.set(item as object, counts)
            }
            deduped.push(item)
        }
        result = deduped
    }

    // Single active sort: pick the first field with a sort direction set.
    const sortField = fields.find((f) => filters[f]?.sort)
    if (sortField) {
        const dir = filters[sortField].sort
        const mult = dir === 'desc' ? -1 : 1
        result = [...result].sort((a, b) => {
            const av = valueToString(getFieldValue(a, sortField))
            const bv = valueToString(getFieldValue(b, sortField))
            if (av === bv) return 0
            if (av === '') return 1
            if (bv === '') return -1
            const na = Number(av)
            const nb = Number(bv)
            if (!Number.isNaN(na) && !Number.isNaN(nb)) return (na - nb) * mult
            return av.localeCompare(bv) * mult
        })
    }
    return result
}
