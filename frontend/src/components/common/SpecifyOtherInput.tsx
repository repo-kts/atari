import React from 'react'
import { FormInput } from '@/pages/dashboard/shared/forms/shared/FormComponents'

interface SpecifyOtherInputProps {
    label: string
    value: string | undefined | null
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    required?: boolean
    placeholder?: string
}

/**
 * Free-text input shown when an "Other" master option is selected.
 * Pair with `useOtherSpecify`: render `{isOtherSelected && <SpecifyOtherInput .../>}`.
 */
export const SpecifyOtherInput: React.FC<SpecifyOtherInputProps> = ({
    label,
    value,
    onChange,
    required,
    placeholder,
}) => (
    <FormInput
        label={label}
        required={required}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder ?? 'Please specify'}
    />
)
