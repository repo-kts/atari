import React from 'react'
import { DatePicker } from '@/components/ui/date-picker'
import { formatLocalDateYmd } from '@/utils/dateLocalYmd'

/** Keeps the outlined label on the border while reserving space so wrapped text does not cover the control. */
function useFloatingLabelPadding(labelText: string) {
    const labelRef = React.useRef<HTMLLabelElement>(null)
    const [paddingTopPx, setPaddingTopPx] = React.useState(12)

    React.useLayoutEffect(() => {
        const el = labelRef.current
        if (!el || !labelText.trim()) {
            setPaddingTopPx(12)
            return
        }
        const sync = () => {
            const h = el.offsetHeight
            // ~8px: label sits slightly above the border (notch); remainder must clear wrapped lines.
            setPaddingTopPx(Math.max(12, h - 8))
        }
        sync()
        const ro = new ResizeObserver(sync)
        ro.observe(el)
        return () => ro.disconnect()
    }, [labelText])

    return { labelRef, paddingTopPx }
}

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
    wholeNumberOnly?: boolean
}

export const FormInput: React.FC<FormInputProps> = ({ label, required, error, helperText, wholeNumberOnly, className = '', ...props }) => {
    const displayLabel = formatFormLabel(label)
    const { labelRef, paddingTopPx } = useFloatingLabelPadding(displayLabel)

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (wholeNumberOnly && (e.key === '-' || e.key === '.' || e.key === 'e')) {
            e.preventDefault()
        }
        props.onKeyDown?.(e)
    }

    return (
        <div className={`relative ${displayLabel ? 'pt-2' : ''}`}>
            {displayLabel && (
                <label
                    ref={labelRef}
                    className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10 leading-snug max-w-[calc(100%-2rem)]"
                >
                    {displayLabel} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            {(() => {
                const type = props.type
                const lowerLabel = displayLabel.toLowerCase()
                const today = new Date()
                const todayStr = formatLocalDateYmd(today)

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

                // Date inputs default-clamp to today so users can't backdate
                // typos. Forward-looking labels (target / expected /
                // completion / end) explicitly opt out — they refer to
                // planned future events (e.g. OFT Expected Completion Date,
                // activity End Date).
                const isFutureAllowedDateLabel =
                    lowerLabel.includes('target') ||
                    lowerLabel.includes('expected') ||
                    lowerLabel.includes('completion') ||
                    lowerLabel.includes('end')
                const computedMax =
                    type === 'date' && !isFutureAllowedDateLabel
                        ? props.max ?? todayStr
                        : props.max

                const originalOnChange = props.onChange
                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    if (type === 'number' && (computedStep === '1' || wholeNumberOnly)) {
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
                            contentPaddingTop={displayLabel ? paddingTopPx : undefined}
                        />
                    )
                }

                return (
                    <input
                        {...props}
                        value={inputValue}
                        required={required}
                        step={wholeNumberOnly ? 1 : computedStep}
                        min={wholeNumberOnly ? 0 : computedMin}
                        max={computedMax}
                        onChange={handleChange}
                        onKeyDown={wholeNumberOnly ? handleKeyDown : props.onKeyDown}
                        inputMode={type === 'number' ? (isInteger || wholeNumberOnly ? 'numeric' : 'decimal') : props.inputMode}
                        style={{
                            ...props.style,
                            ...(displayLabel ? { paddingTop: paddingTopPx, paddingBottom: 12 } : {}),
                        }}
                        className={`w-full px-4 border border-[#E0E0E0] ${displayLabel ? 'pb-3' : 'py-3'} ${helperText ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'} focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all text-base placeholder:text-gray-400 ${props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'} ${className}`}
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
    const { labelRef, paddingTopPx } = useFloatingLabelPadding(displayLabel)

    return (
        <div className="relative pt-2">
            <label
                ref={labelRef}
                className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10 leading-snug max-w-[calc(100%-2rem)]"
            >
                {displayLabel} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                {...props}
                required={required}
                style={{
                    ...props.style,
                    paddingTop: paddingTopPx,
                    paddingBottom: 12,
                }}
                className={`w-full px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all bg-white text-base min-h-[48px] h-auto ${className}`}
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
    const { labelRef, paddingTopPx } = useFloatingLabelPadding(displayLabel)

    return (
        <div className="relative pt-2">
            <label
                ref={labelRef}
                className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10 leading-snug max-w-[calc(100%-2rem)]"
            >
                {displayLabel} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                {...props}
                required={required}
                style={{
                    ...props.style,
                    paddingTop: paddingTopPx,
                    paddingBottom: 12,
                }}
                className={`w-full px-4 pb-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all resize-none text-base placeholder:text-gray-400 ${props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'} ${className}`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
}
