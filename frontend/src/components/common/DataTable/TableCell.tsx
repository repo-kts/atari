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
    const truncateText = (input: unknown, limit = 30) => {
        const text = String(input ?? '')
        return text.length > limit ? `${text.slice(0, limit)}...` : text
    }
    const toSentenceCaseLabel = (raw: string) =>
        raw
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase())
    // Photo/Attachment field
    const isImageValue = typeof value === 'string' && value.startsWith('data:image/') && value.includes('base64,');
    const isImageField = field === 'photo' || field === 'photoPath' || field === 'attachment' || field === 'attachmentPath' || field === 'file' || field === 'uploadedFile';
    const photoFromAttachments = Array.isArray(item.photos) && item.photos.length > 0
        ? (item.photos[0].fileUrl || item.photos[0].downloadUrl || null)
        : null;
    const imagePath = isImageValue
        ? value
        : (item[field] || item.photoPath || item.photo || item.attachmentPath || item.attachment || item.uploadedFile || item.file || photoFromAttachments);
    const isTransferStatusField = field === 'transferStatus' || field === 'transfer_status'
    const isOftStatusField = field === 'ongoingCompleted' || field === 'status'
    const isAccountTypeField = field === 'accountType' || field === 'account_type'

    // Image field
    if ((isImageField || isImageValue) && imagePath && typeof imagePath === 'string' && imagePath !== '-') {
        let finalImageSrc = imagePath;
        if (imagePath.startsWith('[') || imagePath.startsWith('{')) {
            try {
                const parsed = JSON.parse(imagePath);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    finalImageSrc = parsed[0].image || parsed[0].preview || parsed[0] || imagePath;
                } else if (!Array.isArray(parsed) && parsed) {
                    finalImageSrc = parsed.image || parsed.preview || imagePath;
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        // Apply base URL if it's a relative path from uploads
        if (!finalImageSrc.startsWith('http') && !finalImageSrc.startsWith('data:')) {
            finalImageSrc = `${import.meta.env.VITE_API_URL || ''}${finalImageSrc.startsWith('/') ? '' : '/'}${finalImageSrc}`;
        }

        return (
            <div className="flex items-center">
                <img
                    src={finalImageSrc}
                    alt="Image attachment"
                    className="w-20 h-auto max-h-20 object-contain"
                    onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                        const fallback = target.nextElementSibling as HTMLElement
                        if (fallback) {
                            fallback.classList.remove('hidden')
                            fallback.textContent = finalImageSrc // Show the raw path/name if image fails to load
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

    // OFT status field (ONGOING / COMPLETED / TRANSFERRED_TO_NEXT_YEAR)
    if (isOftStatusField) {
        const rawStatus = String(value ?? item.status ?? item.ongoingCompleted ?? '').toUpperCase().trim()
        const labelMap: Record<string, string> = {
            ONGOING: 'Ongoing',
            COMPLETED: 'Completed',
            TRANSFERRED_TO_NEXT_YEAR: 'Transferred to Next Year',
        }
        const classMap: Record<string, string> = {
            ONGOING: 'bg-amber-100 text-amber-700 border border-amber-200',
            COMPLETED: 'bg-green-100 text-green-700 border border-green-200',
            TRANSFERRED_TO_NEXT_YEAR: 'bg-blue-100 text-blue-700 border border-blue-200',
        }
        const label = labelMap[rawStatus] || (rawStatus ? rawStatus.replace(/_/g, ' ') : 'Unknown')
        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${classMap[rawStatus] || 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                {label}
            </span>
        )
    }

    // Account type field (KVK / REVOLVING_FUND / OTHER)
    if (isAccountTypeField) {
        const rawType = String(value ?? item.accountType ?? item.account_type ?? '').toUpperCase().trim()
        if (!rawType) return <span>-</span>

        const labelMap: Record<string, string> = {
            KVK: 'KVK',
            REVOLVING_FUND: 'Revolving Fund',
            OTHER: 'Other',
        }
        const classMap: Record<string, string> = {
            KVK: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
            REVOLVING_FUND: 'bg-violet-100 text-violet-700 border border-violet-200',
            OTHER: 'bg-amber-100 text-amber-700 border border-amber-200',
        }

        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${classMap[rawType] || 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                {labelMap[rawType] || toSentenceCaseLabel(rawType)}
            </span>
        )
    }

    // Object field
    if (typeof value === 'object' && value !== null) {
        return <span>{JSON.stringify(value)}</span>
    }

    // Boolean field
    if (typeof value === 'boolean') {
        return <span>{value ? 'Yes' : 'No'}</span>
    }

    // Default: text value
    if (typeof value === 'string' || typeof value === 'number') {
        const full = String(value)
        const short = truncateText(full, 30)
        return <span title={full}>{short || '-'}</span>
    }

    return <span>{value ?? '-'}</span>
}
