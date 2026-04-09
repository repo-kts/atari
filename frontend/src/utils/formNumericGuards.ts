/**
 * Integer inputs that map to DB INT columns — block phone-sized values and non-digits.
 */

/** Year of establishment: 4 digits (parsed as number for API). */
export function parseEstablishmentYearInput(raw: string): number | '' {
    const digits = raw.replace(/\D/g, '').slice(0, 4)
    if (digits === '') return ''
    const n = parseInt(digits, 10)
    return Number.isNaN(n) ? '' : n
}

/** Member / headcount style counts (max 6 digits). */
export function parseBoundedCountInput(raw: string, maxDigits = 6): number | '' {
    const digits = raw.replace(/\D/g, '').slice(0, maxDigits)
    if (digits === '') return ''
    const n = parseInt(digits, 10)
    return Number.isNaN(n) ? '' : n
}
 