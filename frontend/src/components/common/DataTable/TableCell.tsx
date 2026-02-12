/**
 * Table Cell Component
 *
 * Renders different types of cell content (text, photo, status badges, etc.)
 */

import React from 'react'

interface TableCellProps {
    field: string
    value: any
    item: any
}

export const TableCell: React.FC<TableCellProps> = ({ field, value, item }) => {
    const isPhotoField = field === 'photo' || field === 'photoPath'
    const photoPath = item.photoPath || item.photo
    const isTransferStatusField = field === 'transferStatus' || field === 'transfer_status'

    // Photo field
    if (isPhotoField && photoPath && photoPath !== '-') {
        return (
            <div className="flex items-center">
                <img
                    src={photoPath}
                    alt="Staff photo"
                    className="w-20 h-full object-cover"
                    onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                        const fallback = target.nextElementSibling as HTMLElement
                        if (fallback) {
                            fallback.classList.remove('hidden')
                        }
                    }}
                />
                <span className="hidden text-xs text-gray-500 ml-2 truncate max-w-xs">No image</span>
            </div>
        )
    }

    // Transfer status field
    if (isTransferStatusField) {
        const status = item.transferStatus || 'ACTIVE'
        const isTransferred = status === 'TRANSFERRED'
        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                isTransferred
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
                {status}
            </span>
        )
    }

    // Object field
    if (typeof value === 'object' && value !== null) {
        return <span>{JSON.stringify(value)}</span>
    }

    // Default: text value
    return <span>{value || '-'}</span>
}
