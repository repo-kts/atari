import React from 'react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    required?: boolean
    error?: string
    helperText?: string
    wholeNumberOnly?: boolean
}

export const FormInput: React.FC<FormInputProps> = ({ label, required, error, helperText, wholeNumberOnly, className = '', ...props }) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent negative sign (-) and decimal point (.) if wholeNumberOnly is true
        if (wholeNumberOnly && (e.key === '-' || e.key === '.' || e.key === 'e')) {
            e.preventDefault()
        }
    }

    return (
        <div className="relative pt-2">
            <label className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                {...props}
                required={required}
                onKeyDown={wholeNumberOnly ? handleKeyDown : props.onKeyDown}
                min={wholeNumberOnly ? 0 : props.min}
                step={wholeNumberOnly ? 1 : props.step}
                className={`w-full px-4 py-3 border border-[#E0E0E0] ${helperText ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'} focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all text-base placeholder:text-gray-400 ${className}`}
            />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
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
