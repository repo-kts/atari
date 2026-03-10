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
        <input
            {...props}
            required={required}
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
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => (
    <div className="space-y-3">
        <h3 className="text-lg font-bold text-[#487749]">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {children}
        </div>
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
