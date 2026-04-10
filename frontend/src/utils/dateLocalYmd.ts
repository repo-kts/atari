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
