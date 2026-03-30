import React, { useEffect, useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityConstants'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect, FormTextArea, FormSection } from './shared/FormComponents'
import { DependentDropdown } from '../../../../components/common/DependentDropdown'
import { MasterDataDropdown } from '../../../../components/common/MasterDataDropdown'
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

    const { data: oftSubjects = [] } = useOftSubjects()
    const { data: fldSectors = [] } = useSectors()
    const { data: fldCategories = [] } = useFldCategories()
    const { data: fldSubcategories = [] } = useFldSubcategories()
    const { data: seasons = [] } = useSeasons()
    const { data: cropTypes = [] } = useCropTypes()
    const { data: disciplines = [] } = useDisciplines()
    const { data: fldThematicAreas = [], isLoading: isLoadingFldThematicAreas } = useFldThematicAreas()
    const { data: fldCrops = [] } = useFldCrops()

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
    const fldOptionsByKvkAndYear = useMemo(() => {
        return (fldList as any[]).filter((f: any) => {
            const fldKvkId = f.kvkId ?? f.kvk?.kvkId
            const fldYear = getYearValue(f.reportingYear)
            const selectedYear = getYearValue(selectedReportingYear)
            const kvkMatch = activeKvkId ? Number(fldKvkId) === Number(activeKvkId) : true
            const yearMatch = selectedYear ? Number(fldYear) === Number(selectedYear) : false
            return kvkMatch && yearMatch
        })
    }, [fldList, activeKvkId, selectedReportingYear])
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
        return [{ value: cropId, label: cropName }]
    }, [selectedFldForTechnicalFeedback, fldCrops])

    // FldActivity list for extension training - using the proper hook
    const { data: activityList = [] } = useFldActivities()

    // OFT Thematic Areas - depends on subjectId
    const { data: oftThematicAreasData = [], isLoading: isLoadingOftThematicAreas } = useOftThematicAreasBySubject(
        formData.oftSubjectId ? parseInt(formData.oftSubjectId) : null
    )

    // Memoized onOptionsLoad functions to prevent infinite re-renders
    const loadOftThematicAreas = useCallback(async (subjectId: any) => {
        const response = await oftFldApi.getOftThematicAreasBySubject(subjectId as number);
        return response.data.map((thematicArea: any) => ({
            value: thematicArea.oftThematicAreaId,
            label: thematicArea.thematicAreaName
        }));
    }, []);

    const loadFldThematicAreas = useCallback(async (sectorId: any) => {
        const response = await oftFldApi.getFldThematicAreasBySector(sectorId as number);
        return response.data.map((thematicArea: any) => ({
            value: thematicArea.thematicAreaId || thematicArea.fldThematicAreaId,
            label: thematicArea.thematicAreaName
        }));
    }, []);

    const loadFldCategories = useCallback(async (sectorId: any) => {
        const response = await oftFldApi.getFldCategoriesBySector(sectorId as number);
        return createMasterDataOptions(response.data, 'categoryId', 'categoryName');
    }, []);

    const loadFldSubcategories = useCallback(async (categoryId: any) => {
        const response = await oftFldApi.getFldSubcategoriesByCategory(categoryId as number);
        return createMasterDataOptions(response.data, 'subCategoryId', 'subCategoryName');
    }, []);

    const loadFldCrops = useCallback(async (subCategoryId: any) => {
        const response = await oftFldApi.getFldCropsBySubcategory(subCategoryId as number);
        return response.data.map((crop: any) => ({
            value: crop.cropId || crop.fldCropId,
            label: crop.cropName
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
                const fldYear = getYearValue(f.reportingYear)
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
                <FormInput
                    label="Subject Name"
                    required
                    value={formData.subjectName || ''}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    placeholder="Enter subject name"
                />
            )}

            {entityType === ENTITY_TYPES.OFT_THEMATIC_AREAS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Subject"
                        required
                        value={formData.oftSubjectId || ''}
                        onChange={(e) => setFormData({ ...formData, oftSubjectId: parseInt(e.target.value) })}
                        options={oftSubjects.map(s => ({ value: s.oftSubjectId, label: s.subjectName }))}
                    />
                    <FormInput
                        label="Thematic Area Name"
                        required
                        value={formData.thematicAreaName || ''}
                        onChange={(e) => setFormData({ ...formData, thematicAreaName: e.target.value })}
                        placeholder="Enter thematic area name"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FLD_SECTORS && (
                <FormInput
                    label="Sector Name"
                    required
                    value={formData.sectorName || ''}
                    onChange={(e) => setFormData({ ...formData, sectorName: e.target.value })}
                    placeholder="Enter sector name"
                />
            )}

            {entityType === ENTITY_TYPES.FLD_THEMATIC_AREAS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Sector"
                        required
                        value={formData.sectorId || ''}
                        onChange={(e) => setFormData({ ...formData, sectorId: parseInt(e.target.value) })}
                        options={fldSectors.map(s => ({ value: s.sectorId, label: s.sectorName }))}
                    />
                    <FormInput
                        label="Thematic Area Name"
                        required
                        value={formData.thematicAreaName || ''}
                        onChange={(e) => setFormData({ ...formData, thematicAreaName: e.target.value })}
                        placeholder="Enter thematic area name"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FLD_CATEGORIES && (
                <div className="space-y-4">
                    <FormSelect
                        label="Sector"
                        required
                        value={formData.sectorId || ''}
                        onChange={(e) => setFormData({ ...formData, sectorId: parseInt(e.target.value) })}
                        options={fldSectors.map(s => ({ value: s.sectorId, label: s.sectorName }))}
                    />
                    <FormInput
                        label="Category Name"
                        required
                        value={formData.categoryName || ''}
                        onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                        placeholder="Enter category name"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FLD_SUBCATEGORIES && (
                <div className="space-y-4">
                    <FormSelect
                        label="Sector"
                        required
                        value={formData.sectorId || ''}
                        onChange={(e) => {
                            const sectorId = parseInt(e.target.value)
                            setFormData({ ...formData, sectorId, categoryId: '' })
                        }}
                        options={fldSectors.map(s => ({ value: s.sectorId, label: s.sectorName }))}
                    />
                    <FormSelect
                        label="Category"
                        required
                        value={formData.categoryId || ''}
                        onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                        disabled={!formData.sectorId}
                        options={fldCategories
                            .filter((c: any) => c.sectorId === formData.sectorId)
                            .map(c => ({ value: c.categoryId, label: c.categoryName }))}
                    />
                    <FormInput
                        label="Subcategory Name"
                        required
                        value={formData.subCategoryName || ''}
                        onChange={(e) => setFormData({ ...formData, subCategoryName: e.target.value })}
                        placeholder="Enter subcategory name"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FLD_CROPS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Sector"
                        required
                        value={formData.sectorId || ''}
                        onChange={(e) => {
                            const sectorId = parseInt(e.target.value)
                            setFormData({ ...formData, sectorId, categoryId: '', subCategoryId: '' })
                        }}
                        options={fldSectors.map(s => ({ value: s.sectorId, label: s.sectorName }))}
                    />
                    <FormSelect
                        label="Category"
                        required
                        value={formData.categoryId || ''}
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
                        value={formData.subCategoryId || ''}
                        onChange={(e) => setFormData({ ...formData, subCategoryId: parseInt(e.target.value) })}
                        disabled={!formData.categoryId}
                        options={fldSubcategories
                            .filter((s: any) => s.categoryId === formData.categoryId)
                            .map(s => ({ value: s.subCategoryId, label: s.subCategoryName }))}
                    />
                    <FormInput
                        label="Crop Name"
                        required
                        value={formData.cropName || ''}
                        onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                        placeholder="Enter crop name"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FLD_ACTIVITIES && (
                <FormInput
                    label="Activity Name"
                    required
                    value={formData.activityName || ''}
                    onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                    placeholder="Enter activity name"
                />
            )}

            {entityType === ENTITY_TYPES.CFLD_CROPS && (
                <div className="space-y-4">
                    <MasterDataDropdown
                        label="Season"
                        required
                        value={formData.seasonId || ''}
                        onChange={(value) => setFormData({ ...formData, seasonId: value as number })}
                        options={createMasterDataOptions(seasons, 'seasonId', 'seasonName')}
                        emptyMessage="No seasons available"
                    />
                    <FormSelect
                        label="Type"
                        required
                        value={formData.typeId || ''}
                        onChange={(e) => setFormData({ ...formData, typeId: parseInt(e.target.value) })}
                        options={cropTypes.map(t => ({ value: t.typeId, label: t.typeName }))}
                    />
                    <FormInput
                        label="Crop Name"
                        required
                        value={formData.CropName || ''}
                        onChange={(e) => setFormData({ ...formData, CropName: e.target.value })}
                        placeholder="Enter crop name"
                    />
                </div>
            )}

            {/* Achievement OFT forms-------------- */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_OFT && (
                <div className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
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
                            value={formData.seasonId || ''}
                            onChange={(value) => setFormData({ ...formData, seasonId: value as number })}
                            options={createMasterDataOptions(seasons, 'seasonId', 'seasonName')}
                            emptyMessage="No seasons available"
                        />

                        {/* OFT Subject - From OFT Subject Master */}
                        <MasterDataDropdown
                            label="OFT Subject"
                            required
                            value={formData.oftSubjectId || ''}
                            onChange={(value) => {
                                setFormData({
                                    ...formData,
                                    oftSubjectId: value as number,
                                    oftThematicAreaId: '', // Reset thematic area when subject changes
                                    thematicArea: '' // Reset text input if used
                                });
                            }}
                            options={createMasterDataOptions(oftSubjects, 'oftSubjectId', 'subjectName')}
                            emptyMessage="No OFT subjects available"
                        />

                        {/* Thematic Area - Dependent on OFT Subject */}
                        <DependentDropdown
                            label="Thematic Area"
                            required
                            value={formData.oftThematicAreaId || formData.thematicArea || ''}
                            onChange={(value) => {
                                const selectedThematicArea = oftThematicAreasData?.find((t: any) => t.oftThematicAreaId === value);
                                setFormData({
                                    ...formData,
                                    oftThematicAreaId: value as number,
                                    thematicArea: selectedThematicArea?.thematicAreaName || ''
                                });
                            }}
                            options={oftThematicAreasData?.map((t: any) => ({
                                value: t.oftThematicAreaId,
                                label: t.thematicAreaName
                            })) || []}
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

                        {/* Discipline - From Discipline Master */}
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
                                    discipline: selectedDiscipline?.disciplineName || ''
                                });
                            }}
                            options={createMasterDataOptions(disciplines, 'disciplineId', 'disciplineName')}
                            emptyMessage="No disciplines available"
                        />
                        <FormInput
                            label="Title of On Farm Trial (OFT)"
                            required
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <FormTextArea
                            label="Problem diagnosted"
                            required
                            value={formData.problemDiagnosed || ''}
                            onChange={(e) => setFormData({ ...formData, problemDiagnosed: e.target.value })}
                        />
                        <FormInput
                            label="Source of Technology (ICAR/ SAU/Other, please specify)"
                            required
                            value={formData.sourceOfTechnology || ''}
                            onChange={(e) => setFormData({ ...formData, sourceOfTechnology: e.target.value })}
                        />
                        <FormInput
                            label="Production system and thematic area"
                            required
                            value={formData.productionSystem || ''}
                            onChange={(e) => setFormData({ ...formData, productionSystem: e.target.value })}
                        />
                        <FormInput
                            label="Performance indicators of the technology"
                            required
                            value={formData.performanceIndicators || ''}
                            onChange={(e) => setFormData({ ...formData, performanceIndicators: e.target.value })}
                        />
                        <FormInput
                            label="Area(ha)/Number"
                            required
                            value={formData.area || ''}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        />
                        <FormInput
                            label="No. of location"
                            required
                            value={formData.locations || ''}
                            onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                        />
                        <FormInput
                            label="No. of Trial/Replication"
                            required
                            value={formData.replications || ''}
                            onChange={(e) => setFormData({ ...formData, replications: e.target.value })}
                        />
                        <FormInput
                            label="OFT Start Date"
                            required
                            type="date"
                            value={formData.duration || ''}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        />
                        <FormInput
                            label="Critical Input"
                            required
                            value={formData.criticalInput || ''}
                            onChange={(e) => setFormData({ ...formData, criticalInput: e.target.value })}
                        />
                        <FormInput
                            label="Cost of OFT"
                            required
                            type="number"
                            value={formData.cost || ''}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        />
                    </div>

                    {/* Farmers Details Section */}
                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} required />
                            <FormInput label="General_F" type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} required />
                            <FormInput label="OBC_M" type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} required />
                            <FormInput label="OBC_F" type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} required />

                            <FormInput label="SC_M" type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} required />
                            <FormInput label="SC_F" type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} required />
                            <FormInput label="ST_M" type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} required />
                            <FormInput label="ST_F" type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} required />
                        </div>
                    </FormSection>

                    {/* Technologies Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">
                            Details of technologies selected for assessment/refinement:
                        </h3>
                        <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                            <span className="font-medium text-gray-700">Technology Options</span>
                            <span className="font-medium text-gray-700">Details</span>

                            {['Farmer Practice', 'TO1', 'TO2', 'TO3', 'TO4', 'TO5', 'C1', 'C2'].map((tech) => (
                                <React.Fragment key={tech}>
                                    <label className="text-sm font-medium text-gray-600">{tech}</label>
                                    <FormInput
                                        label=""
                                        placeholder="Description"
                                        value={formData[`tech_${tech}`] || ''}
                                        onChange={(e) => setFormData({ ...formData, [`tech_${tech}`]: e.target.value })}
                                        className="mt-0"
                                        required
                                    />
                                </React.Fragment>
                            ))}
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
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
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
                            value={formData.seasonId || ''}
                            onChange={(value) => setFormData({ ...formData, seasonId: value as number })}
                            options={createMasterDataOptions(seasons, 'seasonId', 'seasonName')}
                            emptyMessage="No seasons available"
                        />

                        <MasterDataDropdown
                            label="Sector"
                            required
                            value={formData.sectorId || ''}
                            onChange={(value) => {
                                setFormData({
                                    ...formData,
                                    sectorId: value as number,
                                    categoryId: '', // Reset category when sector changes
                                    subCategoryId: '', // Reset subcategory when sector changes
                                    cropId: '' // Reset crop when sector changes
                                });
                            }}
                            options={createMasterDataOptions(fldSectors, 'sectorId', 'sectorName')}
                            emptyMessage="No sectors available"
                        />

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
                                    thematicArea: selectedThematicArea?.thematicAreaName || ''
                                });
                            }}
                            options={fldThematicAreas
                                .filter((t: any) => t.sectorId === formData.sectorId)
                                .map((t: any) => ({
                                    // API returns thematicAreaId, but we map it to fldThematicAreaId for frontend consistency
                                    value: t.thematicAreaId || t.fldThematicAreaId,
                                    label: t.thematicAreaName
                                }))}
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

                        {/* Category - Dependent on Sector */}
                        <DependentDropdown
                            label="Category"
                            required
                            value={formData.categoryId || ''}
                            onChange={(value) => {
                                setFormData({
                                    ...formData,
                                    categoryId: value as number,
                                    subCategoryId: '' // Reset subcategory when category changes
                                });
                            }}
                            options={filterByParentId(fldCategories, 'sectorId', formData.sectorId)
                                .map((c: any) => ({ value: c.categoryId, label: c.categoryName }))}
                            dependsOn={{
                                value: formData.sectorId,
                                field: 'sectorId',
                            }}
                            onOptionsLoad={loadFldCategories}
                            cacheKey="fld-categories-by-sector"
                            emptyMessage="No categories available for this sector"
                            loadingMessage="Loading categories..."
                        />

                        {/* Sub Category - Dependent on Category */}
                        <DependentDropdown
                            label="Sub Category"
                            required
                            value={formData.subCategoryId || ''}
                            onChange={(value) => {
                                setFormData({
                                    ...formData,
                                    subCategoryId: value as number,
                                    cropId: '' // Reset crop when subcategory changes
                                });
                            }}
                            options={filterByParentId(fldSubcategories, 'categoryId', formData.categoryId)
                                .map((s: any) => ({ value: s.subCategoryId, label: s.subCategoryName }))}
                            dependsOn={{
                                value: formData.categoryId,
                                field: 'categoryId',
                            }}
                            onOptionsLoad={loadFldSubcategories}
                            cacheKey="fld-subcategories-by-category"
                            emptyMessage="No subcategories available for this category"
                            loadingMessage="Loading subcategories..."
                        />

                        {/* Crop - Dependent on Subcategory */}
                        <DependentDropdown
                            label="Crop"
                            required
                            value={formData.cropId || ''}
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

                                setFormData({ ...formData, cropId: numericValue });
                            }}
                            options={fldCrops
                                .filter((c: any) => c.subCategoryId === formData.subCategoryId)
                                .map((c: any) => ({
                                    // API returns cropId (not fldCropId)
                                    value: c.cropId || c.fldCropId,
                                    label: c.cropName
                                }))}
                            dependsOn={{
                                value: formData.subCategoryId,
                                field: 'subCategoryId',
                            }}
                            onOptionsLoad={loadFldCrops}
                            cacheKey="fld-crops-by-subcategory"
                            emptyMessage="No crops available for this subcategory"
                            loadingMessage="Loading crops..."
                        />
                        <FormInput
                            label="Name of Technology Demonstrated (FLD Name)"
                            required
                            value={formData.technologyName || ''}
                            onChange={(e) => setFormData({ ...formData, technologyName: e.target.value })}
                        />
                        <FormInput
                            label="No of demonstration"
                            required
                            type="number"
                            value={formData.demoCount || ''}
                            onChange={(e) => setFormData({ ...formData, demoCount: e.target.value })}
                        />
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="Area(ha)"
                            required
                            type="number"
                            value={formData.area || ''}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        />
                    </div>

                    {/* Farmers Details Section */}
                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>
                    </FormSection>
                </div>
            )}

            {/* Extension & Training activities under FLD */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_FLD_EXTENSION_TRAINING && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />

                        <DependentDropdown
                            label="FLD"
                            required
                            value={formData.fldId || ''}
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
                                value: activeKvkId && selectedReportingYear ? `${activeKvkId}-${getYearValue(selectedReportingYear)}` : '',
                                field: 'kvkIdReportingYearId',
                            }}
                            onOptionsLoad={loadFldByKvkAndYear}
                            cacheKey="fld-by-kvk-year-extension-training"
                            emptyMessage="No FLD available for selected KVK and year"
                            loadingMessage="Loading FLD..."
                        />

                        <MasterDataDropdown
                            label="Activity"
                            required
                            value={formData.activityId || ''}
                            onChange={(value) => {
                                const selectedActivity = activityList.find((a: any) => a.activityId === value)
                                setFormData({
                                    ...formData,
                                    activityId: value as number,
                                    activity: selectedActivity?.activityName || ''
                                })
                            }}
                            options={createMasterDataOptions(activityList, 'activityId', 'activityName')}
                            emptyMessage="No activities available"
                        />

                        <FormInput
                            label="Date"
                            required
                            type="date"
                            value={formData.activityDate || formData.date || ''}
                            onChange={(e) => setFormData({ ...formData, activityDate: e.target.value, date: e.target.value })}
                        />

                        <FormInput
                            label="No. of activities"
                            required
                            type="number"
                            value={formData.numberOfActivities || formData.noOfActivities || formData.activityCount || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                numberOfActivities: e.target.value,
                                noOfActivities: e.target.value,
                                activityCount: e.target.value
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
                            <FormInput label="General_M*" required type="number" value={formData.gen_m || formData.generalM || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value, generalM: e.target.value })} />
                            <FormInput label="General_F*" required type="number" value={formData.gen_f || formData.generalF || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value, generalF: e.target.value })} />
                            <FormInput label="OBC_M*" required type="number" value={formData.obc_m || formData.obcM || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value, obcM: e.target.value })} />
                            <FormInput label="OBC_F*" required type="number" value={formData.obc_f || formData.obcF || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value, obcF: e.target.value })} />

                            <FormInput label="SC_M*" required type="number" value={formData.sc_m || formData.scM || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value, scM: e.target.value })} />
                            <FormInput label="SC_F*" required type="number" value={formData.sc_f || formData.scF || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value, scF: e.target.value })} />
                            <FormInput label="ST_M*" required type="number" value={formData.st_m || formData.stM || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value, stM: e.target.value })} />
                            <FormInput label="ST_F*" required type="number" value={formData.st_f || formData.stF || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value, stF: e.target.value })} />
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
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />

                        <DependentDropdown
                            label="FLD"
                            required
                            value={formData.fldId || ''}
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
                                value: activeKvkId && selectedReportingYear ? `${activeKvkId}-${getYearValue(selectedReportingYear)}` : '',
                                field: 'kvkIdReportingYearId',
                            }}
                            onOptionsLoad={loadFldByKvkAndYear}
                            cacheKey="fld-by-kvk-year-technical-feedback"
                            emptyMessage="No FLD available for selected KVK and year"
                            loadingMessage="Loading FLD..."
                        />

                        <DependentDropdown
                            label="Crop"
                            required
                            value={formData.cropId || ''}
                            onChange={(value) => {
                                const selectedCrop = cropOptionsForSelectedFld.find((c: any) => Number(c.value) === Number(value))
                                setFormData({
                                    ...formData,
                                    cropId: value as number,
                                    crop: selectedCrop?.label || ''
                                })
                            }}
                            options={cropOptionsForSelectedFld}
                            dependsOn={{
                                value: formData.fldId || '',
                                field: 'fldId',
                            }}
                            emptyMessage="No crop is mapped to selected FLD"
                        />
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
