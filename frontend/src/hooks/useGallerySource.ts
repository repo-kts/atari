import { useMemo } from 'react'
import {
    useModuleImageCategories,
    useModuleImageKvks,
    useModuleImages,
} from './useModuleImages'
import {
    useFormAttachmentsGallery,
    useFormAttachmentsGalleryForms,
    useFormAttachmentsGalleryKvks,
} from './useFormAttachments'
import type {
    ModuleImageCategory,
    ModuleImageKvkOption,
    ModuleImageRow,
} from '@/services/moduleImagesApi'
import type { FormAttachmentRow } from '@/services/formAttachmentsApi'

export interface GalleryFilters {
    page?: number
    limit?: number
    reportingYear?: number
    kvkId?: number
    moduleId?: number
    formCode?: string
    search?: string
}

export type GalleryItem = ModuleImageRow & { source: 'module' | 'form' }

interface UseGallerySourceResult {
    images: GalleryItem[]
    categories: ModuleImageCategory[]
    kvks: ModuleImageKvkOption[]
    total: number
    isLoading: boolean
    isError: boolean
    /**
     * Counts per categoryId (moduleId for module-images; synthetic id for form
     * attachments) — sourced from unfiltered queries so the sidebar shows
     * stable counts regardless of which category is currently selected.
     */
    categoryCounts: Map<number, number>
}

const FORM_LABEL_OVERRIDES: Record<string, string> = {
    oft_result: 'OFT Result',
    nicra_farm_implement: 'NICRA Custom Hiring',
    rawe_fet: 'RAWE/FET',
    ppv_fra: 'PPV FRA',
    cfld_technical_training: 'CFLD Training Photos',
    cfld_technical_action: 'CFLD Action Photos',
    nicra_details: 'NICRA Details',
    nicra_vcrmc: 'NICRA VCRMC',
    nicra_soil_health: 'NICRA Soil Health',
    nicra_convergence: 'NICRA Convergence',
    nicra_dignitaries: 'NICRA Dignitaries',
    natural_farming_demo: 'Natural Farming Demonstration',
    natural_farming_physical: 'Natural Farming Physical',
    sac_meeting: 'SAC Meeting',
    farmer_award: 'Farmer Award',
    arya_current_year: 'ARYA Current Year',
    success_story: 'Success Story',
    kvk_staff: 'KVK Staff Photos',
}

// Maps a formCode to the sidebar group it should appear under. Falls back to
// "Form Attachments" so unknown forms still show up.
const FORM_MENU_BY_CODE: Record<string, string> = {
    oft_result: 'Achievements',
    farmer_award: 'Achievements',
    arya_current_year: 'Projects',
    nicra_details: 'Projects',
    nicra_farm_implement: 'Projects',
    nicra_vcrmc: 'Projects',
    nicra_soil_health: 'Projects',
    nicra_convergence: 'Projects',
    nicra_dignitaries: 'Projects',
    cfld_technical_training: 'Projects',
    cfld_technical_action: 'Projects',
    natural_farming_physical: 'Projects',
    natural_farming_demo: 'Projects',
    sac_meeting: 'Meetings',
    rawe_fet: 'Miscellaneous',
    ppv_fra: 'Miscellaneous',
    success_story: 'Performance Indicators',
    kvk_staff: 'About KVKs',
}

const DEFAULT_FORMS_MENU_NAME = 'Form Attachments'
const FORM_ID_OFFSET = 1_000_000

// Canonical sidebar group order. Mirrors the Form Management children in
// `frontend/src/components/layout/Sidebar.tsx` so the Gallery sidebar groups
// appear in the same order users see in the main app navigation. Includes the
// variants emitted by both `useModuleImageCategories` (backend menuName values
// — see ALLOWED_CATEGORY_MENUS in `backend/services/moduleImageService.js`)
// and `FORM_MENU_BY_CODE` above. Unknown menu names fall to the end and are
// sorted alphabetically.
const MAIN_SIDEBAR_ORDER: string[] = [
    'About KVKs',
    'Achievements',
    'Projects',
    'Performance Indicators',
    'Meetings',
    'Swachh Bharat Abhiyaan',
    'Swachhta Bharat Abhiyaan',
    'Miscellaneous',
    'Miscellaneous Information',
    'Digital Information',
    'Form Management',
    DEFAULT_FORMS_MENU_NAME,
]

