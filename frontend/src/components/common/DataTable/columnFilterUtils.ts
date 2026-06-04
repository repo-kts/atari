import { getFieldValue } from '@/utils/masterUtils'
import type { ColumnFilterState } from './ColumnFilter'

export type ColumnFilters = Record<string, ColumnFilterState>

const BLANK_TOKEN = '__blank__'

export function valueToString(value: unknown): string {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string') return value
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
    const set = new Set<string>()
    for (const item of data) {
        const v = valueToString(getFieldValue(item, field))
        set.add(v)
    }
    return Array.from(set).sort((a, b) => {
        if (a === '') return -1
        if (b === '') return 1
        const na = Number(a)
        const nb = Number(b)
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
        return a.localeCompare(b)
    })
}

export function applyColumnFilters<T>(
    data: T[],
    fields: readonly string[],
    filters: ColumnFilters,
): T[] {
    if (!filters || Object.keys(filters).length === 0) return data
    let result = data
    for (const field of fields) {
        const f = filters[field]
        if (!f) continue
        const text = f.text.trim().toLowerCase()
        const hasExcluded = f.excluded && f.excluded.size > 0
        if (!text && !hasExcluded) continue
        result = result.filter((item) => {
            const raw = valueToString(getFieldValue(item, field))
            if (text && !raw.toLowerCase().includes(text)) return false
            if (hasExcluded) {
                const key = raw || BLANK_TOKEN
                if (f.excluded.has(key)) return false
            }
            return true
        })
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
