import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    rightIcon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    rightIcon,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[#487749] mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    className={`w-full h-12 px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-[#FAF9F6] text-[#212121] placeholder:text-[#9E9E9E] ${
                        error
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                            : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                    } ${rightIcon ? 'pr-12' : ''} ${className}`}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    {error}
                </p>
            )}
        </div>
    )
}
