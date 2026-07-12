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
    /** Human-readable names of the filters currently applied (e.g. ["Kvk"]). */
    activeFilterNames?: string[]
    onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    grandTotal,
    activeFilterNames,
    onPageChange,
}) => {
    if (totalItems === 0) return null

    // Only meaningful once the caller supplies the pre-filter dataset size.
    const isFiltered =
        typeof grandTotal === 'number' && grandTotal !== totalItems

    const filterNameSuffix =
        activeFilterNames && activeFilterNames.length > 0
            ? ` (${activeFilterNames.join(', ')})`
            : ''

    return (
        <div className="flex-none mt-2 flex items-center justify-between gap-3">
            {/* Left: the plain range readout — unchanged. */}
            <div className="text-sm text-[#757575]">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
                {totalItems}
            </div>
            {/* Right: a single filter-summary pill sits beside the page controls. */}
            <div className="flex items-center gap-2">
                {isFiltered && (
                    <span
                        className="inline-flex items-center gap-1 rounded-full border border-[#C8E6C9] bg-[#E8F5E9] px-2.5 py-0.5 text-xs font-semibold text-[#487749]"
                        title="Rows matching the current filters"
                    >
                        Total items with selected filters:{' '}
                        {totalItems.toLocaleString()}
                        {filterNameSuffix}
                    </span>
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
