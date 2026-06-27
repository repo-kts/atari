"use client"

import { useEffect, useMemo, useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Calendar } from "@/components/ui/calendar"

export interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  error?: string
  placeholder?: string
  disabled?: boolean
  min?: string
  max?: string
  className?: string
  ariaLabel?: string
  clearLabel?: string
  /** Extra top padding on the trigger when a parent wraps a long floating label (FormInput). */
  contentPaddingTop?: number
}

function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  // Accept YYYY-MM-DD or any ISO-like string that starts with a date (API often returns ...T00:00:00.000Z)
  const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return undefined
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  if (mo < 0 || mo > 11 || d < 1 || d > 31) return undefined
  const date = new Date(y, mo, d, 0, 0, 0, 0)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function formatIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const DMY_TEMPLATE = "dd-mm-yyyy"

/** Consume up to two digits for a segment, clamping to [min,max].
 * If the first digit alone can't start a valid 2-digit number (e.g. 9 for a day
 * whose tens place maxes at 3), it auto-prepends a 0 and completes the segment. */
function takeSegment(
  digits: string,
  start: number,
  min: number,
  max: number,
): { value: string; next: number } {
  if (start >= digits.length) return { value: "", next: start }
  const d1 = digits[start]
  const tensMax = Math.floor(max / 10)
  if (Number(d1) > tensMax) {
    // e.g. day "9" -> "09", month "5" -> "05": single digit becomes the segment
    return { value: `0${d1}`, next: start + 1 }
  }
  if (start + 1 >= digits.length) {
    return { value: d1, next: start + 1 } // partial, still typing
  }
  let n = Number(d1 + digits[start + 1])
  if (n > max) n = max
  if (n < min) n = min
  return { value: String(n).padStart(2, "0"), next: start + 2 }
}

/**
 * Credit-card style mask: keep digits only, validate each segment, and re-insert
 * dashes as dd-mm-yyyy. A trailing dash is added eagerly once a segment is
 * complete (after the 2nd and 4th digit) so the next keystroke lands past it —
 * except while deleting, so the user can backspace through the separators.
 * Day is clamped to 01-31 and month to 01-12 as you type.
 */
function maskDmy(raw: string, isDeleting: boolean): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  const dayRes = takeSegment(digits, 0, 1, 31)
  const day = dayRes.value
  let month = ""
  let year = ""
  if (day.length === 2) {
    const monthRes = takeSegment(digits, dayRes.next, 1, 12)
    month = monthRes.value
    if (month.length === 2) {
      year = digits.slice(monthRes.next, monthRes.next + 4)
    }
  }
  let out = day
  if (day.length === 2) {
    out += month.length > 0 ? `-${month}` : isDeleting ? "" : "-"
  }
  if (day.length === 2 && month.length === 2) {
    out += year.length > 0 ? `-${year}` : isDeleting ? "" : "-"
  }
  return out
}

