import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Download, Edit2, Trash2, ChevronLeft, ArrowRight, History } from 'lucide-react'
import { Breadcrumbs } from '../../../components/common/Breadcrumbs'
import { TabNavigation } from '../../../components/common/TabNavigation'
import { getBreadcrumbsForPath, getRouteConfig, getSiblingRoutes } from '../../../config/routeConfig'
import { getAllMastersMockData } from '../../../mocks/allMastersMockData'
import { useMasterData } from '../../../hooks/useMasterData'
import type { EntityType } from '../../../types/masterData'
import { DataManagementModal } from './DataManagementModal'
import { ENTITY_TYPES } from '../../../constants/entityTypes'
import { ExtendedEntityType, getEntityTypeFromPath, getIdField, getFieldValue } from '../../../utils/masterUtils'
import { useAuth } from '../../../contexts/AuthContext'
import { isAdminRole } from '../../../constants/roleHierarchy'

import {
    useOftSubjects,
    useOftThematicAreas,
    useSectors,
    useFldThematicAreas,
    useFldCategories,
    useFldSubcategories,
    useFldCrops,
    useCfldCrops,
    useSeasons,
} from '../../../hooks/useOftFldData'
import {
    usePublicationItems,
} from '../../../hooks/usePublicationData'
import {
    useTrainingTypes,
    useTrainingAreas,
    useTrainingThematicAreas,
    useExtensionActivities,
    useOtherExtensionActivities,
    useEvents,
} from '../../../hooks/useTrainingExtensionEventsData'
import { exportApi } from '../../../services/exportApi'
import {
    useProductCategories,
    useProductTypes,
    useProducts,
    useCraCroppingSystems,
    useCraFarmingSystems,
    useAryaEnterprises,
} from '../../../hooks/useProductionProjectsData'
import { useAboutKvkData, AboutKvkEntity } from '../../../hooks/forms/useAboutKvkData'
import { TransferModal } from '../../../components/forms/TransferModal'
import { TransferHistoryModal } from '../../../components/forms/TransferHistoryModal'
import type { KvkEmployee } from '../../../types/aboutKvk'

interface DataManagementViewProps {
    title: string
    description?: string
    fields?: string[]
    mockData?: any[]
}


