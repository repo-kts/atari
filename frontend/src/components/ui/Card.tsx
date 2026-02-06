import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
    onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    onClick,
}) => {
    return (
        <div
            className={`bg-[#FAF9F6] rounded-xl transition-all duration-200 ${
                onClick
                    ? 'cursor-pointer hover:border-[#BDBDBD] hover:shadow-md'
                    : ''
            } ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

interface CardHeaderProps {
    children: React.ReactNode
    className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    children,
    className = '',
}) => {
    return (
        <div className={`px-6 py-4 border-b border-[#E0E0E0] ${className}`}>
            {children}
        </div>
    )
}

interface CardContentProps {
    children: React.ReactNode
    className?: string
}

export const CardContent: React.FC<CardContentProps> = ({
    children,
    className = '',
}) => {
    return <div className={`px-6 py-4 ${className}`}>{children}</div>
}
