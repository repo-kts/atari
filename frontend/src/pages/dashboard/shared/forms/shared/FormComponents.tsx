import React from 'react'
import { DatePicker } from '@/components/ui/date-picker'

function formatFormLabel(label: string): string {
    return String(label || '')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\s+\*/g, '*')
        .trim()
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    required?: boolean
    error?: string
    helperText?: string
}

export const FormInput: React.FC<FormInputProps> = ({ label, required, error, helperText, className = '', ...props }) => {
    const displayLabel = formatFormLabel(label)

    return (
        <div className={`relative ${displayLabel ? 'pt-2' : ''}`}>
            {displayLabel && (
                <label className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10 leading-snug max-w-[95%]">
                    {displayLabel} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            {(() => {
                const type = props.type
                const lowerLabel = displayLabel.toLowerCase()
                const today = new Date()
                const todayStr = today.toISOString().slice(0, 10) // YYYY-MM-DD

                const stepFromProps = props.step
                const isInteger =
                    type === 'number' &&
                    (lowerLabel.includes('no of') ||
                        lowerLabel.includes('number of') ||
                        lowerLabel.includes('count') ||
                        lowerLabel.includes('beneficiar') ||
                        lowerLabel.includes('farmer') ||
                        lowerLabel.includes('village') ||
                        lowerLabel.includes('training') ||
                        lowerLabel.includes('trainee') ||
                        lowerLabel.includes('demonstration') ||
                        lowerLabel.includes('days') ||
                        lowerLabel.includes('year') ||
                        lowerLabel.includes('id'));

                const computedStep =
                    type === 'number'
                        ? (stepFromProps !== undefined && stepFromProps !== null && String(stepFromProps).length > 0
                            ? stepFromProps
                            : (isInteger ? '1' : 'any'))
                        : stepFromProps

                const computedMin =
                    type === 'number'
                        ? (props.min ?? 0)
                        : props.min

                const computedMax =
                    type === 'date' && !lowerLabel.includes('target')
                        ? props.max ?? todayStr
                        : props.max

                const originalOnChange = props.onChange
                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    if (type === 'number' && computedStep === '1') {
                        const v = e.target.value
                        if (v && v.includes('.')) {
                            // Enforce whole numbers client-side for integer inputs.
                            e.target.value = v.split('.')[0]
                        }
                    }
                    originalOnChange?.(e)
                }

                // Ensure 0 is shown instead of empty string by handling it specifically
                const inputValue = (type === 'number' && props.value === 0) ? '0' : (props.value ?? '');

                if (type === 'date') {
                    const dateValue = String(props.value ?? '')
                    const datePlaceholder =
                        typeof props.placeholder === 'string' && props.placeholder.trim().length > 0
                            ? props.placeholder
                            : `Approx. date (e.g. 15-03-${today.getFullYear()})`
                    return (
                        <DatePicker
                            value={dateValue}
                            onChange={(nextValue) => {
                                originalOnChange?.({
                                    target: { value: nextValue },
                                    currentTarget: { value: nextValue },
                                } as React.ChangeEvent<HTMLInputElement>)
                            }}
                            min={typeof props.min === 'string' ? props.min : undefined}
                            max={typeof computedMax === 'string' ? computedMax : undefined}
                            disabled={props.disabled}
                            placeholder={datePlaceholder}
                            ariaLabel={displayLabel}
                            className={className}
                        />
                    )
                }

                return (
                    <input
                        {...props}
                        value={inputValue}
                        required={required}
                        step={computedStep}
                        min={computedMin}
                        max={computedMax}
                        onChange={handleChange}
                        inputMode={type === 'number' ? (isInteger ? 'numeric' : 'decimal') : props.inputMode}
                        className={`w-full px-4 py-3 border border-[#E0E0E0] ${helperText ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'} focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all text-base placeholder:text-gray-400 ${className}`}
                    />
                )
            })()}
            {helperText && (
                <div className="-mt-1 border border-t-0 border-[#E0E0E0] rounded-b-xl bg-gray-50 px-4 py-2 text-xs text-gray-600">
                    {helperText}
                </div>
            )}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string
    options: { value: string | number; label: string }[]
    required?: boolean
    error?: string
    placeholder?: string
}

export const FormSelect: React.FC<FormSelectProps> = ({ label, options, required, error, placeholder, className = '', ...props }) => {
    const displayLabel = formatFormLabel(label)

    return (
        <div className="relative pt-2">
            <label className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10 leading-snug max-w-[95%]">
                {displayLabel} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                {...props}
                required={required}
                className={`w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all bg-white text-base h-[48px] ${className}`}
            >
                <option value="">{placeholder || `Select`}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
}

interface FormSectionProps {
    title: string
    children: React.ReactNode
    noGrid?: boolean
    className?: string
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children, noGrid = false, className = '' }) => (
    <div className={`space-y-4 mb-6 ${className}`}>
        <h3 className="text-lg font-bold text-[#487749] border-b border-[#487749]/10 pb-1">{title}</h3>
        {noGrid ? (
            <div className="space-y-4">
                {children}
            </div>
        ) : (
            <div className="w-full gap-x-6 gap-y-6">
                {children}
            </div>
        )}
    </div>
)

interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string
    required?: boolean
    error?: string
}

export const FormTextArea: React.FC<FormTextAreaProps> = ({ label, required, error, className = '', ...props }) => {
    const displayLabel = formatFormLabel(label)

    return (
        <div className="relative pt-2">
            <label className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10 leading-snug max-w-[95%]">
                {displayLabel} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                {...props}
                required={required}
                className={`w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all resize-none text-base placeholder:text-gray-400 ${className}`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
}