function menuOrderIndex(name: string): number {
    const idx = MAIN_SIDEBAR_ORDER.indexOf(name)
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx
}

// Module-image categories that should be hidden from the gallery sidebar
// (e.g. legacy "Staff Details" — staff photos are now form attachments under
// "KVK Staff Photos" so the duplicate module-image entry is suppressed).
const HIDDEN_MODULE_CODES = new Set<string>([
    'about_kvks_staff_details',
])

function menuForFormCode(code: string): string {
    return FORM_MENU_BY_CODE[code] ?? DEFAULT_FORMS_MENU_NAME
}

function humanizeFormCode(code: string): string {
    if (FORM_LABEL_OVERRIDES[code]) return FORM_LABEL_OVERRIDES[code]
    return code
        .split(/[_-]/)
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join(' ')
}

function attachmentToRow(att: FormAttachmentRow, syntheticModuleId: number): GalleryItem {
    const reportingYear = att.reportingYearDate
        ? new Date(att.reportingYearDate).getFullYear()
        : new Date(att.createdAt).getFullYear()
    return {
        imageId: att.attachmentId + FORM_ID_OFFSET,
        kvkId: att.kvkId,
        kvkName: att.kvk?.kvkName ?? '',
        moduleId: syntheticModuleId,
        moduleCode: att.formCode,
        categoryLabel: humanizeFormCode(att.formCode),
        caption: att.caption ?? '',
        imageDate: att.createdAt,
        reportingYear,
        mimeType: att.mimeType,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        downloadUrl: att.downloadUrl,
        uploadedBy: att.uploadedBy ?? null,
        createdAt: att.createdAt,
        source: 'form',
    }
}

function moduleImageToRow(img: ModuleImageRow): GalleryItem {
    return { ...img, source: 'module' }
}

