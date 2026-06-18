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

/**
 * Decimal number inputs (whole or decimal). Strips anything that isn't a
 * digit, a single leading minus, or a single dot — so the field can never
 * hold a non-numeric string. Preserves a trailing "." while typing (e.g. "1.")
 * so decimals can be entered smoothly; backend coerces to a number.
 */
export function parseDecimalInput(raw: string): string {
    let s = raw.replace(/[^\d.-]/g, '')
    const neg = s.startsWith('-')
    s = s.replace(/-/g, '')
    const firstDot = s.indexOf('.')
    if (firstDot !== -1) {
        s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '')
    }
    return (neg ? '-' : '') + s
}

/** Member / headcount style counts (max 6 digits). */
export function parseBoundedCountInput(raw: string, maxDigits = 6): number | '' {
    const digits = raw.replace(/\D/g, '').slice(0, maxDigits)
    if (digits === '') return ''
    const n = parseInt(digits, 10)
    return Number.isNaN(n) ? '' : n
}
 