import React from 'react'

interface SkeletonLoaderProps {
    variant?: 'text' | 'circle' | 'rectangle'
    width?: string | number
    height?: string | number
    className?: string
    count?: number
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    variant = 'text',
    width,
    height,
    className = '',
    count = 1,
}) => {
    const baseClasses = 'animate-pulse bg-[#E0E0E0] rounded'

    const variantClasses = {
        text: 'h-4',
        circle: 'rounded-full',
        rectangle: 'h-20',
    }

    const style: React.CSSProperties = {}
    if (width) style.width = typeof width === 'number' ? `${width}px` : width
    if (height) style.height = typeof height === 'number' ? `${height}px` : height

    if (count > 1) {
        return (
            <div className="space-y-2">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
                        style={style}
                    />
                ))}
            </div>
        )
    }

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    )
}