export function useGallerySource(
    filters: GalleryFilters,
    showKvkFilter: boolean,
): UseGallerySourceResult {
    // Translate selected synthetic moduleId to formCode if it belongs to forms.
    // Module-image queries should not pass a synthetic id (out of range), so
    // strip moduleId when it's >= FORM_ID_OFFSET.
    // Also treat an explicit formCode filter as a form-only selection so module
    // images don't bleed into the result list.
    const isFormSelection =
        (filters.moduleId ?? 0) >= FORM_ID_OFFSET || Boolean(filters.formCode)
    const moduleImageFilters = {
        ...filters,
        moduleId: isFormSelection ? undefined : filters.moduleId,
    }
    const formAttachmentsFilters = {
        page: filters.page,
        limit: filters.limit,
        reportingYear: filters.reportingYear,
        kvkId: filters.kvkId,
        formCode: filters.formCode,
        search: filters.search,
    }

    const moduleImagesQuery = useModuleImages(moduleImageFilters as any)
    // Second module-image query without moduleId so the sidebar counts stay
    // stable when a single module is selected (the filtered query above
    // returns only one module's rows; that's not a count of the others).
    const moduleImagesUnfilteredQuery = useModuleImages({
        ...filters,
        moduleId: undefined,
    } as any)
    const moduleCategoriesQuery = useModuleImageCategories()
    const moduleKvksQuery = useModuleImageKvks(showKvkFilter)

    const formsQuery = useFormAttachmentsGallery(formAttachmentsFilters)
    const formsListQuery = useFormAttachmentsGalleryForms()
    const formsKvksQuery = useFormAttachmentsGalleryKvks()

    const formCodeToId = useMemo(() => {
        const map = new Map<string, number>()
        const list = formsListQuery.data ?? []
        list.forEach((f, i) => {
            map.set(f.formCode, FORM_ID_OFFSET + i)
        })
        return map
    }, [formsListQuery.data])

    return useMemo<UseGallerySourceResult>(() => {
        const moduleRows = (moduleImagesQuery.data?.data ?? [])
            .filter((r) => !HIDDEN_MODULE_CODES.has(r.moduleCode ?? ''))
            .map(moduleImageToRow)
        // If user selected a module-image module, hide form rows; if user
        // selected a form, hide module-image rows. No selection -> show both.
        const formRows = (formsQuery.data?.data ?? []).map((att) => {
            const id = formCodeToId.get(att.formCode) ?? FORM_ID_OFFSET
            return attachmentToRow(att, id)
        })

        let images: GalleryItem[]
        if (isFormSelection) {
            images = formRows
        } else if (filters.moduleId && !isFormSelection) {
            images = moduleRows
        } else {
            images = [...moduleRows, ...formRows].sort((a, b) => {
                const ad = new Date(a.imageDate || a.createdAt).getTime()
                const bd = new Date(b.imageDate || b.createdAt).getTime()
                return bd - ad
            })
        }

        // Build per-category counts from the unfiltered queries so the sidebar
        // numbers stay stable when one category is selected.
        const unfilteredModuleRows = moduleImagesUnfilteredQuery.data?.data ?? []
        const moduleIdsWithImages = new Set(unfilteredModuleRows.map((r) => r.moduleId))
        const categoryCounts = new Map<number, number>()
        for (const r of unfilteredModuleRows) {
            categoryCounts.set(r.moduleId, (categoryCounts.get(r.moduleId) ?? 0) + 1)
        }
        for (const f of formsListQuery.data ?? []) {
            const id = formCodeToId.get(f.formCode) ?? FORM_ID_OFFSET
            categoryCounts.set(id, f.count)
        }

        const moduleCategories = (moduleCategoriesQuery.data ?? []).filter(
            (c) => moduleIdsWithImages.has(c.moduleId) && !HIDDEN_MODULE_CODES.has(c.moduleCode ?? ''),
        )
        const formCategories: ModuleImageCategory[] = (formsListQuery.data ?? []).map((f) => ({
            moduleId: formCodeToId.get(f.formCode) ?? FORM_ID_OFFSET,
            moduleCode: f.formCode,
            menuName: menuForFormCode(f.formCode),
            subMenuName: humanizeFormCode(f.formCode),
            label: humanizeFormCode(f.formCode),
        }))
        // Sort by canonical sidebar group order (see MAIN_SIDEBAR_ORDER above).
        // The Gallery component groups by menuName via Map insertion order, so
        // ordering the flat list here drives the displayed group order. Unknown
        // menu names go to the end, sorted alphabetically. Within-group order
        // is left to the Gallery component (which sorts items by subMenuName).
        const categories: ModuleImageCategory[] = [...moduleCategories, ...formCategories].sort(
            (a, b) => {
                const ai = menuOrderIndex(a.menuName)
                const bi = menuOrderIndex(b.menuName)
                if (ai !== bi) return ai - bi
                if (ai === Number.MAX_SAFE_INTEGER) {
                    const cmp = a.menuName.localeCompare(b.menuName)
                    if (cmp !== 0) return cmp
                }
                return 0
            },
        )

        const kvkMap = new Map<number, ModuleImageKvkOption>()
        for (const k of moduleKvksQuery.data ?? []) kvkMap.set(k.kvkId, k)
        for (const k of formsKvksQuery.data ?? []) {
            if (!kvkMap.has(k.kvkId)) kvkMap.set(k.kvkId, { kvkId: k.kvkId, kvkName: k.kvkName })
        }
        const kvks = Array.from(kvkMap.values()).sort((a, b) => a.kvkName.localeCompare(b.kvkName))

        const total =
            (moduleImagesQuery.data?.meta?.total ?? 0) + (formsQuery.data?.meta.total ?? 0)

        return {
            images,
            categories,
            kvks,
            total,
            isLoading: moduleImagesQuery.isLoading || formsQuery.isLoading,
            isError: Boolean(moduleImagesQuery.error || formsQuery.error),
            categoryCounts,
        }
    }, [
        formCodeToId,
        formsQuery.data,
        formsQuery.isLoading,
        formsQuery.error,
        formsListQuery.data,
        formsKvksQuery.data,
        moduleImagesQuery.data,
        moduleImagesQuery.isLoading,
        moduleImagesQuery.error,
        moduleImagesUnfilteredQuery.data,
        moduleCategoriesQuery.data,
        moduleKvksQuery.data,
        filters.moduleId,
        isFormSelection,
    ])
}

export function getFormCodeForModuleId(
    moduleId: number | undefined,
    categories: ModuleImageCategory[],
): string | undefined {
    if (!moduleId) return undefined
    return categories.find((c) => c.moduleId === moduleId)?.moduleCode ?? undefined
}
