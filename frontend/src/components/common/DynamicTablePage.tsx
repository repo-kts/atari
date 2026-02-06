import React, { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, Edit2, Trash2, Eye, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { RouteWrapper } from './RouteWrapper'

export interface TableColumn {
    key: string
    label: string
    sortable?: boolean
    render?: (value: any, row: any) => React.ReactNode
}

export interface ButtonOption {
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: 'primary' | 'outline'
    disabled?: boolean
    className?: string
}

export interface DynamicTablePageProps {
    // Page metadata
    title: string
    description?: string

    // Table configuration
    columns: TableColumn[]
    data: any[]

    // Button options (export, add, custom actions)
    buttonOptions?: ButtonOption[]

    // Actions
    onEdit?: (row: any) => void
    onDelete?: (row: any) => void
    onView?: (row: any) => void

    // Customization
    showSearch?: boolean
    searchPlaceholder?: string
    showPagination?: boolean
    pageSize?: number

    // Route wrapper options
    showBreadcrumbs?: boolean
    showTabs?: boolean
    showBack?: boolean

    // Custom content (for non-table pages)
    customContent?: React.ReactNode
}

export const DynamicTablePage: React.FC<DynamicTablePageProps> = ({
    title,
    description,
    columns,
    data,
    buttonOptions = [],
    onEdit,
    onDelete,
    onView,
    showSearch = true,
    searchPlaceholder = 'Search...',
    showPagination = true,
    pageSize = 10,
    showBreadcrumbs = true,
    showTabs = true,
    showBack = true,
    customContent,
}) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data
        const query = searchQuery.toLowerCase()
        return data.filter(row =>
            Object.values(row).some(val =>
                String(val).toLowerCase().includes(query)
            )
        )
    }, [data, searchQuery])

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key]
            const bVal = b[sortConfig.key]
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }, [filteredData, sortConfig])

    // Paginate data
    const paginatedData = useMemo(() => {
        if (!showPagination) return sortedData
        const start = (currentPage - 1) * pageSize
        return sortedData.slice(start, start + pageSize)
    }, [sortedData, currentPage, pageSize, showPagination])

    const totalPages = Math.ceil(sortedData.length / pageSize)

    const handleSort = (key: string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
            }
            return { key, direction: 'asc' }
        })
    }

    // Reset to page 1 when search changes
    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    return (
        <RouteWrapper showBreadcrumbs={showBreadcrumbs} showTabs={showTabs} showBack={showBack}>
            <div className="space-y-6 bg-[#FAF9F6] rounded-2xl w-full min-w-0">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-medium text-gray-800">{title}</h1>
                        {description && (
                            <p className="text-sm text-[#757575] mt-1">{description}</p>
                        )}
                    </div>
                    {buttonOptions.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {buttonOptions.map((option, idx) => (
                                <Button
                                    key={idx}
                                    variant={option.variant || 'outline'}
                                    size="sm"
                                    onClick={option.onClick}
                                    disabled={option.disabled}
                                    className={`flex items-center ${option.className || ''}`}
                                >
                                    {option.icon}
                                    {option.icon && <span className="ml-2">{option.label}</span>}
                                    {!option.icon && option.label}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <Card className="bg-[#FAF9F6] w-full overflow-hidden">
                    <CardContent className="p-6">
                        {customContent ? (
                            customContent
                        ) : (
                            <>
                                {/* Search */}
                                {showSearch && (
                                    <div className="mb-4">
                                        <div className="relative max-w-md">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder={searchPlaceholder}
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                className="w-full h-10 pl-10 pr-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Table */}
                                {columns.length > 0 && sortedData.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto w-full">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-[#CFE1D1] border-b border-[#E0E0E0]">
                                                        {columns.map(col => (
                                                            <th
                                                                key={col.key}
                                                                className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200 ${col.sortable ? 'cursor-pointer hover:bg-[#C8E6C9]' : ''}`}
                                                                onClick={() => col.sortable && handleSort(col.key)}
                                                            >
                                                                <div className="flex items-center gap-1.5">
                                                                    {col.label}
                                                                    {col.sortable && (
                                                                        <div className="flex flex-col">
                                                                            {sortConfig?.key === col.key ? (
                                                                                sortConfig.direction === 'asc' ? (
                                                                                    <ChevronUp className="w-3 h-3 text-gray-600" />
                                                                                ) : (
                                                                                    <ChevronDown className="w-3 h-3 text-gray-600" />
                                                                                )
                                                                            ) : (
                                                                                <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </th>
                                                        ))}
                                                        {(onEdit || onDelete || onView) && (
                                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-b border-gray-200">
                                                                Actions
                                                            </th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedData.map((row, idx) => (
                                                        <tr key={row.id || idx} className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA]">
                                                            {columns.map(col => (
                                                                <td key={col.key} className="px-4 py-3 text-[#212121]">
                                                                    {col.render ? col.render(row[col.key], row) : (row[col.key] || '-')}
                                                                </td>
                                                            ))}
                                                            {(onEdit || onDelete || onView) && (
                                                                <td className="px-4 py-3">
                                                                    <div className="flex gap-2">
                                                                        {onView && (
                                                                            <button
                                                                                onClick={() => onView(row)}
                                                                                className="p-2 text-[#487749] hover:bg-[#E8F5E9] rounded-lg transition-colors"
                                                                                title="View"
                                                                            >
                                                                                <Eye className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                        {onEdit && (
                                                                            <button
                                                                                onClick={() => onEdit(row)}
                                                                                className="p-2 text-[#487749] hover:bg-[#E8F5E9] rounded-lg transition-colors"
                                                                                title="Edit"
                                                                            >
                                                                                <Edit2 className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                        {onDelete && (
                                                                            <button
                                                                                onClick={() => onDelete(row)}
                                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                                title="Delete"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {showPagination && totalPages > 1 && (
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E0E0E0]">
                                                <p className="text-sm text-[#757575]">
                                                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
                                                </p>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </Button>
                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                        let pageNum: number
                                                        if (totalPages <= 5) {
                                                            pageNum = i + 1
                                                        } else if (currentPage <= 3) {
                                                            pageNum = i + 1
                                                        } else if (currentPage >= totalPages - 2) {
                                                            pageNum = totalPages - 4 + i
                                                        } else {
                                                            pageNum = currentPage - 2 + i
                                                        }
                                                        return (
                                                            <Button
                                                                key={pageNum}
                                                                variant={currentPage === pageNum ? 'primary' : 'outline'}
                                                                size="sm"
                                                                onClick={() => setCurrentPage(pageNum)}
                                                            >
                                                                {pageNum}
                                                            </Button>
                                                        )
                                                    })}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-[#757575]">
                                        <p>{searchQuery ? 'No results found' : 'No data available'}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </RouteWrapper>
    )
}
