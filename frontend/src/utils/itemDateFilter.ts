/**
 * From/To list filters: resolve each row to an activity interval or a single calendar date,
 * then test against the filter. Rows with start+end must lie fully inside [from, to] when both are set.
 */

type IntervalShape = {
    kind: 'interval'
    start: Date
    end: Date
}

type PointShape = {
    kind: 'point'
    date: Date
}

type UnresolvableShape = {
    kind: 'unresolvable'
}

type TemporalShape = IntervalShape | PointShape | UnresolvableShape

function startOfDay(d: Date): Date {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x
}

function endOfDay(d: Date): Date {
    const x = new Date(d)
    x.setHours(23, 59, 59, 999)
    return x
}

function parseDate(value: unknown): Date | null {
    if (value === null || value === undefined || value === '') return null
    if (typeof value === 'string') {
        const t = value.trim()
        if (!t) return null
        // dd-MM-yyyy or dd/MM/yyyy (common UI-rendered date strings)
        const dmy = t.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/)
        if (dmy) {
            const day = Number(dmy[1])
            const month = Number(dmy[2])
            const year = Number(dmy[3])
            if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                const d = new Date(year, month - 1, day, 12, 0, 0, 0)
                return Number.isNaN(d.getTime()) ? null : d
            }
            return null
        }
        if (/^\d{4}-\d{2}$/.test(t)) {
            const d = new Date(`${t}-01T12:00:00`)
            return Number.isNaN(d.getTime()) ? null : d
        }
        if (/^\d{4}$/.test(t)) {
            const d = new Date(`${t}-01-01T12:00:00`)
            return Number.isNaN(d.getTime()) ? null : d
        }
    }
    const d = new Date(value as string | number | Date)
    return Number.isNaN(d.getTime()) ? null : d
}

/** Pairs [startKey, endKey]; end may be missing for some APIs — handled per pair below. */
const INTERVAL_START_END_KEYS: [string, string][] = [
    ['startDate', 'endDate'],
    ['start_date', 'end_date'],
    ['oftStartDate', 'oftEndDate'],
]

function tryIntervalFromPairs(item: Record<string, unknown>): IntervalShape | null {
    for (const [startKey, endKey] of INTERVAL_START_END_KEYS) {
        const rawS = item[startKey]
        const rawE = item[endKey]
        const s = parseDate(rawS)
        if (!s) continue
        const e = parseDate(rawE)
        if (e) {
            const start = startOfDay(s)
            const end = endOfDay(e)
            if (start.getTime() <= end.getTime()) {
                return { kind: 'interval', start, end }
            }
            return {
                kind: 'interval',
                start: endOfDay(s),
                end: startOfDay(e),
            }
        }
        // Optional OFT end: single-day activity when oftEndDate is null
        if (startKey === 'oftStartDate') {
            return {
                kind: 'interval',
                start: startOfDay(s),
                end: endOfDay(s),
            }
        }
        // startDate without endDate: not a closed interval here — use single-date path (e.g. FLD)
    }
    return null
}

const SINGLE_DATE_KEYS: string[] = [
    'reportingYearDate',
    'programmeDate',
    'dateOfProgram',
    'dateOfTheProgramme',
    'trainingDate',
    'activityDate',
    'observationDate',
    'meetingDate',
    'eventDate',
    'dateOfOutbreak',
    'date_of_outbreak',
    'dateOfCompletion',
    'date_of_completion',
    'trialDate',
    'visitDate',
    /** VIP visitors (API: `dateOfVisit`); form may send `visitDate`. */
    'dateOfVisit',
    'date_of_visit',
    'celebrationDate',
    'publicationDate',
    'awardDate',
    'monthYear',
]

function reportingYearAsDay(item: Record<string, unknown>): Date | null {
    const raw = item.reportingYear
    if (raw !== null && typeof raw === 'object' && 'yearName' in raw) {
        const d = parseDate((raw as { yearName?: unknown }).yearName)
        return d ? startOfDay(d) : null
    }
    const d = parseDate(raw)
    return d ? startOfDay(d) : null
}

