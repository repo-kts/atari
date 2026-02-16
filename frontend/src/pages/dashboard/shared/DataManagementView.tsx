import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Download, ChevronLeft } from 'lucide-react'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { TabNavigation } from '@/components/common/TabNavigation'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { Pagination } from '@/components/common/DataTable/Pagination'
import { SearchInput } from '@/components/common/SearchInput'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { getBreadcrumbsForPath, getRouteConfig, getSiblingRoutes } from '@/config/routeConfig'
import { getAllMastersMockData } from '@/mocks/allMastersMockData'
import { DataManagementFormPage } from './DataManagementFormPage'
import { ENTITY_TYPES } from '@/constants/entityTypes'
import { getEntityTypeFromPath, getIdField, getFieldValue } from '@/utils/masterUtils'
import { useAuth } from '@/contexts/AuthContext'
import { isAdminRole } from '@/constants/roleHierarchy'
import { useDataSave } from '@/hooks/useDataSave'
import { useEntityHook, isBasicMasterEntity } from '@/hooks/useEntityHook'
import { useFormState } from '@/hooks/useFormState'
import { getHookLoading, getHookError } from '@/hooks/useHookState'
import { exportApi } from '@/services/exportApi'
import { getEntityTypeChecks } from '@/utils/entityTypeUtils'
import {
    formatHeaderLabel,
    generateCSV,
    downloadFile,
    generateFilename,
    getExportExtension,
} from '@/utils/exportUtils'
import { TransferModal } from '@/components/forms/TransferModal'
import { TransferHistoryModal } from '@/components/forms/TransferHistoryModal'
import type { KvkEmployee } from '@/types/aboutKvk'
import { useConfirm } from '@/hooks/useConfirm'
import { useAlert } from '@/hooks/useAlert'
import { LoadingButton } from '@/components/common/LoadingButton'

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
    const [exportLoading, setExportLoading] = useState<string | null>(null) // 'pdf' | 'excel' | 'word' | null

    // Form state management
    const {
        isFormPageOpen,
        editingItem,
        formData,
        openForm,
        closeForm,
        setFormData,
    } = useFormState()
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<KvkEmployee | null>(null)

    // Get user from auth store
    const { user } = useAuth()

    // Modal hooks
    const { confirm, ConfirmDialog } = useConfirm()
    const { alert, AlertDialog } = useAlert()

    // Route meta, siblings & breadcrumbs
    const routeConfig = getRouteConfig(location.pathname)
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)
    const siblingRoutes = getSiblingRoutes(location.pathname)
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Determine if this is a master data entity
    const entityType = getEntityTypeFromPath(location.pathname)
    const isMasterDataEntity = entityType !== null

    // Use centralized hook factory
    const activeHook = useEntityHook(entityType)

    // Check if this is Employee Details view
    const isEmployeeDetails = entityType === ENTITY_TYPES.KVK_EMPLOYEES

    // Check if this is an About KVK entity
    const { isAboutKvk: isAboutKvkEntity } = getEntityTypeChecks(entityType)

    // Determine if "Add New" button should be shown
    const canUserCreate = () => {
        if (!user) return false
        // About KVK entities: check routeConfig.canCreate for KVKS, otherwise only KVK role can add details
        if (isAboutKvkEntity) {
            if (entityType === ENTITY_TYPES.KVKS) {
                // For KVKS, check routeConfig.canCreate (super_admin can create)
                if (routeConfig?.canCreate) {
                    return routeConfig.canCreate.includes(user.role)
                }
                return false
            }
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
        // Master data entities: only super_admin can edit
        return user.role === 'super_admin'
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
        // Master data entities: only super_admin can delete
        return user.role === 'super_admin'
    }
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

    // Refs to track previous values and prevent infinite loops
    const prevPathRef = useRef<string>(location.pathname)
    const prevDataHashRef = useRef<string | null>(null)
    const prevMockDataHashRef = useRef<string | null>(null)

    // Create stable hash for hook data to detect actual changes
    const hookDataHash = useMemo(() => {
        if (!activeHook?.data || !Array.isArray(activeHook.data)) return null
        // Create a hash based on data length and a sample of IDs
        // This is more efficient than full JSON.stringify for large arrays
        const data = activeHook.data
        if (data.length === 0) return 'empty'

        // Use length + first and last item IDs for quick comparison
        const firstId = data[0] ? (data[0].id || data[0].zoneId || data[0].stateId || data[0].districtId || data[0].orgId || data[0].universityId || '') : ''
        const lastId = data[data.length - 1] ? (data[data.length - 1].id || data[data.length - 1].zoneId || data[data.length - 1].stateId || data[data.length - 1].districtId || data[data.length - 1].orgId || data[data.length - 1].universityId || '') : ''
        return `${data.length}-${firstId}-${lastId}`
    }, [activeHook?.data])

    // Create stable hash for mock data
    const mockDataHash = useMemo(() => {
        if (!mockData || !Array.isArray(mockData)) return null
        return mockData.length > 0
            ? `${mockData.length}-${JSON.stringify(mockData[0])}-${JSON.stringify(mockData[mockData.length - 1])}`
            : 'empty'
    }, [mockData])

    // Reset state when route changes (tab switch)
    useEffect(() => {
        // Only reset if path actually changed
        if (prevPathRef.current !== location.pathname) {
            prevPathRef.current = location.pathname
            // Clear items immediately when route changes
            setItems([])
            setSearchQuery('')
            setCurrentPage(1)
            closeForm()
            // Reset data refs
            prevDataHashRef.current = null
            prevMockDataHashRef.current = null
        }
    }, [location.pathname, closeForm])

    // Sync data from API or mock - optimized to prevent infinite loops
    // Use hash-based dependencies to prevent re-renders when only reference changes
    useEffect(() => {
        // PRIORITY 1: Explicit mockData from props (for new achievement forms etc.)
        if (mockData && mockData.length > 0) {
            if (mockDataHash !== null && mockDataHash !== prevMockDataHashRef.current) {
                prevMockDataHashRef.current = mockDataHash
                setItems(mockData)
            }
            return // Exit early so we don't overwrite with empty API data
        }

        // PRIORITY 2: API Data (if no mockData provided)
        if (isMasterDataEntity && activeHook?.data) {
            // Only update if hash changed (indicating actual data change)
            if (hookDataHash !== null && hookDataHash !== prevDataHashRef.current) {
                prevDataHashRef.current = hookDataHash
                setItems(activeHook.data)
            }
        } else if (!isMasterDataEntity) {
            // PRIORITY 3: Fallback legacy mock data
            // Handle mock data (this block will only be reached if mockData prop was not provided or was empty)
            const mockDataFromPath = getAllMastersMockData(location.pathname)
            const pathMockHash = mockDataFromPath.length > 0
                ? `${mockDataFromPath.length}-${JSON.stringify(mockDataFromPath[0])}-${JSON.stringify(mockDataFromPath[mockDataFromPath.length - 1])}`
                : 'empty'

            if (pathMockHash !== prevMockDataHashRef.current) {
                prevMockDataHashRef.current = pathMockHash
                setItems(mockDataFromPath)
            }
        }
    }, [activeHook?.data, isMasterDataEntity, mockData, location.pathname, hookDataHash, mockDataHash])

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

        openForm(formDataWithIds)
    }

    const handleDelete = async (item: any) => {
        if (isMasterDataEntity && activeHook && entityType) {
            const idField = getIdField(entityType)
            const itemId = item[idField]

            // Check if this is a zone or organization with potential dependents
            if (entityType === ENTITY_TYPES.ZONES) {
                // Show warning dialog for cascade delete
                const confirmMessage = `⚠️ WARNING: This zone has related records (states, districts, organizations, KVKs, users).\n\n` +
                    `Deleting this zone will permanently delete ALL related data:\n` +
                    `• All states in this zone\n` +
                    `• All districts in those states\n` +
                    `• All organizations in those districts\n` +
                    `• All KVKs in this zone\n` +
                    `• User zone assignments will be cleared\n\n` +
                    `This action CANNOT be undone!\n\n` +
                    `Are you sure you want to proceed with cascade delete?`

                confirm(
                    {
                        title: 'Delete Zone',
                        message: confirmMessage,
                        variant: 'danger',
                        confirmText: 'Delete',
                        cancelText: 'Cancel',
                    },
                    async () => {
                        try {
                            await activeHook.remove(itemId, true) // Pass cascade=true
                            alert({
                                title: 'Success',
                                message: 'Zone deleted successfully.',
                                variant: 'success',
                                autoClose: true,
                                autoCloseDelay: 2000,
                            })
                        } catch (err: any) {
                            const errorMessage = err.message || 'Failed to delete zone.'
                            if (errorMessage.includes('dependent')) {
                                alert({
                                    title: 'Error',
                                    message: `${errorMessage}\n\nPlease try again or contact support.`,
                                    variant: 'error',
                                })
                            } else {
                                alert({
                                    title: 'Error',
                                    message: errorMessage,
                                    variant: 'error',
                                })
                            }
                        }
                    }
                )
            } else if (entityType === ENTITY_TYPES.ORGANIZATIONS) {
                // Show warning dialog for cascade delete
                const confirmMessage = `⚠️ WARNING: This organization has related records (universities, KVKs, users).\n\n` +
                    `Deleting this organization will permanently delete ALL related data:\n` +
                    `• All universities in this organization\n` +
                    `• All KVKs in this organization\n` +
                    `• User organization assignments will be cleared\n\n` +
                    `This action CANNOT be undone!\n\n` +
                    `Are you sure you want to proceed with cascade delete?`

                confirm(
                    {
                        title: 'Delete Organization',
                        message: confirmMessage,
                        variant: 'danger',
                        confirmText: 'Delete',
                        cancelText: 'Cancel',
                    },
                    async () => {
                        try {
                            await activeHook.remove(itemId, true) // Pass cascade=true
                            alert({
                                title: 'Success',
                                message: 'Organization deleted successfully.',
                                variant: 'success',
                                autoClose: true,
                                autoCloseDelay: 2000,
                            })
                        } catch (err: any) {
                            const errorMessage = err.message || 'Failed to delete organization.'
                            if (errorMessage.includes('dependent')) {
                                alert({
                                    title: 'Error',
                                    message: `${errorMessage}\n\nPlease try again or contact support.`,
                                    variant: 'error',
                                })
                            } else {
                                alert({
                                    title: 'Error',
                                    message: errorMessage,
                                    variant: 'error',
                                })
                            }
                        }
                    }
                )
            } else {
                // For other entities, use regular confirmation
                confirm(
                    {
                        title: 'Delete Item',
                        message: 'Are you sure you want to delete this item? This action cannot be undone.',
                        variant: 'danger',
                        confirmText: 'Delete',
                        cancelText: 'Cancel',
                    },
                    async () => {
                        try {
                            await activeHook.remove(itemId)
                            alert({
                                title: 'Success',
                                message: 'Item deleted successfully.',
                                variant: 'success',
                                autoClose: true,
                                autoCloseDelay: 2000,
                            })
                        } catch (err: any) {
                            alert({
                                title: 'Error',
                                message: err.message || 'Failed to delete. This item may have dependent records.',
                                variant: 'error',
                            })
                        }
                    }
                )
            }
        } else {
            // Mock delete for non-master-data entities
            confirm(
                {
                    title: 'Delete Item',
                    message: 'Are you sure you want to delete this item? This action cannot be undone.',
                    variant: 'danger',
                    confirmText: 'Delete',
                    cancelText: 'Cancel',
                },
                () => {
                    setItems(items.filter(i => i.id !== item.id))
                    alert({
                        title: 'Success',
                        message: 'Item deleted successfully.',
                        variant: 'success',
                        autoClose: true,
                        autoCloseDelay: 2000,
                    })
                }
            )
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
        openForm()
    }

    // Custom hook for save operations with proper error handling
    const { save: saveData, isSaving } = useDataSave({
        entityType,
        activeHook: isMasterDataEntity ? activeHook : null,
        isBasicMasterEntity: isBasicMasterEntity(entityType) || false,
        onSuccess: closeForm,
        onError: (err: Error) => {
            alert({
                title: 'Error',
                message: err.message || 'Failed to save',
                variant: 'error',
            })
        },
    });

    /**
     * Handles saving form data (create or update)
     * Uses centralized transformation utilities and custom hook for data sanitization
     */
    const handleSaveModal = async () => {
        if (isMasterDataEntity && activeHook && entityType) {
            await saveData(formData, editingItem);
        } else {
            // Mock save for non-master-data entities
            if (editingItem) {
                setItems(items.map(item => item.id === editingItem.id ? { ...item, ...formData } : item));
            } else {
                const newId = Math.max(...items.map(i => i.id || 0), 0) + 1;
                setItems([...items, { ...formData, id: newId }]);
            }
            closeForm();
        }
    }

    const handleExport = async (format: 'pdf' | 'excel' | 'word' | 'csv') => {
        const headerLabels = fields.map(formatHeaderLabel)
        const rows = filteredData.map(item => fields.map(field => getFieldValue(item, field)))

        if (format === 'csv') {
            const csv = generateCSV(headerLabels, rows)
            const blob = new Blob([csv], { type: 'text/csv' })
            const filename = generateFilename(title, 'csv')
            downloadFile(blob, filename, 'text/csv')
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

            const extension = getExportExtension(format)
            const filename = generateFilename(title, extension)
            downloadFile(blob, filename)
            alert({
                title: 'Success',
                message: 'Export completed successfully.',
                variant: 'success',
                autoClose: true,
                autoCloseDelay: 2000,
            })
        } catch (error: any) {
            console.error('Export failed:', error)
            alert({
                title: 'Error',
                message: error.message || 'Failed to export. Please try again.',
                variant: 'error',
            })
        } finally {
            setExportLoading(null)
        }
    }

    const loading = isMasterDataEntity ? getHookLoading(activeHook) : false
    const error = isMasterDataEntity ? getHookError(activeHook) : null

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl p-1 overflow-hidden">
            {/* Back + Breadcrumbs + Tabs - Fixed Header (hidden when form is open) */}
            {!isFormPageOpen && (
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
            )}

            {/* Main Content Area - Flexible height */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#FAF9F6] rounded-xl overflow-hidden shadow-sm m-1">
                {/* Show Form Page if open, otherwise show List View */}
                {isFormPageOpen ? (
                    <div className="flex-1 overflow-y-auto p-6">
                        <DataManagementFormPage
                            entityType={entityType}
                            title={editingItem ? `Edit ${title.replace(/ Master$/, '')}` : `Create ${title.replace(/ Master$/, '')}`}
                            formData={formData}
                            setFormData={setFormData}
                            onSave={handleSaveModal}
                            onClose={closeForm}
                            isSaving={isSaving}
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex-none p-6 pb-2">
                            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-[#487749]">{title}</h2>
                                    <p className="text-sm text-[#757575] mt-1">{description}</p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <LoadingButton
                                        onClick={() => handleExport('pdf')}
                                        isLoading={exportLoading === 'pdf'}
                                        loadingText="Exporting..."
                                        variant="outline"
                                        size="sm"
                                        disabled={exportLoading !== null && exportLoading !== 'pdf'}
                                        className="flex items-center gap-2"
                                    >
                                        {exportLoading !== 'pdf' && <Download className="w-4 h-4" />}
                                        Export PDF
                                    </LoadingButton>
                                    <LoadingButton
                                        onClick={() => handleExport('excel')}
                                        isLoading={exportLoading === 'excel'}
                                        loadingText="Exporting..."
                                        variant="outline"
                                        size="sm"
                                        disabled={exportLoading !== null && exportLoading !== 'excel'}
                                        className="flex items-center gap-2"
                                    >
                                        {exportLoading !== 'excel' && <Download className="w-4 h-4" />}
                                        Export Excel
                                    </LoadingButton>
                                    <LoadingButton
                                        onClick={() => handleExport('word')}
                                        isLoading={exportLoading === 'word'}
                                        loadingText="Exporting..."
                                        variant="outline"
                                        size="sm"
                                        disabled={exportLoading !== null && exportLoading !== 'word'}
                                        className="flex items-center gap-2"
                                    >
                                        {exportLoading !== 'word' && <Download className="w-4 h-4" />}
                                        Export Word
                                    </LoadingButton>

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
                                <SearchInput
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder={`Search ${title.toLowerCase()}...`}
                                />
                            </div>

                            {error && <ErrorState message={error} className="my-4" />}
                        </div>

                        <div className="flex-1 flex flex-col min-h-0 px-6 pb-6 overflow-hidden">
                            {loading ? (
                                <LoadingState />
                            ) : (
                                <>
                                    <DataTable
                                        fields={fields}
                                        data={paginatedData}
                                        entityType={entityType}
                                        user={user}
                                        showAddButton={showAddButton}
                                        isEmployeeDetails={isEmployeeDetails}
                                        startIndex={startIndex}
                                        locationPathname={location.pathname}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        canEditItem={canEditItem}
                                        canDeleteItem={canDeleteItem}
                                        onTransfer={isEmployeeDetails || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED ? handleTransfer : undefined}
                                        onViewHistory={(isEmployeeDetails || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED) ? handleViewHistory : undefined}
                                    />

                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        startIndex={startIndex}
                                        endIndex={endIndex}
                                        totalItems={filteredData.length}
                                        onPageChange={setCurrentPage}
                                    />
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

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

            {/* Modals */}
            <ConfirmDialog />
            <AlertDialog />
        </div>
    )
}
