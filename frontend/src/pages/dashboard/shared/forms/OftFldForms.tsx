import React, { useEffect, useCallback, useMemo } from 'react'
import { X } from 'lucide-react'
import { ENTITY_TYPES } from '../../../../constants/entityConstants'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect, FormTextArea, FormSection } from './shared/FormComponents'
import { DependentDropdown } from '../../../../components/common/DependentDropdown'
import { MasterDataDropdown } from '../../../../components/common/MasterDataDropdown'
import { SpecifyOtherInput } from '../../../../components/common/SpecifyOtherInput'
import { IsOtherCheckbox } from '../../../../components/common/IsOtherCheckbox'
import { useOtherSpecify } from '../../../../hooks/useOtherSpecify'
import {
    useOftSubjects,
    useSectors,
    useFldCategories,
    useFldSubcategories,
    useSeasons,
    useCropTypes,
    useOftThematicAreasBySubject,
    useFldThematicAreas,
    useFldCrops,
    useFldActivities,
} from '../../../../hooks/useOftFldData'
import { useDisciplines } from '../../../../hooks/forms/useAboutKvkData'
import { useKvkStaffForDropdown } from '../../../../hooks/forms/useAboutKvkData'
import { useFundingSources, useUnits } from '../../../../hooks/useOtherMastersData'
import { QUANTITY_DATA_TYPE_OPTIONS } from '../../../../constants/quantityDataType'
import { isWomenEmpowermentName } from '@/utils/fldResultTemplate'
import { useAuth } from '../../../../contexts/AuthContext'
import { useProjectData } from '../../../../hooks/useProjectData'
import { oftFldApi } from '../../../../services/oftFldApi'
import {
    createStaffOptions,
    handleStaffChange,
    createMasterDataOptions,
    filterByParentId
} from '../../../../utils/formHelpers'

interface OftFldFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

