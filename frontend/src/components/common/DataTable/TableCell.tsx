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
    // Photo/Attachment field
    const isImageField = field === 'photo' || field === 'photoPath' || field === 'attachment' || field === 'attachmentPath'
    const imagePath = item[field] || item.photoPath || item.photo || item.attachmentPath || item.attachment
    const isTransferStatusField = field === 'transferStatus' || field === 'transfer_status'

    // Image field
    if (isImageField && imagePath && typeof imagePath === 'string' && imagePath !== '-') {
        // Simple check to see if it might be an image data URL or path that ends in image extension
        return (
            <div className="flex items-center">
                <img
                    src={imagePath}
                    alt="Image attachment"
                    className="w-20 h-auto max-h-20 object-contain"
                    onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                        const fallback = target.nextElementSibling as HTMLElement
                        if (fallback) {
                            fallback.classList.remove('hidden')
                            fallback.textContent = imagePath // Show the raw path/name if image fails to load
                        }
                    }}
                />
                <span className="hidden text-xs text-gray-500 ml-2 truncate max-w-[200px]"></span>
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
