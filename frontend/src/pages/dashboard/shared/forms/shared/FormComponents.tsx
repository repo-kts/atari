import React from 'react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    required?: boolean
    error?: string
}

export const FormInput: React.FC<FormInputProps> = ({ label, required, error, className = '', ...props }) => (
    <div className="relative group mt-2">
        <input
            {...props}
            required={required}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#487749] focus:ring-1 focus:ring-[#487749] transition-all bg-white disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
        />
        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-700 pointer-events-none font-medium">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
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
    <div className="relative group mt-2">
        <select
            {...props}
            required={required}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#487749] focus:ring-1 focus:ring-[#487749] transition-all bg-white appearance-none cursor-pointer ${className}`}
        >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-700 pointer-events-none font-medium">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
        </div>
        {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
)

interface FormSectionProps {
    title: string
    children: React.ReactNode
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => (
    <div className="space-y-6">
        <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    <div className="relative group mt-2">
        <textarea
            {...props}
            required={required}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#487749] focus:ring-1 focus:ring-[#487749] transition-all bg-white resize-none ${className}`}
        />
        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-700 pointer-events-none font-medium">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
)
