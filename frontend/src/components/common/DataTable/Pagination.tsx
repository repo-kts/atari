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
    /**
     * Full dataset size before search/column filters narrow it. When it differs
     * from totalItems the footer shows the filtered count against this grand
     * total, so the user sees how much a filter has hidden.
     */
    grandTotal?: number
    onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    grandTotal,
    onPageChange,
}) => {
    if (totalItems === 0) return null

    // Only meaningful once the caller supplies the pre-filter dataset size.
    const isFiltered =
        typeof grandTotal === 'number' && grandTotal !== totalItems

    return (
        <div className="flex-none mt-2 flex items-center justify-between gap-3">
            {/* Left: the plain range readout — unchanged. */}
            <div className="text-sm text-[#757575]">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
                {totalItems}
            </div>
            {/* Right: filter pills sit beside the page controls. */}
            <div className="flex items-center gap-2">
                {isFiltered && (
                    <div className="flex items-center gap-1.5">
                        <span
                            className="inline-flex items-center gap-1 rounded-full border border-[#C8E6C9] bg-[#E8F5E9] px-2.5 py-0.5 text-xs font-semibold text-[#487749]"
                            title="Rows matching the current filters"
                        >
                            {totalItems.toLocaleString()} filtered
                        </span>
                        <span
                            className="inline-flex items-center gap-1 rounded-full border border-[#E0E0E0] bg-[#F5F5F5] px-2.5 py-0.5 text-xs font-semibold text-[#757575]"
                            title="Total rows without any filter"
                        >
                            {grandTotal.toLocaleString()} total
                        </span>
                    </div>
                )}
                <div className="flex gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors"
                    >
                        Prev
                    </button>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
