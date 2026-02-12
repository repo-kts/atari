/**
 * Table Actions Component
 *
 * Renders action buttons (Edit, Delete, Transfer, etc.) for table rows
 */

import React from 'react'
import { Edit2, Trash2, ArrowRight, History } from 'lucide-react'
import { ENTITY_TYPES } from '@/constants/entityTypes'
import { ExtendedEntityType } from '@/utils/masterUtils'

interface TableActionsProps {
    item: any
    entityType: ExtendedEntityType | null
    user: any
    showAddButton: boolean
    isEmployeeDetails: boolean
    onEdit: (item: any) => void
    onDelete: (item: any) => void
    onTransfer?: (item: any) => void
    onViewHistory?: (item: any) => void
    canEditItem?: (item: any) => boolean
    canDeleteItem?: (item: any) => boolean
}

export const TableActions: React.FC<TableActionsProps> = ({
    item,
    entityType,
    user,
    showAddButton,
    isEmployeeDetails,
    onEdit,
    onDelete,
    onTransfer,
    onViewHistory,
    canEditItem,
    canDeleteItem,
}) => {
    // Use provided permission functions if available, otherwise fall back to default logic
    const canEdit = canEditItem ? canEditItem(item) : (showAddButton && (
        !item.transferStatus ||
        item.transferStatus === 'ACTIVE' ||
        (item.kvkId === user?.kvkId || item.kvk?.kvkId === user?.kvkId)
    ))
    const canDelete = canDeleteItem ? canDeleteItem(item) : (showAddButton && (
        !item.transferStatus ||
        item.transferStatus === 'ACTIVE' ||
        (item.kvkId === user?.kvkId || item.kvk?.kvkId === user?.kvkId)
    ))

    const canTransfer = isEmployeeDetails &&
        user?.role === 'kvk' &&
        (item.transferStatus === 'ACTIVE' ||
         (item.transferStatus === 'TRANSFERRED' && (item.kvkId === user?.kvkId || item.kvk?.kvkId === user?.kvkId)))

    const canTransferFurther = entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED &&
        user?.role === 'kvk' &&
        (item.kvkId === user?.kvkId || item.kvk?.kvkId === user?.kvkId)

    const canViewHistory = (isEmployeeDetails || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED) &&
        (item.transferStatus === 'TRANSFERRED' || item.transferCount > 0)

    return (
        <div className="flex items-center justify-end gap-2">
            {canEdit && (
                    <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-[#487749] hover:bg-[#F0FDF4] rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
            )}
            {canDelete && (
                    <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
            )}
            {(canTransfer || canTransferFurther) && onTransfer && (
                <button
                    onClick={() => onTransfer(item)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={canTransferFurther ? "Transfer Further" : "Transfer"}
                >
                    <ArrowRight className="w-4 h-4" />
                </button>
            )}
            {canViewHistory && onViewHistory && (
                <button
                    onClick={() => onViewHistory(item)}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="View Transfer History"
                >
                    <History className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}
