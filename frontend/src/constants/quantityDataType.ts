// Quantity data type carried by a Crop / Product master. Downstream entry forms
// (FLD Introduction, Production & Supply) use it to constrain the quantity input:
//   number  -> whole-number input, stored in numeric `quantity`
//   decimal -> decimal input, stored in numeric `quantity`
//   string  -> free text (e.g. "N/A"), stored in `quantityText`
//   boolean -> Yes/No, stored in `quantityText`
export const QUANTITY_DATA_TYPES = ['number', 'decimal', 'string', 'boolean'] as const

export type QuantityDataType = (typeof QUANTITY_DATA_TYPES)[number]

export const QUANTITY_DATA_TYPE_OPTIONS: Array<{ value: QuantityDataType; label: string }> = [
    { value: 'number', label: 'Number (whole)' },
    { value: 'decimal', label: 'Decimal' },
    { value: 'string', label: 'Text / String' },
    { value: 'boolean', label: 'Yes / No (Boolean)' },
]

/** Types stored as text in `quantityText` rather than the numeric `quantity`. */
export function isTextQuantityType(t?: string | null): boolean {
    return t === 'string' || t === 'boolean'
}
