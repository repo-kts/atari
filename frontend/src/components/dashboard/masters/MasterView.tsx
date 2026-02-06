import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Search, Download, Edit2, Trash2, X, Save, ChevronLeft } from 'lucide-react'
import { Breadcrumbs } from '../../common/Breadcrumbs'
import { TabNavigation } from '../../common/TabNavigation'
import { getBreadcrumbsForPath, getRouteConfig, getSiblingRoutes } from '../../../config/routeConfig'
import { getAllMastersMockData } from '../../../mocks/allMastersMockData'
import { Card, CardContent } from '../../ui/Card'

interface MasterViewProps {
    title: string
    description?: string
    fields?: string[]
    mockData?: any[]
}

export const MasterView: React.FC<MasterViewProps> = ({
    title,
    description = `Manage and view all ${title.toLowerCase()} in the system`,
    fields: propFields,
    mockData
}) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchQuery, setSearchQuery] = useState('')

    // Route meta, siblings & breadcrumbs
    const routeConfig = getRouteConfig(location.pathname)
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)
    const siblingRoutes = getSiblingRoutes(location.pathname)
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const fields = propFields && propFields.length > 0 ? propFields : ['name']
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editValues, setEditValues] = useState<Record<string, string>>({})
    const [items, setItems] = useState<any[]>(() => {
        if (mockData && mockData.length) return mockData
        return getAllMastersMockData(location.pathname)
    })
    const itemsPerPage = 10

    // Keep items in sync when mockData or path changes
    useEffect(() => {
        if (mockData && mockData.length) {
            setItems(mockData)
        } else {
            setItems(getAllMastersMockData(location.pathname))
        }
    }, [mockData, location.pathname])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
            setCurrentPage(1)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Filter data based on search
    const filteredData = items.filter(item => {
        if (!debouncedSearch.trim()) return true
        const query = debouncedSearch.toLowerCase()
        return fields.some(field => {
            const value = item[field]
            return value && String(value).toLowerCase().includes(query)
        })
    })

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = filteredData.slice(startIndex, endIndex)
    console.log("-00000", paginatedData)

    const handleEdit = (item: any) => {
        setEditingId(item.id)
        const values: Record<string, string> = {}
        fields.forEach(field => {
            values[field] = item[field] || ''
        })
        setEditValues(values)
    }

    const handleSave = (id: number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, ...editValues } : item
        ))
        setEditingId(null)
        setEditValues({})
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditValues({})
    }

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setItems(items.filter(item => item.id !== id))
        }
    }

    const handleAddNew = () => {
        const newId = Math.max(...items.map(i => i.id || 0), 0) + 1
        const newItem: any = { id: newId }
        fields.forEach(field => {
            newItem[field] = `New ${field}`
        })
        setItems([...items, newItem])
        setEditingId(newId)
        setEditValues(newItem)
    }

    const handleExport = () => {
        const csv = [
            ['S.No.', ...fields.map(f => f.charAt(0).toUpperCase() + f.slice(1))],
            ...filteredData.map((item, index) => [
                index + 1,
                ...fields.map(field => item[field] || '')
            ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <div className="bg-white rounded-2xl p-1">
            {/* Back + Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <div className="mb-6 flex items-center gap-4 px-6 pt-4">
                    <button
                        onClick={() => {
                            if (routeConfig?.parent) {
                                navigate(routeConfig.parent)
                            } else {
                                navigate('/all-master')
                            }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>
                    <Breadcrumbs items={breadcrumbs.map((b, i) => ({ ...b, level: i }))} showHome={false} />
                </div>
            )}

            {/* Sibling Tabs for related masters */}
            {siblingRoutes.length > 1 && (
                <div className="mb-6">
                    <TabNavigation
                        tabs={siblingRoutes.map(r => ({ label: r.title, path: r.path }))}
                        currentPath={location.pathname}
                    />
                </div>
            )}

            {/* Header with Actions */}
            <Card className="bg-[#FAF9F6]">
                <CardContent className="p-6">
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-[#487749]">{title}</h2>
                            <p className="text-sm text-[#757575] mt-1">{description}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#487749] hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-all duration-200"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button
                                onClick={handleAddNew}
                                className="flex items-center gap-2 px-4 py-2 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#487749] border border-[#487749] hover:border-[#487749] transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                Add New
                            </button>
                        </div>
                    </div>
                    {/* Search Bar */}
                    <div className="my-2">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#757575]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={`Search ${title.toLowerCase()}...`}
                                className="w-full pl-10 pr-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9]0/20 focus:border-[#487749] bg-white text-[#212121] placeholder-[#9E9E9E] transition-all duration-200 hover:border-[#BDBDBD]"
                            />
                        </div>
                    </div>

                    {/* Pagination */}
                    {filteredData.length > 0 && (
                        <div className="my-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-[#757575]">
                                Showing <span className="font-medium text-[#212121]">{startIndex + 1}</span> to{' '}
                                <span className="font-medium text-[#212121]">{Math.min(endIndex, filteredData.length)}</span> of{' '}
                                <span className="font-medium text-[#212121]">{filteredData.length}</span> entries
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#487749] hover:bg-[#F5F5F5] hover:border-[#BDBDBD] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    Previous
                                </button>
                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let page: number
                                        if (totalPages <= 5) {
                                            page = i + 1
                                        } else if (currentPage <= 3) {
                                            page = i + 1
                                        } else if (currentPage >= totalPages - 2) {
                                            page = totalPages - 4 + i
                                        } else {
                                            page = currentPage - 2 + i
                                        }

                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-2 min-w-[2.5rem] border rounded-xl text-sm font-medium transition-all duration-200 ${currentPage === page
                                                    ? 'bg-[#487749] text-white border-[#487749]'
                                                    : 'border-[#E0E0E0] text-[#487749] hover:bg-[#F5F5F5] hover:border-[#BDBDBD]'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    })}
                                </div>
                                <button
                                    onClick={() =>
                                        setCurrentPage(prev => Math.min(totalPages, prev + 1))
                                    }
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#487749] hover:bg-[#F5F5F5] hover:border-[#BDBDBD] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                            S.No.
                                        </th>
                                        {fields.map((field, idx) => (
                                            <th key={idx} className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                                {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                                            </th>
                                        ))}
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-[#E0E0E0]">
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-[#F5F5F5] transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#212121]">
                                                    {startIndex + index + 1}
                                                </td>
                                                {fields.map((field, fieldIdx) => (
                                                    <td key={fieldIdx} className="px-6 py-4 text-sm text-[#212121]">
                                                        {editingId === item.id ? (
                                                            <input
                                                                type="text"
                                                                value={editValues[field] || ''}
                                                                onChange={e => setEditValues({ ...editValues, [field]: e.target.value })}
                                                                className="px-3 py-1.5 border border-[#487749] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9]0/20 w-full max-w-xs transition-all duration-200"
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter' && fieldIdx === fields.length - 1) handleSave(item.id)
                                                                    if (e.key === 'Escape') handleCancel()
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="font-medium">{item[field] || item.zoneName || '-'}</span>
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    {editingId === item.id ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleSave(item.id)}
                                                                className="p-1.5 text-[#487749] hover:bg-[#F5F5F5] rounded-xl border border-transparent hover:border-[#E0E0E0] transition-all duration-200"
                                                                aria-label="Save"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancel}
                                                                className="p-1.5 text-[#757575] hover:bg-[#F5F5F5] rounded-xl border border-transparent hover:border-[#E0E0E0] transition-all duration-200"
                                                                aria-label="Cancel"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="p-1.5 text-[#487749] hover:bg-[#F5F5F5] rounded-xl border border-transparent hover:border-[#E0E0E0] transition-all duration-200"
                                                                aria-label="Edit"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-colors"
                                                                aria-label="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={fields.length + 2}
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <p className="text-sm font-medium text-[#757575]">
                                                        {debouncedSearch ? `No items found matching your search` : `No ${title.toLowerCase()} available`}
                                                    </p>
                                                    {debouncedSearch && (
                                                        <button
                                                            onClick={() => setSearchQuery('')}
                                                            className="text-sm text-[#487749] hover:text-[#3d6540] hover:underline transition-colors"
                                                        >
                                                            Clear search
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
