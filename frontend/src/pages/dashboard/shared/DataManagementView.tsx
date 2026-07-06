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
    CheckCircle2,
    ChevronDown,
    RotateCcw,
    FilterX,
    Trash2,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { TabNavigation } from '@/components/common/TabNavigation'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { Pagination } from '@/components/common/DataTable/Pagination'
import {
    applyColumnFilters,
    valueToString,
    type ColumnFilters,
} from '@/components/common/DataTable/columnFilterUtils'
import { isFilterActive as isColumnFilterActive } from '@/components/common/DataTable/ColumnFilter'
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
    fuzzyDedupeByName,
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
import { wipeKvkModule, WIPEABLE_ENTITY_TYPES } from '@/services/maintenanceApi'
import {
    useTransferOftToNextYear,
    useRevokeOftTransfer,
    useTransferFldToNextYear,
    useRevokeFldTransfer,
    useCreateOftResult,
    useUpdateOftResult,
    useMarkOftCompleted,
    useMarkFldCompleted,
    useOftResult,
    useFldResult,
    useCreateFldResult,
    useUpdateFldResult,
} from '@/hooks/useOftWorkflow'
import {
    useMarkCfldTechnicalCompleted,
    useRevokeCfldTechnicalTransfer,
    useTransferCfldTechnicalToNextYear,
} from '@/hooks/useCfldWorkflow'
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
import { getFldResultTemplate } from '@/utils/fldResultTemplate'

interface DataManagementViewProps {
    title: string
    description?: string
    fields?: readonly string[] | string[]
}

const normalizeSortValue = (value: unknown): string => {
    const text = valueToString(value)
    return text === '-' ? '' : text
}

const compareSortValues = (a: string, b: string): number => {
    if (a === b) return 0
    if (a === '') return 1
    if (b === '') return -1
    const na = Number(a)
    const nb = Number(b)
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
    return a.localeCompare(b, undefined, {
        sensitivity: 'base',
        numeric: true,
    })
}

const sortByDisplayFields = <T,>(data: T[], sortFields: readonly string[]): T[] => {
    if (data.length < 2 || sortFields.length === 0) return data
    return [...data].sort((a, b) => {
        for (const field of sortFields) {
            const av = normalizeSortValue(getFieldValue(a, field))
            const bv = normalizeSortValue(getFieldValue(b, field))
            const cmp = compareSortValues(av, bv)
            if (cmp !== 0) return cmp
        }
        return 0
    })
}

