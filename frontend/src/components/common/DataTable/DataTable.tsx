/**
 * Data Table Component
 *
 * Reusable data table with pagination, sorting, and actions
 */

import React from 'react'
import { formatHeaderLabel } from '@/utils/exportUtils'
import { getFieldValue, ExtendedEntityType } from '@/utils/masterUtils'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { TableCell } from './TableCell'
import { TableActions } from './TableActions'

interface DataTableProps {
    fields: readonly string[] | string[]
    data: any[]
    entityType: ExtendedEntityType | null
    user: any
    showAddButton: boolean
    isEmployeeDetails: boolean
    startIndex: number
    locationPathname: string
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
    }>
}

export const DataTable: React.FC<DataTableProps> = ({
    fields,
    data,
    entityType,
    user,
    showAddButton,
    isEmployeeDetails,
    startIndex,
    locationPathname,
    onEdit,
    onDelete,
    onTransfer,
    onViewHistory,
    canEditItem,
    canDeleteItem,
    customActions,
}) => {
    // Always show table headers, even when there's no data
    // This ensures users can see the field structure and understand what data should be there
    const hasData = data.length > 0

    return (
        <div className="flex-1 bg-white rounded-xl border border-[#E0E0E0] overflow-hidden flex flex-col min-h-0 relative shadow-sm">
            <div className="absolute inset-0 overflow-auto">
                <table className="w-full border-collapse min-w-max text-left">
                    <thead className="sticky top-0 z-20 bg-[#F5F5F5] shadow-sm">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-[#212121] uppercase tracking-wider bg-[#F5F5F5] whitespace-nowrap sticky left-0 z-30 border-b border-[#E0E0E0]">
                                S.No.
                            </th>
                            {fields.map((field, idx) => (
                                <th key={idx} className="px-6 py-4 text-xs font-semibold text-[#212121] uppercase tracking-wider bg-[#F5F5F5] whitespace-nowrap border-b border-[#E0E0E0]">
                                    {formatHeaderLabel(field)}
                                </th>
                            ))}
                            <th className="px-6 py-4 text-right text-xs font-semibold text-[#212121] uppercase tracking-wider bg-[#F5F5F5] whitespace-nowrap sticky right-0 z-30 border-b border-[#E0E0E0]">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0]">
                        {hasData ? (
                            data.map((item, index) => {
                                const uniqueKey = `${locationPathname}-${index}`
                                const isTransferred = (isEmployeeDetails || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED) &&
                                    item.transferStatus === 'TRANSFERRED'

                                return (
                                    <tr
                                        key={uniqueKey}
                                        className={`hover:bg-[#F9FAFB] transition-colors group ${isTransferred ? 'bg-blue-50/30' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#212121] sticky left-0 bg-white group-hover:bg-[#F9FAFB] z-10 border-r border-transparent group-hover:border-gray-100">
                                            {startIndex + index + 1}
                                        </td>
                                        {fields.map((field, fieldIdx) => {
                                            const fieldValue = getFieldValue(item, field)
                                            return (
                                                <td key={fieldIdx} className="px-6 py-4 text-sm text-[#212121] whitespace-nowrap">
                                                    <TableCell field={field} value={fieldValue} item={item} />
                                                </td>
                                            )
                                        })}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm sticky right-0 bg-white group-hover:bg-[#F9FAFB] z-10 border-l border-transparent group-hover:border-gray-100">
                                            <TableActions
                                                item={item}
                                                entityType={entityType}
                                                user={user}
                                                showAddButton={showAddButton}
                                                isEmployeeDetails={isEmployeeDetails}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                onTransfer={onTransfer}
                                                onViewHistory={onViewHistory}
                                                canEditItem={canEditItem}
                                                canDeleteItem={canDeleteItem}
                                                customActions={customActions}
                                            />
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan={fields.length + 2} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p className="text-sm font-medium text-gray-600">No data available</p>
                                        <p className="text-xs text-gray-500 mt-1">Click "Add New" to create your first record</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
