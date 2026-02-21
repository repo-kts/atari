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
    const isPhotoField = field === 'photo' || field === 'photoPath' || field === 'Image' || (typeof value === 'string' && value.startsWith('data:image'))
    const photoPath = item.photoPath || item.photo || (field === 'Image' ? value : null) || (typeof value === 'string' && value.startsWith('data:image') ? value : null)
    const isTransferStatusField = field === 'transferStatus' || field === 'transfer_status'

    // Photo field
    if (isPhotoField && photoPath && photoPath !== '-') {
        return (
            <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <img
                    src={photoPath}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                        const fallback = target.nextElementSibling as HTMLElement
                        if (fallback) {
                            fallback.classList.remove('hidden')
                        }
                    }}
                />
                <span className="hidden text-[10px] text-gray-400">NA</span>
            </div>
        )
    }

    // Transfer status field
    if (isTransferStatusField) {
        const status = item.transferStatus || 'ACTIVE'
        const isTransferred = status === 'TRANSFERRED'
        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${isTransferred
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
