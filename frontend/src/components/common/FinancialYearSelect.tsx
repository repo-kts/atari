import React, { useMemo } from 'react'
import { FormSelect } from '@/pages/dashboard/shared/forms/shared/FormComponents'
import {
    fyLabel,
    fyStartYearFromDate,
    fyToDateRange,
    listFinancialYears,
} from '@/utils/financialYear'

interface FinancialYearSelectProps {
    /** Current start date (YYYY-MM-DD / ISO). The selected FY is derived from it. */
    startDate?: string | null
    /** Fired with the FY's start/end date range and the FY start year. */
    onChange: (
        range: { startDate: string; endDate: string },
        startYear: number,
    ) => void
    label?: string
    required?: boolean
    error?: string
    /** How many past FYs to list (default 15). The current FY is always first. */
    count?: number
}

/**
 * Single Financial Year dropdown (e.g. "2024-25") that replaces a Start Date +
 * End Date pair. It stays storage-compatible: selecting an FY emits the
 * 01 Apr → 31 Mar date range the backend already persists.
 */
export const FinancialYearSelect: React.FC<FinancialYearSelectProps> = ({
    startDate,
    onChange,
    label = 'Financial Year',
    required,
    error,
    count = 15,
}) => {
    const options = useMemo(() => listFinancialYears(count), [count])
    const selected = fyStartYearFromDate(startDate ?? null)

    // Keep an already-saved FY selectable even if it predates the list window.
    const mergedOptions = useMemo(() => {
        if (selected != null && !options.some((o) => o.value === selected)) {
            return [{ value: selected, label: fyLabel(selected) }, ...options]
        }
        return options
    }, [options, selected])

    return (
        <FormSelect
            label={label}
            required={required}
            error={error}
            placeholder="Select financial year"
            value={selected ?? ''}
            options={mergedOptions}
            onChange={(e) => {
                const year = parseInt(e.target.value, 10)
                if (Number.isNaN(year)) return
                onChange(fyToDateRange(year), year)
            }}
        />
    )
}
