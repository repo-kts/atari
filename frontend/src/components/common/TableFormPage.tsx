import React, { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Download, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Breadcrumbs } from './Breadcrumbs'
import { TabNavigation } from './TabNavigation'
import { getRouteConfig, getSiblingRoutes, getBreadcrumbsForPath } from '../../config/routeConfig'

export interface TableColumn {
    key: string
    label: string
    sortable?: boolean
    render?: (value: any, row: any) => React.ReactNode
}

export interface TableFormPageProps {
    // If not provided, will be derived from current route
    title?: string
    description?: string
    columns?: TableColumn[]
    data?: any[]
    // Actions
    onAdd?: () => void
    onEdit?: (row: any) => void
    onDelete?: (row: any) => void
    onExportPDF?: () => void
    onExportExcel?: () => void
    // Customization
    showSearch?: boolean
    showPagination?: boolean
    pageSize?: number
    showBreadcrumbs?: boolean
    showTabs?: boolean
    addButtonLabel?: string
    // For pages without table (just placeholder)
    placeholder?: boolean
    children?: React.ReactNode
}

export const TableFormPage: React.FC<TableFormPageProps> = ({
    title: propTitle,
    description: propDescription,
    columns = [],
    data = [],
    onAdd,
    onEdit,
    onDelete,
    onExportPDF,
    onExportExcel,
    showSearch = true,
    showPagination = true,
    pageSize = 10,
    showBreadcrumbs = true,
    showTabs = true,
    addButtonLabel = 'Add New',
    placeholder = false,
    children
}) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

    // Get route config for current path
    const routeConfig = getRouteConfig(location.pathname)
    const title = propTitle || routeConfig?.title || 'Form'
    const description = propDescription || routeConfig?.description || ''

    // Get siblings for tab navigation
    const siblingRoutes = getSiblingRoutes(location.pathname)

    // Get breadcrumbs
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)

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

    const handleBack = () => {
        // For "All Masters" category, go to subcategory path (second breadcrumb)
        // Otherwise use parent or subcategoryPath
        if (routeConfig?.category === 'All Masters' && breadcrumbs.length > 1) {
            // Go to subcategory path (e.g., /all-master/basic, /all-master/training-extension)
            const subcategoryPath = breadcrumbs[1]?.path
            if (subcategoryPath) {
                navigate(subcategoryPath)
            } else if (routeConfig?.subcategoryPath) {
                navigate(routeConfig.subcategoryPath)
            } else {
                navigate('/all-master')
            }
        } else if (routeConfig?.subcategoryPath) {
            navigate(routeConfig.subcategoryPath)
        } else if (routeConfig?.parent) {
            navigate(routeConfig.parent)
        } else if (breadcrumbs.length > 1) {
            // Fallback: go to second-to-last breadcrumb
            const parentBreadcrumb = breadcrumbs[breadcrumbs.length - 2]
            if (parentBreadcrumb?.path) {
                navigate(parentBreadcrumb.path)
            } else {
                navigate(-1)
            }
        } else {
            navigate(-1)
        }
    }

    return (
        <div className="space-y-6">
            {/* Back button and Breadcrumbs */}
            {showBreadcrumbs && breadcrumbs.length > 0 && (
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        className="flex items-center shrink-0"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                    </Button>
                    <Breadcrumbs items={breadcrumbs.map((b, i) => ({ ...b, level: i }))} showHome={false} />
                </div>
            )}

            {/* Tab Navigation for siblings */}
            {showTabs && siblingRoutes.length > 1 && (
                <TabNavigation
                    tabs={siblingRoutes.map(r => ({ label: r.title, path: r.path }))}
                    currentPath={location.pathname}
                />
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#487749]">{title}</h1>
                    {description && (
                        <p className="text-sm text-[#757575] mt-1">{description}</p>
                    )}
                </div>
                <div className="flex gap-2 flex-wrap">
                    {onExportPDF && (
                        <Button variant="outline" size="sm" onClick={onExportPDF} className="flex items-center">
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                    )}
                    {onExportExcel && (
                        <Button variant="outline" size="sm" onClick={onExportExcel} className="flex items-center">
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Excel
                        </Button>
                    )}
                    {onAdd && (
                        <Button variant="primary" size="sm" onClick={onAdd} className="flex items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            {addButtonLabel}
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <Card>
                <CardContent className="p-6">
                    {placeholder ? (
                        // Placeholder for forms without data yet
                        children || (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-[#487749]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-[#212121] mb-2">Data Table Coming Soon</h3>
                                <p className="text-sm text-[#757575] max-w-md mx-auto">
                                    This form will display data from the backend once connected. For now, use the Add button to enter new records.
                                </p>
                            </div>
                        )
                    ) : (
                        <>
                            {/* Search */}
                            {showSearch && (
                                <div className="mb-4">
                                    <div className="relative max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-full h-10 pl-10 pr-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Table */}
                            {columns.length > 0 && data.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-[#E8F5E9] border-b border-[#E0E0E0]">
                                                    {columns.map(col => (
                                                        <th
                                                            key={col.key}
                                                            className={`px-4 py-3 text-left text-sm font-semibold text-[#487749] ${col.sortable ? 'cursor-pointer hover:bg-[#C8E6C9]' : ''}`}
                                                            onClick={() => col.sortable && handleSort(col.key)}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                {col.label}
                                                                {col.sortable && sortConfig?.key === col.key && (
                                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                                )}
                                                            </div>
                                                        </th>
                                                    ))}
                                                    {(onEdit || onDelete) && (
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
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
                                                                {col.render ? col.render(row[col.key], row) : row[col.key]}
                                                            </td>
                                                        ))}
                                                        {(onEdit || onDelete) && (
                                                            <td className="px-4 py-3">
                                                                <div className="flex gap-2">
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
                                    <p>No data available</p>
                                    {onAdd && (
                                        <Button variant="primary" size="sm" onClick={onAdd} className="mt-4">
                                            <Plus className="w-4 h-4 mr-2" />
                                            {addButtonLabel}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
