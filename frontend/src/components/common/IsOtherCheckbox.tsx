import React from 'react'

interface IsOtherCheckboxProps {
    checked: boolean
    onChange: (checked: boolean) => void
    label?: string
}

/**
 * Master-side toggle that flags a master row as the "Other" option.
 * When set, forms consuming this master show a free-text specify input
 * (see `useOtherSpecify` + `SpecifyOtherInput`).
 */
export const IsOtherCheckbox: React.FC<IsOtherCheckboxProps> = ({ checked, onChange, label }) => (
    <label className="flex items-center gap-3 cursor-pointer select-none py-1">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-[#E0E0E0] text-[#487749] focus:ring-2 focus:ring-[#487749]/30 cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-700">
            {label ?? 'Mark as "Other" option (lets users type a custom value in forms)'}
        </span>
    </label>
)
