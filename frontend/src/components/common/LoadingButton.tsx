import React from 'react'
import { Button } from '@/components/ui/Button'
import { ButtonLoader } from './ButtonLoader'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean
    loadingText?: string
    variant?: 'primary' | 'secondary' | 'outline' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    children: React.ReactNode
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
    isLoading = false,
    loadingText,
    variant = 'primary',
    size = 'md',
    children,
    disabled,
    className = '',
    ...props
}) => {
    const dangerStyles = variant === 'danger'
        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/30'
        : ''

    return (
        <Button
            variant={variant === 'danger' ? 'primary' : variant}
            size={size}
            disabled={disabled || isLoading}
            className={`${dangerStyles} ${className}`}
            {...props}
        >
            <ButtonLoader isLoading={isLoading} loadingText={loadingText} size={size}>
                {children}
            </ButtonLoader>
        </Button>
    )
}
