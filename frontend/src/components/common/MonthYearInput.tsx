import React, { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthYearInputProps {
    label: string
    required?: boolean
    /** Stored value in `YYYY-MM` (what the backend expects). */
    value?: string
    /** Emits `YYYY-MM` when valid + complete, otherwise an empty string. */
    onChange: (value: string) => void
    /** External error (e.g. from a failed submit) — overrides live validation. */
    error?: string
    className?: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** `YYYY-MM` → `MM/YYYY` for display. */
function toDisplay(value?: string): string {
    if (!value) return ''
    const m = String(value).match(/^(\d{4})-(\d{1,2})$/)
    if (!m) return ''
    return `${m[2].padStart(2, '0')}/${m[1]}`
}

/** `MM/YYYY` → `YYYY-MM` if a valid, complete month; else null. */
function toValue(display: string): string | null {
    const m = display.match(/^(\d{2})\/(\d{4})$/)
    if (!m) return null
    const month = parseInt(m[1], 10)
    const year = parseInt(m[2], 10)
    if (month < 1 || month > 12) return null
    if (year < 1900 || year > 2100) return null
    return `${m[2]}-${m[1]}`
}

/**
 * Credit-card-expiry style month/year field: masks input to `MM/YYYY` (slash
 * auto-inserted after the month), validates in real time, stores `YYYY-MM`, and
 * offers a calendar month picker.
 */
export const MonthYearInput: React.FC<MonthYearInputProps> = ({
    label,
    required,
    value,
    onChange,
    error,
    className = '',
}) => {
    const [display, setDisplay] = useState<string>(() => toDisplay(value))
    const [touched, setTouched] = useState(false)
    const [open, setOpen] = useState(false)
    const [viewYear, setViewYear] = useState<number>(() => {
        const m = String(value || '').match(/^(\d{4})-/)
        return m ? parseInt(m[1], 10) : new Date().getFullYear()
    })
    const containerRef = useRef<HTMLDivElement>(null)

    // Keep display in sync when the stored value changes externally (edit prefill).
    useEffect(() => {
        // Sync from the stored value only when it represents a different month
        // than what's currently typed (reads prev via the updater, so this
        // effect needs to depend on `value` only).
        setDisplay((prev) => (toValue(prev) !== value ? toDisplay(value) : prev))
    }, [value])

    // Close the picker on outside click.
    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    const handleChange = (raw: string) => {
        const deleting = raw.length < display.length
        const d = raw.replace(/\D/g, '').slice(0, 6) // MMYYYY
        let masked: string
        if (d.length < 2) masked = d
        else if (d.length === 2) masked = deleting ? d : `${d}/` // slash right after month
        else masked = `${d.slice(0, 2)}/${d.slice(2)}`
        setDisplay(masked)
        onChange(toValue(masked) ?? '')
    }

    const selected = value || toValue(display) || ''
    const selMatch = String(selected).match(/^(\d{4})-(\d{2})$/)
    const selYear = selMatch ? parseInt(selMatch[1], 10) : null
    const selMonth = selMatch ? parseInt(selMatch[2], 10) : null

    const togglePicker = () => {
        if (!open && selYear) setViewYear(selYear)
        setOpen((o) => !o)
        setTouched(true)
    }

    const pickMonth = (monthIndex: number) => {
        const mm = String(monthIndex + 1).padStart(2, '0')
        setDisplay(`${mm}/${viewYear}`)
        onChange(`${viewYear}-${mm}`)
        setOpen(false)
    }

    const liveError = (() => {
        if (error) return error
        if (!touched || display === '') return ''
        const digits = display.replace(/\D/g, '')
        if (digits.length >= 2) {
            const month = parseInt(digits.slice(0, 2), 10)
            if (month < 1 || month > 12) return 'Month must be between 01 and 12'
        }
        if (toValue(display) === null) return 'Enter month and year as MM/YYYY'
        return ''
    })()

    return (
        <div className="relative pt-2" ref={containerRef}>
            <label className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10 leading-snug max-w-[calc(100%-2rem)]">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="MM/YYYY"
                    value={display}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={() => setTouched(true)}
                    aria-label={label}
                    className={`w-full pl-4 pr-11 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-base placeholder:text-gray-400 bg-white ${
                        liveError
                            ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                            : 'border-[#E0E0E0] focus:ring-[#487749]/20 focus:border-[#487749]'
                    } ${className}`}
                />
                <button
                    type="button"
                    onClick={togglePicker}
                    aria-label="Open month picker"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#487749] hover:bg-[#487749]/10 transition-colors"
                >
                    <Calendar className="w-5 h-5" />
                </button>

                {open && (
                    <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-[#E0E0E0] bg-white shadow-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <button
                                type="button"
                                onClick={() => setViewYear((y) => y - 1)}
                                className="p-1 rounded-lg text-[#487749] hover:bg-[#487749]/10"
                                aria-label="Previous year"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-semibold text-[#212121]">{viewYear}</span>
                            <button
                                type="button"
                                onClick={() => setViewYear((y) => y + 1)}
                                className="p-1 rounded-lg text-[#487749] hover:bg-[#487749]/10"
                                aria-label="Next year"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {MONTHS.map((m, i) => {
                                const active = selYear === viewYear && selMonth === i + 1
                                return (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => pickMonth(i)}
                                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                                            active
                                                ? 'bg-[#487749] text-white'
                                                : 'text-[#424242] hover:bg-[#487749]/10'
                                        }`}
                                    >
                                        {m}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
            {liveError && <p className="text-xs text-red-500 mt-1">{liveError}</p>}
        </div>
    )
}
