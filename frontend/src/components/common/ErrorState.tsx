/**
 * Error State Component
 *
 * Reusable error message display
 */

import React from 'react'

interface ErrorStateProps {
    message: string
    className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    message,
    className = ''
}) => {
    return (
        <div className={`p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm ${className}`}>
            {message}
        </div>
    )
}
