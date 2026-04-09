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
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return undefined
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  const date = new Date(y, mo, d, 0, 0, 0, 0)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function formatIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function DatePicker({
  value,
  onChange,
  label,
  required,
  error,
  placeholder = "Select date",
  disabled,
  min,
  max,
  className = "",
  ariaLabel,
  clearLabel = "Clear",
  contentPaddingTop,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [displayMonth, setDisplayMonth] = useState<Date>(() => new Date())
  const selectedDate = useMemo(() => parseIsoDate(value), [value])

  // When opening the popover, show the month of the saved value (or today if empty).
  useEffect(() => {
    if (open) {
      setDisplayMonth(selectedDate ?? new Date())
    }
  }, [open, selectedDate])
  const minDate = useMemo(() => parseIsoDate(min), [min])
  const maxDate = useMemo(() => {
    if (max) return parseIsoDate(max)
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  }, [max])
  const startMonth = minDate ?? new Date(1950, 0, 1)
  const endMonth = maxDate ?? new Date(new Date().getFullYear() + 10, 11, 31)

  return (
    <div className={label ? "relative pt-2" : ""}>
      {label && (
        <label className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={ariaLabel}
            style={
              contentPaddingTop != null
                ? { paddingTop: contentPaddingTop, paddingBottom: 12 }
                : undefined
            }
            className={`w-full px-4 border border-[#E0E0E0] rounded-xl bg-white text-base text-[#212121] text-left inline-flex items-center justify-between gap-2 hover:border-[#BDBDBD] focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] disabled:opacity-50 ${
              contentPaddingTop != null ? "min-h-11 h-auto py-0" : "h-11 py-3"
            } ${className}`}
          >
            <span className={selectedDate ? "text-[#212121]" : "text-[#9E9E9E]"}>
              {selectedDate ? format(selectedDate, "dd-MM-yyyy") : placeholder}
            </span>
            <CalendarIcon className="h-4 w-4 text-[#487749]" />
          </button>
        </Popover.Trigger>
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
