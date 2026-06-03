/**
 * Financial-year helpers.
 *
 * A financial year (FY) runs 01 Apr of `startYear` → 31 Mar of `startYear + 1`
 * and is labelled "YYYY-YY" (e.g. 2024 → "2024-25").
 *
 * The backend stores FY as a `startDate`/`endDate` pair, so these helpers convert
 * between a single FY "start year" (what the dropdown shows) and that date range
 * (what the API expects). This keeps the DB schema and reports unchanged.
 */

export interface FinancialYearOption {
    value: number // FY start year, e.g. 2024 for "2024-25"
    label: string // e.g. "2024-25"
}

/** FY label for a given start year, e.g. 2024 -> "2024-25". */
export function fyLabel(startYear: number): string {
    const end = (startYear + 1) % 100
    return `${startYear}-${String(end).padStart(2, '0')}`
}

/** The current financial year's start year (Apr–Mar). */
export function currentFinancialYearStart(now: Date = new Date()): number {
    const year = now.getFullYear()
    // Jan–Mar (months 0–2) still belong to the previous FY.
    return now.getMonth() >= 3 ? year : year - 1
}

/** List FYs from the current FY back `count` years, newest first (default 15). */
export function listFinancialYears(
    count = 15,
    now: Date = new Date(),
): FinancialYearOption[] {
    const current = currentFinancialYearStart(now)
    const out: FinancialYearOption[] = []
    for (let y = current; y > current - count; y--) {
        out.push({ value: y, label: fyLabel(y) })
    }
    return out
}

/** Convert an FY start year to its date range (YYYY-MM-DD strings). */
export function fyToDateRange(startYear: number): {
    startDate: string
    endDate: string
} {
    return {
        startDate: `${startYear}-04-01`,
        endDate: `${startYear + 1}-03-31`,
    }
}

/**
 * Derive the FY start year from a start date (ISO string or Date).
 * Returns null when absent/invalid. Parses YYYY-MM-DD by parts to avoid
 * timezone drift around the April boundary.
 */
export function fyStartYearFromDate(
    date?: string | Date | null,
): number | null {
    if (!date) return null
    if (typeof date === 'string') {
        const [y, m] = date.split('T')[0].split('-').map((n) => parseInt(n, 10))
        if (Number.isNaN(y) || Number.isNaN(m)) return null
        return m >= 4 ? y : y - 1
    }
    if (Number.isNaN(date.getTime())) return null
    return date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1
}
