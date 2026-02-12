import React from 'react'
import { Loader2 } from 'lucide-react'

interface InlineLoaderProps {
    size?: 'sm' | 'md' | 'lg'
    text?: string
    className?: string
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({
    size = 'md',
    text,
    className = '',
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Loader2 className={`${sizeClasses[size]} animate-spin text-[#487749]`} />
            {text && <span className="text-sm text-[#757575]">{text}</span>}
        </div>
    )
}
