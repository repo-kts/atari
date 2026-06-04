/**
 * Dropdown option builder.
 *
 * Derives stable `{ value, label }` arrays from master data lists. Keep calls
 * wrapped in `useMemo` in consumers so downstream selects don't see a new
 * reference on every render.
 */

export type SelectOption = { value: string; label: string }

type LabelResolver<T> = keyof T | ((item: T) => string | null | undefined)

function resolveLabel<T>(item: T, label: LabelResolver<T>): string {
    if (typeof label === 'function') {
        return String(label(item) ?? '')
    }
    return String((item as Record<string, unknown>)[label as string] ?? '')
}

/**
 * Build a `{ value, label }` option array from a list of master records.
 *
 * @param list   source records (e.g. `payScales`, `equipmentTypes`)
 * @param idKey  property that carries the numeric/string id
 * @param label  property name OR function returning the display label
 */
export function toOptions<T>(
    list: readonly T[],
    idKey: keyof T,
    label: LabelResolver<T>,
): SelectOption[] {
    const out: SelectOption[] = []
    for (const item of list) {
        const id = (item as Record<string, unknown>)[idKey as string]
        if (id == null) continue
        out.push({ value: String(id), label: resolveLabel(item, label) })
    }
    return out
}

/**
 * Build options after filtering records against an optional parent id.
 * Common pattern for dependent dropdowns (e.g. EquipmentMaster filtered by
 * selected EquipmentType).
 */
export function toFilteredOptions<T>(
    list: readonly T[],
    idKey: keyof T,
    label: LabelResolver<T>,
    filterKey: keyof T,
    filterValue: number | string | null | undefined,
): SelectOption[] {
    if (filterValue == null || filterValue === '') return []
    return toOptions(
        list.filter((item) => (item as Record<string, unknown>)[filterKey as string] === filterValue),
        idKey,
        label,
    )
}
