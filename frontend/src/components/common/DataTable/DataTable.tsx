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
import { ColumnFilter, EMPTY_FILTER, type ColumnFilterState } from './ColumnFilter'
import { uniqueValuesForField, type ColumnFilters } from './columnFilterUtils'

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
        icon?: React.ComponentType<{ className?: string }>
    }>
    /**
     * Full pre-pagination dataset (used to compute unique values for column filter dropdowns).
     * Falls back to `data` when omitted.
     */
    columnFilterSourceData?: any[]
    columnFilters?: ColumnFilters
    onColumnFiltersChange?: (next: ColumnFilters) => void
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
    columnFilterSourceData,
    columnFilters,
    onColumnFiltersChange,
}) => {
    // Always show table headers, even when there's no data
    // This ensures users can see the field structure and understand what data should be there
    const hasData = data.length > 0
    const filterSource = columnFilterSourceData ?? data
    const filtersEnabled = Boolean(columnFilters && onColumnFiltersChange)

    const uniqueValuesByField = React.useMemo(() => {
        if (!filtersEnabled) return {} as Record<string, string[]>
        const map: Record<string, string[]> = {}
        for (const field of fields) {
            map[field] = uniqueValuesForField(filterSource, field)
        }
        return map
    }, [filtersEnabled, fields, filterSource])

    const updateColumnFilter = (field: string, next: ColumnFilterState) => {
        if (!onColumnFiltersChange) return
        const current = columnFilters ?? {}
        // If the new state sets a sort direction, clear sort on every other column
        // (we support a single active sort at a time).
        if (next.sort) {
            const cleared: ColumnFilters = {}
            for (const key of Object.keys(current)) {
                if (key === field) continue
                cleared[key] = { ...current[key], sort: null }
            }
            onColumnFiltersChange({ ...current, ...cleared, [field]: next })
            return
        }
        onColumnFiltersChange({ ...current, [field]: next })
    }

    const clearColumnFilter = (field: string) => {
        if (!onColumnFiltersChange) return
        const current = columnFilters ?? {}
        const { [field]: _drop, ...rest } = current
        onColumnFiltersChange(rest)
    }

    return (
        <div className="flex-1 bg-white rounded-xl border border-[#E0E0E0] overflow-hidden flex flex-col min-h-0 relative">
            <div className="absolute inset-0 overflow-auto">
				<table className="w-full border-separate border-spacing-0 min-w-max text-left">
					<thead className="sticky top-0 z-20 bg-[#F5F5F5] shadow-sm">
                        <tr className="divide-x divide-[#E0E0E0]">
							<th className="px-6 py-4 text-xs font-semibold text-[#212121] uppercase tracking-wider bg-[#F5F5F5] whitespace-nowrap sticky left-0 z-30 border-b border-l border-[#E0E0E0]">
                                S.No.
                            </th>
                            {fields.map((field, idx) => {
                                const label = formatHeaderLabel(field)
                                const state = (columnFilters && columnFilters[field]) || EMPTY_FILTER
                                return (
                                    <th
                                        key={idx}
                                        className="px-6 py-4 text-xs font-semibold text-[#212121] uppercase tracking-wider bg-[#F5F5F5] whitespace-nowrap border-b border-[#E0E0E0]"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate">{label}</span>
                                            {filtersEnabled && (
                                                <ColumnFilter
                                                    field={field}
                                                    label={label}
                                                    uniqueValues={uniqueValuesByField[field] || []}
                                                    state={state}
                                                    onChange={(s) => updateColumnFilter(field, s)}
                                                    onClear={() => clearColumnFilter(field)}
                                                />
                                            )}
                                        </div>
                                    </th>
                                )
                            })}
							<th className="px-6 py-4 text-right text-xs font-semibold text-[#212121] uppercase tracking-wider bg-[#F5F5F5] whitespace-nowrap sticky right-0 z-30 border-b border-r border-[#E0E0E0]">
                                Action
                            </th>
                        </tr>
                    </thead>
					<tbody className="border-b border-[#E0E0E0]">
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
										<td className="px-6 py-4 whitespace-nowrap text-sm text-[#212121] sticky left-0 bg-white group-hover:bg-[#F9FAFB] z-10 border-r border-b border-[#E0E0E0]">
                                            {startIndex + index + 1}
                                        </td>
                                        {fields.map((field, fieldIdx) => {
                                            const fieldValue = getFieldValue(item, field)
                                            return (
												<td key={fieldIdx} className="px-6 py-4 text-sm text-[#212121] whitespace-nowrap border-r border-b border-[#E0E0E0]">
                                                    <TableCell field={field} value={fieldValue} item={item} />
                                                </td>
                                            )
                                        })}
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm sticky right-0 bg-white group-hover:bg-[#F9FAFB] z-10 border-l border-b border-[#E0E0E0]">
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
								<td colSpan={fields.length + 2} className="px-6 py-12 text-center text-gray-500 border-b border-[#E0E0E0]">
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
