import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Search, Download, Edit2, Trash2, X, ChevronLeft } from 'lucide-react'
import { Breadcrumbs } from '../../common/Breadcrumbs'
import { TabNavigation } from '../../common/TabNavigation'
import { getBreadcrumbsForPath, getRouteConfig, getSiblingRoutes } from '../../../config/routeConfig'
import { getAllMastersMockData } from '../../../mocks/allMastersMockData'
import { Card, CardContent } from '../../ui/Card'
import { useMasterData } from '../../../hooks/useMasterData'
import type { EntityType, Zone, State } from '../../../types/masterData'

interface MasterViewProps {
    title: string
    description?: string
    fields?: string[]
    mockData?: any[]
}

// Map route paths to entity types
const getEntityTypeFromPath = (path: string): EntityType | null => {
    if (path.includes('/zones')) return 'zones'
    if (path.includes('/states')) return 'states'
    if (path.includes('/districts')) return 'districts'
    if (path.includes('/organizations') || path.includes('/universities')) return 'organizations'
    return null
}

// Get ID field name based on entity type
const getIdField = (entityType: EntityType): string => {
    switch (entityType) {
        case 'zones': return 'zoneId'
        case 'states': return 'stateId'
        case 'districts': return 'districtId'
        case 'organizations': return 'orgId'
    }
}

// Get field value from item, handling nested objects
const getFieldValue = (item: any, field: string): string => {
    // Direct field access
    if (item[field]) return item[field]

    // Handle nested fields for related data
    if (field === 'zoneName') {
        // For states and districts: item.zone.zoneName
        if (item.zone?.zoneName) return item.zone.zoneName
        // For organizations: item.state.zone.zoneName
        if (item.state?.zone?.zoneName) return item.state.zone.zoneName
    }

    if (field === 'stateName' && item.state?.stateName) return item.state.stateName
    if (field === 'uniName' && item.uniName) return item.uniName

    return '-'
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
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any | null>(null)
    const [formData, setFormData] = useState<any>({})

    // Route meta, siblings & breadcrumbs
    const routeConfig = getRouteConfig(location.pathname)
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)
    const siblingRoutes = getSiblingRoutes(location.pathname)
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Determine if this is a master data entity
    const entityType = getEntityTypeFromPath(location.pathname)
    const isMasterDataEntity = entityType !== null

    // Use real API for master data entities, mock data for others
    const masterDataHook = isMasterDataEntity ? useMasterData(entityType!) : null

    // Initialize items based on entity type
    const [items, setItems] = useState<any[]>(() => {
        // Master data entities start empty, will be populated by API
        if (isMasterDataEntity) return []
        // Non-master entities use mock data
        if (mockData && mockData.length) return mockData
        return getAllMastersMockData(location.pathname)
    })

    const fields = propFields && propFields.length > 0 ? propFields : ['name']
    const itemsPerPage = 10

    // Reset state when route changes (tab switch)
    useEffect(() => {
        // Clear items immediately when route changes
        setItems([])
        setSearchQuery('')
        setCurrentPage(1)
        setEditingItem(null)
        setFormData({})
        setIsModalOpen(false)
    }, [location.pathname])

    // Sync data from API or mock
    useEffect(() => {
        if (isMasterDataEntity && masterDataHook) {
            // Use real API data for master data entities
            setItems(masterDataHook.data)
        } else {
            // Use mock data for non-master entities
            if (mockData && mockData.length) {
                setItems(mockData)
            } else {
                setItems(getAllMastersMockData(location.pathname))
            }
        }
    }, [mockData, location.pathname, isMasterDataEntity, masterDataHook?.data])

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
            const value = getFieldValue(item, field)
            return value && String(value).toLowerCase().includes(query)
        })
    })

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = filteredData.slice(startIndex, endIndex)

    const handleEdit = (item: any) => {
        setEditingItem(item)
        setFormData({ ...item })
        setIsModalOpen(true)
    }

    const handleDelete = async (item: any) => {
        if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return
        }

        if (isMasterDataEntity && masterDataHook && entityType) {
            try {
                const idField = getIdField(entityType)
                await masterDataHook.remove(item[idField])
            } catch (err: any) {
                alert(err.message || 'Failed to delete. This item may have dependent records.')
            }
        } else {
            // Mock delete for non-master-data entities
            setItems(items.filter(i => i.id !== item.id))
        }
    }

    const handleAddNew = () => {
        setEditingItem(null)
        setFormData({})
        setIsModalOpen(true)
    }

    const handleSaveModal = async () => {
        if (isMasterDataEntity && masterDataHook && entityType) {
            try {
                if (editingItem) {
                    // Update - filter out read-only fields (ID, _count, nested objects)
                    const idField = getIdField(entityType)
                    const { [idField]: _, _count, zone, state, ...updateData } = formData
                    await masterDataHook.update(editingItem[idField], updateData)
                } else {
                    // Create - remove read-only nested objects but keep foreign key IDs
                    const { _count, zone, state, ...createData } = formData
                    await masterDataHook.create(createData)
                }
                setIsModalOpen(false)
                setEditingItem(null)
                setFormData({})
            } catch (err: any) {
                alert(err.message || 'Failed to save')
            }
        } else {
            // Mock save for non-master-data entities
            if (editingItem) {
                setItems(items.map(item => item.id === editingItem.id ? { ...item, ...formData } : item))
            } else {
                const newId = Math.max(...items.map(i => i.id || 0), 0) + 1
                setItems([...items, { ...formData, id: newId }])
            }
            setIsModalOpen(false)
            setEditingItem(null)
            setFormData({})
        }
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

    const loading = isMasterDataEntity && masterDataHook ? masterDataHook.loading : false
    const error = isMasterDataEntity && masterDataHook ? masterDataHook.error : null

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

                    {/* Error Message */}
                    {error && (
                        <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#487749]"></div>
                            <span className="ml-3 text-[#757575]">Loading...</span>
                        </div>
                    ) : (
                        <>
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
                                                paginatedData.map((item, index) => {
                                                    // Generate unique key that includes route to prevent mixing
                                                    const itemId = item.zoneId || item.stateId || item.districtId || item.orgId || item.id || index
                                                    const uniqueKey = `${location.pathname}-${itemId}-${index}`

                                                    return (
                                                        <tr
                                                            key={uniqueKey}
                                                            className="hover:bg-[#F5F5F5] transition-colors"
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#212121]">
                                                                {startIndex + index + 1}
                                                            </td>
                                                            {fields.map((field, fieldIdx) => (
                                                                <td key={fieldIdx} className="px-6 py-4 text-sm text-[#212121]">
                                                                    <span className="font-medium">{getFieldValue(item, field)}</span>
                                                                </td>
                                                            ))}
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleEdit(item)}
                                                                        className="p-1.5 text-[#487749] hover:bg-[#F5F5F5] rounded-xl border border-transparent hover:border-[#E0E0E0] transition-all duration-200"
                                                                        aria-label="Edit"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(item)}
                                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-colors"
                                                                        aria-label="Delete"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
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
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Modal for Create/Edit */}
            {isModalOpen && (
                <MasterDataModal
                    entityType={entityType}
                    title={editingItem ? `Edit ${title.slice(0, -7)}` : `Add ${title.slice(0, -7)}`}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSaveModal}
                    onClose={() => {
                        setIsModalOpen(false)
                        setEditingItem(null)
                        setFormData({})
                    }}
                />
            )}
        </div>
    )
}