function trySingleFromKeys(item: Record<string, unknown>): PointShape | null {
    const ry = reportingYearAsDay(item)
    if (ry) return { kind: 'point', date: ry }

    for (const key of SINGLE_DATE_KEYS) {
        const d = parseDate(item[key])
        if (d) return { kind: 'point', date: startOfDay(d) }
    }

    const loneStart = parseDate(item.startDate)
    if (loneStart && !parseDate(item.endDate)) {
        return { kind: 'point', date: startOfDay(loneStart) }
    }

    const created = parseDate(item.createdAt)
    if (created) return { kind: 'point', date: startOfDay(created) }

    const updated = parseDate(item.updatedAt)
    if (updated) return { kind: 'point', date: startOfDay(updated) }

    return null
}

function normalizeBoundary(
    boundary: Date | null,
    side: 'from' | 'to'
): Date | null {
    if (!boundary) return null
    return side === 'from' ? startOfDay(boundary) : endOfDay(boundary)
}

function resolveRecordTemporalShape(item: unknown): TemporalShape {
    if (!item || typeof item !== 'object') return { kind: 'unresolvable' }
    const rec = item as Record<string, unknown>
    return (
        tryIntervalFromPairs(rec) ??
        trySingleFromKeys(rec) ?? { kind: 'unresolvable' }
    )
}

function isWithinMaxDate(date: Date, maxDate: Date): boolean {
    return date.getTime() <= maxDate.getTime()
}

/**
 * Interval decision rules (all inclusive):
 * - from only: start >= from
 * - to only: end <= to
 * - from + to: start >= from AND end <= to
 */
function matchesInterval(
    interval: IntervalShape,
    fromBoundary: Date | null,
    toBoundary: Date | null
): boolean {
    const startTs = interval.start.getTime()
    const endTs = interval.end.getTime()
    const hasFrom = Boolean(fromBoundary)
    const hasTo = Boolean(toBoundary)

    if (!hasFrom && !hasTo) return true
    if (hasFrom && hasTo && fromBoundary && toBoundary) {
        return (
            startTs >= fromBoundary.getTime() && endTs <= toBoundary.getTime()
        )
    }
    if (hasFrom && fromBoundary) return startTs >= fromBoundary.getTime()
    if (hasTo && toBoundary) return endTs <= toBoundary.getTime()
    return true
}

/**
 * Point-date decision rules (all inclusive):
 * - from only: date >= from
 * - to only: date <= to
 * - from + to: from <= date <= to
 */
function matchesPointDate(
    point: PointShape,
    fromBoundary: Date | null,
    toBoundary: Date | null
): boolean {
    const pointTs = point.date.getTime()
    if (fromBoundary && pointTs < fromBoundary.getTime()) return false
    if (toBoundary && pointTs > toBoundary.getTime()) return false
    return true
}

/**
 * Deterministic temporal filtering.
 * - Interval rows are matched by start/end boundaries.
 * - Point rows are matched by their single date.
 * - Boundaries are normalized to day-start/day-end for stable inclusive comparisons.
 */
export function itemMatchesDateRangeFilter(
    item: unknown,
    fromBoundary: Date | null,
    toBoundary: Date | null,
    maxDate: Date
): boolean {
    const normalizedFrom = normalizeBoundary(fromBoundary, 'from')
    const normalizedTo = normalizeBoundary(toBoundary, 'to')
    const hasFrom = Boolean(normalizedFrom)
    const hasTo = Boolean(normalizedTo)

    if (!hasFrom && !hasTo) return true

    const shape = resolveRecordTemporalShape(item)
    if (shape.kind === 'unresolvable') return false

    if (shape.kind === 'interval') {
        if (!isWithinMaxDate(shape.start, maxDate)) return false
        return matchesInterval(shape, normalizedFrom, normalizedTo)
    }

    if (!isWithinMaxDate(shape.date, maxDate)) return false
    return matchesPointDate(shape, normalizedFrom, normalizedTo)
}