const getAllMasterDefaultSortFields = (
    routeConfig: ReturnType<typeof getRouteConfig> | null | undefined,
    fields: readonly string[]
): string[] | null => {
    if (routeConfig?.category !== 'All Masters') return null
    const configured = routeConfig.defaultSortFields
    const source = configured && configured.length > 0 ? configured : fields
    return Array.from(new Set(source.filter(Boolean).map(String)))
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
    const revokeOftMutation = useRevokeOftTransfer()
    const transferFldMutation = useTransferFldToNextYear()
    const revokeFldMutation = useRevokeFldTransfer()
    const transferCfldMutation = useTransferCfldTechnicalToNextYear()
    const revokeCfldMutation = useRevokeCfldTechnicalTransfer()
    const markCfldCompletedMutation = useMarkCfldTechnicalCompleted()
    const createOftResultMutation = useCreateOftResult()
    const updateOftResultMutation = useUpdateOftResult()
    const markOftCompletedMutation = useMarkOftCompleted()
    const createFldResultMutation = useCreateFldResult()
    const updateFldResultMutation = useUpdateFldResult()
    const markFldCompletedMutation = useMarkFldCompleted()
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
    const [columnFilters, setColumnFilters] = useState<ColumnFilters>({})
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
    const [isMobileRouteMenuOpen, setIsMobileRouteMenuOpen] = useState(false)
    const [isOftFldTabMenuOpen, setIsOftFldTabMenuOpen] = useState(false)
    const [isCfldTabMenuOpen, setIsCfldTabMenuOpen] = useState(false)

    const mobileRouteMenuRef = useRef<HTMLDivElement | null>(null)
    const exportMenuRef = useRef<HTMLDivElement | null>(null)
    const oftFldTabMenuRef = useRef<HTMLDivElement | null>(null)
    const cfldTabMenuRef = useRef<HTMLDivElement | null>(null)

    // Get entity type from path
    const entityType = getEntityTypeFromPath(location.pathname)

    // Use centralized hook factory — pass pagination params so server-side hooks
    // (e.g. Equipment Master) can fetch the right page/search from the API.
    const activeHook = useEntityHook(entityType, {
        page: currentPage,
        limit: 10,
        search: debouncedSearch,
    })

    // Detect server-side pagination (e.g. Equipment Master returns serverPagination)
    const serverPagination = (activeHook as any)?.serverPagination as
        | { total: number; totalPages: number }
        | undefined

    // Server-paginated masters only return the current page, so search and the
    // column-filter value lists would be limited to those ~10 rows. These master
    // tables are small, so also fetch the WHOLE dataset and run the normal
    // client-side pipeline (search + column filters + their unique-value lists +
    // pagination) over it. Falls back to the server page until the full set loads.
    const fullDataHook = useEntityHook(entityType, {
        page: 1,
        limit: 5000,
        search: '',
    })
    const fullItems = Array.isArray((fullDataHook as any)?.data)
        ? (fullDataHook as any).data
        : []
    // Use the server page only while the full dataset is still loading.
    const useServerPaging = !!serverPagination && fullItems.length === 0

    // Check if this is Employee Details view
    const isEmployeeDetails = entityType === ENTITY_TYPES.KVK_EMPLOYEES
    const isStaffTable =
        entityType === ENTITY_TYPES.KVK_EMPLOYEES ||
        entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED

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
        // Super-admin may only add KVKs (KVK creation) and master data; the
        // "Add New" button is hidden on every other form-management page.
        if (user.role === 'super_admin') {
            const isMaster = routeConfig?.category === 'All Masters'
            const isKvkCreation = isAboutKvkEntity && entityType === ENTITY_TYPES.KVKS
            if (!isMaster && !isKvkCreation) return false
        }
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

    // ── TEMPORARY migration cleanup: per-module "Delete All" ─────────────
    // Only for KVK accounts (scoped to their own kvkId on the backend), only on
    // modules the backend registry supports, and only with DELETE permission.
    const canWipeModule =
        !!entityType &&
        WIPEABLE_ENTITY_TYPES.has(entityType) &&
        !!user &&
        (user.role === 'kvk_admin' || user.role === 'kvk_user') &&
        !!user.kvkId &&
        (!moduleCode || hasPermission('DELETE', moduleCode))

    const handleWipeAll = () => {
        if (!entityType) return
        const label = title.replace(/ Master$/, '')
        confirm(
            {
                title: `Delete ALL ${label} data?`,
                message:
                    `This permanently deletes EVERY ${label} record for your KVK ` +
                    `(not just this page). This migration-cleanup action cannot be ` +
                    `undone. Are you sure you want to continue?`,
                variant: 'danger',
                confirmText: 'Delete All',
                cancelText: 'Cancel',
            },
            async () => {
                try {
                    const res = await wipeKvkModule(entityType)
                    if (activeHook && 'refetch' in activeHook) {
                        await (activeHook as any).refetch()
                    }
                    queryClient.invalidateQueries()
                    setCurrentPage(1)
                    alert({
                        title: 'Deleted',
                        message: res?.message || 'All records deleted.',
                        variant: 'success',
                        autoClose: true,
                    })
                } catch (err: any) {
                    alert({
                        title: 'Delete failed',
                        message: err?.message || 'Failed to delete records.',
                        variant: 'error',
                    })
                }
            }
        )
    }

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
    // Base dataset for the client-side pipeline: the full set for server-paginated
    // entities (once loaded), otherwise the hook's already-complete data.
    const baseItems = serverPagination && fullItems.length > 0 ? fullItems : items

    // Optional table-only dedupe (e.g. Institute/Host masters show one row per
    // distinct name). Keeps the first occurrence per normalized field value.
    // Display only — the form/backend are untouched. The full dataset is loaded
    // (fullItems) before this runs, so the dedupe covers every row.
    const uniqueByField = routeConfig?.uniqueByField
    const dedupedBaseItems = useMemo(() => {
        if (!uniqueByField) return baseItems
        // Fuzzy: collapse near-duplicate names (case/punctuation/suffix/typo) to
        // one row, e.g. the many "Birsa Agricultural University, ..." variants.
        return fuzzyDedupeByName(baseItems, (item: any) =>
            valueToString(getFieldValue(item, uniqueByField))
        )
    }, [baseItems, uniqueByField])

    // Resolve fields using centralized utility function
    // This ensures fields are always available even when there's no data
    const fields = useMemo(
        () => resolveTableFields(routeConfig, propFields),
        [routeConfig, propFields]
    )
    const itemsPerPage = 10

    const defaultSortFields = useMemo(
        () => getAllMasterDefaultSortFields(routeConfig, fields),
        [routeConfig, fields]
    )

    const orderedBaseItems = useMemo(() => {
        if (!defaultSortFields) return dedupedBaseItems
        return sortByDisplayFields(dedupedBaseItems, defaultSortFields)
    }, [dedupedBaseItems, defaultSortFields])

    // Reset pagination/search when route changes (tab switch)
    useEffect(() => {
        setSearchQuery('')
        setCurrentPage(1)
        setColumnFilters({})
        closeForm()
    }, [location.pathname, closeForm])

    // Reset to first page whenever column filters change so the user always
    // sees the start of the new result set.
    useEffect(() => {
        setCurrentPage(1)
    }, [columnFilters])

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
    // When serverPagination is active the hook already returns the right page
    // slice + handles search on the backend, so skip client-side filtering.
    const filteredData = useMemo(() => {
        if (useServerPaging) return items
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
        const yearFiltered = orderedBaseItems.filter((item: any) =>
            itemMatchesDateRangeFilter(item, fromDate, toDate)
        )

        if (!debouncedSearch.trim()) return yearFiltered

        const query = debouncedSearch.toLowerCase()
        return yearFiltered.filter((item: any) => {
            return fields.some(field => {
                const value = getFieldValue(item, field)
                return value && String(value).toLowerCase().includes(query)
            })
        })
    }, [orderedBaseItems, items, debouncedSearch, fields, reportingYearFrom, reportingYearTo, useServerPaging])

    // Apply per-column filters (Excel-style: sort + text + multi-select) on top
    // of the search/year-filtered set. The column-filter dropdown's unique-value
    // list is computed from `filteredData` so it represents the full visible
    // dataset before column filters narrow it further.
    const columnFilteredData = useMemo(() => {
        if (useServerPaging) return items
        const result = applyColumnFilters(filteredData, fields, columnFilters)
        // Default order: newest reporting year first when present, then newest
        // createdAt/id. Explicit column sorts still take precedence.
        // unless the user has applied an explicit column sort.
        const hasActiveSort = Object.values(columnFilters || {}).some(
            (f: any) => f?.sort,
        )
        if (hasActiveSort || result.length < 2) return result
        if (defaultSortFields) {
            return sortByDisplayFields(result, defaultSortFields)
        }
        const staffPositionOf = (item: any): number => {
            const raw = item?.positionOrder ?? item?.position
            const parsed = Number(raw)
            return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
        }
        const kvkNameOf = (item: any): string =>
            String(item?.kvk?.kvkName ?? item?.kvkName ?? '')
        if (isStaffTable) {
            return [...result].sort((a, b) => {
                const kvkCompare = kvkNameOf(a).localeCompare(kvkNameOf(b))
                if (kvkCompare !== 0) return kvkCompare
                const positionCompare = staffPositionOf(a) - staffPositionOf(b)
                if (positionCompare !== 0) return positionCompare
                return String((a as any)?.staffName || '').localeCompare(String((b as any)?.staffName || ''))
            })
        }
        const reportingYearOf = (item: any): number => {
            const raw =
                item?.reportingYear ??
                item?.reportingYearDate ??
                item?.year ??
                item?.yearName
            if (raw === null || raw === undefined || raw === '') return 0
            if (typeof raw === 'number') return raw
            const parsed = new Date(raw)
            if (!Number.isNaN(parsed.getTime())) return parsed.getFullYear()
            const match = String(raw).match(/^(\d{4})/)
            return match ? Number(match[1]) : 0
        }
        const recencyOf = (item: any): number => {
            const raw = item?.createdAt ?? item?.updatedAt
            if (raw) {
                const t = new Date(raw).getTime()
                if (!Number.isNaN(t)) return t
            }
            return 0
        }
        const idOf = (item: any): number => {
            if (!item || typeof item !== 'object') return 0
            if (typeof item.id === 'number') return item.id
            for (const k of Object.keys(item)) {
                if (/Id$/.test(k) && typeof item[k] === 'number') return item[k]
            }
            return 0
        }
        // Superadmin / cross-KVK views group each reporting year by KVK name
        // A→Z; KVK-scoped users see their own latest entries first.
        const isKvkScoped =
            user?.role === 'kvk_admin' || user?.role === 'kvk_user'
        return [...result].sort((a, b) => {
            const ya = reportingYearOf(a)
            const yb = reportingYearOf(b)
            if (ya !== yb) return yb - ya
            if (!isKvkScoped) {
                const nameCompare = kvkNameOf(a).localeCompare(kvkNameOf(b))
                if (nameCompare !== 0) return nameCompare
            } else {
                const ra = recencyOf(a)
                const rb = recencyOf(b)
                if (ra !== rb) return rb - ra
            }
            return idOf(b) - idOf(a)
        })
    }, [
        filteredData,
        fields,
        columnFilters,
        useServerPaging,
        items,
        isStaffTable,
        defaultSortFields,
        user?.role,
    ])

    // Pagination calculations - memoized for performance
    const paginationData = useMemo(() => {
        if (useServerPaging && serverPagination) {
            const totalPages = serverPagination.totalPages || 1
            const safePage = Math.min(currentPage, totalPages)
            const startIndex = (safePage - 1) * itemsPerPage
            const endIndex = startIndex + items.length
            return { totalPages, safePage, startIndex, endIndex, paginatedData: items }
        }
        const totalPages = Math.max(
            1,
            Math.ceil(columnFilteredData.length / itemsPerPage)
        )
        // Clamp currentPage so it never points beyond the last page (e.g. after a search narrows results)
        const safePage = Math.min(currentPage, totalPages)
        const startIndex = (safePage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const paginatedData = columnFilteredData.slice(startIndex, endIndex)

        return { totalPages, safePage, startIndex, endIndex, paginatedData }
    }, [columnFilteredData, currentPage, itemsPerPage, useServerPaging, serverPagination, items])

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

    const unwrapApiData = (response: any) => {
        if (
            response &&
            typeof response === 'object' &&
            ('success' in response || 'data' in response)
        ) {
            return response.data ?? undefined
        }
        return response
    }

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
        confirm(
            {
                title: 'Transfer OFT?',
                message:
                    'This will move the OFT to the next reporting year and create a next-year copy. The OFT start date will stay unchanged.',
                variant: 'warning',
                confirmText: 'Transfer',
                cancelText: 'Cancel',
            },
            async () => {
                try {
                    await transferOftMutation.mutateAsync(id)
                    if (activeHook && 'refetch' in activeHook) {
                        await (activeHook as any).refetch()
                    }
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
                    throw err
                }
            }
        )
    }

    const handleRevokeOftTransfer = async (item: any) => {
        const id = item?.id ?? item?.kvkOftId
        if (!id) {
            alert({
                title: 'Error',
                message: 'Unable to revoke transfer: missing record id.',
                variant: 'error',
            })
            return
        }
        confirm(
            {
                title: 'Undo OFT transfer?',
                message:
                    'This will delete the untouched next-year OFT copy and restore the original OFT to Ongoing. This is available only to superadmin and only before the next-year copy is completed or transferred again.',
                variant: 'warning',
                confirmText: 'Undo Transfer',
                cancelText: 'Cancel',
            },
            async () => {
                try {
                    await revokeOftMutation.mutateAsync(id)
                    if (activeHook && 'refetch' in activeHook) {
                        await (activeHook as any).refetch()
                    }
                    alert({
                        title: 'Success',
                        message: 'OFT transfer undone; original record restored to Ongoing.',
                        variant: 'success',
                        autoClose: true,
                    })
                } catch (err: any) {
                    alert({
                        title: 'Undo transfer failed',
                        message: err?.message || 'Unable to undo OFT transfer.',
                        variant: 'error',
                    })
                    throw err
                }
            }
        )
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
        confirm(
            {
                title: 'Transfer FLD?',
                message:
                    'This will move the current FLD to transferred status and create a new ongoing copy for the next reporting year.',
                variant: 'warning',
                confirmText: 'Transfer',
                cancelText: 'Cancel',
            },
            async () => {
                try {
                    await transferFldMutation.mutateAsync(id)
                    if (activeHook && 'refetch' in activeHook) {
                        await (activeHook as any).refetch()
                    }
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
                    throw err
                }
            }
        )
    }

    const handleRevokeFldTransfer = async (item: any) => {
        const id = item?.id ?? item?.kvkFldId
        if (!id) {
            alert({
                title: 'Error',
                message: 'Unable to revoke transfer: missing record id.',
                variant: 'error',
            })
            return
        }
        confirm(
            {
                title: 'Undo FLD transfer?',
                message:
                    'This will delete the untouched next-year FLD copy and restore the original FLD to Ongoing. This is available only to superadmin and only before the next-year copy is completed or transferred again.',
                variant: 'warning',
                confirmText: 'Undo Transfer',
                cancelText: 'Cancel',
            },
            async () => {
                try {
                    await revokeFldMutation.mutateAsync(id)
                    if (activeHook && 'refetch' in activeHook) {
                        await (activeHook as any).refetch()
                    }
                    alert({
                        title: 'Success',
                        message: 'FLD transfer undone; original record restored to Ongoing.',
                        variant: 'success',
                        autoClose: true,
                    })
                } catch (err: any) {
                    alert({
                        title: 'Undo transfer failed',
                        message: err?.message || 'Unable to undo FLD transfer.',
                        variant: 'error',
                    })
                    throw err
                }
            }
        )
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

    const handleRevokeCfldTransfer = async (item: any) => {
        const id = item?.id ?? item?.cfldTechId
        if (!id) {
            alert({
                title: 'Error',
                message: 'Unable to revoke transfer: missing record id.',
                variant: 'error',
            })
            return
        }
        confirm(
            {
                title: 'Undo CFLD transfer?',
                message:
                    'This will delete the untouched next-year CFLD copy and restore the original CFLD to Ongoing. This is available only to superadmin before the copy is updated.',
                variant: 'warning',
                confirmText: 'Undo Transfer',
                cancelText: 'Cancel',
            },
            async () => {
                try {
                    await revokeCfldMutation.mutateAsync(id)
                    if (activeHook && 'refetch' in activeHook) {
                        await (activeHook as any).refetch()
                    }
                    alert({
                        title: 'Success',
                        message: 'CFLD transfer undone; original record restored to Ongoing.',
                        variant: 'success',
                        autoClose: true,
                    })
                } catch (err: any) {
                    alert({
                        title: 'Undo transfer failed',
                        message: err?.message || 'Unable to undo CFLD transfer.',
                        variant: 'error',
                    })
                    throw err
                }
            }
        )
    }

    const handleMarkCfldCompleted = async (item: any) => {
        const id = item?.id ?? item?.cfldTechId
        if (!id) {
            alert({
                title: 'Error',
                message: 'Unable to mark CFLD completed: missing record id.',
                variant: 'error',
            })
            return
        }
        confirm(
            {
                title: 'Mark CFLD as completed?',
                message:
                    'Are you sure you want to mark this CFLD as completed? Save economic, socio economic, and farmers perception details first.',
                variant: 'warning',
                confirmText: 'Mark Completed',
                cancelText: 'Cancel',
            },
            async () => {
                try {
                    await markCfldCompletedMutation.mutateAsync(id)
                    if (activeHook && 'refetch' in activeHook) {
                        await (activeHook as any).refetch()
                    }
                    alert({
                        title: 'Success',
                        message: 'CFLD marked completed successfully.',
                        variant: 'success',
                        autoClose: true,
                    })
                    closeForm()
                } catch (err: any) {
                    alert({
                        title: 'Error',
                        message:
                            err?.message ||
                            'Failed to mark the CFLD as completed. Please save all CFLD sections first.',
                        variant: 'error',
                    })
                    throw err
                }
            }
        )
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

    const oftResultInitialValue = unwrapApiData(oftResultQuery.data)

    useEffect(() => {
        if (!isOftResultPageOpen || !oftResultInitialValue) return
        setOftResultMode('edit')
        setSelectedOftItem((prev: any) => ({
            ...(prev || {}),
            resultReport: oftResultInitialValue,
            oftResultReportId: (oftResultInitialValue as any)?.oftResultReportId,
        }))
    }, [isOftResultPageOpen, oftResultInitialValue])

    const itemHasOftResult = (item: any) =>
        Boolean(item?.resultReport || item?.oftResultReportId || item?.resultReportId)

    const getOftSourceRows = (item: any, result: any) => {
        // Prefer the result's technology options (the snapshot the saved rows were
        // built from) and fall back to the list item's. Concatenating both would
        // duplicate rows and break positional cell alignment in the result form.
        const rawOptions = Array.isArray(result?.technologyOptions) && result.technologyOptions.length > 0
            ? result.technologyOptions
            : Array.isArray(item?.technologyOptions)
                ? item.technologyOptions
                : []
        const seen = new Set<string>()
        const explicitOptions = rawOptions
            .map((row: any) => ({
                optionKey: String(row?.optionKey || ''),
                optionName: String(row?.optionName || '').trim(),
            }))
            .filter((row: { optionKey: string; optionName: string }) => {
                if (!row.optionName) return false
                const dedupeKey = `${row.optionKey}::${row.optionName.toLowerCase()}`
                if (seen.has(dedupeKey)) return false
                seen.add(dedupeKey)
                return true
            })

        if (explicitOptions.length > 0) {
            return explicitOptions
        }

        return Object.keys(item || {})
            .filter((key) => key.startsWith('tech_'))
            .map((key) => {
                const optionName = key.replace(/^tech_/, '').trim()
                return {
                    optionKey: `legacy_${optionName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
                    optionName,
                }
            })
            .filter((row) => row.optionName)
    }

    const handleMarkOftCompleted = async (item: any) => {
        const id = item?.id ?? item?.kvkOftId ?? selectedOftId
        if (!id) {
            alert({
                title: 'Error',
                message: 'Unable to mark OFT completed: missing record id.',
                variant: 'error',
            })
            return
        }
        confirm(
            {
                title: 'Mark OFT as completed?',
                message:
                    'Are you sure you want to mark this OFT result as completed? You can continue editing the result after completion, but it will no longer be treated as ongoing.',
                variant: 'warning',
                confirmText: 'Mark Completed',
                cancelText: 'Cancel',
            },
            async () => {
                try {
                    await markOftCompletedMutation.mutateAsync(id)
                    alert({
                        title: 'Success',
                        message: 'OFT marked completed successfully.',
                        variant: 'success',
                        autoClose: true,
                    })
                    setIsOftResultPageOpen(false)
                    setSelectedOftId(null)
                    setSelectedOftItem(null)
                } catch (err: any) {
                    alert({
                        title: 'Error',
                        message:
                            err?.message ||
                            'Failed to mark the OFT as completed. Please save the result first.',
                        variant: 'error',
                    })
                    throw err
                }
            }
        )
    }

    const handleSubmitOftResult = async (payload: OftResultFormValue) => {
        if (!selectedOftId) return
        try {
            if (oftResultMode === 'create') {
                await createOftResultMutation.mutateAsync({
                    id: selectedOftId,
                    payload,
                })
                setOftResultMode('edit')
                setSelectedOftItem((prev: any) => ({
                    ...(prev || {}),
                    resultReport: { ...(prev?.resultReport || {}), ...payload },
                }))
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
        } catch (err: any) {
            alert({
                title: 'Error',
                message: err?.message || 'Failed to save the OFT result. Please try again.',
                variant: 'error',
            })
            throw err // keep the form open so the user can retry
        }
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

    const fldResultInitialValue = unwrapApiData(fldResultQuery.data)

    useEffect(() => {
        if (!isFldResultPageOpen || !fldResultInitialValue) return
        setFldResultMode('edit')
        setSelectedFldItem((prev: any) => ({
            ...(prev || {}),
            fldResult: fldResultInitialValue,
            fldResultId: (fldResultInitialValue as any)?.fldResultId,
        }))
    }, [isFldResultPageOpen, fldResultInitialValue])

    const itemHasFldResult = (item: any) =>
        Boolean(item?.fldResult || item?.fldResultId || item?.resultReportId)

    const handleMarkFldCompleted = async (item: any) => {
        const id = item?.id ?? item?.kvkFldId ?? selectedFldId
        if (!id) {
            alert({
                title: 'Error',
                message: 'Unable to mark FLD completed: missing record id.',
                variant: 'error',
            })
            return
        }
        confirm(
            {
                title: 'Mark FLD as completed?',
                message:
                    'Are you sure you want to mark this FLD result as completed? Save or update the result before completing it.',
                variant: 'warning',
                confirmText: 'Mark Completed',
                cancelText: 'Cancel',
            },
            async () => {
                try {
                    await markFldCompletedMutation.mutateAsync(id)
                    alert({
                        title: 'Success',
                        message: 'FLD marked completed successfully.',
                        variant: 'success',
                        autoClose: true,
                    })
                    setIsFldResultPageOpen(false)
                    setSelectedFldId(null)
                    setSelectedFldItem(null)
                } catch (err: any) {
                    alert({
                        title: 'Error',
                        message:
                            err?.message ||
                            'Failed to mark the FLD as completed. Please save the result first.',
                        variant: 'error',
                    })
                    throw err
                }
            }
        )
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
        const hasResult = opts.kind === 'oft' ? itemHasOftResult(item) : itemHasFldResult(item)
        const canAdd =
            opts.kind === 'oft'
                ? normalized === 'ONGOING' && !hasResult
                : normalized === 'ONGOING' && !hasResult
        const canEditResult = hasResult

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

    // CFLD section switcher — same pill/menu look as the OFT/FLD tabs, shown
    // above the form (Back button) when editing a CFLD technical param record.
    // Source of truth is formData.cfldActiveSection (CfldForms syncs off it).
    const renderCfldTabs = () => {
        const isEdit = Boolean(formData?.id || formData?.cfldTechId)
        if (!isEdit) return null
        const active = String(formData?.cfldActiveSection || 'technical')
            .toLowerCase()
        const currentSection = ['economic', 'socio', 'perception'].includes(
            active
        )
            ? active
            : 'technical'
        const isTransferred = normalizeOftStatus(formData?.status) === 'TRANSFERRED'
        const goSection = (next: string) => {
            setFormData((prev: any) => ({ ...prev, cfldActiveSection: next }))
        }
        const tabs: Array<{ value: string; label: string; isVisible: boolean }> = [
            { value: 'technical', label: 'Edit CfldTechnicalParameter', isVisible: true },
            { value: 'economic', label: 'Economic Parameters of CFLD', isVisible: !isTransferred },
            { value: 'socio', label: 'Update Socio Economic Parameters of CFLD', isVisible: !isTransferred },
            { value: 'perception', label: 'Farmers Perception parameters of CFLD', isVisible: !isTransferred },
        ]
        const visibleTabs = tabs.filter(t => t.isVisible)

        return (
            <>
                {/* Desktop tabs */}
                <div className="hidden sm:flex mb-4 flex-wrap gap-2 w-fit rounded-2xl p-1 bg-[#3d6540]">
                    {visibleTabs.map(t => (
                        <button
                            key={t.value}
                            type="button"
                            className={tabButtonClass(currentSection === t.value)}
                            onClick={() => goSection(t.value)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Mobile dropdown (custom menu like the OFT/FLD tabs) */}
                <div className="sm:hidden mb-4">
                    <div
                        ref={cfldTabMenuRef}
                        className="relative inline-flex max-w-[90vw]"
                    >
                        <button
                            type="button"
                            onClick={() => setIsCfldTabMenuOpen(v => !v)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-[#E0E0E0] rounded-xl bg-white text-sm font-medium text-[#212121] hover:bg-[#F5F5F5] transition-colors"
                        >
                            {visibleTabs.find(t => t.value === currentSection)
                                ?.label || 'Select'}
                            <ChevronDown className="w-4 h-4 text-[#757575]" />
                        </button>

                        {isCfldTabMenuOpen && (
                            <div className="absolute z-50 mt-1 w-72 max-w-[90vw] rounded-2xl border border-[#E0E0E0] bg-white p-1">
                                {visibleTabs.map(t => {
                                    const selected = t.value === currentSection
                                    return (
                                        <button
                                            key={t.value}
                                            type="button"
                                            onClick={() => {
                                                setIsCfldTabMenuOpen(false)
                                                goSection(t.value)
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-xl border transition-colors ${selected
                                                ? 'bg-[#E8F5E9] text-[#2e5a31] font-medium border-[#C8E6C9]'
                                                : 'text-[#212121] border-transparent hover:bg-[#F5F5F5] hover:border-[#E0E0E0]'
                                                }`}
                                        >
                                            {t.label}
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
        try {
            if (fldResultMode === 'create') {
                await createFldResultMutation.mutateAsync({
                    id: selectedFldId,
                    payload,
                })
                setFldResultMode('edit')
                setSelectedFldItem((prev: any) => ({
                    ...(prev || {}),
                    fldResult: { ...(prev?.fldResult || {}), ...payload },
                }))
            } else {
                await updateFldResultMutation.mutateAsync({
                    id: selectedFldId,
                    payload,
                })
                setSelectedFldItem((prev: any) => ({
                    ...(prev || {}),
                    fldResult: { ...(prev?.fldResult || {}), ...payload },
                }))
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
        } catch (err: any) {
            alert({
                title: 'Error',
                message: err?.message || 'Failed to save the FLD result. Please try again.',
                variant: 'error',
            })
            throw err // keep the form open so the user can retry
        }
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
    const itemHasCfldSavedSections = (item: any) =>
        Boolean(item?.economicStatus && item?.socioStatus && item?.perceptionStatus)
    const oftCustomActions =
        entityType === ENTITY_TYPES.ACHIEVEMENT_OFT
            ? [
                {
                    key: 'add-result',
                    label: 'Add Result',
                    onClick: handleAddOftResult,
                    isVisible: (item: any) =>
                        statusValue(item) === 'ONGOING' && !itemHasOftResult(item),
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors',
                    icon: FilePlus2,
                },
                {
                    key: 'edit-result',
                    label: 'Edit Result',
                    onClick: handleEditOftResult,
                    isVisible: (item: any) =>
                        itemHasOftResult(item),
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 transition-colors',
                    icon: FilePenLine,
                },
                {
                    key: 'mark-completed',
                    label: 'Mark Completed',
                    onClick: handleMarkOftCompleted,
                    isVisible: (item: any) =>
                        statusValue(item) === 'ONGOING' && itemHasOftResult(item),
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-[#487749] text-[#487749] hover:bg-[#E8F5E9] transition-colors',
                    icon: CheckCircle2,
                },
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
                    key: 'revoke-transfer',
                    label: 'Undo Transfer',
                    onClick: handleRevokeOftTransfer,
                    // Super-admin only, and only for original records already transferred.
                    isVisible: (item: any) =>
                        user?.role === 'super_admin' &&
                        statusValue(item) === 'TRANSFERRED_TO_NEXT_YEAR',
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors',
                    icon: RotateCcw,
                },
            ]
            : []

    const fldCustomActions =
        entityType === ENTITY_TYPES.ACHIEVEMENT_FLD
            ? [
                {
                    key: 'add-result',
                    label: 'Add Result',
                    onClick: handleAddFldResult,
                    isVisible: (item: any) =>
                        statusValue(item) === 'ONGOING' && !itemHasFldResult(item),
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors',
                    icon: FilePlus2,
                },
                {
                    key: 'edit-result',
                    label: 'Edit Result',
                    onClick: handleEditFldResult,
                    isVisible: (item: any) =>
                        itemHasFldResult(item),
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 transition-colors',
                    icon: FilePenLine,
                },
                {
                    key: 'mark-completed',
                    label: 'Mark Completed',
                    onClick: handleMarkFldCompleted,
                    isVisible: (item: any) =>
                        statusValue(item) === 'ONGOING' && itemHasFldResult(item),
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-[#487749] text-[#487749] hover:bg-[#E8F5E9] transition-colors',
                    icon: CheckCircle2,
                },
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
                    key: 'revoke-transfer',
                    label: 'Undo Transfer',
                    onClick: handleRevokeFldTransfer,
                    isVisible: (item: any) =>
                        user?.role === 'super_admin' &&
                        statusValue(item) === 'TRANSFERRED_TO_NEXT_YEAR',
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors',
                    icon: RotateCcw,
                },
            ]
            : []
    const cfldCustomActions =
        entityType === ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM
            ? [
                // Edit forms first (Edit built-in sits above these), then
                // complete, then transfer, then delete (built-in, below).
                {
                    key: 'economic-params',
                    label: 'Economic Parameters',
                    onClick: (item: any) =>
                        openCfldSectionForm(item, 'economic'),
                    isVisible: (item: any) => {
                        const normalized = normalizeOftStatus(item?.status)
                        return normalized !== 'TRANSFERRED'
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
                        return normalized !== 'TRANSFERRED'
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
                        return normalized !== 'TRANSFERRED'
                    },
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors',
                    icon: FilePenLine,
                },
                {
                    key: 'mark-completed',
                    label: 'Mark Completed',
                    onClick: handleMarkCfldCompleted,
                    isVisible: (item: any) =>
                        item?.status === 'ONGOING' && itemHasCfldSavedSections(item),
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-[#487749] text-[#487749] hover:bg-[#E8F5E9] transition-colors',
                    icon: CheckCircle2,
                },
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
                    key: 'revoke-transfer',
                    label: 'Undo Transfer',
                    onClick: handleRevokeCfldTransfer,
                    isVisible: (item: any) =>
                        user?.role === 'super_admin' &&
                        item?.status === 'TRANSFERRED',
                    className:
                        'px-2 py-1 text-xs rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors',
                    icon: RotateCcw,
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

    const isCfldTechnicalSectionForm =
        entityType === ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM &&
        Boolean(editingItem) &&
        ['economic', 'socio', 'perception'].includes(String(formData?.cfldActiveSection || '').toLowerCase())

    const isCfldPerceptionSectionForm =
        entityType === ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM &&
        Boolean(editingItem) &&
        String(formData?.cfldActiveSection || '').toLowerCase() === 'perception'

    // Custom hook for save operations with proper error handling
    const { save: saveData, isSaving } = useDataSave({
        entityType,
        activeHook: activeHook,
        isBasicMasterEntity: isBasicMasterEntity(entityType) || false,
        onSuccess: () => {
            if (isCfldTechnicalSectionForm) return
            closeForm()
        },
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
            if (isCfldTechnicalSectionForm) {
                const section = String(formData?.cfldActiveSection || '').toLowerCase()
                const statusField =
                    section === 'economic'
                        ? 'economicStatus'
                        : section === 'socio'
                            ? 'socioStatus'
                            : section === 'perception'
                                ? 'perceptionStatus'
                                : ''
                if (statusField) {
                    setFormData((prev: any) => ({
                        ...(prev || {}),
                        [statusField]: prev?.[statusField] || 'ONGOING',
                    }))
                }
            }
        } else {
            console.warn('Cannot save: missing activeHook or entityType', {
                activeHook,
                entityType,
            })
        }
    }

    const handleExport = async (format: 'pdf' | 'excel' | 'word' | 'csv') => {
        const templateKey = getExportTemplateKey(entityType)
        // Export exactly what's visible after ALL active filters (search, date
        // range, and per-column filters/sort), so a filtered download contains
        // only the filtered rows — not the full dataset.
        const exportDataSource = columnFilteredData

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
            if (
                isCfldTabMenuOpen &&
                cfldTabMenuRef.current &&
                !cfldTabMenuRef.current.contains(target)
            ) {
                setIsCfldTabMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', onDocMouseDown)
        return () => document.removeEventListener('mousedown', onDocMouseDown)
    }, [isMobileRouteMenuOpen, isExportMenuOpen, isOftFldTabMenuOpen, isCfldTabMenuOpen])

    const loading = getHookLoading(activeHook)
    // Server-paginated hooks (e.g. Equipment Master) keep the previous page via
    // placeholderData, so isLoading is false during a search/page change — only
    // isFetching flips. Surface that as an overlay spinner so the user sees the
    // table is refreshing without the rows vanishing.
    const isFetching = Boolean((activeHook as any)?.isFetching)

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
                        {entityType === ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM &&
                            renderCfldTabs()}

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
                            extraActions={
                                isCfldPerceptionSectionForm &&
                                    statusValue(formData) === 'ONGOING' ? (
                                    <button
                                        type="button"
                                        onClick={() => handleMarkCfldCompleted(formData)}
                                        disabled={
                                            isSaving ||
                                            markCfldCompletedMutation.isPending ||
                                            !itemHasCfldSavedSections(formData)
                                        }
                                        className="px-4 py-2.5 text-sm font-medium text-white bg-[#487749] rounded-xl hover:bg-[#3d6540] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        title={!itemHasCfldSavedSections(formData) ? 'Save economic, socio economic, and farmers perception sections before marking completed' : undefined}
                                    >
                                        {markCfldCompletedMutation.isPending
                                            ? 'Completing...'
                                            : 'Mark as Completed'}
                                    </button>
                                ) : null
                            }
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
                                {oftResultQuery.isLoading ? (
                                    <div className="min-h-[260px] flex items-center justify-center">
                                        <LoadingState message="Loading result…" />
                                    </div>
                                ) : (
                                    <OftResultForm
                                        embedded
                                        mode={oftResultMode}
                                        initialValue={oftResultInitialValue}
                                        sourceRows={
                                            getOftSourceRows(
                                                selectedOftItem,
                                                oftResultInitialValue
                                            )
                                        }
                                        kvkId={selectedOftItem?.kvkId ?? null}
                                        isCompleted={
                                            statusValue(selectedOftItem) ===
                                            'COMPLETED'
                                        }
                                        canMarkCompleted={
                                            statusValue(selectedOftItem) ===
                                            'ONGOING'
                                        }
                                        onClose={() => {
                                            setIsOftResultPageOpen(false)
                                            setSelectedOftId(null)
                                            setSelectedOftItem(null)
                                        }}
                                        onSubmit={handleSubmitOftResult}
                                        onMarkCompleted={() =>
                                            handleMarkOftCompleted(
                                                selectedOftItem
                                            )
                                        }
                                    />
                                )}
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
                                {fldResultQuery.isLoading ? (
                                    <div className="min-h-[260px] flex items-center justify-center">
                                        <LoadingState message="Loading result…" />
                                    </div>
                                ) : (
                                    <FldResultForm
                                        mode={fldResultMode}
                                        template={getFldResultTemplate(selectedFldItem)}
                                        initialValue={fldResultInitialValue || undefined}
                                        hasSavedResult={
                                            fldResultMode === 'edit' ||
                                            Boolean(fldResultInitialValue) ||
                                            itemHasFldResult(selectedFldItem)
                                        }
                                        isCompleted={statusValue(selectedFldItem) === 'COMPLETED'}
                                        canMarkCompleted={statusValue(selectedFldItem) === 'ONGOING'}
                                        onClose={() => {
                                            setIsFldResultPageOpen(false)
                                            setSelectedFldId(null)
                                            setSelectedFldItem(null)
                                        }}
                                        onSubmit={handleSubmitFldResult}
                                        onMarkCompleted={() => handleMarkFldCompleted(selectedFldItem)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ) : isNariNutriResultPageOpen ? (
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {nariNutriResult.isLoading ? (
                            <LoadingState message="Loading result…" />
                        ) : (
                            <NariNutritionalGardenResultForm
                                mode={
                                    nariNutriResult.resultData
                                        ? 'edit'
                                        : 'create'
                                }
                                initialValue={nariNutriResult.resultData}
                                onClose={() => {
                                    setIsNariNutriResultPageOpen(false)
                                    setSelectedNariNutriId(null)
                                }}
                                onSubmit={handleSubmitNariNutriResult}
                            />
                        )}
                    </div>
                ) : isNariBioResultPageOpen ? (
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {nariBioResult.isLoading ? (
                            <LoadingState message="Loading result…" />
                        ) : (
                            <NariBioFortifiedResultForm
                                mode={
                                    nariBioResult.resultData ? 'edit' : 'create'
                                }
                                initialValue={nariBioResult.resultData}
                                onClose={() => {
                                    setIsNariBioResultPageOpen(false)
                                    setSelectedNariBioId(null)
                                }}
                                onSubmit={handleSubmitNariBioResult}
                            />
                        )}
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

                                    {canWipeModule && (
                                        <button
                                            onClick={handleWipeAll}
                                            title="Delete ALL records of this module for your KVK (migration cleanup)"
                                            className="h-10 flex items-center gap-2 px-4 bg-white text-[#C62828] border border-[#E57373] rounded-xl text-sm font-medium hover:bg-[#FFEBEE] transition-all duration-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete All
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center px-2 pb-2">
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
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('')
                                                setDebouncedSearch('')
                                                setReportingYearFrom('')
                                                setReportingYearTo('')
                                                setColumnFilters({})
                                                setCurrentPage(1)
                                            }}
                                            disabled={
                                                !debouncedSearch &&
                                                !searchQuery &&
                                                !reportingYearFrom &&
                                                !reportingYearTo &&
                                                !Object.values(
                                                    columnFilters
                                                ).some(isColumnFilterActive)
                                            }
                                            className="h-11 inline-flex items-center gap-1.5 px-3 rounded-xl text-sm border border-[#487749] text-[#487749] bg-white hover:bg-[#E8F5E9] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                            title="Clear search, dates, and column filters"
                                        >
                                            <FilterX className="w-4 h-4" />
                                            Reset filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
                            {isFetching && !loading && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#487749]"></div>
                                </div>
                            )}
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
                                        columnFilterSourceData={filteredData}
                                        columnFilters={columnFilters}
                                        onColumnFiltersChange={setColumnFilters}
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
                                        totalItems={useServerPaging && serverPagination ? serverPagination.total : columnFilteredData.length}
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