const createTechnologyOption = () => ({
    optionKey: `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    optionName: '',
    details: '',
})

const OFT_UNIT_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'ha', label: 'ha' },
    { value: 'Kg', label: 'Kg' },
    { value: 'Number', label: 'Number' },
    { value: 'Litre', label: 'Litre' },
]

const FIXED_TECHNOLOGY_OPTIONS = [
    'Farmer Practice',
    'TO1',
    'TO2',
    'TO3',
    'TO4',
    'TO5',
    'CV',
    'CD',
] as const

const buildFixedTechnologyOptions = () =>
    FIXED_TECHNOLOGY_OPTIONS.map((name) => ({
        optionKey: `fixed_${name.toLowerCase().replace(/\s+/g, '_')}`,
        optionName: name,
        details: '',
        isFixed: true,
    }))

const isFixedTechnologyName = (name: string) =>
    (FIXED_TECHNOLOGY_OPTIONS as readonly string[]).includes(String(name).trim())

const PerformanceIndicatorTagInput: React.FC<{
    value: string
    onChange: (value: string) => void
}> = ({ value, onChange }) => {
    const [draft, setDraft] = React.useState('')
    const tags = React.useMemo(
        () => String(value || '').split(',').map((s) => s.trim()).filter(Boolean),
        [value],
    )

    const commit = (raw: string) => {
        const next = raw.trim()
        if (!next) return
        if (tags.includes(next)) return
        const merged = [...tags, next].join(', ')
        onChange(merged)
    }

    const removeTag = (idx: number) => {
        const next = tags.filter((_, i) => i !== idx).join(', ')
        onChange(next)
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Performance indicators of the technology<span className="text-red-500"> *</span>
            </label>
            <div className="min-h-[44px] w-full rounded-lg border border-gray-300 px-2 py-1 flex flex-wrap gap-2 items-center">
                {tags.map((tag, i) => (
                    <span key={`${tag}-${i}`} className="inline-flex items-center gap-1 bg-[#E8F5E9] text-[#487749] px-2 py-1 rounded-full text-sm">
                        {tag}
                        <button
                            type="button"
                            className="text-[#487749] hover:text-red-600"
                            onClick={() => removeTag(i)}
                            aria-label={`remove ${tag}`}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    className="flex-1 min-w-[140px] outline-none border-0 px-1 py-1 text-sm"
                    placeholder={tags.length === 0 ? 'Type indicator and press comma or Enter…' : ''}
                    value={draft}
                    onChange={(e) => {
                        const v = e.target.value
                        if (v.endsWith(',')) {
                            commit(v.slice(0, -1))
                            setDraft('')
                            return
                        }
                        setDraft(v)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            commit(draft)
                            setDraft('')
                        } else if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
                            removeTag(tags.length - 1)
                        }
                    }}
                    onBlur={() => {
                        if (draft.trim()) {
                            commit(draft)
                            setDraft('')
                        }
                    }}
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">
                Tip: type each indicator and press <kbd className="px-1 bg-gray-100 rounded">,</kbd> or <kbd className="px-1 bg-gray-100 rounded">Enter</kbd> to add it as a tag.
            </p>
        </div>
    )
}

export const OftFldForms: React.FC<OftFldFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { user } = useAuth()

    // Automatically sync kvkId from user session if it's missing in formData
    useEffect(() => {
        if (user?.kvkId && !formData.kvkId && !formData.id) {
            setFormData((prev: any) => ({ ...prev, kvkId: user.kvkId }))
        }
    }, [user?.kvkId, formData.kvkId, formData.id, setFormData])

    // These hooks use React Query and should support 'enabled' if we add it,
    // but even without it, moving them here means they only run when the component mounts.
    // However, to be extra safe, we'll call them with enabled: isOftFld if we were to update the hooks.
    // Since we are not updating hooks yet, conditional rendering of this component in the parent is key.

    // We'll call them here. React Query hooks will trigger fetches if component is mounted.

    const { data: fundingSources = [], isLoading: isLoadingFundingSources } = useFundingSources()
    const { data: oftSubjects = [] } = useOftSubjects()
    const { data: fldSectors = [] } = useSectors()
    const { data: units = [] } = useUnits()
    const { data: fldCategories = [] } = useFldCategories()
    const { data: fldSubcategories = [] } = useFldSubcategories()
    const { data: seasons = [] } = useSeasons()
    const { data: cropTypes = [] } = useCropTypes()
    const { data: disciplines = [] } = useDisciplines()
    const { data: fldThematicAreas = [], isLoading: isLoadingFldThematicAreas } = useFldThematicAreas()
    const { data: fldCrops = [] } = useFldCrops()

    // Master-controlled "Other → specify" for the FLD Sector / Thematic Area chain.
    const sectorOptions = useMemo(
        () => createMasterDataOptions(fldSectors, 'sectorId', 'sectorName', { flagKey: 'isOther' }),
        [fldSectors]
    )
    const fldThematicOptions = useMemo(
        () => (fldThematicAreas as any[])
            .filter((t: any) => t.sectorId === formData.sectorId)
            .map((t: any) => ({
                value: t.thematicAreaId || t.fldThematicAreaId,
                label: t.thematicAreaName,
                isOther: Boolean(t.isOther),
            })),
        [fldThematicAreas, formData.sectorId]
    )
    const { isOtherSelected: isOtherSector, otherResetPatch: sectorResetPatch } = useOtherSpecify(
        sectorOptions,
        formData.sectorId
    )
    const { isOtherSelected: isOtherThematic, otherResetPatch: thematicResetPatch } = useOtherSpecify(
        fldThematicOptions,
        formData.fldThematicAreaId || formData.thematicAreaId
    )
    const fldCategoryOptions = useMemo(
        () => filterByParentId(fldCategories, 'sectorId', formData.sectorId)
            .map((c: any) => ({ value: c.categoryId, label: c.categoryName, isOther: Boolean(c.isOther) })),
        [fldCategories, formData.sectorId]
    )
    const fldSubcategoryOptions = useMemo(
        () => filterByParentId(fldSubcategories, 'categoryId', formData.categoryId)
            .map((s: any) => ({ value: s.subCategoryId, label: s.subCategoryName, isOther: Boolean(s.isOther) })),
        [fldSubcategories, formData.categoryId]
    )
    const fldCropOptions = useMemo(
        () => (fldCrops as any[])
            .filter((c: any) => c.subCategoryId === formData.subCategoryId)
            .map((c: any) => ({ value: c.cropId || c.fldCropId, label: c.cropName, isOther: Boolean(c.isOther) })),
        [fldCrops, formData.subCategoryId]
    )
    const { isOtherSelected: isOtherCategory, otherResetPatch: categoryResetPatch } = useOtherSpecify(
        fldCategoryOptions,
        formData.categoryId
    )
    const { isOtherSelected: isOtherSubCategory, otherResetPatch: subCategoryResetPatch } = useOtherSpecify(
        fldSubcategoryOptions,
        formData.subCategoryId
    )
    const { isOtherSelected: isOtherCrop, otherResetPatch: cropResetPatch } = useOtherSpecify(
        fldCropOptions,
        formData.cropId
    )

    // KVK Staff dropdown - depends on kvkId
    const activeKvkId = user?.kvkId || formData.kvkId
    const { data: kvkStaffData = [], isLoading: isLoadingKvkStaff } = useKvkStaffForDropdown(activeKvkId)

    // FLD list for extension training and technical feedback
    const { data: fldList = [] } = useProjectData(ENTITY_TYPES.ACHIEVEMENT_FLD)
    const selectedReportingYear = formData.reportingYear || ''
    const getYearValue = (value: any): number | null => {
        if (!value) return null
        const parsed = new Date(value)
        if (!Number.isNaN(parsed.getTime())) return parsed.getFullYear()
        const text = String(value)
        const match = text.match(/^(\d{4})/)
        return match ? Number(match[1]) : null
    }
    // FLD now has a persisted reporting year. Older migrated rows can still be
    // null, so fall back to startYear/startDate for those records.
    const getFldYear = (f: any): number | null => {
        const reportingYear = getYearValue(f?.reportingYear)
        if (reportingYear != null) return reportingYear
        if (f?.startYear != null) return Number(f.startYear)
        return getYearValue(f?.startDate ?? f?.expectedCompletionDate)
    }
    const fldOptionsByKvkAndYear = useMemo(() => {
        return (fldList as any[]).filter((f: any) => {
            const fldKvkId = f.kvkId ?? f.kvk?.kvkId
            const fldYear = getFldYear(f)
            const selectedYear = getYearValue(selectedReportingYear)
            const kvkMatch = activeKvkId ? Number(fldKvkId) === Number(activeKvkId) : true
            const yearMatch = selectedYear ? Number(fldYear) === Number(selectedYear) : false
            return kvkMatch && yearMatch
        })
    }, [fldList, activeKvkId, selectedReportingYear])
    const selectedReportingYearNumber = useMemo(
        () => getYearValue(selectedReportingYear),
        [selectedReportingYear]
    )
    const selectedFldForTechnicalFeedback = useMemo(
        () => fldOptionsByKvkAndYear.find((f: any) => Number(f.kvkFldId || f.id) === Number(formData.fldId)),
        [fldOptionsByKvkAndYear, formData.fldId]
    )
    const cropOptionsForSelectedFld = useMemo(() => {
        if (!selectedFldForTechnicalFeedback) return []
        const cropId = selectedFldForTechnicalFeedback.cropId
        if (!cropId) return []
        const cropName =
            selectedFldForTechnicalFeedback.cropName ||
            fldCrops.find((c: any) => Number(c.cropId) === Number(cropId))?.cropName ||
            `Crop ${cropId}`
        const cropMaster = fldCrops.find((c: any) => Number(c.cropId) === Number(cropId))
        return [{ value: cropId, label: cropName, isOther: Boolean(cropMaster?.isOther) }]
    }, [selectedFldForTechnicalFeedback, fldCrops])
    const { isOtherSelected: isOtherFeedbackCrop, otherResetPatch: feedbackCropResetPatch } = useOtherSpecify(
        cropOptionsForSelectedFld,
        formData.cropId,
    )
    const seasonOptions = useMemo(
        () => createMasterDataOptions(seasons, 'seasonId', 'seasonName', { flagKey: 'isOther' }),
        [seasons],
    )
    const { isOtherSelected: isOtherSeason, otherResetPatch: seasonResetPatch } = useOtherSpecify(
        seasonOptions,
        formData.seasonId,
    )

    // FldActivity list for extension training - using the proper hook
    const { data: activityList = [] } = useFldActivities()
    const fldActivityOptions = React.useMemo(
        () => createMasterDataOptions(activityList, 'activityId', 'activityName', { flagKey: 'isOther' }),
        [activityList]
    )
    const { isOtherSelected: isOtherFldActivity, otherResetPatch: fldActivityResetPatch } = useOtherSpecify(fldActivityOptions, formData.activityId)

    // OFT Thematic Areas - depends on subjectId
    const { data: oftThematicAreasData = [], isLoading: isLoadingOftThematicAreas } = useOftThematicAreasBySubject(
        formData.oftSubjectId ? parseInt(formData.oftSubjectId) : null
    )

    // Master-controlled "Other → specify" for the OFT Subject / Thematic Area chain.
    const oftSubjectOptions = useMemo(
        () => createMasterDataOptions(oftSubjects, 'oftSubjectId', 'subjectName', { flagKey: 'isOther' }),
        [oftSubjects]
    )
    const oftThematicOptions = useMemo(
        () => (oftThematicAreasData as any[]).map((t: any) => ({
            value: t.oftThematicAreaId,
            label: t.thematicAreaName,
            isOther: Boolean(t.isOther),
        })),
        [oftThematicAreasData]
    )
    const { isOtherSelected: isOtherOftSubject, otherResetPatch: oftSubjectResetPatch } = useOtherSpecify(
        oftSubjectOptions,
        formData.oftSubjectId
    )
    const { isOtherSelected: isOtherOftThematic, otherResetPatch: oftThematicResetPatch } = useOtherSpecify(
        oftThematicOptions,
        formData.oftThematicAreaId
    )
    const oftDisciplineOptions = useMemo(
        () => createMasterDataOptions(disciplines, 'disciplineId', 'disciplineName', { flagKey: 'isOther' }),
        [disciplines]
    )
    const oftFundingOptions = useMemo(
        () => createMasterDataOptions(fundingSources as any[], 'fundingSourceId', 'name', { flagKey: 'isOther' }),
        [fundingSources]
    )
    const { isOtherSelected: isOtherDiscipline, otherResetPatch: disciplineResetPatch } = useOtherSpecify(
        oftDisciplineOptions,
        formData.disciplineId
    )
    const { isOtherSelected: isOtherFunding, otherResetPatch: fundingResetPatch } = useOtherSpecify(
        oftFundingOptions,
        formData.sourceOfFundingId
    )

    // Memoized onOptionsLoad functions to prevent infinite re-renders
    const loadOftThematicAreas = useCallback(async (subjectId: any) => {
        const response = await oftFldApi.getOftThematicAreasBySubject(subjectId as number);
        return response.data.map((thematicArea: any) => ({
            value: thematicArea.oftThematicAreaId,
            label: thematicArea.thematicAreaName,
            isOther: Boolean(thematicArea.isOther)
        }));
    }, []);

    const loadFldThematicAreas = useCallback(async (sectorId: any) => {
        const response = await oftFldApi.getFldThematicAreasBySector(sectorId as number);
        return response.data.map((thematicArea: any) => ({
            value: thematicArea.thematicAreaId || thematicArea.fldThematicAreaId,
            label: thematicArea.thematicAreaName,
            isOther: Boolean(thematicArea.isOther)
        }));
    }, []);

    const loadFldCategories = useCallback(async (sectorId: any) => {
        const response = await oftFldApi.getFldCategoriesBySector(sectorId as number);
        return createMasterDataOptions(response.data, 'categoryId', 'categoryName', { flagKey: 'isOther' });
    }, []);

    const loadFldSubcategories = useCallback(async (categoryId: any) => {
        const response = await oftFldApi.getFldSubcategoriesByCategory(categoryId as number);
        return createMasterDataOptions(response.data, 'subCategoryId', 'subCategoryName', { flagKey: 'isOther' });
    }, []);

    const loadFldCrops = useCallback(async (subCategoryId: any) => {
        const response = await oftFldApi.getFldCropsBySubcategory(subCategoryId as number);
        return response.data.map((crop: any) => ({
            value: crop.cropId || crop.fldCropId,
            label: crop.cropName,
            isOther: Boolean(crop.isOther)
        }));
    }, []);

    const loadFldByKvkAndYear = useCallback(async (compositeValue: any) => {
        const parsed = String(compositeValue || '')
        const [kvkIdRaw, yearRaw] = parsed.split('-')
        const kvkId = Number(kvkIdRaw)
        const reportingYear = Number(yearRaw)

        if (!Number.isFinite(kvkId) || !Number.isFinite(reportingYear)) {
            return []
        }

        return (fldList as any[])
            .filter((f: any) => {
                const fldKvkId = f.kvkId ?? f.kvk?.kvkId
                const fldYear = getFldYear(f)
                return Number(fldKvkId) === kvkId && Number(fldYear) === reportingYear
            })
            .map((f: any) => ({
                value: f.kvkFldId || f.id,
                label: f.fldName || f.technologyName || `FLD ${f.kvkFldId || f.id}`,
            }))
    }, [fldList])

    // Derive sectorId from categoryId when editing FLD_CROPS
    useEffect(() => {
        if (entityType === ENTITY_TYPES.FLD_CROPS && formData.categoryId && !formData.sectorId && fldCategories.length > 0) {
            const category = fldCategories.find((c: any) => c.categoryId === formData.categoryId)
            if (category && category.sectorId) {
                setFormData((prev: any) => ({ ...prev, sectorId: category.sectorId }))
            }
        }
    }, [entityType, formData.categoryId, formData.sectorId, fldCategories, setFormData])

    // Normalize reportingYear for edit forms (prefer canonical Date field)
    useEffect(() => {
        if (entityType === ENTITY_TYPES.ACHIEVEMENT_OFT || entityType === ENTITY_TYPES.ACHIEVEMENT_FLD) {
            setFormData((prev: any) => {
                const updates: any = {}
                if (!prev.reportingYear) {
                    return prev
                }

                if (Object.keys(updates).length === 0) return prev
                return { ...prev, ...updates }
            })
        }
    }, [entityType, setFormData])

    // FLD edit: the stored category / sub-category can be stale (masters were
    // re-seeded and ids shifted), so the dependent Sub Category / Crop dropdowns
    // can't match them and render empty. The crop (leaf) is reliable — derive the
    // correct sub-category and category from it so both dropdowns prefill, and the
    // corrected chain is saved on update.
    useEffect(() => {
        if (entityType !== ENTITY_TYPES.ACHIEVEMENT_FLD) return
        if (formData.cropId == null || formData.cropId === '') return
        const crop = (fldCrops as any[]).find(
            (c) => Number(c.cropId ?? c.fldCropId) === Number(formData.cropId),
        )
        if (!crop || crop.subCategoryId == null) return
        const sub = (fldSubcategories as any[]).find(
            (s) => Number(s.subCategoryId) === Number(crop.subCategoryId),
        )
        setFormData((prev: any) => {
            const updates: any = {}
            if (Number(prev.subCategoryId) !== Number(crop.subCategoryId)) {
                updates.subCategoryId = crop.subCategoryId
            }
            if (sub?.categoryId != null && Number(prev.categoryId) !== Number(sub.categoryId)) {
                updates.categoryId = sub.categoryId
            }
            return Object.keys(updates).length ? { ...prev, ...updates } : prev
        })
    }, [entityType, formData.cropId, fldCrops, fldSubcategories, setFormData])

    useEffect(() => {
        if (entityType !== ENTITY_TYPES.ACHIEVEMENT_OFT) return
        if (Array.isArray(formData.technologyOptions)) return

        const legacyOptions = Object.keys(formData || {})
            .filter((key) => key.startsWith('tech_'))
            .map((key) => ({
                optionKey: `legacy_${key}`,
                optionName: key.replace(/^tech_/, '').trim(),
                details: formData[key] || '',
                isFixed: isFixedTechnologyName(key.replace(/^tech_/, '').trim()),
            }))
            .filter((row) => row.optionName)

        setFormData((prev: any) => ({
            ...prev,
            technologyOptions: legacyOptions.length > 0 ? legacyOptions : buildFixedTechnologyOptions(),
        }))
    }, [entityType, formData, setFormData])

    // Ensure CropName, seasonId, and typeId are correctly populated for CFLD_CROPS
    useEffect(() => {
        if (entityType === ENTITY_TYPES.CFLD_CROPS) {
            setFormData((prev: any) => {
                const updates: any = {}
                let hasUpdates = false

                // Preserve CropName if it exists (check both capital C and lowercase for compatibility)
                if (prev.cropName && !prev.CropName) {
                    updates.CropName = prev.cropName
                    hasUpdates = true
                }

                // Extract seasonId from nested season object if not directly available
                if (!prev.seasonId && prev.season && prev.season.seasonId) {
                    updates.seasonId = prev.season.seasonId
                    hasUpdates = true
                }

                // Extract typeId from nested cropType object if not directly available
                if (!prev.typeId && prev.cropType && prev.cropType.typeId) {
                    updates.typeId = prev.cropType.typeId
                    hasUpdates = true
                }

                if (!hasUpdates) return prev
                return { ...prev, ...updates }
            })
        }
    }, [entityType, setFormData])

    if (!entityType) return null

    return (
        <>
            {/* ALL MAsters forms-------------- */}
            {entityType === ENTITY_TYPES.OFT_SUBJECTS && (
                <div className="space-y-4">
                    <FormInput
                        label="Subject Name"
                        required
                        value={formData.subjectName ?? ''}
                        onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                        placeholder="Enter subject name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.OFT_THEMATIC_AREAS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Subject"
                        required
                        value={formData.oftSubjectId ?? ''}
                        onChange={(e) => setFormData({ ...formData, oftSubjectId: parseInt(e.target.value) })}
                        options={oftSubjects.map(s => ({ value: s.oftSubjectId, label: s.subjectName }))}
                    />
                    <FormInput
                        label="Thematic Area Name"
                        required
                        value={formData.thematicAreaName ?? ''}
                        onChange={(e) => setFormData({ ...formData, thematicAreaName: e.target.value })}
                        placeholder="Enter thematic area name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FLD_SECTORS && (
                <div className="space-y-4">
                    <FormInput
                        label="Sector Name"
                        required
                        value={formData.sectorName ?? ''}
                        onChange={(e) => setFormData({ ...formData, sectorName: e.target.value })}
                        placeholder="Enter sector name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FLD_THEMATIC_AREAS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Sector"
                        required
                        value={formData.sectorId ?? ''}
                        onChange={(e) => setFormData({ ...formData, sectorId: parseInt(e.target.value) })}
                        options={fldSectors.map(s => ({ value: s.sectorId, label: s.sectorName }))}
                    />
                    <FormInput
                        label="Thematic Area Name"
                        required
                        value={formData.thematicAreaName ?? ''}
                        onChange={(e) => setFormData({ ...formData, thematicAreaName: e.target.value })}
                        placeholder="Enter thematic area name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FLD_CATEGORIES && (
                <div className="space-y-4">
                    <FormSelect
                        label="Sector"
                        required
                        value={formData.sectorId ?? ''}
                        onChange={(e) => setFormData({ ...formData, sectorId: parseInt(e.target.value) })}
                        options={fldSectors.map(s => ({ value: s.sectorId, label: s.sectorName }))}
                    />
                    <FormInput
                        label="Category Name"
                        required
                        value={formData.categoryName ?? ''}
                        onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                        placeholder="Enter category name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FLD_SUBCATEGORIES && (
                <div className="space-y-4">
                    <FormSelect
                        label="Sector"
                        required
                        value={formData.sectorId ?? ''}
                        onChange={(e) => {
                            const sectorId = parseInt(e.target.value)
                            setFormData({ ...formData, sectorId, categoryId: '' })
                        }}
                        options={fldSectors.map(s => ({ value: s.sectorId, label: s.sectorName }))}
                    />
                    <FormSelect
                        label="Category"
                        required
                        value={formData.categoryId ?? ''}
                        onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                        disabled={!formData.sectorId}
                        options={fldCategories
                            .filter((c: any) => c.sectorId === formData.sectorId)
                            .map(c => ({ value: c.categoryId, label: c.categoryName }))}
                    />
                    <FormInput
                        label="Subcategory Name"
                        required
                        value={formData.subCategoryName ?? ''}
                        onChange={(e) => setFormData({ ...formData, subCategoryName: e.target.value })}
                        placeholder="Enter subcategory name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FLD_CROPS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Sector"
                        required
                        value={formData.sectorId ?? ''}
                        onChange={(e) => {
                            const sectorId = parseInt(e.target.value)
                            setFormData({ ...formData, sectorId, categoryId: '', subCategoryId: '' })
                        }}
                        options={fldSectors.map(s => ({ value: s.sectorId, label: s.sectorName }))}
                    />
                    <FormSelect
                        label="Category"
                        required
                        value={formData.categoryId ?? ''}
                        onChange={(e) => {
                            const categoryId = parseInt(e.target.value)
                            setFormData({ ...formData, categoryId, subCategoryId: '' })
                        }}
                        disabled={!formData.sectorId}
                        options={fldCategories
                            .filter((c: any) => c.sectorId === formData.sectorId)
                            .map(c => ({ value: c.categoryId, label: c.categoryName }))}
                    />
                    <FormSelect
                        label="Subcategory"
                        required
                        value={formData.subCategoryId ?? ''}
                        onChange={(e) => setFormData({ ...formData, subCategoryId: parseInt(e.target.value) })}
                        disabled={!formData.categoryId}
                        options={fldSubcategories
                            .filter((s: any) => s.categoryId === formData.categoryId)
                            .map(s => ({ value: s.subCategoryId, label: s.subCategoryName }))}
                    />
                    <FormInput
                        label="Crop Name"
                        required
                        value={formData.cropName ?? ''}
                        onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                        placeholder="Enter crop name"
                    />
                    <FormSelect
                        label="Unit"
                        value={formData.unitId ?? ''}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                unitId: e.target.value ? parseInt(e.target.value) : null,
                            })
                        }
                        options={units.map(u => ({ value: u.unitId, label: u.unitName }))}
                    />
                    <FormSelect
                        label="Quantity Data Type"
                        value={formData.quantityDataType ?? ''}
                        onChange={(e) =>
                            setFormData({ ...formData, quantityDataType: e.target.value || null })
                        }
                        options={QUANTITY_DATA_TYPE_OPTIONS}
                    />
                    <label className="flex items-center gap-2 text-sm text-[#212121] cursor-pointer">
                        <input
                            type="checkbox"
                            checked={Boolean(formData.quantityRequired)}
                            onChange={(e) =>
                                setFormData({ ...formData, quantityRequired: e.target.checked })
                            }
                        />
                        Quantity required in forms
                    </label>
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FLD_ACTIVITIES && (
                <div className="space-y-4">
                    <FormInput
                        label="Activity Name"
                        required
                        value={formData.activityName ?? ''}
                        onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                        placeholder="Enter activity name"
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData({ ...formData, isOther: checked })} />
                </div>
            )}

            {entityType === ENTITY_TYPES.CFLD_CROPS && (
                <div className="space-y-4">
                    <MasterDataDropdown
                        label="Season"
                        required
                        value={formData.seasonId ?? ''}
                        onChange={(value) => setFormData({ ...formData, seasonId: value as number })}
                        options={createMasterDataOptions(seasons, 'seasonId', 'seasonName')}
                        emptyMessage="No seasons available"
                    />
                    <FormSelect
                        label="Type"
                        required
                        value={formData.typeId ?? ''}
                        onChange={(e) => setFormData({ ...formData, typeId: parseInt(e.target.value) })}
                        options={cropTypes.map(t => ({ value: t.typeId, label: t.typeName }))}
                    />
                    <FormInput
                        label="Crop Name"
                        required
                        value={formData.CropName ?? ''}
                        onChange={(e) => setFormData({ ...formData, CropName: e.target.value })}
                        placeholder="Enter crop name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {/* Achievement OFT forms-------------- */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_OFT && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="OFT Start Date"
                            required
                            type="date"
                            value={formData.duration ?? formData.oftStartDate ?? ''}
                            onChange={(e) => {
                                const next = e.target.value
                                const expected = formData.expectedCompletionDate
                                const expectedInvalid = expected && next && expected < next
                                // Reporting year is derived from the start date
                                // (field hidden; backend is authoritative). Mirror
                                // it so client-side year filters stay in sync.
                                setFormData({
                                    ...formData,
                                    duration: next,
                                    oftStartDate: next,
                                    reportingYear: next,
                                    ...(expectedInvalid ? { expectedCompletionDate: '' } : {}),
                                })
                            }}
                        />
                        <FormInput
                            label="Expected Completion Date"
                            required
                            type="date"
                            min={(formData.duration ?? formData.oftStartDate ?? '') as string}
                            value={formData.expectedCompletionDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
                        />

                        <DependentDropdown
                            label="Name of SMS/KVK Head"
                            required
                            value={formData.staffId || formData.staffName || ''}
                            onChange={(value) => handleStaffChange(value, kvkStaffData || [], setFormData, formData)}
                            options={createStaffOptions(kvkStaffData || [])}
                            dependsOn={{
                                value: activeKvkId,
                                field: 'kvkId',
                            }}
                            cacheKey="kvk-staff-dropdown"
                            emptyMessage="No SMS/KVK Head staff available for this KVK"
                            loadingMessage="Loading staff..."
                            isLoading={isLoadingKvkStaff}
                        />

                        <MasterDataDropdown
                            label="Season"
                            required
                            value={formData.seasonId ?? ''}
                            onChange={(value) => setFormData({ ...formData, seasonId: value as number, ...seasonResetPatch(value, 'seasonOther') })}
                            options={seasonOptions}
                            emptyMessage="No seasons available"
                        />
                        {isOtherSeason && (
                            <SpecifyOtherInput label="Please specify other season" required value={formData.seasonOther} onChange={(e) => setFormData({ ...formData, seasonOther: e.target.value })} />
                        )}

                        <MasterDataDropdown
                            label="OFT Subject"
                            required
                            value={formData.oftSubjectId ?? ''}
                            onChange={(value) => {
                                setFormData({
                                    ...formData,
                                    oftSubjectId: value as number,
                                    oftThematicAreaId: '',
                                    thematicArea: '',
                                    // Clear thematic "other" too — the thematic selection resets with the subject.
                                    oftThematicAreaOther: '',
                                    // Clear the subject "specify other" unless the newly picked subject is the Other row.
                                    ...oftSubjectResetPatch(value, 'oftSubjectOther'),
                                });
                            }}
                            options={oftSubjectOptions}
                            emptyMessage="No OFT subjects available"
                        />

                        {isOtherOftSubject && (
                            <SpecifyOtherInput
                                label="Please specify other subject"
                                required
                                value={formData.oftSubjectOther}
                                onChange={(e) => setFormData({ ...formData, oftSubjectOther: e.target.value })}
                            />
                        )}

                        <DependentDropdown
                            label="Thematic Area"
                            required
                            value={formData.oftThematicAreaId || formData.thematicArea || ''}
                            onChange={(value) => {
                                const selectedThematicArea = oftThematicAreasData?.find((t: any) => t.oftThematicAreaId === value);
                                setFormData({
                                    ...formData,
                                    oftThematicAreaId: value as number,
                                    thematicArea: selectedThematicArea?.thematicAreaName || '',
                                    // Clear the "specify other" text unless the newly picked area is the Other row.
                                    ...oftThematicResetPatch(value, 'oftThematicAreaOther'),
                                });
                            }}
                            options={oftThematicOptions}
                            dependsOn={{
                                value: formData.oftSubjectId ? parseInt(formData.oftSubjectId) : null,
                                field: 'oftSubjectId',
                            }}
                            onOptionsLoad={loadOftThematicAreas}
                            cacheKey="oft-thematic-areas-by-subject"
                            emptyMessage="No thematic areas available for this subject"
                            loadingMessage="Loading thematic areas..."
                            isLoading={isLoadingOftThematicAreas}
                        />

                        {isOtherOftThematic && (
                            <SpecifyOtherInput
                                label="Please specify other thematic area"
                                required
                                value={formData.oftThematicAreaOther}
                                onChange={(e) => setFormData({ ...formData, oftThematicAreaOther: e.target.value })}
                            />
                        )}

                        <MasterDataDropdown
                            label="Discipline"
                            required
                            value={formData.disciplineId || formData.discipline || ''}
                            onChange={(value) => {
                                const disciplineId = value as number;
                                const selectedDiscipline = disciplines.find((d: any) => d.disciplineId === disciplineId);
                                setFormData({
                                    ...formData,
                                    disciplineId: disciplineId,
                                    discipline: selectedDiscipline?.disciplineName || '',
                                    ...disciplineResetPatch(disciplineId, 'disciplineOther'),
                                });
                            }}
                            options={oftDisciplineOptions}
                            emptyMessage="No disciplines available"
                        />
                        {isOtherDiscipline && (
                            <SpecifyOtherInput
                                label="Please specify other discipline"
                                required
                                value={formData.disciplineOther}
                                onChange={(e) => setFormData({ ...formData, disciplineOther: e.target.value })}
                            />
                        )}
                        <FormInput
                            label="Title of On Farm Trial (OFT)"
                            required
                            value={formData.title ?? ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <FormTextArea
                            label="Problem diagnosted"
                            required
                            value={formData.problemDiagnosed ?? ''}
                            onChange={(e) => setFormData({ ...formData, problemDiagnosed: e.target.value })}
                        />
                        <FormInput
                            label="Source of Technology (ICAR/ SAU/Other, please specify)"
                            required
                            value={formData.sourceOfTechnology ?? ''}
                            onChange={(e) => setFormData({ ...formData, sourceOfTechnology: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Source of Funding"
                            required
                            value={formData.sourceOfFundingId ?? ''}
                            onChange={(value) => setFormData({
                                ...formData,
                                sourceOfFundingId: value as number,
                                ...fundingResetPatch(value, 'sourceOfFundingOther'),
                            })}
                            options={oftFundingOptions}
                            emptyMessage="No funding sources available"
                            isLoading={isLoadingFundingSources}
                        />
                        {isOtherFunding && (
                            <SpecifyOtherInput
                                label="Please specify other funding source"
                                required
                                value={formData.sourceOfFundingOther}
                                onChange={(e) => setFormData({ ...formData, sourceOfFundingOther: e.target.value })}
                            />
                        )}
                        <FormInput
                            label="Funding Agency Name"
                            value={formData.fundingAgencyName ?? ''}
                            onChange={(e) => setFormData({ ...formData, fundingAgencyName: e.target.value })}
                            placeholder="Enter funding agency name"
                        />
                        <FormInput
                            label="Production system and thematic area"
                            required
                            value={formData.productionSystem ?? ''}
                            onChange={(e) => setFormData({ ...formData, productionSystem: e.target.value })}
                        />

                        <div className="md:col-span-2">
                            <PerformanceIndicatorTagInput
                                value={formData.performanceIndicators ?? ''}
                                onChange={(next) => setFormData({ ...formData, performanceIndicators: next })}
                            />
                        </div>

                        <div className="grid grid-cols-[120px_1fr] gap-3">
                            <FormSelect
                                label="Unit"
                                required
                                value={formData.unit ?? ''}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                options={OFT_UNIT_OPTIONS}
                            />
                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                value={formData.quantity ?? formData.area ?? ''}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value, area: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <FormInput
                                label="No. of location"
                                required
                                value={formData.locations ?? ''}
                                onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                            />
                            <FormInput
                                label="No. of Trial/Replication"
                                required
                                value={formData.replications ?? ''}
                                onChange={(e) => setFormData({ ...formData, replications: e.target.value })}
                            />
                        </div>
                        <FormInput
                            label="Critical Input"
                            required
                            value={formData.criticalInput ?? ''}
                            onChange={(e) => setFormData({ ...formData, criticalInput: e.target.value })}
                        />
                        <FormInput
                            label="Cost of OFT"
                            required
                            type="number"
                            value={formData.cost ?? ''}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        />
                    </div>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <FormInput label="General_M" type="number" value={formData.gen_m ?? ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} required />
                                <FormInput label="General_F" type="number" value={formData.gen_f ?? ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} required />
                                <FormInput label="OBC_M" type="number" value={formData.obc_m ?? ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} required />
                                <FormInput label="OBC_F" type="number" value={formData.obc_f ?? ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} required />

                                <FormInput label="SC_M" type="number" value={formData.sc_m ?? ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} required />
                                <FormInput label="SC_F" type="number" value={formData.sc_f ?? ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} required />
                                <FormInput label="ST_M" type="number" value={formData.st_m ?? ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} required />
                                <FormInput label="ST_F" type="number" value={formData.st_f ?? ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} required />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9]">
                                    <span className="text-xs font-semibold text-[#2E7D32] uppercase">Total Male</span>
                                    <span className="text-sm font-bold text-[#1B5E20] tabular-nums">
                                        {(Number(formData.gen_m) || 0) +
                                            (Number(formData.obc_m) || 0) +
                                            (Number(formData.sc_m) || 0) +
                                            (Number(formData.st_m) || 0)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCE4EC] border border-[#F8BBD0]">
                                    <span className="text-xs font-semibold text-[#AD1457] uppercase">Total Female</span>
                                    <span className="text-sm font-bold text-[#880E4F] tabular-nums">
                                        {(Number(formData.gen_f) || 0) +
                                            (Number(formData.obc_f) || 0) +
                                            (Number(formData.sc_f) || 0) +
                                            (Number(formData.st_f) || 0)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB]">
                                    <span className="text-xs font-semibold text-[#1565C0] uppercase">Overall Total</span>
                                    <span className="text-sm font-bold text-[#0D47A1] tabular-nums">
                                        {(Number(formData.gen_m) || 0) +
                                            (Number(formData.gen_f) || 0) +
                                            (Number(formData.obc_m) || 0) +
                                            (Number(formData.obc_f) || 0) +
                                            (Number(formData.sc_m) || 0) +
                                            (Number(formData.sc_f) || 0) +
                                            (Number(formData.st_m) || 0) +
                                            (Number(formData.st_f) || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </FormSection>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">
                            Details of technologies selected for assessment/refinement:
                        </h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 text-sm font-medium text-gray-600">
                                <div>Technology options<span className="text-red-500">*</span></div>
                                <div>Details<span className="text-red-500">*</span></div>
                                <div></div>
                            </div>
                            {(Array.isArray(formData.technologyOptions) ? formData.technologyOptions : []).map((tech: any, index: number) => {
                                const fixed = tech.isFixed || isFixedTechnologyName(tech.optionName)
                                return (
                                    <div key={tech.optionKey || index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-start">
                                        <input
                                            type="text"
                                            className={`h-10 w-full rounded-lg border px-3 ${fixed ? 'bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200' : 'border-gray-300'}`}
                                            placeholder="Enter option name"
                                            value={tech.optionName ?? ''}
                                            readOnly={fixed}
                                            onChange={(e) => {
                                                if (fixed) return
                                                const next = [...(formData.technologyOptions || [])]
                                                next[index] = { ...next[index], optionName: e.target.value }
                                                setFormData({ ...formData, technologyOptions: next, hasTechnologiesUpdate: true })
                                            }}
                                        />
                                        <textarea
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 min-h-[40px]"
                                            placeholder="Description"
                                            value={tech.details ?? ''}
                                            onChange={(e) => {
                                                const next = [...(formData.technologyOptions || [])]
                                                next[index] = { ...next[index], details: e.target.value }
                                                setFormData({ ...formData, technologyOptions: next, hasTechnologiesUpdate: true })
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="h-10 px-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                                            title="Remove"
                                            onClick={() => {
                                                const next = (formData.technologyOptions || []).filter((_: any, i: number) => i !== index)
                                                setFormData({ ...formData, technologyOptions: next, hasTechnologiesUpdate: true })
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )
                            })}
                            <button
                                type="button"
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                                onClick={() => {
                                    const next = [...(formData.technologyOptions || []), createTechnologyOption()]
                                    setFormData({ ...formData, technologyOptions: next, hasTechnologiesUpdate: true })
                                }}
                            >
                                Add Technology Option
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* WIP: result form is pending and some more fields are needed(end date) */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_FLD && (
                <div className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ?? ''}
                            onChange={(e) => {
                                const next = e.target.value
                                const expected = formData.expectedCompletionDate
                                const expectedInvalid = expected && next && expected < next
                                // Reporting year is derived from the start date
                                // (field hidden; backend is authoritative). Mirror
                                // it so client-side year filters stay in sync.
                                setFormData({
                                    ...formData,
                                    startDate: next,
                                    reportingYear: next,
                                    ...(expectedInvalid ? { expectedCompletionDate: '' } : {}),
                                })
                            }}
                        />
                        <FormInput
                            label="Expected Completion Date"
                            required
                            type="date"
                            min={(formData.startDate ?? '') as string}
                            value={formData.expectedCompletionDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
                        />

                        {/* Name of SMS/KVK Head - From KVK Staff API */}
                        <DependentDropdown
                            label="Name of SMS/KVK Head"
                            required
                            value={formData.staffId || formData.staffName || ''}
                            onChange={(value) => handleStaffChange(value, kvkStaffData || [], setFormData, formData)}
                            options={createStaffOptions(kvkStaffData || [])}
                            dependsOn={{
                                value: activeKvkId,
                                field: 'kvkId',
                            }}
                            // Don't use onOptionsLoad - we already have data from useKvkStaffForDropdown hook
                            // This prevents duplicate API calls
                            cacheKey="kvk-staff-dropdown"
                            emptyMessage="No SMS/KVK Head staff available for this KVK"
                            loadingMessage="Loading staff..."
                            isLoading={isLoadingKvkStaff}
                        />

                        {/* Season - From Season Master */}
                        <MasterDataDropdown
                            label="Season"
                            required
                            value={formData.seasonId ?? ''}
                            onChange={(value) => setFormData({ ...formData, seasonId: value as number, ...seasonResetPatch(value, 'seasonOther') })}
                            options={seasonOptions}
                            emptyMessage="No seasons available"
                        />
                        {isOtherSeason && (
                            <SpecifyOtherInput label="Please specify other season" required value={formData.seasonOther} onChange={(e) => setFormData({ ...formData, seasonOther: e.target.value })} />
                        )}

                        <MasterDataDropdown
                            label="Sector"
                            required
                            value={formData.sectorId ?? ''}
                            onChange={(value) => {
                                const sectorName = fldSectors.find((s: any) => s.sectorId === value)?.sectorName ?? ''
                                const isWomenEmpowerment = isWomenEmpowermentName(sectorName)
                                setFormData({
                                    ...formData,
                                    sectorId: value as number,
                                    categoryId: '', // Reset category when sector changes
                                    subCategoryId: '', // Reset subcategory when sector changes
                                    cropId: '', // Reset crop when sector changes
                                    // Child specify-other texts reset with their dropdowns.
                                    categoryOther: '',
                                    subCategoryOther: '',
                                    cropOther: '',
                                    // Women Empowerment has no measurable unit/quantity — clear any stale values.
                                    ...(isWomenEmpowerment ? { unitId: null, unit: '', quantity: '', area: '' } : {}),
                                    // Clear the "specify other" text unless the newly picked sector is the Other row.
                                    ...sectorResetPatch(value, 'sectorOther'),
                                });
                            }}
                            options={sectorOptions}
                            emptyMessage="No sectors available"
                        />

                        {isOtherSector && (
                            <SpecifyOtherInput
                                label="Please specify other sector"
                                required
                                value={formData.sectorOther}
                                onChange={(e) => setFormData({ ...formData, sectorOther: e.target.value })}
                            />
                        )}

                        {/* Thematic Area - Dependent on Sector */}
                        <DependentDropdown
                            label="Thematic Area"
                            required
                            value={formData.fldThematicAreaId || formData.thematicAreaId || ''}
                            onChange={(value) => {
                                // Ensure value is a number (ID), not a string
                                const numericValue = value === '' || value === null || value === undefined
                                    ? null
                                    : (typeof value === 'number' ? value : parseInt(String(value), 10));

                                // Validate that we got a valid number
                                if (numericValue !== null && isNaN(numericValue)) {
                                    console.error('Invalid thematic area ID:', value);
                                    return;
                                }

                                // API returns thematicAreaId (not fldThematicAreaId)
                                const selectedThematicArea = fldThematicAreas.find((t: any) =>
                                    (t.thematicAreaId === numericValue) || (t.fldThematicAreaId === numericValue)
                                );
                                setFormData({
                                    ...formData,
                                    fldThematicAreaId: numericValue, // Frontend uses fldThematicAreaId for consistency
                                    thematicAreaId: numericValue, // Backend uses thematicAreaId
                                    thematicArea: selectedThematicArea?.thematicAreaName || '',
                                    // Clear the "specify other" text unless the newly picked area is the Other row.
                                    ...thematicResetPatch(numericValue, 'thematicAreaOther'),
                                });
                            }}
                            options={fldThematicOptions}
                            dependsOn={{
                                value: formData.sectorId,
                                field: 'sectorId',
                            }}
                            onOptionsLoad={loadFldThematicAreas}
                            cacheKey="fld-thematic-areas-by-sector"
                            emptyMessage="No thematic areas available for this sector"
                            loadingMessage="Loading thematic areas..."
                            isLoading={isLoadingFldThematicAreas}
                        />

                        {isOtherThematic && (
                            <SpecifyOtherInput
                                label="Please specify other thematic area"
                                required
                                value={formData.thematicAreaOther}
                                onChange={(e) => setFormData({ ...formData, thematicAreaOther: e.target.value })}
                            />
                        )}

                        {/* Category - Dependent on Sector */}
                        <DependentDropdown
                            label="Category"
                            required
                            value={formData.categoryId ?? ''}
                            onChange={(value) => {
                                setFormData({
                                    ...formData,
                                    categoryId: value as number,
                                    subCategoryId: '', // Reset subcategory when category changes
                                    // Child selections reset with the parent — clear their specify text too.
                                    subCategoryOther: '',
                                    cropOther: '',
                                    ...categoryResetPatch(value, 'categoryOther'),
                                });
                            }}
                            options={fldCategoryOptions}
                            dependsOn={{
                                value: formData.sectorId,
                                field: 'sectorId',
                            }}
                            onOptionsLoad={loadFldCategories}
                            cacheKey="fld-categories-by-sector"
                            emptyMessage="No categories available for this sector"
                            loadingMessage="Loading categories..."
                        />

                        {isOtherCategory && (
                            <SpecifyOtherInput
                                label="Please specify other category"
                                required
                                value={formData.categoryOther}
                                onChange={(e) => setFormData({ ...formData, categoryOther: e.target.value })}
                            />
                        )}

                        {/* Sub Category - Dependent on Category */}
                        <DependentDropdown
                            label="Sub Category"
                            required
                            value={formData.subCategoryId ?? ''}
                            onChange={(value) => {
                                setFormData({
                                    ...formData,
                                    subCategoryId: value as number,
                                    cropId: '', // Reset crop when subcategory changes
                                    cropOther: '',
                                    ...subCategoryResetPatch(value, 'subCategoryOther'),
                                });
                            }}
                            options={fldSubcategoryOptions}
                            dependsOn={{
                                value: formData.categoryId,
                                field: 'categoryId',
                            }}
                            onOptionsLoad={loadFldSubcategories}
                            cacheKey="fld-subcategories-by-category"
                            emptyMessage="No subcategories available for this category"
                            loadingMessage="Loading subcategories..."
                        />

                        {isOtherSubCategory && (
                            <SpecifyOtherInput
                                label="Please specify other sub category"
                                required
                                value={formData.subCategoryOther}
                                onChange={(e) => setFormData({ ...formData, subCategoryOther: e.target.value })}
                            />
                        )}

                        {/* Crop - Dependent on Subcategory */}
                        <DependentDropdown
                            label="Crop/Animal/Enterprise"
                            required
                            value={formData.cropId ?? ''}
                            onChange={(value) => {
                                // Ensure value is a number (ID), not a string
                                const numericValue = value === '' || value === null || value === undefined
                                    ? null
                                    : (typeof value === 'number' ? value : parseInt(String(value), 10));

                                // Validate that we got a valid number
                                if (numericValue !== null && isNaN(numericValue)) {
                                    console.error('Invalid crop ID:', value);
                                    return;
                                }

                                // Pull the crop's master-defined unit; clear the
                                // quantity inputs so the type-correct field starts fresh.
                                const selCrop: any = fldCrops.find(
                                    (c: any) => Number(c.cropId) === Number(numericValue)
                                );

                                setFormData({
                                    ...formData,
                                    cropId: numericValue,
                                    unitId: selCrop?.unit?.unitId ?? null,
                                    unit: selCrop?.unit?.unitName ?? '',
                                    quantity: '',
                                    quantityText: '',
                                    area: '',
                                    ...cropResetPatch(numericValue, 'cropOther'),
                                });
                            }}
                            options={fldCropOptions}
                            dependsOn={{
                                value: formData.subCategoryId,
                                field: 'subCategoryId',
                            }}
                            onOptionsLoad={loadFldCrops}
                            cacheKey="fld-crops-by-subcategory"
                            emptyMessage="No crops available for this subcategory"
                            loadingMessage="Loading crops..."
                        />

                        {isOtherCrop && (
                            <SpecifyOtherInput
                                label="Please specify other crop/animal/enterprise"
                                required
                                value={formData.cropOther}
                                onChange={(e) => setFormData({ ...formData, cropOther: e.target.value })}
                            />
                        )}
                        <FormInput
                            label="Name of Technology Demonstrated (FLD Name)"
                            required
                            value={formData.technologyName ?? ''}
                            onChange={(e) => setFormData({ ...formData, technologyName: e.target.value })}
                        />
                        <FormInput
                            label="No of demonstration"
                            required
                            type="number"
                            value={formData.demoCount ?? ''}
                            onChange={(e) => setFormData({ ...formData, demoCount: e.target.value })}
                        />
                        {(() => {
                            const selectedSectorName = fldSectors.find((s: any) => s.sectorId === formData.sectorId)?.sectorName ?? ''
                            const isWomenEmpowerment = isWomenEmpowermentName(selectedSectorName)
                            if (isWomenEmpowerment) return null
                            // Unit + quantity are driven by the selected crop's master.
                            const selectedCrop: any = fldCrops.find((c: any) => Number(c.cropId) === Number(formData.cropId))
                            const dataType = selectedCrop?.quantityDataType || 'decimal'
                            const masterUnit = selectedCrop?.unit?.unitName || formData.unit || ''
                            const required = Boolean(selectedCrop?.quantityRequired)
                            const setText = (v: string) =>
                                setFormData({ ...formData, quantityText: v, quantity: 0, area: 0, unit: masterUnit })
                            const setNumber = (raw: string) => {
                                const v = dataType === 'number' ? raw.replace(/[^0-9]/g, '') : raw
                                setFormData({ ...formData, quantity: v, area: v, quantityText: null, unit: masterUnit })
                            }
                            return (
                                <div className="grid grid-cols-[140px_1fr] gap-3">
                                    <FormInput
                                        label="Unit"
                                        value={masterUnit}
                                        disabled
                                        onChange={() => { }}
                                        placeholder={formData.cropId ? '' : 'Select crop'}
                                    />
                                    {dataType === 'boolean' ? (
                                        <FormSelect
                                            label="Quantity"
                                            required={required}
                                            value={formData.quantityText ?? ''}
                                            onChange={(e) => setText(e.target.value)}
                                            options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
                                        />
                                    ) : dataType === 'string' ? (
                                        <FormInput
                                            label="Quantity"
                                            required={required}
                                            value={formData.quantityText ?? ''}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="e.g. N/A"
                                        />
                                    ) : (
                                        <FormInput
                                            label="Quantity"
                                            required={required}
                                            type="number"
                                            step={dataType === 'number' ? '1' : 'any'}
                                            value={formData.quantity ?? formData.area ?? ''}
                                            onChange={(e) => setNumber(e.target.value)}
                                        />
                                    )}
                                </div>
                            )
                        })()}
                    </div>

                    {/* Farmers Details Section */}
                    <FormSection title="Farmers Details">
                        <div className="col-span-2 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <FormInput label="General_M" required type="number" value={formData.gen_m ?? ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                                <FormInput label="General_F" required type="number" value={formData.gen_f ?? ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                                <FormInput label="OBC_M" required type="number" value={formData.obc_m ?? ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                                <FormInput label="OBC_F" required type="number" value={formData.obc_f ?? ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                                <FormInput label="SC_M" required type="number" value={formData.sc_m ?? ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                                <FormInput label="SC_F" required type="number" value={formData.sc_f ?? ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                                <FormInput label="ST_M" required type="number" value={formData.st_m ?? ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                                <FormInput label="ST_F" required type="number" value={formData.st_f ?? ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9]">
                                    <span className="text-xs font-semibold text-[#2E7D32] uppercase">Total Male</span>
                                    <span className="text-sm font-bold text-[#1B5E20] tabular-nums">
                                        {(Number(formData.gen_m) || 0) +
                                            (Number(formData.obc_m) || 0) +
                                            (Number(formData.sc_m) || 0) +
                                            (Number(formData.st_m) || 0)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCE4EC] border border-[#F8BBD0]">
                                    <span className="text-xs font-semibold text-[#AD1457] uppercase">Total Female</span>
                                    <span className="text-sm font-bold text-[#880E4F] tabular-nums">
                                        {(Number(formData.gen_f) || 0) +
                                            (Number(formData.obc_f) || 0) +
                                            (Number(formData.sc_f) || 0) +
                                            (Number(formData.st_f) || 0)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB]">
                                    <span className="text-xs font-semibold text-[#1565C0] uppercase">Overall Total</span>
                                    <span className="text-sm font-bold text-[#0D47A1] tabular-nums">
                                        {(Number(formData.gen_m) || 0) +
                                            (Number(formData.gen_f) || 0) +
                                            (Number(formData.obc_m) || 0) +
                                            (Number(formData.obc_f) || 0) +
                                            (Number(formData.sc_m) || 0) +
                                            (Number(formData.sc_f) || 0) +
                                            (Number(formData.st_m) || 0) +
                                            (Number(formData.st_f) || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </FormSection>
                </div>
            )}

            {/* Extension & Training activities under FLD */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_FLD_EXTENSION_TRAINING && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Activity Date"
                            required
                            type="date"
                            value={formData.activityDate || formData.date || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                activityDate: e.target.value,
                                date: e.target.value,
                                // Mirror activity date as reportingYear so the FLD dropdown (gated
                                // on reportingYear) loads and downstream filters/reports — which
                                // key on reportingYear — bucket by the activity date.
                                reportingYear: e.target.value,
                                // numberOfActivities is NOT NULL in the DB but no longer surfaced;
                                // pin to 1 so the create payload stays valid.
                                numberOfActivities: formData.numberOfActivities || 1,
                                noOfActivities: formData.noOfActivities || 1,
                                activityCount: formData.activityCount || 1,
                            })}
                        />

                        <DependentDropdown
                            label="FLD"
                            required
                            value={formData.fldId ?? ''}
                            onChange={(value) => {
                                const selectedFld = fldOptionsByKvkAndYear.find((f: any) => f.kvkFldId === value || f.id === value)
                                setFormData({
                                    ...formData,
                                    fldId: value as number,
                                    fldName: selectedFld?.fldName || selectedFld?.technologyName,
                                    cropId: selectedFld?.cropId || '',
                                    crop: selectedFld?.cropName || ''
                                })
                            }}
                            options={fldOptionsByKvkAndYear.map((f: any) => ({
                                value: f.kvkFldId || f.id,
                                label: f.fldName || f.technologyName || `FLD ${f.kvkFldId || f.id}`
                            }))}
                            dependsOn={{
                                value: activeKvkId && selectedReportingYearNumber ? `${activeKvkId}-${selectedReportingYearNumber}` : '',
                                field: 'kvkIdReportingYearId',
                            }}
                            onOptionsLoad={loadFldByKvkAndYear}
                            cacheKey="fld-by-kvk-year-extension-training"
                            emptyMessage={
                                selectedReportingYearNumber
                                    ? `No FLD available for date ${selectedReportingYearNumber}`
                                    : 'Select date to load FLD'
                            }
                            loadingMessage="Loading FLD..."
                        />

                        <MasterDataDropdown
                            label="Activity"
                            required
                            value={formData.activityId ?? ''}
                            onChange={(value) => {
                                const selectedActivity = activityList.find((a: any) => a.activityId === value)
                                setFormData({
                                    ...formData,
                                    activityId: value as number,
                                    activity: selectedActivity?.activityName || '',
                                    ...fldActivityResetPatch(value, 'activityOther'),
                                })
                            }}
                            options={fldActivityOptions}
                            emptyMessage="No activities available"
                        />
                        {isOtherFldActivity && (
                            <SpecifyOtherInput label="Please specify other activity" required value={formData.activityOther} onChange={(e) => setFormData({ ...formData, activityOther: e.target.value })} />
                        )}

                        <FormInput
                            label="No. of activities"
                            required
                            type="number"
                            min={1}
                            wholeNumberOnly
                            value={(formData.numberOfActivities ?? formData.noOfActivities ?? formData.activityCount) ?? ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                numberOfActivities: e.target.value,
                                noOfActivities: e.target.value,
                                activityCount: e.target.value,
                            })}
                        />
                    </div>

                    <FormTextArea
                        label="Remarks"
                        value={formData.remarks || formData.remark || ''}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value, remark: e.target.value })}
                        placeholder="Enter remarks"
                    />

                    <FormSection title="Participants">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={(formData.gen_m ?? formData.generalM) ?? ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value, generalM: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={(formData.gen_f ?? formData.generalF) ?? ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value, generalF: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={(formData.obc_m ?? formData.obcM) ?? ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value, obcM: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={(formData.obc_f ?? formData.obcF) ?? ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value, obcF: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={(formData.sc_m ?? formData.scM) ?? ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value, scM: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={(formData.sc_f ?? formData.scF) ?? ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value, scF: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={(formData.st_m ?? formData.stM) ?? ''} onChange={e => setFormData({ ...formData, st_m: e.target.value, stM: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={(formData.st_f ?? formData.stF) ?? ''} onChange={e => setFormData({ ...formData, st_f: e.target.value, stF: e.target.value })} />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9]">
                                <span className="text-xs font-semibold text-[#2E7D32] uppercase">Total Male</span>
                                <span className="text-sm font-bold text-[#1B5E20] tabular-nums">
                                    {(Number(formData.gen_m ?? formData.generalM) || 0) +
                                        (Number(formData.obc_m ?? formData.obcM) || 0) +
                                        (Number(formData.sc_m ?? formData.scM) || 0) +
                                        (Number(formData.st_m ?? formData.stM) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCE4EC] border border-[#F8BBD0]">
                                <span className="text-xs font-semibold text-[#AD1457] uppercase">Total Female</span>
                                <span className="text-sm font-bold text-[#880E4F] tabular-nums">
                                    {(Number(formData.gen_f ?? formData.generalF) || 0) +
                                        (Number(formData.obc_f ?? formData.obcF) || 0) +
                                        (Number(formData.sc_f ?? formData.scF) || 0) +
                                        (Number(formData.st_f ?? formData.stF) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB]">
                                <span className="text-xs font-semibold text-[#1565C0] uppercase">Overall Total</span>
                                <span className="text-sm font-bold text-[#0D47A1] tabular-nums">
                                    {(Number(formData.gen_m ?? formData.generalM) || 0) +
                                        (Number(formData.gen_f ?? formData.generalF) || 0) +
                                        (Number(formData.obc_m ?? formData.obcM) || 0) +
                                        (Number(formData.obc_f ?? formData.obcF) || 0) +
                                        (Number(formData.sc_m ?? formData.scM) || 0) +
                                        (Number(formData.sc_f ?? formData.scF) || 0) +
                                        (Number(formData.st_m ?? formData.stM) || 0) +
                                        (Number(formData.st_f ?? formData.stF) || 0)}
                                </span>
                            </div>
                        </div>
                    </FormSection>
                </div>
            )}

            {/* Technical Feedback on FLD */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_FLD_TECHNICAL_FEEDBACK && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />

                        <DependentDropdown
                            label="FLD"
                            required
                            value={formData.fldId ?? ''}
                            onChange={(value) => {
                                const selectedFld = fldOptionsByKvkAndYear.find((f: any) => f.kvkFldId === value || f.id === value)
                                setFormData({
                                    ...formData,
                                    fldId: value as number,
                                    fldName: selectedFld?.fldName || selectedFld?.technologyName
                                })
                            }}
                            options={fldOptionsByKvkAndYear.map((f: any) => ({
                                value: f.kvkFldId || f.id,
                                label: f.fldName || f.technologyName || `FLD ${f.kvkFldId || f.id}`
                            }))}
                            dependsOn={{
                                value: activeKvkId && selectedReportingYearNumber ? `${activeKvkId}-${selectedReportingYearNumber}` : '',
                                field: 'kvkIdReportingYearId',
                            }}
                            onOptionsLoad={loadFldByKvkAndYear}
                            cacheKey="fld-by-kvk-year-technical-feedback"
                            emptyMessage={
                                selectedReportingYearNumber
                                    ? `No FLD available for reporting year ${selectedReportingYearNumber}`
                                    : 'Select reporting year to load FLD'
                            }
                            loadingMessage="Loading FLD..."
                        />

                        <DependentDropdown
                            label="Crop"
                            required
                            value={formData.cropId ?? ''}
                            onChange={(value) => {
                                const selectedCrop = cropOptionsForSelectedFld.find((c: any) => Number(c.value) === Number(value))
                                setFormData({
                                    ...formData,
                                    cropId: value as number,
                                    crop: selectedCrop?.label || '',
                                    ...feedbackCropResetPatch(value, 'cropOther'),
                                })
                            }}
                            options={cropOptionsForSelectedFld}
                            dependsOn={{
                                value: formData.fldId || '',
                                field: 'fldId',
                            }}
                            emptyMessage="No crop is mapped to selected FLD"
                        />
                        {isOtherFeedbackCrop && (
                            <SpecifyOtherInput label="Please specify other crop" required value={formData.cropOther} onChange={(e) => setFormData({ ...formData, cropOther: e.target.value })} />
                        )}
                    </div>

                    <FormTextArea
                        label="FeedBack"
                        required
                        value={formData.feedback || formData.feedBack || ''}
                        onChange={(e) => setFormData({ ...formData, feedback: e.target.value, feedBack: e.target.value })}
                        placeholder="Enter technical feedback"
                    />
                </div>
            )}
        </>
    )
}
