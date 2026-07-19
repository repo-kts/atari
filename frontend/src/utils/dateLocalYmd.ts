/**
 * Calendar date in the user's local timezone as YYYY-MM-DD.
 * Prefer this over `date.toISOString().slice(0, 10)` for form date inputs and max="today",
 * since ISO uses UTC and can shift the calendar day near midnight in non-UTC zones.
 */
export function formatLocalDateYmd(d: Date = new Date()): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

/**
 * Format a backend date value as DD/MM/YYYY without any timezone shift.
 *
 * Backend date-only fields (startDate, endDate, meetingDate, …) are serialized
 * as `YYYY-MM-DD` or as an ISO timestamp at UTC midnight. `new Date(iso)` parses
 * those as UTC, so `toLocaleDateString` in a timezone behind UTC (e.g. US) rolls
 * the calendar day back one (2024-01-01 → 31/12/2023). Reading the UTC parts —
 * or the raw Y-M-D string directly — keeps the calendar day the user entered.
 */
export function formatDmyUtc(
    input: string | number | Date | null | undefined,
): string | null {
    if (input === null || input === undefined || input === '') return null
    if (typeof input === 'string') {
        const m = input.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
        if (m) return `${m[3]}/${m[2]}/${m[1]}`
    }
    const d = input instanceof Date ? input : new Date(input)
    if (Number.isNaN(d.getTime())) return null
    const day = String(d.getUTCDate()).padStart(2, '0')
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const year = d.getUTCFullYear()
    return `${day}/${month}/${year}`
}
