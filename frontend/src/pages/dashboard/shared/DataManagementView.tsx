import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
    Plus,
    Download,
    ChevronLeft,
    ArrowRight,
    FilePlus2,
    FilePenLine,
    ChevronDown,
    RotateCcw,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { TabNavigation } from '@/components/common/TabNavigation'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { Pagination } from '@/components/common/DataTable/Pagination'
import { SearchInput } from '@/components/common/SearchInput'
import { LoadingState } from '@/components/common/LoadingState'
// import { ErrorState } from '@/components/common/ErrorState'
import {
    getBreadcrumbsForPath,
    getRouteConfig,
    getSiblingRoutes,
} from '@/config/route'
import { DataManagementFormPage } from './DataManagementFormPage'
import { getExportTemplateKey } from './dataManagementExportTemplateKeys'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import {
    getEntityTypeFromPath,
    getFieldValue,
    resolveTableFields,
} from '@/utils/masterUtils'
import { useAuth } from '@/contexts/AuthContext'
import { useDataSave } from '@/hooks/useDataSave'
import { useEntityHook, isBasicMasterEntity } from '@/hooks/useEntityHook'
import { useFormState } from '@/hooks/useFormState'
import { getHookLoading } from '@/hooks/useHookState'
import { getEntityTypeChecks } from '@/utils/entityTypeHelpers'
import { TransferModal } from '@/components/forms/TransferModal'
import { TransferHistoryModal } from '@/components/forms/TransferHistoryModal'
import type { KvkEmployee } from '@/types/aboutKvk'
import { useConfirm } from '@/hooks/useConfirm'
import { useAlert } from '@/hooks/useAlert'
import { useDeleteHandler } from '@/hooks/useDeleteHandler'
import { useEditHandler } from '@/hooks/useEditHandler'
import { useExportHandler } from '@/hooks/useExportHandler'
import { useToast } from '@/hooks/useToast'
import {
    useTransferOftToNextYear,
    useTransferFldToNextYear,
    useCreateOftResult,
    useUpdateOftResult,
    useOftResult,
    useFldResult,
    useCreateFldResult,
    useUpdateFldResult,
} from '@/hooks/useOftWorkflow'
import { useTransferCfldTechnicalToNextYear } from '@/hooks/useCfldWorkflow'
import {
    OftResultForm,
    OftResultFormValue,
} from './forms/achievement/OftResultForm'
import {
    FldResultForm,
    FldResultValue,
} from './forms/achievement/FldResultForm'
import { DatePicker } from '@/components/ui/date-picker'
import { formatLocalDateYmd } from '@/utils/dateLocalYmd'
import { itemMatchesDateRangeFilter } from '@/utils/itemDateFilter'
import {
    NariNutritionalGardenResultForm,
    NariNutritionalGardenResultValue,
} from './forms/achievement/NariNutritionalGardenResultForm'
import {
    NariBioFortifiedResultForm,
    NariBioFortifiedResultValue,
} from './forms/achievement/NariBioFortifiedResultForm'
import {
    NariValueAdditionResultForm,
    NariValueAdditionResultValue,
} from './forms/achievement/NariValueAdditionResultForm'
import { useNariResult } from '@/hooks/useNariResult'

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
    const [selectedEmployee, setSelectedEmployee] =
        useState<KvkEmployee | null>(null)

    // Get user and permission helper from auth store
    const { user, hasPermission } = useAuth()

    // Modal hooks
    const { confirm, ConfirmDialog } = useConfirm()
    const { alert, AlertDialog } = useAlert()
    const { toast, ToastContainer } = useToast()

    // Handler hooks
    const { handleMasterDataDelete } = useDeleteHandler({ confirm, alert })
    const { handleEdit: handleEditItem } = useEditHandler()
    const {
        handleExport: handleExportData,
        exportLoading: exportLoadingState,
    } = useExportHandler()
    const transferOftMutation = useTransferOftToNextYear()
    const transferFldMutation = useTransferFldToNextYear()
    const transferCfldMutation = useTransferCfldTechnicalToNextYear()
    const createOftResultMutation = useCreateOftResult()
    const updateOftResultMutation = useUpdateOftResult()
    const createFldResultMutation = useCreateFldResult()
    const updateFldResultMutation = useUpdateFldResult()
    const [isOftResultPageOpen, setIsOftResultPageOpen] = useState(false)
    const [oftResultMode, setOftResultMode] = useState<'create' | 'edit'>(
        'create'
    )
    const [selectedOftId, setSelectedOftId] = useState<number | string | null>(
        null
    )
    const [selectedOftItem, setSelectedOftItem] = useState<any>(null)
    const oftResultQuery = useOftResult(selectedOftId || undefined)
    const [isFldResultPageOpen, setIsFldResultPageOpen] = useState(false)
    const [fldResultMode, setFldResultMode] = useState<'create' | 'edit'>(
        'create'
    )
    const [selectedFldId, setSelectedFldId] = useState<number | string | null>(
        null
    )
    const [selectedFldItem, setSelectedFldItem] = useState<any>(null)
    const fldResultQuery = useFldResult(selectedFldId || undefined)

    const [isNariNutriResultPageOpen, setIsNariNutriResultPageOpen] =
        useState(false)
    const [selectedNariNutriId, setSelectedNariNutriId] = useState<
        number | string | null
    >(null)
    const nariNutriResult = useNariResult(
        ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN,
        selectedNariNutriId
    )

    const [isNariBioResultPageOpen, setIsNariBioResultPageOpen] =
        useState(false)
    const [selectedNariBioId, setSelectedNariBioId] = useState<
        number | string | null
    >(null)
    const nariBioResult = useNariResult(
        ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED,
        selectedNariBioId
    )

    const [isNariValueResultPageOpen, setIsNariValueResultPageOpen] =
        useState(false)
    const [selectedNariValueId, setSelectedNariValueId] = useState<
        number | string | null
    >(null)
    const nariValueResult = useNariResult(
        ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION,
        selectedNariValueId
    )

    // Route meta, siblings & breadcrumbs
    const routeConfig = getRouteConfig(location.pathname)
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)
    const allSiblingRoutes = getSiblingRoutes(location.pathname)
    // Filter sibling tabs: only show tabs for routes the user has VIEW permission for
    const siblingRoutes = React.useMemo(
        () =>
            allSiblingRoutes.filter(r => {
                const code = r.moduleCode
                if (!code) return true
                return hasPermission('VIEW', code)
            }),
        [allSiblingRoutes, hasPermission]
    )
    const moduleCode = routeConfig?.moduleCode
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [reportingYearFrom, setReportingYearFrom] = useState<string>('')
    const [reportingYearTo, setReportingYearTo] = useState<string>('')
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
    const [isMobileRouteMenuOpen, setIsMobileRouteMenuOpen] = useState(false)
    const [isOftFldTabMenuOpen, setIsOftFldTabMenuOpen] = useState(false)

    const mobileRouteMenuRef = useRef<HTMLDivElement | null>(null)
    const exportMenuRef = useRef<HTMLDivElement | null>(null)
    const oftFldTabMenuRef = useRef<HTMLDivElement | null>(null)

    // Get entity type from path
    const entityType = getEntityTypeFromPath(location.pathname)

    // Use centralized hook factory
    const activeHook = useEntityHook(entityType)

    // Check if this is Employee Details view
    const isEmployeeDetails = entityType === ENTITY_TYPES.KVK_EMPLOYEES

    // Check if this is an About KVK entity
    const { isAboutKvk: isAboutKvkEntity } = getEntityTypeChecks(entityType)

    // Check if KVK admin/user doesn't have kvkId linked
    const isKvkRoleWithoutKvk =
        user &&
        (user.role === 'kvk_admin' || user.role === 'kvk_user') &&
        !user.kvkId &&
        isAboutKvkEntity

    // Determine if "Add New" button should be shown
    const canUserCreate = () => {
        if (!user) return false
        if (moduleCode && !hasPermission('ADD', moduleCode)) return false
        // Explicit opt-out via routeConfig wins for everyone, regardless of role.
        if (routeConfig?.canCreate === 'none') return false
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
        const { isMiscellaneous, isSwachhtaBharatAbhiyaan, isMeetings } =
            getEntityTypeChecks(entityType)

        if (
            isAboutKvkEntity ||
            isMiscellaneous ||
            isSwachhtaBharatAbhiyaan ||
            isMeetings
        ) {
            if (moduleCode && !hasPermission('EDIT', moduleCode)) return false
            if (entityType === ENTITY_TYPES.KVKS) return true
            // Any non-kvk role that passed the permission gate above can edit all records
            if (user.role !== 'kvk_admin' && user.role !== 'kvk_user')
                return true
            // KVK roles can only edit their own data
            if (!item.transferStatus || item.transferStatus === 'ACTIVE')
                return true
            return item.kvkId === user.kvkId || item.kvk?.kvkId === user.kvkId
        }
        // Master data entities: explicit module EDIT permission is sufficient
        if (moduleCode) return hasPermission('EDIT', moduleCode)
        return user.role === 'super_admin'
    }

    // Determine if Delete button should be shown for a given item
    const canDeleteItem = (item: any) => {
        if (!user) return false
        const { isMiscellaneous, isSwachhtaBharatAbhiyaan, isMeetings } =
            getEntityTypeChecks(entityType)

        if (
            isAboutKvkEntity ||
            isMiscellaneous ||
            isSwachhtaBharatAbhiyaan ||
            isMeetings
        ) {
            if (moduleCode && !hasPermission('DELETE', moduleCode)) return false
            if (entityType === ENTITY_TYPES.KVKS) return true
            // Any non-kvk role that passed the permission gate above can delete all records
            if (user.role !== 'kvk_admin' && user.role !== 'kvk_user')
                return true
            // KVK roles can only delete their own data
            if (!item.transferStatus || item.transferStatus === 'ACTIVE')
                return true
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

    useEffect(() => {
        setCurrentPage(1)
    }, [reportingYearFrom, reportingYearTo])

    const reportingRangeTodayIso = formatLocalDateYmd()
    const reportingFromMaxIso = !reportingYearTo
        ? reportingRangeTodayIso
        : reportingYearTo < reportingRangeTodayIso
            ? reportingYearTo
            : reportingRangeTodayIso

    useEffect(() => {
        if (
            reportingYearFrom &&
            reportingYearTo &&
            reportingYearFrom > reportingYearTo
        ) {
            setReportingYearTo('')
        }
    }, [reportingYearFrom, reportingYearTo])

    // Filter data based on search - memoized for performance
    const filteredData = useMemo(() => {
        const maxDate = new Date()
        maxDate.setHours(23, 59, 59, 999)
        const rawFromDate = reportingYearFrom
            ? new Date(reportingYearFrom)
            : null
        if (rawFromDate) rawFromDate.setHours(0, 0, 0, 0)
        const rawToDate = reportingYearTo ? new Date(reportingYearTo) : null
        if (rawToDate) rawToDate.setHours(23, 59, 59, 999)
        const fromDate =
            rawFromDate && rawToDate
                ? rawFromDate <= rawToDate
                    ? rawFromDate
                    : rawToDate
                : rawFromDate
        const toDate =
            rawFromDate && rawToDate
                ? rawFromDate <= rawToDate
                    ? rawToDate
                    : rawFromDate
                : rawToDate
        const yearFiltered = items.filter((item: any) =>
            itemMatchesDateRangeFilter(item, fromDate, toDate, maxDate)
        )

        if (!debouncedSearch.trim()) return yearFiltered

        const query = debouncedSearch.toLowerCase()
        return yearFiltered.filter((item: any) => {
            return fields.some(field => {
                const value = getFieldValue(item, field)
                return value && String(value).toLowerCase().includes(query)
            })
        })
    }, [items, debouncedSearch, fields, reportingYearFrom, reportingYearTo])

    // Pagination calculations - memoized for performance
    const paginationData = useMemo(() => {
        const totalPages = Math.max(
            1,
            Math.ceil(filteredData.length / itemsPerPage)
        )
        // Clamp currentPage so it never points beyond the last page (e.g. after a search narrows results)
        const safePage = Math.min(currentPage, totalPages)
        const startIndex = (safePage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const paginatedData = filteredData.slice(startIndex, endIndex)

        return { totalPages, safePage, startIndex, endIndex, paginatedData }
    }, [filteredData, currentPage, itemsPerPage])

    const { totalPages, safePage, startIndex, endIndex, paginatedData } =
        paginationData

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
            console.warn('Cannot delete: missing activeHook or entityType', {
                activeHook,
                entityType,
            })
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

    const normalizeOftStatus = (status: unknown): string =>
        String(status || '')
            .toUpperCase()
            .trim()

    const handleTransferOftToNextYear = async (item: any) => {
        const id = item?.id ?? item?.kvkOftId
        if (!id) {
            alert({
                title: 'Error',
                message: 'Unable to transfer OFT: missing record id.',
                variant: 'error',
            })
            return
        }
        try {
            await transferOftMutation.mutateAsync(id)
            alert({
                title: 'Success',
                message: 'OFT transferred to next reporting year successfully.',
                variant: 'success',
                autoClose: true,
            })
        } catch (err: any) {
            alert({
                title: 'Transfer failed',
                message: err?.message || 'Unable to transfer OFT.',
                variant: 'error',
            })
        }
    }

    const handleTransferFldToNextYear = async (item: any) => {
        const id = item?.id ?? item?.kvkFldId
        if (!id) {
            alert({
                title: 'Error',
                message: 'Unable to transfer FLD: missing record id.',
                variant: 'error',
            })
            return
        }
        try {
            await transferFldMutation.mutateAsync(id)
            alert({
                title: 'Success',
                message: 'FLD transferred to next reporting year successfully.',
                variant: 'success',
                autoClose: true,
            })
        } catch (err: any) {
            alert({
                title: 'Transfer failed',
                message: err?.message || 'Unable to transfer FLD.',
                variant: 'error',
            })
        }
    }

    const handleTransferCfldToNextYear = async (item: any) => {
        const id = item?.id ?? item?.cfldTechId
        if (!id) {
            alert({
                title: 'Error',
                message: 'Unable to transfer CFLD: missing record id.',
                variant: 'error',
            })
            return
        }
        try {
            await transferCfldMutation.mutateAsync(id)
            alert({
                title: 'Success',
                message:
                    'CFLD transferred to next reporting year successfully.',
                variant: 'success',
                autoClose: true,
            })
        } catch (err: any) {
            alert({
                title: 'Transfer failed',
                message: err?.message || 'Unable to transfer CFLD.',
                variant: 'error',
            })
        }
    }

    const openCfldSectionForm = (
        item: any,
        section: 'technical' | 'economic' | 'socio' | 'perception'
    ) => {
        openForm({
            ...item,
            cfldActiveSection: section,
        })
    }

    const handleAddOftResult = (item: any) => {
        const id = item?.id ?? item?.kvkOftId
        if (!id) return
        setOftResultMode('create')
        setSelectedOftId(id)
        setSelectedOftItem(item || null)
        setIsOftResultPageOpen(true)
    }

    const handleEditOftResult = (item: any) => {
        const id = item?.id ?? item?.kvkOftId
        if (!id) return
        setOftResultMode('edit')
        setSelectedOftId(id)
        setSelectedOftItem(item || null)
        setIsOftResultPageOpen(true)
    }

    const handleSubmitOftResult = async (payload: OftResultFormValue) => {
        if (!selectedOftId) return
        if (oftResultMode === 'create') {
            await createOftResultMutation.mutateAsync({
                id: selectedOftId,
                payload,
            })
        } else {
            await updateOftResultMutation.mutateAsync({
                id: selectedOftId,
                payload,
            })
        }
        alert({
            title: 'Success',
            message:
                oftResultMode === 'create'
                    ? 'OFT result created successfully.'
                    : 'OFT result updated successfully.',
            variant: 'success',
            autoClose: true,
        })
    }

    const handleAddFldResult = (item: any) => {
        const id = item?.id ?? item?.kvkFldId
        if (!id) return
        setFldResultMode('create')
        setSelectedFldId(id)
        setSelectedFldItem(item || null)
        setIsFldResultPageOpen(true)
    }

    const handleEditFldResult = (item: any) => {
        const id = item?.id ?? item?.kvkFldId
        if (!id) return
        setFldResultMode('edit')
        setSelectedFldId(id)
        setSelectedFldItem(item || null)
        setIsFldResultPageOpen(true)
    }

    const tabButtonClass = (active: boolean) =>
        active
            ? 'px-4 py-2 bg-white text-[#487749] rounded-xl text-sm font-medium transition-all'
            : 'px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-[#487749]/80 transition-all'

    const renderOftFldTabs = (opts: {
        mode: 'edit' | 'add-result' | 'edit-result'
        kind: 'oft' | 'fld'
        item: any
    }) => {
        const item = opts.item
        if (!item) return null

        const normalized = normalizeOftStatus(
            item.status || item.ongoingCompleted
        )
        const canAdd = normalized === 'ONGOING'
        const canEditResult = normalized === 'COMPLETED'

        const labelEdit = opts.kind === 'oft' ? 'Edit OFT' : 'Edit FLD'

        const goEdit = () => {
            if (opts.kind === 'oft') {
                setIsOftResultPageOpen(false)
                setSelectedOftId(null)
            } else {
                setIsFldResultPageOpen(false)
                setSelectedFldId(null)
            }
            openForm(item)
        }

        const goAdd = () => {
            if (!canAdd) return
            closeForm()
            if (opts.kind === 'oft') handleAddOftResult(item)
            else handleAddFldResult(item)
        }

        const goEditResult = () => {
            if (!canEditResult) return
            closeForm()
            if (opts.kind === 'oft') handleEditOftResult(item)
            else handleEditFldResult(item)
        }

        const options: Array<{
            value: 'edit' | 'add-result' | 'edit-result'
            label: string
            isVisible: boolean
        }> = [
                { value: 'edit', label: labelEdit, isVisible: true },
                { value: 'add-result', label: 'Add Result', isVisible: canAdd },
                {
                    value: 'edit-result',
                    label: 'Edit Result',
                    isVisible: canEditResult,
                },
            ]

        return (
            <>
                {/* Desktop tabs */}
                <div className="hidden sm:flex mb-4 flex-wrap gap-2 w-fit rounded-2xl p-1 bg-[#3d6540]">
                    <button
                        type="button"
                        className={tabButtonClass(opts.mode === 'edit')}
                        onClick={goEdit}
                    >
                        {labelEdit}
                    </button>
                    {canAdd && (
                        <button
                            type="button"
                            className={tabButtonClass(
                                opts.mode === 'add-result'
                            )}
                            onClick={goAdd}
                        >
                            Add Result
                        </button>
                    )}
                    {canEditResult && (
                        <button
                            type="button"
                            className={tabButtonClass(
                                opts.mode === 'edit-result'
                            )}
                            onClick={goEditResult}
                        >
                            Edit Result
                        </button>
                    )}
                </div>

                {/* Mobile dropdown (custom menu like Download) */}
                <div className="sm:hidden mb-4">
                    <div
                        ref={oftFldTabMenuRef}
                        className="relative inline-flex bg-red-300 max-w-[90vw]"
                    >
                        <button
                            type="button"
                            onClick={() => setIsOftFldTabMenuOpen(v => !v)}
                            className="inline-flex items-center gap-2 px-4 border border-[#E0E0E0] rounded-xl bg-white text-sm font-medium text-[#212121] hover:bg-[#F5F5F5] transition-colors"
                        >
                            {options.find(o => o.value === opts.mode)?.label ||
                                'Select'}
                            <ChevronDown className="w-4 h-4 text-[#757575]" />
                        </button>

                        {isOftFldTabMenuOpen && (
                            <div className="absolute z-50 mt-1 w-60 max-w-[90vw] rounded-2xl border border-[#E0E0E0] bg-white p-1">
                                {options
                                    .filter(o => o.isVisible)
                                    .map(o => {
                                        const selected = o.value === opts.mode
                                        return (
                                            <button
                                                key={o.value}
                                                type="button"
                                                onClick={() => {
                                                    setIsOftFldTabMenuOpen(
                                                        false
                                                    )
                                                    if (o.value === 'edit')
                                                        goEdit()
                                                    else if (
                                                        o.value === 'add-result'
                                                    )
                                                        goAdd()
                                                    else if (
                                                        o.value ===
                                                        'edit-result'
                                                    )
                                                        goEditResult()
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm rounded-xl border transition-colors ${selected
                                                    ? 'bg-[#E8F5E9] text-[#2e5a31] font-medium border-[#C8E6C9]'
                                                    : 'text-[#212121] border-transparent hover:bg-[#F5F5F5] hover:border-[#E0E0E0]'
                                                    }`}
                                            >
                                                {o.label}
                                            </button>
                                        )
                                    })}
                            </div>
                        )}
                    </div>
                </div>
            </>
        )
    }

    const handleSubmitFldResult = async (payload: FldResultValue) => {
        if (!selectedFldId) return
        if (fldResultMode === 'create') {
            await createFldResultMutation.mutateAsync({
                id: selectedFldId,
                payload,
            })
        } else {
            await updateFldResultMutation.mutateAsync({
                id: selectedFldId,
                payload,
            })
        }
        alert({
            title: 'Success',
            message:
                fldResultMode === 'create'
                    ? 'FLD result created successfully.'
                    : 'FLD result updated successfully.',
            variant: 'success',
            autoClose: true,
        })
    }

    const handleSubmitNariNutriResult = async (
        payload: NariNutritionalGardenResultValue
    ) => {
        if (!selectedNariNutriId) return
        try {
            await nariNutriResult.saveResult(payload)
            alert({
                title: 'Success',
                message: 'Nutrition Garden result saved successfully.',
                variant: 'success',
                autoClose: true,
            })
        } catch (err: any) {
            alert({
                title: 'Error',
                message:
                    err?.response?.data?.message ||
                    err?.message ||
                    'Failed to save result',
                variant: 'error',
            })
        }
    }

    const handleSubmitNariBioResult = async (
        payload: NariBioFortifiedResultValue
    ) => {
        if (!selectedNariBioId) return
        try {
            await nariBioResult.saveResult(payload)
            alert({
                title: 'Success',
                message: 'Bio Fortified result saved successfully.',
                variant: 'success',
                autoClose: true,
            })
        } catch (err: any) {
            alert({
                title: 'Error',
                message:
                    err?.response?.data?.message ||
                    err?.message ||
                    'Failed to save result',
                variant: 'error',
            })
        }
    }

    const handleSubmitNariValueResult = async (
        payload: NariValueAdditionResultValue
    ) => {
        if (!selectedNariValueId) return
        try {
            await nariValueResult.saveResult(payload)
            alert({
                title: 'Success',
                message: 'Value Addition result saved successfully.',
                variant: 'success',
                autoClose: true,
            })
        } catch (err: any) {
            alert({
                title: 'Error',
                message:
                    err?.response?.data?.message ||
                    err?.message ||
                    'Failed to save result',
                variant: 'error',
            })
        }
    }

    const statusValue = (item: any) =>
        normalizeOftStatus(item.status || item.ongoingCompleted)
    const oftCustomActions =
        entityType === ENTITY_TYPES.ACHIEVEMENT_OFT
            ? [
                {
                    key: 'transfer-next-year',
                    label: 'Transfer',
                    onClick: handleTransferOftToNextYear,
                    isVisible: (item: any) => statusValue(item) === 'ONGOING',
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors',
                    icon: ArrowRight,
                },
                {
                    key: 'add-result',
                    label: 'Add Result',
                    onClick: handleAddOftResult,
                    isVisible: (item: any) => statusValue(item) === 'ONGOING',
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors',
                    icon: FilePlus2,
                },
                {
                    key: 'edit-result',
                    label: 'Edit Result',
                    onClick: handleEditOftResult,
                    isVisible: (item: any) =>
                        statusValue(item) === 'COMPLETED',
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 transition-colors',
                    icon: FilePenLine,
                },
            ]
            : []

    const fldCustomActions =
        entityType === ENTITY_TYPES.ACHIEVEMENT_FLD
            ? [
                {
                    key: 'transfer-next-year',
                    label: 'Transfer',
                    onClick: handleTransferFldToNextYear,
                    isVisible: (item: any) => statusValue(item) === 'ONGOING',
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors',
                    icon: ArrowRight,
                },
                {
                    key: 'add-result',
                    label: 'Add Result',
                    onClick: handleAddFldResult,
                    isVisible: (item: any) => statusValue(item) === 'ONGOING',
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors',
                    icon: FilePlus2,
                },
                {
                    key: 'edit-result',
                    label: 'Edit Result',
                    onClick: handleEditFldResult,
                    isVisible: (item: any) =>
                        statusValue(item) === 'COMPLETED',
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 transition-colors',
                    icon: FilePenLine,
                },
            ]
            : []
    const cfldCustomActions =
        entityType === ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM
            ? [
                {
                    key: 'transfer-next-year',
                    label: 'Transfer',
                    onClick: handleTransferCfldToNextYear,
                    isVisible: (item: any) => item?.status === 'ONGOING',
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors',
                    icon: ArrowRight,
                },
                {
                    key: 'economic-params',
                    label: 'Economic Parameters',
                    onClick: (item: any) =>
                        openCfldSectionForm(item, 'economic'),
                    isVisible: (item: any) => {
                        const normalized = normalizeOftStatus(item?.status)
                        return (
                            normalized !== 'TRANSFERRED' &&
                            normalized !== 'COMPLETED'
                        )
                    },
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors',
                    icon: FilePenLine,
                },
                {
                    key: 'socio-params',
                    label: 'Update Socio Economic Parameters',
                    onClick: (item: any) =>
                        openCfldSectionForm(item, 'socio'),
                    isVisible: (item: any) => {
                        const normalized = normalizeOftStatus(item?.status)
                        return (
                            normalized !== 'TRANSFERRED' &&
                            normalized !== 'COMPLETED'
                        )
                    },
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors',
                    icon: FilePenLine,
                },
                {
                    key: 'perception-params',
                    label: 'Farmers Perception Parameters',
                    onClick: (item: any) =>
                        openCfldSectionForm(item, 'perception'),
                    isVisible: (item: any) => {
                        const normalized = normalizeOftStatus(item?.status)
                        return (
                            normalized !== 'TRANSFERRED' &&
                            normalized !== 'COMPLETED'
                        )
                    },
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors',
                    icon: FilePenLine,
                },
            ]
            : []

    const nariCustomActions =
        entityType === ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN ||
            entityType === ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED ||
            entityType === ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION
            ? [
                {
                    key: 'create-result',
                    label: 'Create Result',
                    onClick: (item: any) => {
                        if (
                            entityType ===
                            ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN
                        ) {
                            setSelectedNariNutriId(item.id)
                            setIsNariNutriResultPageOpen(true)
                        } else if (
                            entityType ===
                            ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED
                        ) {
                            setSelectedNariBioId(item.id)
                            setIsNariBioResultPageOpen(true)
                        } else if (
                            entityType ===
                            ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION
                        ) {
                            setSelectedNariValueId(item.id)
                            setIsNariValueResultPageOpen(true)
                        }
                    },
                    isVisible: (item: any) =>
                        statusValue(item) !== 'COMPLETED',
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-[#487749] text-[#487749] hover:bg-[#E8F5E9] transition-colors',
                    icon: FilePlus2,
                },
                {
                    key: 'edit-result',
                    label: 'Edit Result',
                    onClick: (item: any) => {
                        if (
                            entityType ===
                            ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN
                        ) {
                            setSelectedNariNutriId(item.id)
                            setIsNariNutriResultPageOpen(true)
                        } else if (
                            entityType ===
                            ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED
                        ) {
                            setSelectedNariBioId(item.id)
                            setIsNariBioResultPageOpen(true)
                        } else if (
                            entityType ===
                            ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION
                        ) {
                            setSelectedNariValueId(item.id)
                            setIsNariValueResultPageOpen(true)
                        }
                    },
                    isVisible: (item: any) =>
                        statusValue(item) === 'COMPLETED',
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 transition-colors',
                    icon: FilePenLine,
                },
            ]
            : []

    // Custom hook for save operations with proper error handling
    const { save: saveData, isSaving } = useDataSave({
        entityType,
        activeHook: activeHook,
        isBasicMasterEntity: isBasicMasterEntity(entityType) || false,
        onSuccess: closeForm,
        onError: (err: Error) => {
            toast({
                title: 'Save failed',
                message: err.message || 'Failed to save',
                variant: 'error',
                autoCloseDelay: 4500,
            })
        },
    })

    /**
     * Handles saving form data (create or update)
     * Uses centralized transformation utilities and custom hook for data sanitization
     */
    const handleSaveModal = async () => {
        if (activeHook && entityType) {
            await saveData(formData, editingItem)
        } else {
            console.warn('Cannot save: missing activeHook or entityType', {
                activeHook,
                entityType,
            })
        }
    }

    const handleExport = async (format: 'pdf' | 'excel' | 'word' | 'csv') => {
        const templateKey = getExportTemplateKey(entityType)
        // Prevent empty custom-template exports when transient UI filters narrow to zero rows.
        const exportDataSource =
            templateKey && filteredData.length === 0 && items.length > 0
                ? items
                : filteredData

        await handleExportData(format, {
            title,
            fields,
            data: exportDataSource,
            pathname: location.pathname,
            templateKey,
            ...(templateKey === 'world-soil-day-page-report'
                ? {
                    isAggregatedReport:
                        user?.role !== 'kvk_admin' &&
                        user?.role !== 'kvk_user',
                }
                : {}),
        })
    }

    const multiFormNote = useMemo(() => {
        if (entityType === ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM) {
            return 'Note: Please mark your record as completed only after adding Technical + Economic + Socio-Economic + Farmers Perception details.'
        }
        if (entityType === ENTITY_TYPES.ACHIEVEMENT_OFT) {
            return 'Note: Please mark your result as completed after adding the OFT result details.'
        }
        if (entityType === ENTITY_TYPES.ACHIEVEMENT_FLD) {
            return 'Note: Please mark your result as completed after adding the FLD result details.'
        }
        return null
    }, [entityType])

    const exportFormatOptions = useMemo(
        () =>
            [
                { value: 'pdf', label: 'PDF' },
                { value: 'excel', label: 'Excel' },
                { value: 'word', label: 'Word' },
            ] as const,
        []
    )

    useEffect(() => {
        const onDocMouseDown = (e: MouseEvent) => {
            const target = e.target as Node
            if (
                isMobileRouteMenuOpen &&
                mobileRouteMenuRef.current &&
                !mobileRouteMenuRef.current.contains(target)
            ) {
                setIsMobileRouteMenuOpen(false)
            }
            if (
                isExportMenuOpen &&
                exportMenuRef.current &&
                !exportMenuRef.current.contains(target)
            ) {
                setIsExportMenuOpen(false)
            }
            if (
                isOftFldTabMenuOpen &&
                oftFldTabMenuRef.current &&
                !oftFldTabMenuRef.current.contains(target)
            ) {
                setIsOftFldTabMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', onDocMouseDown)
        return () => document.removeEventListener('mousedown', onDocMouseDown)
    }, [isMobileRouteMenuOpen, isExportMenuOpen, isOftFldTabMenuOpen])

    const loading = getHookLoading(activeHook)

    return (
        <div className="flex flex-col h-full bg-white sm:rounded-2xl p-1 overflow-hidden">
            {/* Back + Breadcrumbs + Tabs - Fixed Header (hidden when form is open) */}
            {!isFormPageOpen &&
                !isOftResultPageOpen &&
                !isFldResultPageOpen &&
                !isNariNutriResultPageOpen &&
                !isNariBioResultPageOpen &&
                !isNariValueResultPageOpen && (
                    <div className="flex-none bg-white relative z-20 px-3 md:px-5">
                        {breadcrumbs.length > 0 && (
                            <div className="flex flex-row items-center gap-3 sm:gap-4 pt-4 pb-4">
                                <button
                                    onClick={() => {
                                        if (
                                            routeConfig?.category === 'Projects'
                                        ) {
                                            navigate(
                                                '/forms/achievements/projects'
                                            )
                                        } else if (
                                            routeConfig?.category ===
                                            'All Masters' &&
                                            breadcrumbs.length > 1
                                        ) {
                                            const subcategoryPath =
                                                breadcrumbs[1]?.path
                                            if (subcategoryPath) {
                                                navigate(subcategoryPath)
                                            } else if (
                                                routeConfig?.subcategoryPath
                                            ) {
                                                navigate(
                                                    routeConfig.subcategoryPath
                                                )
                                            } else {
                                                navigate('/all-master')
                                            }
                                        } else if (
                                            routeConfig?.subcategoryPath
                                        ) {
                                            navigate(
                                                routeConfig.subcategoryPath
                                            )
                                        } else if (routeConfig?.parent) {
                                            navigate(routeConfig.parent)
                                        } else if (breadcrumbs.length > 1) {
                                            const parentBreadcrumb = [
                                                ...breadcrumbs,
                                            ].reverse()[1]
                                            if (parentBreadcrumb?.path) {
                                                navigate(parentBreadcrumb.path)
                                            } else {
                                                navigate('/forms')
                                            }
                                        } else {
                                            navigate('/dashboard')
                                        }
                                    }}
                                    className="self-start flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <div className="w-full">
                                    <Breadcrumbs
                                        items={breadcrumbs.map((b, i) => ({
                                            ...b,
                                            level: i,
                                        }))}
                                        showHome={false}
                                    />
                                </div>
                            </div>
                        )}

                        {siblingRoutes.length > 1 && (
                            <div className="pb-2">
                                <div className="hidden sm:block">
                                    <TabNavigation
                                        tabs={siblingRoutes.map(r => ({
                                            label: r.title,
                                            path: r.path,
                                        }))}
                                        currentPath={location.pathname}
                                    />
                                </div>
                                <div className="sm:hidden">
                                    <div
                                        ref={mobileRouteMenuRef}
                                        className="relative inline-flex max-w-[90vw] h-11"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsMobileRouteMenuOpen(
                                                    v => !v
                                                )
                                            }
                                            className="inline-flex items-center gap-2 px-3 border border-[#E0E0E0] rounded-xl bg-white text-sm font-medium text-[#212121] hover:bg-[#F5F5F5] transition-colors"
                                        >
                                            {siblingRoutes.find(
                                                r =>
                                                    r.path === location.pathname
                                            )?.title || 'Select'}
                                            <ChevronDown className="w-4 h-4 text-[#757575]" />
                                        </button>
                                        {isMobileRouteMenuOpen && (
                                            <div className="absolute z-50 mt-1 w-60 max-w-[90vw] rounded-2xl border border-[#E0E0E0] bg-white p-1">
                                                {siblingRoutes.map(r => {
                                                    const selected =
                                                        r.path ===
                                                        location.pathname
                                                    return (
                                                        <button
                                                            key={r.path}
                                                            type="button"
                                                            onClick={() => {
                                                                setIsMobileRouteMenuOpen(
                                                                    false
                                                                )
                                                                navigate(r.path)
                                                            }}
                                                            className={`w-full text-left px-3 py-2 text-sm rounded-xl border transition-colors ${selected
                                                                ? 'bg-[#E8F5E9] text-[#2e5a31] font-medium border-[#C8E6C9]'
                                                                : 'text-[#212121] border-transparent hover:bg-[#F5F5F5] hover:border-[#E0E0E0]'
                                                                }`}
                                                        >
                                                            {r.title}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            <div className="flex-1 flex flex-col min-h-0 bg-[#FAF9F6] overflow-hidden rounded-xl px-3 md:px-5 py-3 md:py-2">
                {isFormPageOpen ? (
                    <div className="flex-1 overflow-y-auto py-4">
                        {entityType === ENTITY_TYPES.ACHIEVEMENT_OFT &&
                            renderOftFldTabs({
                                mode: 'edit',
                                kind: 'oft',
                                item: editingItem,
                            })}
                        {entityType === ENTITY_TYPES.ACHIEVEMENT_FLD &&
                            renderOftFldTabs({
                                mode: 'edit',
                                kind: 'fld',
                                item: editingItem,
                            })}

                        <DataManagementFormPage
                            entityType={entityType}
                            title={
                                editingItem
                                    ? `Edit ${title.replace(/ Master$/, '')}`
                                    : `Create ${title.replace(/ Master$/, '')}`
                            }
                            formData={formData}
                            setFormData={setFormData}
                            onSave={handleSaveModal}
                            onClose={closeForm}
                            isSaving={isSaving}
                        />
                    </div>
                ) : isOftResultPageOpen ? (
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-4 min-h-[300px]">
                            {renderOftFldTabs({
                                mode:
                                    oftResultMode === 'create'
                                        ? 'add-result'
                                        : 'edit-result',
                                kind: 'oft',
                                item: selectedOftItem,
                            })}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setIsOftResultPageOpen(false)
                                        setSelectedOftId(null)
                                        setSelectedOftItem(null)
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <h1 className="text-2xl font-semibold text-[#487749]">
                                    {oftResultMode === 'create'
                                        ? 'Create OFT Result'
                                        : 'Edit OFT Result'}
                                </h1>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] min-h-[260px] p-4">
                                <OftResultForm
                                    embedded
                                    mode={oftResultMode}
                                    initialValue={
                                        (oftResultQuery.data as any)?.data ||
                                        (oftResultQuery.data as any) ||
                                        undefined
                                    }
                                    sourceRows={
                                        Array.isArray(
                                            selectedOftItem?.technologyOptions
                                        )
                                            ? selectedOftItem.technologyOptions
                                            : []
                                    }
                                    kvkId={selectedOftItem?.kvkId ?? null}
                                    onClose={() => {
                                        setIsOftResultPageOpen(false)
                                        setSelectedOftId(null)
                                        setSelectedOftItem(null)
                                    }}
                                    onSubmit={handleSubmitOftResult}
                                />
                            </div>
                        </div>
                    </div>
                ) : isFldResultPageOpen ? (
                    <div className="flex-1 overflow-y-auto py-4">
                        <div className="space-y-6 min-h-[400px]">
                            {renderOftFldTabs({
                                mode:
                                    fldResultMode === 'create'
                                        ? 'add-result'
                                        : 'edit-result',
                                kind: 'fld',
                                item: selectedFldItem,
                            })}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        setIsFldResultPageOpen(false)
                                        setSelectedFldId(null)
                                        setSelectedFldItem(null)
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <h1 className='text-lg sm:text-xl md:text-2xl font-semibold text-[#487749] leading-tight'>
                                    {fldResultMode === 'create' ? 'Create FLD Result' : 'Edit FLD Result'}
                                </h1>

                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] min-h-[300px] p-6">
                                <FldResultForm
                                    mode={fldResultMode}
                                    initialValue={
                                        (fldResultQuery.data as any)?.data ||
                                        (fldResultQuery.data as any) ||
                                        undefined
                                    }
                                    onClose={() => {
                                        setIsFldResultPageOpen(false)
                                        setSelectedFldId(null)
                                        setSelectedFldItem(null)
                                    }}
                                    onSubmit={handleSubmitFldResult}
                                />
                            </div>
                        </div>
                    </div>
                ) : isNariNutriResultPageOpen ? (
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <NariNutritionalGardenResultForm
                            mode={
                                nariNutriResult.resultData ? 'edit' : 'create'
                            }
                            initialValue={nariNutriResult.resultData}
                            onClose={() => {
                                setIsNariNutriResultPageOpen(false)
                                setSelectedNariNutriId(null)
                            }}
                            onSubmit={handleSubmitNariNutriResult}
                        />
                    </div>
                ) : isNariBioResultPageOpen ? (
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <NariBioFortifiedResultForm
                            mode={nariBioResult.resultData ? 'edit' : 'create'}
                            initialValue={nariBioResult.resultData}
                            onClose={() => {
                                setIsNariBioResultPageOpen(false)
                                setSelectedNariBioId(null)
                            }}
                            onSubmit={handleSubmitNariBioResult}
                        />
                    </div>
                ) : isNariValueResultPageOpen ? (
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {nariValueResult.isLoading ? (
                            <LoadingState message="Loading result…" />
                        ) : (
                            <NariValueAdditionResultForm
                                key={String(selectedNariValueId ?? '')}
                                mode={
                                    nariValueResult.resultData
                                        ? 'edit'
                                        : 'create'
                                }
                                initialValue={nariValueResult.resultData}
                                onClose={() => {
                                    setIsNariValueResultPageOpen(false)
                                    setSelectedNariValueId(null)
                                }}
                                onSubmit={handleSubmitNariValueResult}
                            />
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex-none pb-2">
                            <div className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-[#487749]">
                                        {title}
                                    </h2>
                                    <p className="text-sm text-[#757575] mt-1">
                                        {description}
                                    </p>
                                </div>
                                <div className="flex gap-3 flex-wrap items-center">
                                    <div className="hidden md:flex gap-2 items-center">
                                        {exportFormatOptions.map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() =>
                                                    handleExport(opt.value)
                                                }
                                                disabled={
                                                    exportLoadingState !==
                                                    null &&
                                                    exportLoadingState !==
                                                    opt.value
                                                }
                                                className={`h-10 inline-flex items-center gap-2 px-4 border rounded-xl text-sm font-medium transition-colors ${exportLoadingState ===
                                                    opt.value
                                                    ? 'border-[#487749] text-[#487749] bg-[#E8F5E9]'
                                                    : 'border-[#E0E0E0] text-[#487749] bg-white hover:bg-[#F5F5F5]'
                                                    } ${exportLoadingState !== null && exportLoadingState !== opt.value ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            >
                                                {exportLoadingState ===
                                                    opt.value ? (
                                                    <svg
                                                        className="w-4 h-4 animate-spin text-[#487749]"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        aria-hidden="true"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
                                                        ></path>
                                                    </svg>
                                                ) : (
                                                    <Download className="w-4 h-4" />
                                                )}
                                                {exportLoadingState ===
                                                    opt.value
                                                    ? 'Downloading...'
                                                    : opt.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div
                                        ref={exportMenuRef}
                                        className="relative md:hidden"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsExportMenuOpen(v => !v)
                                            }
                                            disabled={
                                                exportLoadingState !== null
                                            }
                                            className="h-10 inline-flex items-center gap-2 px-3 border border-[#E0E0E0] rounded-xl bg-white text-sm font-medium text-[#212121] hover:bg-[#F5F5F5] transition-colors disabled:opacity-60"
                                        >
                                            {exportLoadingState ? (
                                                <svg
                                                    className="w-4 h-4 animate-spin text-[#487749]"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    aria-hidden="true"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
                                                    ></path>
                                                </svg>
                                            ) : (
                                                <Download className="w-4 h-4 text-[#487749]" />
                                            )}
                                            {exportLoadingState
                                                ? 'Downloading...'
                                                : 'Download'}
                                            <ChevronDown className="w-4 h-4 text-[#757575]" />
                                        </button>
                                        {isExportMenuOpen && (
                                            <div className="absolute z-50 mt-1 w-44 rounded-2xl border border-[#E0E0E0] bg-white p-1">
                                                {exportFormatOptions.map(
                                                    opt => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setIsExportMenuOpen(
                                                                    false
                                                                )
                                                                handleExport(
                                                                    opt.value
                                                                )
                                                            }}
                                                            className="w-full text-left px-3 py-2 text-sm rounded-xl border border-transparent text-[#212121] hover:bg-[#E8F5E9] hover:text-[#2e5a31] hover:border-[#C8E6C9] transition-colors"
                                                        >
                                                            <span className="inline-flex items-center gap-2">
                                                                <Download className="w-4 h-4 text-[#487749]" />
                                                                {opt.label}
                                                            </span>
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {showAddButton && (
                                        <button
                                            onClick={handleAddNew}
                                            className="h-10 flex items-center gap-2 px-4 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] transition-all duration-200"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add New
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center">
                                <div className="w-full sm:w-[280px]">
                                    <SearchInput
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                        placeholder="Search..."
                                        className="max-w-full!"
                                    />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <DatePicker
                                        value={reportingYearFrom}
                                        onChange={setReportingYearFrom}
                                        max={reportingFromMaxIso}
                                        placeholder="From date"
                                        ariaLabel="Reporting year from"
                                        className="h-10 px-3 py-2 text-sm sm:w-[170px]"
                                    />
                                    <DatePicker
                                        value={reportingYearTo}
                                        onChange={setReportingYearTo}
                                        min={
                                            reportingYearFrom.trim()
                                                ? reportingYearFrom
                                                : undefined
                                        }
                                        max={reportingRangeTodayIso}
                                        placeholder="To date"
                                        ariaLabel="Reporting year to"
                                        className="h-10 px-3 py-2 text-sm sm:w-[170px]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReportingYearFrom('')
                                            setReportingYearTo('')
                                        }}
                                        className="h-11 inline-flex items-center gap-1.5 px-3 text-white rounded-xl bg-[#487749] text-sm hover:bg-[#3d6540] transition-colors cursor-pointer"
                                        title="Clear from and to dates"
                                    >
                                        <RotateCcw className="w-4 h-4 text-white" />
                                        Reset dates
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            {loading ? (
                                <LoadingState />
                            ) : isKvkRoleWithoutKvk ? (
                                <div className="flex-1 bg-white rounded-xl border border-[#E0E0E0] overflow-hidden flex flex-col min-h-0 relative shadow-sm">
                                    <div className="absolute inset-0 overflow-auto flex items-center justify-center">
                                        <div className="text-center px-6 py-12">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F5F5F5] mb-4">
                                                <svg
                                                    className="w-8 h-8 text-[#757575]"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-[#212121] mb-2">
                                                No KVK Linked
                                            </h3>
                                            <p className="text-[#757575] mb-4">
                                                You do not have a linked KVK
                                                yet. Please contact
                                                administrator to assign a KVK to
                                                your account.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {multiFormNote && (
                                        <div className="mb-2 rounded-xl border border-[#FFE6A7] bg-[#FFF8E1] px-4 py-3 text-xs md:text-sm text-[#5D4037]">
                                            {multiFormNote}
                                        </div>
                                    )}
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
                                        onTransfer={
                                            isEmployeeDetails ||
                                                entityType ===
                                                ENTITY_TYPES.KVK_STAFF_TRANSFERRED
                                                ? handleTransfer
                                                : undefined
                                        }
                                        onViewHistory={
                                            isEmployeeDetails ||
                                                entityType ===
                                                ENTITY_TYPES.KVK_STAFF_TRANSFERRED
                                                ? handleViewHistory
                                                : undefined
                                        }
                                        customActions={[
                                            ...oftCustomActions,
                                            ...fldCustomActions,
                                            ...cfldCustomActions,
                                            ...nariCustomActions,
                                        ]}
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
            <ToastContainer />
        </div>
    )
}
