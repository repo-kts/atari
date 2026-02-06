import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}) => {
    const baseStyles =
        'font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary:
            'bg-[#487749] text-white hover:bg-[#3d6540] active:bg-[#487749] focus:ring-[#487749]/30 shadow-sm hover:shadow-md',
        secondary:
            'bg-white text-[#487749] border border-[#E0E0E0] hover:bg-[#F5F5F5] hover:border-[#BDBDBD] active:bg-[#FAFAFA] focus:ring-[#487749]/20',
        outline:
            'bg-transparent text-[#487749] border-2 border-[#487749] hover:bg-[#E8F5E9] active:bg-[#C8E6C9] focus:ring-[#487749]/30',
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm h-10',
        md: 'px-5 py-3 text-base h-12',
        lg: 'px-6 py-3.5 text-lg h-14',
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