export const DataManagementView: React.FC<DataManagementViewProps> = ({
    title,
    description = `Manage and view all ${title.toLowerCase()} in the system`,
    fields: propFields,
    mockData
}) => {
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any | null>(null)
    const [formData, setFormData] = useState<any>({})
    const [exportLoading, setExportLoading] = useState<string | null>(null) // 'pdf' | 'excel' | 'word' | null
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<KvkEmployee | null>(null)

    // Get user from auth store
    const { user } = useAuth()

    // Route meta, siblings & breadcrumbs
    const routeConfig = getRouteConfig(location.pathname)
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)
    const siblingRoutes = getSiblingRoutes(location.pathname)
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Determine if this is a master data entity
    const entityType = getEntityTypeFromPath(location.pathname)
    const isBasicMasterEntity = entityType && ([ENTITY_TYPES.ZONES, ENTITY_TYPES.STATES, ENTITY_TYPES.DISTRICTS, ENTITY_TYPES.ORGANIZATIONS] as ExtendedEntityType[]).includes(entityType)
    const isMasterDataEntity = entityType !== null

    // Use appropriate hooks based on entity type
    const basicMasterHook = isBasicMasterEntity ? useMasterData(entityType as EntityType) : null
    const oftSubjectsHook = entityType === ENTITY_TYPES.OFT_SUBJECTS ? useOftSubjects() : null
    const oftThematicAreasHook = entityType === ENTITY_TYPES.OFT_THEMATIC_AREAS ? useOftThematicAreas() : null
    const sectorsHook = entityType === ENTITY_TYPES.FLD_SECTORS ? useSectors() : null
    const fldThematicAreasHook = entityType === ENTITY_TYPES.FLD_THEMATIC_AREAS ? useFldThematicAreas() : null
    const fldCategoriesHook = entityType === ENTITY_TYPES.FLD_CATEGORIES ? useFldCategories() : null
    const fldSubcategoriesHook = entityType === ENTITY_TYPES.FLD_SUBCATEGORIES ? useFldSubcategories() : null
    const fldCropsHook = entityType === ENTITY_TYPES.FLD_CROPS ? useFldCrops() : null
    const cfldCropsHook = entityType === ENTITY_TYPES.CFLD_CROPS ? useCfldCrops() : null
    const seasonsHook = entityType === ENTITY_TYPES.SEASONS ? useSeasons() : null
    const trainingTypesHook = entityType === ENTITY_TYPES.TRAINING_TYPES ? useTrainingTypes() : null
    const trainingAreasHook = entityType === ENTITY_TYPES.TRAINING_AREAS ? useTrainingAreas() : null
    const trainingThematicAreasHook = entityType === ENTITY_TYPES.TRAINING_THEMATIC_AREAS ? useTrainingThematicAreas() : null
    const extensionActivitiesHook = entityType === ENTITY_TYPES.EXTENSION_ACTIVITIES ? useExtensionActivities() : null
    const otherExtensionActivitiesHook = entityType === ENTITY_TYPES.OTHER_EXTENSION_ACTIVITIES ? useOtherExtensionActivities() : null
    const eventsHook = entityType === ENTITY_TYPES.EVENTS ? useEvents() : null
    const productCategoriesHook = entityType === ENTITY_TYPES.PRODUCT_CATEGORIES ? useProductCategories() : null
    const productTypesHook = entityType === ENTITY_TYPES.PRODUCT_TYPES ? useProductTypes() : null
    const productsHook = entityType === ENTITY_TYPES.PRODUCTS ? useProducts() : null
    const craCroppingSystemsHook = entityType === ENTITY_TYPES.CRA_CROPPING_SYSTEMS ? useCraCroppingSystems() : null
    const craFarmingSystemsHook = entityType === ENTITY_TYPES.CRA_FARMING_SYSTEMS ? useCraFarmingSystems() : null
    const aryaEnterprisesHook = entityType === ENTITY_TYPES.ARYA_ENTERPRISES ? useAryaEnterprises() : null
    const publicationItemsHook = entityType === ENTITY_TYPES.PUBLICATION_ITEMS ? usePublicationItems() : null

    // About KVK hook
    const aboutKvkEntities: string[] = [
        ENTITY_TYPES.KVK_BANK_ACCOUNTS, ENTITY_TYPES.KVK_EMPLOYEES, ENTITY_TYPES.KVK_STAFF_TRANSFERRED,
        ENTITY_TYPES.KVK_INFRASTRUCTURE, ENTITY_TYPES.KVK_VEHICLES, ENTITY_TYPES.KVK_VEHICLE_DETAILS,
        ENTITY_TYPES.KVK_EQUIPMENTS, ENTITY_TYPES.KVK_EQUIPMENT_DETAILS, ENTITY_TYPES.KVK_FARM_IMPLEMENTS, ENTITY_TYPES.KVKS
    ]
    const isAboutKvkEntity = entityType && aboutKvkEntities.includes(entityType)
    const aboutKvkHook = isAboutKvkEntity ? useAboutKvkData(entityType as AboutKvkEntity) : null

    // Check if this is Employee Details view
    const isEmployeeDetails = entityType === ENTITY_TYPES.KVK_EMPLOYEES

    // Determine if "Add New" button should be shown
    const canUserCreate = () => {
        if (!user) return false
        // About KVK entities: only KVK role can add details; no one adds KVKs from UI
        if (isAboutKvkEntity) {
            if (entityType === ENTITY_TYPES.KVKS) return false
            return user.role === 'kvk'
        }
        if (!routeConfig?.canCreate) return true
        return routeConfig.canCreate.includes(user.role)
    }
    const showAddButton = canUserCreate()

    // Determine if Edit button should be shown for a given item
    const canEditItem = (item: any) => {
        if (!user) return false
        if (isAboutKvkEntity) {
            if (entityType === ENTITY_TYPES.KVKS) {
                // Admins can edit KVKs
                return isAdminRole(user.role)
            }
            // KVK details: only KVK role can edit their own data
            if (user.role !== 'kvk') return false
            if (!item.transferStatus || item.transferStatus === 'ACTIVE') return true
            return item.kvkId === user.kvkId || item.kvk?.kvkId === user.kvkId
        }
        return true
    }

    // Determine if Delete button should be shown for a given item
    const canDeleteItem = (item: any) => {
        if (!user) return false
        if (isAboutKvkEntity) {
            if (entityType === ENTITY_TYPES.KVKS) {
                return user.role === 'super_admin'
            }
            // KVK details: only KVK role can delete their own data
            if (user.role !== 'kvk') return false
            if (!item.transferStatus || item.transferStatus === 'ACTIVE') return true
            return item.kvkId === user.kvkId || item.kvk?.kvkId === user.kvkId
        }
        return true
    }

    // Get the active hook
    const activeHook = basicMasterHook || oftSubjectsHook || oftThematicAreasHook || sectorsHook ||
        fldThematicAreasHook || fldCategoriesHook || fldSubcategoriesHook ||
        fldCropsHook || cfldCropsHook || trainingTypesHook || trainingAreasHook ||
        trainingThematicAreasHook || extensionActivitiesHook || otherExtensionActivitiesHook || eventsHook || seasonsHook ||
        productCategoriesHook || productTypesHook || productsHook || craCroppingSystemsHook || craFarmingSystemsHook || aryaEnterprisesHook ||
        publicationItemsHook || aboutKvkHook

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
        if (isMasterDataEntity && activeHook) {
            // Use real API data for master data entities
            setItems(activeHook.data)
        } else {
            // Use mock data for non-master entities
            if (mockData && mockData.length) {
                setItems(mockData)
            } else {
                setItems(getAllMastersMockData(location.pathname))
            }
        }
    }, [mockData, location.pathname, isMasterDataEntity, activeHook?.data])

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

        // Extract nested IDs for form fields (especially for KVK employees)
        const formDataWithIds = { ...item }

        // Extract sanctionedPostId from nested sanctionedPost object
        if (item.sanctionedPost && item.sanctionedPost.sanctionedPostId) {
            formDataWithIds.sanctionedPostId = item.sanctionedPost.sanctionedPostId
        }

        // Extract disciplineId from nested discipline object
        if (item.discipline && item.discipline.disciplineId) {
            formDataWithIds.disciplineId = item.discipline.disciplineId
        }

        // Extract kvkId from nested kvk object
        if (item.kvk && item.kvk.kvkId) {
            formDataWithIds.kvkId = item.kvk.kvkId
        }

        setFormData(formDataWithIds)
        setIsModalOpen(true)
    }

    const handleDelete = async (item: any) => {
        if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return
        }

        if (isMasterDataEntity && activeHook && entityType) {
            try {
                const idField = getIdField(entityType)
                await activeHook.remove(item[idField])
            } catch (err: any) {
                alert(err.message || 'Failed to delete. This item may have dependent records.')
            }
        } else {
            // Mock delete for non-master-data entities
            setItems(items.filter(i => i.id !== item.id))
        }
    }

    const handleTransfer = (item: any) => {
        setSelectedEmployee(item as KvkEmployee)
        setIsTransferModalOpen(true)
    }

    const handleViewHistory = (item: any) => {
        setSelectedEmployee(item as KvkEmployee)
        setIsHistoryModalOpen(true)
    }

    const handleTransferSuccess = async () => {
        // Invalidate queries to refresh data for all users
        // This ensures the target KVK sees the transferred employee immediately
        queryClient.invalidateQueries({ queryKey: ['kvk-employees'] })
        queryClient.invalidateQueries({ queryKey: ['kvk-staff-transferred'] })

        // Also refetch current data
        if (activeHook && 'refetch' in activeHook) {
            await (activeHook as any).refetch()
        }
    }

    const handleAddNew = () => {

        setEditingItem(null)
        setFormData({})
        setIsModalOpen(true)
    }

    const handleSaveModal = async () => {
        if (isMasterDataEntity && activeHook && entityType) {
            try {
                // Check if category should be kept (it's a direct field for KVK employees, not a nested object)
                const shouldKeepCategory = entityType === ENTITY_TYPES.KVK_EMPLOYEES || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED

                if (editingItem) {
                    // Update - filter out read-only fields (ID, _count, nested objects)
                    const idField = getIdField(entityType)
                    const {
                        [idField]: _,
                        _count,
                        // Basic master nested objects
                        zone, state, subject, sector, subCategory, season, cropType,
                        // About KVK nested objects
                        kvk, organization, district, org, sanctionedPost, discipline, infraMaster, vehicle, equipment,
                        // Timestamps
                        createdAt, updatedAt,
                        ...restData
                    } = formData

                    // Conditionally exclude category only if it's not a direct field for this entity
                    let updateData = restData
                    if (!shouldKeepCategory && 'category' in restData) {
                        const { category: _, ...dataWithoutCategory } = restData
                        updateData = dataWithoutCategory
                    }

                    // Sanitize optional enum fields: convert empty strings to null
                    // Prisma requires null for optional enum fields, not empty strings
                    if (entityType === ENTITY_TYPES.KVK_EMPLOYEES || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED) {
                        if (updateData.payLevel === '') {
                            updateData.payLevel = null
                        }
                    }

                    // Different update signatures for different hooks
                    if (isBasicMasterEntity) {
                        await (activeHook as any).update(editingItem[idField], updateData)
                    } else {
                        await (activeHook as any).update({ id: editingItem[idField], data: updateData })
                    }
                } else {
                    // Create - remove read-only nested objects but keep foreign key IDs
                    const {
                        _count,
                        zone, state, subject, sector, subCategory, season, cropType,
                        kvk, organization, district, org, sanctionedPost, discipline, infraMaster, vehicle, equipment,
                        ...restData
                    } = formData

                    // Conditionally exclude category only if it's not a direct field for this entity
                    let createData = restData
                    if (!shouldKeepCategory && 'category' in restData) {
                        const { category: _, ...dataWithoutCategory } = restData
                        createData = dataWithoutCategory
                    }

                    // Sanitize optional enum fields: convert empty strings to null
                    // Prisma requires null for optional enum fields, not empty strings
                    if (entityType === ENTITY_TYPES.KVK_EMPLOYEES || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED) {
                        if (createData.payLevel === '') {
                            createData.payLevel = null
                        }
                    }

                    await activeHook.create(createData)
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

    const handleExport = async (format: 'pdf' | 'excel' | 'word' | 'csv') => {
        const headerLabels = fields.map(f => f.charAt(0).toUpperCase() + f.slice(1).replace(/([A-Z])/g, ' $1'))
        const rows = filteredData.map(item => fields.map(field => getFieldValue(item, field)))

        if (format === 'csv') {
            const csv = [
                ['S.No.', ...headerLabels],
                ...rows.map((row, index) => [index + 1, ...row])
            ].map(row => row.join(',')).join('\n')

            const blob = new Blob([csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`
            a.click()
            window.URL.revokeObjectURL(url)
            return
        }

        setExportLoading(format)
        try {
            const blob = await exportApi.exportData({
                title,
                headers: headerLabels,
                rows,
                format: format as 'pdf' | 'excel' | 'word'
            }, location.pathname)

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const extensions: Record<string, string> = { pdf: 'pdf', excel: 'xlsx', word: 'docx' }
            a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.${extensions[format] || format}`
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (error: any) {
            console.error('Export failed:', error)
            alert(error.message || 'Failed to export. Please try again.')
        } finally {
            setExportLoading(null)
        }
    }

    const loading = isMasterDataEntity && activeHook ? ('isLoading' in activeHook ? activeHook.isLoading : activeHook.loading) : false
    const error = isMasterDataEntity && activeHook ? (activeHook.error ? (activeHook.error instanceof Error ? activeHook.error.message : activeHook.error) : null) : null

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl p-1 overflow-hidden">
            {/* Back + Breadcrumbs + Tabs - Fixed Header */}
            <div className="flex-none">
                {breadcrumbs.length > 0 && (
                    <div className="flex items-center gap-4 px-6 pt-4 pb-4">
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

                {siblingRoutes.length > 1 && (
                    <div className="mb-4">
                        <TabNavigation
                            tabs={siblingRoutes.map(r => ({ label: r.title, path: r.path }))}
                            currentPath={location.pathname}
                        />
                    </div>
                )}
            </div>

            {/* Main Content Area - Flexible height */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#FAF9F6] rounded-xl overflow-hidden shadow-sm m-1">
                <div className="flex-none p-6 pb-2">
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-[#487749]">{title}</h2>
                            <p className="text-sm text-[#757575] mt-1">{description}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => handleExport('pdf')}
                                disabled={exportLoading !== null}
                                className="flex items-center gap-2 px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#487749] hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {exportLoading === 'pdf' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#487749]"></div>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Export PDF
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleExport('excel')}
                                disabled={exportLoading !== null}
                                className="flex items-center gap-2 px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#487749] hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {exportLoading === 'excel' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#487749]"></div>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Export Excel
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleExport('word')}
                                disabled={exportLoading !== null}
                                className="flex items-center gap-2 px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#487749] hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {exportLoading === 'word' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#487749]"></div>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Export Word
                                    </>
                                )}
                            </button>

                            {showAddButton && (
                                <button
                                    onClick={handleAddNew}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] shadow-sm transition-all duration-200"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="my-2">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#757575]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={`Search ${title.toLowerCase()}...`}
                                className="w-full pl-10 pr-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749] bg-white text-[#212121] placeholder-[#9E9E9E] transition-all duration-200"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col min-h-0 px-6 pb-6 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#487749]"></div>
                            <span className="ml-3 text-[#757575]">Loading...</span>
                        </div>
                    ) : (
                        <>
                            {/* Pagination (Top) - Optional, put here if desired */}

                            {/* Table Container */}
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
                                                        {field.replace(/([A-Z])/g, ' $1').trim()}
                                                    </th>
                                                ))}
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-[#212121] uppercase tracking-wider bg-[#F5F5F5] whitespace-nowrap sticky right-0 z-30 border-b border-[#E0E0E0]">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E0E0E0]">
                                            {paginatedData.length > 0 ? (
                                                paginatedData.map((item, index) => {
                                                    const uniqueKey = `${location.pathname}-${index}`
                                                    return (
                                                        <tr key={uniqueKey} className={`hover:bg-[#F9FAFB] transition-colors group ${
                                                            (isEmployeeDetails || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED) &&
                                                            item.transferStatus === 'TRANSFERRED'
                                                                ? 'bg-blue-50/30'
                                                                : ''
                                                        }`}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#212121] sticky left-0 bg-white group-hover:bg-[#F9FAFB] z-10 border-r border-transparent group-hover:border-gray-100">
                                                                {startIndex + index + 1}
                                                            </td>
                                                            {fields.map((field, fieldIdx) => {
                                                                const fieldValue = getFieldValue(item, field)
                                                                const isPhotoField = field === 'photo' || field === 'photoPath'
                                                                const photoPath = item.photoPath || item.photo
                                                                const isTransferStatusField = field === 'transferStatus' || field === 'transfer_status'

                                                                return (
                                                                    <td key={fieldIdx} className="px-6 py-4 text-sm text-[#212121] whitespace-nowrap">
                                                                        {isPhotoField && photoPath && photoPath !== '-' ? (
                                                                            <div className="flex items-center">
                                                                                <img
                                                                                    src={photoPath}
                                                                                    alt="Staff photo"
                                                                                    className="w-20 h-full object-cover"
                                                                                    onError={(e) => {
                                                                                        // Hide image and show fallback
                                                                                        const target = e.currentTarget as HTMLImageElement
                                                                                        target.style.display = 'none'
                                                                                        const fallback = target.nextElementSibling as HTMLElement
                                                                                        if (fallback) {
                                                                                            fallback.classList.remove('hidden')
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <span className="hidden text-xs text-gray-500 ml-2 truncate max-w-xs">No image</span>
                                                                            </div>
                                                                        ) : isTransferStatusField ? (
                                                                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                                                                item.transferStatus === 'TRANSFERRED'
                                                                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                                                    : 'bg-green-100 text-green-700 border border-green-200'
                                                                            }`}>
                                                                                {item.transferStatus || 'ACTIVE'}
                                                                            </span>
                                                                        ) : typeof fieldValue === 'object' ? (
                                                                            JSON.stringify(fieldValue)
                                                                        ) : (
                                                                            fieldValue
                                                                        )}
                                                                    </td>
                                                                )
                                                            })}
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm sticky right-0 bg-white group-hover:bg-[#F9FAFB] z-10 border-l border-transparent group-hover:border-gray-100">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {canEditItem(item) && (
                                                                        <button
                                                                            onClick={() => handleEdit(item)}
                                                                            className="p-1.5 text-[#487749] hover:bg-[#F0FDF4] rounded-lg transition-colors"
                                                                            title="Edit"
                                                                        >
                                                                            <Edit2 className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                    {canDeleteItem(item) && (
                                                                        <button
                                                                            onClick={() => handleDelete(item)}
                                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                    {/* Transfer button - only for active employees in Employee Details or transferred employees in current KVK */}
                                                                    {isEmployeeDetails && user?.role === 'kvk' &&
                                                                     (item.transferStatus === 'ACTIVE' ||
                                                                      (item.transferStatus === 'TRANSFERRED' && (item.kvkId === user?.kvkId || item.kvk?.kvkId === user?.kvkId))) && (
                                                                        <button
                                                                            onClick={() => handleTransfer(item)}
                                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                            title="Transfer"
                                                                        >
                                                                            <ArrowRight className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                    {/* Transfer button for current KVK to transfer further (Staff Transferred view) */}
                                                                    {entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED &&
                                                                     user?.role === 'kvk' &&
                                                                     (item.kvkId === user?.kvkId || item.kvk?.kvkId === user?.kvkId) && (
                                                                        <button
                                                                            onClick={() => handleTransfer(item)}
                                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                            title="Transfer Further"
                                                                        >
                                                                            <ArrowRight className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                    {/* View History button - for all employees with transfer history */}
                                                                    {(isEmployeeDetails || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED) &&
                                                                     (item.transferStatus === 'TRANSFERRED' || item.transferCount > 0) && (
                                                                        <button
                                                                            onClick={() => handleViewHistory(item)}
                                                                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                                            title="View Transfer History"
                                                                        >
                                                                            <History className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={fields.length + 2} className="px-6 py-12 text-center text-gray-500">
                                                        No data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination (Bottom) */}
                            {filteredData.length > 0 && (
                                <div className="flex-none mt-4 flex items-center justify-between">
                                    <div className="text-sm text-[#757575]">
                                        Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border rounded disabled:opacity-50"
                                        >
                                            Prev
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 border rounded disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal for Create/Edit */}
            {isModalOpen && (
                <DataManagementModal
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

            {/* Transfer Modal */}
            {isTransferModalOpen && selectedEmployee && (
                <TransferModal
                    open={isTransferModalOpen}
                    onClose={() => {
                        setIsTransferModalOpen(false)
                        setSelectedEmployee(null)
                    }}
                    staff={selectedEmployee}
                    onTransferSuccess={handleTransferSuccess}
                />
            )}

            {/* Transfer History Modal */}
            {isHistoryModalOpen && selectedEmployee && (
                <TransferHistoryModal
                    open={isHistoryModalOpen}
                    onClose={() => {
                        setIsHistoryModalOpen(false)
                        setSelectedEmployee(null)
                    }}
                    staff={selectedEmployee}
                />
            )}
        </div>
    )
}
