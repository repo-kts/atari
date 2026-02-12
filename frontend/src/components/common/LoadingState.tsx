/**
 * Loading State Component
 *
 * Reusable loading indicator
 */

import React from 'react'

interface LoadingStateProps {
    message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Loading...'
}) => {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#487749]"></div>
            <span className="ml-3 text-[#757575]">{message}</span>
        </div>
    )
}
