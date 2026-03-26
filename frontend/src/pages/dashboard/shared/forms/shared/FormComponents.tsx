import React from 'react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    required?: boolean
    error?: string
    helperText?: string
}

export const FormInput: React.FC<FormInputProps> = ({ label, required, error, helperText, className = '', ...props }) => (
    <div className="relative pt-2">
        <label className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {(() => {
            const type = props.type
            const lowerLabel = String(label || '').toLowerCase()
            const today = new Date()
            const todayStr = today.toISOString().slice(0, 10) // YYYY-MM-DD

            const stepFromProps = props.step
            const computedStep =
                type === 'number'
                    ? (stepFromProps !== undefined && stepFromProps !== null && String(stepFromProps).length > 0
                        ? stepFromProps
                        : (lowerLabel.includes('ha') || lowerLabel.includes('area') ? '0.01' : '1'))
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
                if (type === 'number' && String(computedStep) === '1') {
                    const v = e.target.value
                    if (v && v.includes('.')) {
                        // Enforce whole numbers client-side for integer inputs.
                        e.target.value = v.split('.')[0]
                    }
                }
                originalOnChange?.(e)
            }

            return (
                <input
                    {...props}
                    required={required}
                    step={computedStep}
                    min={computedMin}
                    max={computedMax}
                    onChange={handleChange}
                    inputMode={type === 'number' ? 'numeric' : props.inputMode}
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

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string
    options: { value: string | number; label: string }[]
    required?: boolean
    error?: string
    placeholder?: string
}

export const FormSelect: React.FC<FormSelectProps> = ({ label, options, required, error, placeholder, className = '', ...props }) => (
    <div className="relative pt-2">
        <label className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10">
            {label} {required && <span className="text-red-500">*</span>}
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

export const FormTextArea: React.FC<FormTextAreaProps> = ({ label, required, error, className = '', ...props }) => (
    <div className="relative pt-2">
        <label className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            {...props}
            required={required}
            className={`w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all resize-none text-base placeholder:text-gray-400 ${className}`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
)
