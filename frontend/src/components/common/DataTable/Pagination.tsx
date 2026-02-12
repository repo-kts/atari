/**
 * Pagination Component
 *
 * Reusable pagination controls for data tables
 */

import React from 'react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    startIndex: number
    endIndex: number
    totalItems: number
    onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    onPageChange,
}) => {
    if (totalItems === 0) return null

    return (
        <div className="flex-none mt-4 flex items-center justify-between">
            <div className="text-sm text-[#757575]">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors"
                >
                    Prev
                </button>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    )
}
