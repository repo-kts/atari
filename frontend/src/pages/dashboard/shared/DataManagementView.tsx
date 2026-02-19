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
import { DataManagementFormPage } from './DataManagementFormPage'
import { ENTITY_TYPES } from '@/constants/entityTypes'
import { getEntityTypeFromPath, getFieldValue } from '@/utils/masterUtils'
import { useAuth } from '@/contexts/AuthContext'
import { isAdminRole } from '@/constants/roleHierarchy'
import { useDataSave } from '@/hooks/useDataSave'
import { useEntityHook, isBasicMasterEntity } from '@/hooks/useEntityHook'
import { useFormState } from '@/hooks/useFormState'
import { getHookLoading, getHookError } from '@/hooks/useHookState'
import { getEntityTypeChecks } from '@/utils/entityTypeUtils'
import { TransferModal } from '@/components/forms/TransferModal'
import { TransferHistoryModal } from '@/components/forms/TransferHistoryModal'
import type { KvkEmployee } from '@/types/aboutKvk'
import { useConfirm } from '@/hooks/useConfirm'
import { useAlert } from '@/hooks/useAlert'
import { useDeleteHandler } from '@/hooks/useDeleteHandler'
import { useEditHandler } from '@/hooks/useEditHandler'
import { useExportHandler } from '@/hooks/useExportHandler'
import { LoadingButton } from '@/components/common/LoadingButton'

interface DataManagementViewProps {
    title: string
    description?: string
    fields?: string[]
}


export const DataManagementView: React.FC<DataManagementViewProps> = ({
    title,
    description = `Manage and view all ${title.toLowerCase()} in the system`,
    fields: propFields,
}) => {
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')

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

    // Handler hooks
    const { handleMasterDataDelete } = useDeleteHandler({ confirm, alert })
    const { handleEdit: handleEditItem } = useEditHandler()
    const { handleExport: handleExportData, exportLoading: exportLoadingState } = useExportHandler()

    // Route meta, siblings & breadcrumbs
    const routeConfig = getRouteConfig(location.pathname)
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)
    const siblingRoutes = getSiblingRoutes(location.pathname)
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Get entity type from path
    const entityType = getEntityTypeFromPath(location.pathname)

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
    // Initialize items - all entities use real data from hooks
    const [items, setItems] = useState<any[]>([])

    const fields = propFields && propFields.length > 0 ? propFields : ['name']
    const itemsPerPage = 10

    // Refs to track previous values and prevent infinite loops
    const prevPathRef = useRef<string>(location.pathname)
    const prevDataHashRef = useRef<string | null>(null)
    const prevDataRef = useRef<any[] | null>(null) // Track previous data reference

    // Create comprehensive hash for hook data to detect ALL changes
    // Includes all IDs and a checksum to detect any updates
    const hookDataHash = useMemo(() => {
        if (!activeHook?.data || !Array.isArray(activeHook.data)) return null
        const data = activeHook.data
        if (data.length === 0) return 'empty'

        // Create a hash that includes all IDs to detect changes anywhere in the list
        // Also include a simple checksum of key fields to detect field updates
        const ids = data.map((item: any) => {
            const id = item.id || item.zoneId || item.stateId || item.districtId ||
                item.orgId || item.universityId || item.cropId || item.cfldId ||
                item.seasonId || item.sanctionedPostId || item.yearId ||
                item.publicationId || item.kvkId || item.employeeId || ''
            // Include a hash of the name field to detect name changes
            const name = item.name || item.zoneName || item.stateName || item.districtName ||
                item.orgName || item.universityName || item.cropName || item.CropName ||
                item.seasonName || item.postName || item.yearName ||
                item.publicationName || item.kvkName || ''
            return `${id}:${name ? name.substring(0, 20) : ''}` // Truncate name for performance
        }).join('|')

        // Use length + all IDs + simple checksum
        return `${data.length}-${ids.substring(0, 500)}` // Limit length for performance
    }, [activeHook?.data])


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
            prevDataRef.current = null
        }
    }, [location.pathname, closeForm])

    // Sync data from API - real-time updates
    // Check both hash changes AND reference changes (React Query gives new reference on refetch)
    useEffect(() => {
        // All entities use real data from hooks
        if (activeHook?.data) {
            const data = activeHook.data
            const dataRefChanged = prevDataRef.current !== data
            const hashChanged = hookDataHash !== null && hookDataHash !== prevDataHashRef.current

            // Update if either the reference changed (React Query refetch) or hash changed (data content changed)
            if (dataRefChanged || hashChanged) {
                prevDataRef.current = data
                prevDataHashRef.current = hookDataHash
                setItems([...data]) // Create new array reference to ensure React detects the change
            }
        } else if (activeHook && !activeHook.data && !activeHook.isLoading) {
            // If hook exists but has no data and is not loading, set empty array
            setItems([])
        }
    }, [hookDataHash, location.pathname, activeHook?.data, activeHook?.isLoading]) // Include activeHook?.data to detect reference changes

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
        handleEditItem({
            item,
            entityType,
            onOpenForm: openForm,
        })
    }

    const handleDelete = (item: any) => {
        if (activeHook && entityType) {
            handleMasterDataDelete(item, entityType, activeHook)
        } else {
            console.warn('Cannot delete: missing activeHook or entityType', { activeHook, entityType })
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
        activeHook: activeHook,
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
        if (activeHook && entityType) {
            await saveData(formData, editingItem);
        } else {
            console.warn('Cannot save: missing activeHook or entityType', { activeHook, entityType })
        }
    }

    const handleExport = async (format: 'pdf' | 'excel' | 'word' | 'csv') => {
        await handleExportData(format, {
            title,
            fields,
            data: filteredData,
            pathname: location.pathname,
        })
    }

    const loading = getHookLoading(activeHook)
    const error = getHookError(activeHook)

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl p-1 overflow-hidden">
            {/* Back + Breadcrumbs + Tabs - Fixed Header (hidden when form is open) */}
            {!isFormPageOpen && (
                <div className="flex-none">
                    {breadcrumbs.length > 0 && (
                        <div className="flex items-center gap-4 px-6 pt-4 pb-4">
                            <button
                                onClick={() => {
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
                                            navigate('/all-master')
                                        }
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
                                        isLoading={exportLoadingState === 'pdf'}
                                        loadingText="Exporting..."
                                        variant="outline"
                                        size="sm"
                                        disabled={exportLoadingState !== null && exportLoadingState !== 'pdf'}
                                        className="flex items-center gap-2"
                                    >
                                        {exportLoadingState !== 'pdf' && <Download className="w-4 h-4" />}
                                        Export PDF
                                    </LoadingButton>
                                    <LoadingButton
                                        onClick={() => handleExport('excel')}
                                        isLoading={exportLoadingState === 'excel'}
                                        loadingText="Exporting..."
                                        variant="outline"
                                        size="sm"
                                        disabled={exportLoadingState !== null && exportLoadingState !== 'excel'}
                                        className="flex items-center gap-2"
                                    >
                                        {exportLoadingState !== 'excel' && <Download className="w-4 h-4" />}
                                        Export Excel
                                    </LoadingButton>
                                    <LoadingButton
                                        onClick={() => handleExport('word')}
                                        isLoading={exportLoadingState === 'word'}
                                        loadingText="Exporting..."
                                        variant="outline"
                                        size="sm"
                                        disabled={exportLoadingState !== null && exportLoadingState !== 'word'}
                                        className="flex items-center gap-2"
                                    >
                                        {exportLoadingState !== 'word' && <Download className="w-4 h-4" />}
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