/** Parse a fully-typed dd-mm-yyyy string, rejecting impossible dates (e.g. 31-02-2026). */
function parseDmy(text: string): Date | undefined {
  const m = text.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (!m) return undefined
  const d = Number(m[1])
  const mo = Number(m[2]) - 1
  const y = Number(m[3])
  if (mo < 0 || mo > 11 || d < 1 || d > 31) return undefined
  const date = new Date(y, mo, d, 0, 0, 0, 0)
  if (date.getMonth() !== mo || date.getDate() !== d) return undefined
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function DatePicker({
  value,
  onChange,
  label,
  required,
  error,
  placeholder = "dd-mm-yyyy",
  disabled,
  min,
  max,
  className = "",
  ariaLabel,
  clearLabel = "Clear",
  contentPaddingTop,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [displayMonth, setDisplayMonth] = useState<Date>(() => new Date())
  const selectedDate = useMemo(() => parseIsoDate(value), [value])

  // Text shown in the typeable input (dd-mm-yyyy). Kept in sync with the
  // external value, but left alone while the user is mid-typing a partial date.
  const [text, setText] = useState<string>(() =>
    selectedDate ? format(selectedDate, "dd-MM-yyyy") : "",
  )

  useEffect(() => {
    const formatted = selectedDate ? format(selectedDate, "dd-MM-yyyy") : ""
    setText((prev) => {
      const prevDate = parseDmy(prev)
      // Don't clobber an in-progress entry that already resolves to this value.
      if (prevDate && selectedDate && format(prevDate, "dd-MM-yyyy") === formatted) {
        return prev
      }
      return formatted
    })
  }, [selectedDate])

  // Calendar follows the chosen date in realtime (typing or picking).
  useEffect(() => {
    if (selectedDate) setDisplayMonth(selectedDate)
  }, [selectedDate])

  // When opening with no value, land on today.
  useEffect(() => {
    if (open && !selectedDate) setDisplayMonth(new Date())
  }, [open, selectedDate])

  const minDate = useMemo(() => parseIsoDate(min), [min])
  const maxDate = useMemo(() => parseIsoDate(max), [max])
  const startMonth = minDate ?? new Date(1950, 0, 1)
  const endMonth = maxDate ?? new Date(new Date().getFullYear() + 10, 11, 31)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isDeleting = e.target.value.length < text.length
    const masked = maskDmy(e.target.value, isDeleting)
    setText(masked)
    if (masked === "") {
      onChange("")
      return
    }
    const parsed = parseDmy(masked)
    if (parsed) {
      onChange(formatIso(parsed))
      setDisplayMonth(parsed)
    }
  }

  return (
    <div className={label ? "relative pt-2" : ""}>
      {label && (
        <label className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <div
            style={
              contentPaddingTop != null
                ? { paddingTop: contentPaddingTop, paddingBottom: 12 }
                : undefined
            }
            className={`w-full px-4 border border-[#E0E0E0] rounded-xl bg-white text-base text-[#212121] inline-flex items-center justify-between gap-2 hover:border-[#BDBDBD] focus-within:ring-2 focus-within:ring-[#487749]/20 focus-within:border-[#487749] ${
              disabled ? "opacity-50" : ""
            } ${contentPaddingTop != null ? "min-h-11 h-auto py-0" : "h-11 py-3"} ${className}`}
          >
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                inputMode="numeric"
                value={text}
                onChange={handleInputChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                disabled={disabled}
                aria-label={ariaLabel}
                placeholder={focused ? "" : placeholder}
                maxLength={10}
                className="relative z-10 w-full bg-transparent outline-none border-none p-0 text-base placeholder:text-[#9E9E9E]"
              />
              {(focused || text) && text.length < DMY_TEMPLATE.length && (
                <div
                  aria-hidden
                  className="absolute inset-0 flex items-center text-base pointer-events-none"
                >
                  <span className="invisible whitespace-pre">{text}</span>
                  <span className="text-[#9E9E9E] whitespace-pre">
                    {DMY_TEMPLATE.slice(text.length)}
                  </span>
                </div>
              )}
            </div>
            <Popover.Trigger asChild>
              <button
                type="button"
                disabled={disabled}
                aria-label="Open calendar"
                className="shrink-0 inline-flex items-center justify-center disabled:opacity-50"
              >
                <CalendarIcon className="h-4 w-4 text-[#487749]" />
              </button>
            </Popover.Trigger>
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            className="z-50 rounded-xl border border-[#E0E0E0] bg-white shadow-lg"
          >
            <div className="p-2">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                startMonth={startMonth}
                endMonth={endMonth}
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return
                  onChange(formatIso(date))
                  setOpen(false)
                }}
                disabled={(date) => {
                  if (minDate && date < minDate) return true
                  if (maxDate && date > maxDate) return true
                  return false
                }}
              />
              <div className="flex justify-end px-2 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange("")
                    setOpen(false)
                  }}
                  className="h-8 px-3 text-xs border border-[#487749] rounded-lg bg-[#487749] text-white hover:bg-[#3d6540]"
                >
                  {clearLabel}
                </button>
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