// Modal Component
function MasterDataModal({
    entityType,
    title,
    formData,
    setFormData,
    onSave,
    onClose,
}: {
    entityType: EntityType | null
    title: string
    formData: any
    setFormData: (data: any) => void
    onSave: () => void
    onClose: () => void
}) {
    const { data: zones } = useMasterData<Zone>('zones')
    const { data: states } = useMasterData<State>('states')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-[#E0E0E0]">
                    <h2 className="text-xl font-semibold text-[#212121]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[#F5F5F5] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-[#757575]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {entityType === 'zones' && (
                        <div>
                            <label className="block text-sm font-medium text-[#212121] mb-2">
                                Zone Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.zoneName || ''}
                                onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                                required
                                placeholder="Enter zone name"
                                className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                            />
                        </div>
                    )}

                    {entityType === 'states' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    State Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.stateName || ''}
                                    onChange={(e) => setFormData({ ...formData, stateName: e.target.value })}
                                    required
                                    placeholder="Enter state name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Zone <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.zoneId || ''}
                                    onChange={(e) => setFormData({ ...formData, zoneId: parseInt(e.target.value) })}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select zone</option>
                                    {zones.map((zone) => (
                                        <option key={zone.zoneId} value={zone.zoneId}>
                                            {zone.zoneName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {entityType === 'districts' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    District Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.districtName || ''}
                                    onChange={(e) => setFormData({ ...formData, districtName: e.target.value })}
                                    required
                                    placeholder="Enter district name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Zone <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.zoneId || ''}
                                    onChange={(e) => {
                                        const zoneId = parseInt(e.target.value)
                                        setFormData({ ...formData, zoneId, stateId: '' })
                                    }}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select zone</option>
                                    {zones.map((zone) => (
                                        <option key={zone.zoneId} value={zone.zoneId}>
                                            {zone.zoneName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.stateId || ''}
                                    onChange={(e) => setFormData({ ...formData, stateId: parseInt(e.target.value) })}
                                    required
                                    disabled={!formData.zoneId}
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all disabled:bg-[#F5F5F5] disabled:cursor-not-allowed"
                                >
                                    <option value="">Select state</option>
                                    {states
                                        .filter((state) => state.zoneId === formData.zoneId)
                                        .map((state) => (
                                            <option key={state.stateId} value={state.stateId}>
                                                {state.stateName}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </>
                    )}

                    {entityType === 'organizations' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Organization Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.uniName || ''}
                                    onChange={(e) => setFormData({ ...formData, uniName: e.target.value })}
                                    required
                                    placeholder="Enter organization name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.stateId || ''}
                                    onChange={(e) => setFormData({ ...formData, stateId: parseInt(e.target.value) })}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select state</option>
                                    {states.map((state) => (
                                        <option key={state.stateId} value={state.stateId}>
                                            {state.stateName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E0E0]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#757575] hover:bg-[#F5F5F5] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] transition-all shadow-sm hover:shadow-md"
                        >
                            {formData.zoneId || formData.stateId || formData.districtId || formData.orgId ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
