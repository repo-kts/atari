import React from 'react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    required?: boolean
    error?: string
}

export const FormInput: React.FC<FormInputProps> = ({ label, required, error, className = '', ...props }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-[#212121]">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            {...props}
            required={required}
            className={`w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all ${className}`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
)

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string
    options: { value: string | number; label: string }[]
    required?: boolean
    error?: string
}

export const FormSelect: React.FC<FormSelectProps> = ({ label, options, required, error, className = '', ...props }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-[#212121]">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            {...props}
            required={required}
            className={`w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all bg-white ${className}`}
        >
            <option value="">Select {label}</option>
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
    <div className="space-y-6">
        <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    <div className="space-y-2">
        <label className="block text-sm font-medium text-[#212121]">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            {...props}
            required={required}
            className={`w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all resize-none ${className}`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
)
