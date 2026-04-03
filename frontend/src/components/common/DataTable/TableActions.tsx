/**
 * Table Actions Component
 *
 * Renders action buttons (Edit, Delete, Transfer, etc.) for table rows
 */

import React from 'react'
import { Edit2, Trash2, ArrowRight, History, MoreVertical, Circle } from 'lucide-react'
import { createPortal } from 'react-dom'
import { ENTITY_TYPES } from '@/constants/entityConstants'
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
    customActions?: Array<{
        key: string
        label: string
        onClick: (item: any) => void
        isVisible?: (item: any) => boolean
        className?: string
        icon?: React.ComponentType<{ className?: string }>
    }>
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
    customActions = [],
}) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)
    const menuRef = React.useRef<HTMLDivElement | null>(null)
    const triggerRef = React.useRef<HTMLButtonElement | null>(null)
    const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 })

    const updateMenuPosition = React.useCallback(() => {
        const trigger = triggerRef.current
        if (!trigger) return
        const rect = trigger.getBoundingClientRect()
        setMenuPosition({
            top: rect.bottom + 6,
            left: rect.right - 220,
        })
    }, [])

    React.useEffect(() => {
        if (!isMenuOpen) return
        updateMenuPosition()
        const onClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            const clickedMenu = Boolean(menuRef.current?.contains(target))
            const clickedTrigger = Boolean(triggerRef.current?.contains(target))
            if (!clickedMenu && !clickedTrigger) {
                setIsMenuOpen(false)
            }
        }
        const onWindowChange = () => updateMenuPosition()
        document.addEventListener('mousedown', onClickOutside)
        window.addEventListener('scroll', onWindowChange, true)
        window.addEventListener('resize', onWindowChange)
        return () => {
            document.removeEventListener('mousedown', onClickOutside)
            window.removeEventListener('scroll', onWindowChange, true)
            window.removeEventListener('resize', onWindowChange)
        }
    }, [isMenuOpen, updateMenuPosition])

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
        (user?.role === 'kvk_admin' || user?.role === 'kvk_user') &&
        (item.transferStatus === 'ACTIVE' ||
         (item.transferStatus === 'TRANSFERRED' && (item.kvkId === user?.kvkId || item.kvk?.kvkId === user?.kvkId)))

    const canTransferFurther = entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED &&
        (user?.role === 'kvk_admin' || user?.role === 'kvk_user') &&
        (item.kvkId === user?.kvkId || item.kvk?.kvkId === user?.kvkId)

    const canViewHistory = (isEmployeeDetails || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED) &&
        (item.transferStatus === 'TRANSFERRED' || item.transferCount > 0)

    const visibleCustomActions = customActions
        .filter((action) => (action.isVisible ? action.isVisible(item) : true))

    const hasAnyActions =
        canEdit ||
        canDelete ||
        ((canTransfer || canTransferFurther) && Boolean(onTransfer)) ||
        (canViewHistory && Boolean(onViewHistory)) ||
        visibleCustomActions.length > 0

    return (
        <div className="relative flex items-center justify-end" ref={menuRef}>
            {!hasAnyActions ? null : (
                <button
                    ref={triggerRef}
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="p-1.5 text-[#487749] hover:bg-[#F0FDF4] rounded-lg transition-colors bg-gray-100"
                    title="Actions"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
            )}

            {isMenuOpen && hasAnyActions && createPortal(
                <div
                    ref={menuRef}
                    className="fixed min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-lg py-1"
                    style={{ top: menuPosition.top, left: menuPosition.left, zIndex: 9999 }}
                >
                    {canEdit && (
                        <button
                            onClick={() => {
                                onEdit(item)
                                setIsMenuOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-[#487749]"
                            title="Edit"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => {
                                onDelete(item)
                                setIsMenuOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    )}
                    {(canTransfer || canTransferFurther) && onTransfer && (
                        <button
                            onClick={() => {
                                onTransfer(item)
                                setIsMenuOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 text-blue-600"
                            title={canTransferFurther ? "Transfer Further" : "Transfer"}
                        >
                            <ArrowRight className="w-4 h-4" />
                            {canTransferFurther ? 'Transfer Further' : 'Transfer'}
                        </button>
                    )}
                    {canViewHistory && onViewHistory && (
                        <button
                            onClick={() => {
                                onViewHistory(item)
                                setIsMenuOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2 text-purple-600"
                            title="View Transfer History"
                        >
                            <History className="w-4 h-4" />
                            View Transfer History
                        </button>
                    )}
                    {visibleCustomActions.map((action) => {
                        const Icon = action.icon || Circle
                        return (
                        <button
                            key={action.key}
                            onClick={() => {
                                action.onClick(item)
                                setIsMenuOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                            title={action.label}
                        >
                            <Icon className="w-4 h-4" />
                            {action.label}
                        </button>
                        )
                    })}
                </div>,
                document.body
            )}
        </div>
    )
}
