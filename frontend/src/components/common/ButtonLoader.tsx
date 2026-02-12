import React from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonLoaderProps {
    isLoading?: boolean
    loadingText?: string
    children: React.ReactNode
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export const ButtonLoader: React.FC<ButtonLoaderProps> = ({
    isLoading = false,
    loadingText,
    children,
    size = 'md',
    className = '',
}) => {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    }

    return (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            {isLoading && (
                <Loader2 className={`${sizeClasses[size]} animate-spin text-current`} />
            )}
            {isLoading && loadingText ? loadingText : children}
        </span>
    )
}
