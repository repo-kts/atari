import React, { useState, useEffect, useMemo } from 'react'
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
import { getBreadcrumbsForPath, getRouteConfig, getSiblingRoutes } from '@/config/route'
import { DataManagementFormPage } from './DataManagementFormPage'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { getEntityTypeFromPath, getFieldValue, resolveTableFields } from '@/utils/masterUtils'
import { useAuth } from '@/contexts/AuthContext'
import { useDataSave } from '@/hooks/useDataSave'
import { useEntityHook, isBasicMasterEntity } from '@/hooks/useEntityHook'
import { useFormState } from '@/hooks/useFormState'
import { getHookLoading, getHookError } from '@/hooks/useHookState'
import { getEntityTypeChecks } from '@/utils/entityTypeHelpers'
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
    fields?: readonly string[] | string[]
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

    // Get user and permission helper from auth store
    const { user, hasPermission } = useAuth()

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
    const allSiblingRoutes = getSiblingRoutes(location.pathname)
    // Filter sibling tabs: only show tabs for routes the user has VIEW permission for
    const siblingRoutes = React.useMemo(
        () =>
            allSiblingRoutes.filter((r) => {
                const code = r.moduleCode
                if (!code) return true
                return hasPermission('VIEW', code)
            }),
        [allSiblingRoutes, hasPermission]
    )
    const moduleCode = routeConfig?.moduleCode
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

    // Check if KVK admin/user doesn't have kvkId linked
    const isKvkRoleWithoutKvk = user &&
        (user.role === 'kvk_admin' || user.role === 'kvk_user') &&
        !user.kvkId &&
        isAboutKvkEntity

    // Determine if "Add New" button should be shown
    const canUserCreate = () => {
        if (!user) return false
        if (moduleCode && !hasPermission('ADD', moduleCode)) return false
        // About KVK entities: check routeConfig.canCreate for KVKS, otherwise only KVK role can add details
        if (isAboutKvkEntity) {
            if (entityType === ENTITY_TYPES.KVKS) {
                // For KVKS, check routeConfig.canCreate (super_admin can create)
                if (routeConfig?.canCreate) {
                    return routeConfig.canCreate.includes(user.role)
                }
                return false
            }
            return user.role === 'kvk_admin' || user.role === 'kvk_user'
        }
        if (!routeConfig?.canCreate) return true
        return routeConfig.canCreate.includes(user.role)
    }
    const showAddButton = canUserCreate()

    // Determine if Edit button should be shown for a given item
    const canEditItem = (item: any) => {
        if (!user) return false
        const { isMiscellaneous, isSwachhtaBharatAbhiyaan, isMeetings } = getEntityTypeChecks(entityType)

        if (isAboutKvkEntity || isMiscellaneous || isSwachhtaBharatAbhiyaan || isMeetings) {
            if (moduleCode && !hasPermission('EDIT', moduleCode)) return false
            if (entityType === ENTITY_TYPES.KVKS) return true
            // Any non-kvk role that passed the permission gate above can edit all records
            if (user.role !== 'kvk_admin' && user.role !== 'kvk_user') return true
            // KVK roles can only edit their own data
            if (!item.transferStatus || item.transferStatus === 'ACTIVE') return true
            return item.kvkId === user.kvkId || item.kvk?.kvkId === user.kvkId
        }
        // Master data entities: explicit module EDIT permission is sufficient
        if (moduleCode) return hasPermission('EDIT', moduleCode)
        return user.role === 'super_admin'
    }

    // Determine if Delete button should be shown for a given item
    const canDeleteItem = (item: any) => {
        if (!user) return false
        const { isMiscellaneous, isSwachhtaBharatAbhiyaan, isMeetings } = getEntityTypeChecks(entityType)

        if (isAboutKvkEntity || isMiscellaneous || isSwachhtaBharatAbhiyaan || isMeetings) {
            if (moduleCode && !hasPermission('DELETE', moduleCode)) return false
            if (entityType === ENTITY_TYPES.KVKS) return true
            // Any non-kvk role that passed the permission gate above can delete all records
            if (user.role !== 'kvk_admin' && user.role !== 'kvk_user') return true
            // KVK roles can only delete their own data
            if (!item.transferStatus || item.transferStatus === 'ACTIVE') return true
            return item.kvkId === user.kvkId || item.kvk?.kvkId === user.kvkId
        }
        // Master data entities: explicit module DELETE permission is sufficient
        if (moduleCode) return hasPermission('DELETE', moduleCode)
        return user.role === 'super_admin'
    }
    // Use data directly from the hook — React Query updates this reference on every
    // successful mutation/invalidation, so the table re-renders automatically without
    // needing a manual local state layer or a page refresh.
    const items = Array.isArray(activeHook?.data) ? activeHook.data : []

    // Resolve fields using centralized utility function
    // This ensures fields are always available even when there's no data
    const fields = useMemo(
        () => resolveTableFields(routeConfig, propFields),
        [routeConfig, propFields]
    )
    const itemsPerPage = 10

    // Reset pagination/search when route changes (tab switch)
    useEffect(() => {
        setSearchQuery('')
        setCurrentPage(1)
        closeForm()
    }, [location.pathname, closeForm])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
            setCurrentPage(1)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Filter data based on search - memoized for performance
    const filteredData = useMemo(() => {
        if (!debouncedSearch.trim()) return items

        const query = debouncedSearch.toLowerCase()
        return items.filter((item: any) => {
            return fields.some(field => {
                const value = getFieldValue(item, field)
                return value && String(value).toLowerCase().includes(query)
            })
        })
    }, [items, debouncedSearch, fields])

    // Pagination calculations - memoized for performance
    const paginationData = useMemo(() => {
        const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
        // Clamp currentPage so it never points beyond the last page (e.g. after a search narrows results)
        const safePage = Math.min(currentPage, totalPages)
        const startIndex = (safePage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const paginatedData = filteredData.slice(startIndex, endIndex)

        return { totalPages, safePage, startIndex, endIndex, paginatedData }
    }, [filteredData, currentPage, itemsPerPage])

    const { totalPages, safePage, startIndex, endIndex, paginatedData } = paginationData

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
                                    // Special handling for different categories
                                    if (routeConfig?.category === 'Projects') {
                                        // Always go back to projects overview for any project sub-page
                                        navigate('/forms/achievements/projects')
                                    } else if (routeConfig?.category === 'All Masters' && breadcrumbs.length > 1) {
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
                                        // Fallback: go to second-to-last breadcrumb that has a valid path
                                        const parentBreadcrumb = [...breadcrumbs].reverse()[1]
                                        if (parentBreadcrumb?.path) {
                                            navigate(parentBreadcrumb.path)
                                        } else {
                                            navigate('/forms')
                                        }
                                    } else {
                                        navigate('/dashboard')
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
                            ) : isKvkRoleWithoutKvk ? (
                                <div className="flex-1 bg-white rounded-xl border border-[#E0E0E0] overflow-hidden flex flex-col min-h-0 relative shadow-sm">
                                    <div className="absolute inset-0 overflow-auto flex items-center justify-center">
                                        <div className="text-center px-6 py-12">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F5F5F5] mb-4">
                                                <svg className="w-8 h-8 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-[#212121] mb-2">No KVK Linked</h3>
                                            <p className="text-[#757575] mb-4">You do not have a linked KVK yet. Please contact administrator to assign a KVK to your account.</p>
                                        </div>
                                    </div>
                                </div>
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
                                        currentPage={safePage}
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
