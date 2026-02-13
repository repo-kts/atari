import React, { useEffect } from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect } from './shared/FormComponents'
import {
    useOftSubjects,
    useSectors,
    useFldCategories,
    useFldSubcategories,
    useSeasons,
    useCropTypes,
} from '../../../../hooks/useOftFldData'

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

    // Derive sectorId from categoryId when editing FLD_CROPS
    useEffect(() => {
        if (entityType === ENTITY_TYPES.FLD_CROPS && formData.categoryId && !formData.sectorId && fldCategories.length > 0) {
            const category = fldCategories.find((c: any) => c.categoryId === formData.categoryId)
            if (category && category.sectorId) {
                setFormData((prev: any) => ({ ...prev, sectorId: category.sectorId }))
            }
        }
    }, [entityType, formData.categoryId, formData.sectorId, fldCategories, setFormData])

    // Ensure CropName, seasonId, and typeId are correctly populated for CFLD_CROPS
    useEffect(() => {
        if (entityType === ENTITY_TYPES.CFLD_CROPS && Object.keys(formData).length > 0) {
            setFormData((prev: any) => {
                const updates: any = {}

                // Preserve CropName if it exists (check both capital C and lowercase for compatibility)
                if (prev.CropName && !updates.CropName) {
                    updates.CropName = prev.CropName
                } else if (prev.cropName && !updates.CropName) {
                    updates.CropName = prev.cropName
                }

                // Extract seasonId from nested season object if not directly available
                if (!prev.seasonId && prev.season && prev.season.seasonId) {
                    updates.seasonId = prev.season.seasonId
                }

                // Extract typeId from nested cropType object if not directly available
                if (!prev.typeId && prev.cropType && prev.cropType.typeId) {
                    updates.typeId = prev.cropType.typeId
                }

                if (Object.keys(updates).length === 0) return prev
                return { ...prev, ...updates }
            })
        }
    }, [entityType, formData, setFormData])

    if (!entityType) return null

    return (
        <>
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
                    <FormInput
                        label="Thematic Area Name"
                        required
                        value={formData.thematicAreaName || ''}
                        onChange={(e) => setFormData({ ...formData, thematicAreaName: e.target.value })}
                        placeholder="Enter thematic area name"
                    />
                    <FormSelect
                        label="Subject"
                        required
                        value={formData.oftSubjectId || ''}
                        onChange={(e) => setFormData({ ...formData, oftSubjectId: parseInt(e.target.value) })}
                        options={oftSubjects.map(s => ({ value: s.oftSubjectId, label: s.subjectName }))}
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
                    <FormInput
                        label="Thematic Area Name"
                        required
                        value={formData.thematicAreaName || ''}
                        onChange={(e) => setFormData({ ...formData, thematicAreaName: e.target.value })}
                        placeholder="Enter thematic area name"
                    />
                    <FormSelect
                        label="Sector"
                        required
                        value={formData.sectorId || ''}
                        onChange={(e) => setFormData({ ...formData, sectorId: parseInt(e.target.value) })}
                        options={fldSectors.map(s => ({ value: s.sectorId, label: s.sectorName }))}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FLD_CATEGORIES && (
                <div className="space-y-4">
                    <FormInput
                        label="Category Name"
                        required
                        value={formData.categoryName || ''}
                        onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                        placeholder="Enter category name"
                    />
                    <FormSelect
                        label="Sector"
                        required
                        value={formData.sectorId || ''}
                        onChange={(e) => setFormData({ ...formData, sectorId: parseInt(e.target.value) })}
                        options={fldSectors.map(s => ({ value: s.sectorId, label: s.sectorName }))}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FLD_SUBCATEGORIES && (
                <div className="space-y-4">
                    <FormInput
                        label="Subcategory Name"
                        required
                        value={formData.subCategoryName || ''}
                        onChange={(e) => setFormData({ ...formData, subCategoryName: e.target.value })}
                        placeholder="Enter subcategory name"
                    />
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

            {entityType === ENTITY_TYPES.CFLD_CROPS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Season"
                        required
                        value={formData.seasonId || ''}
                        onChange={(e) => setFormData({ ...formData, seasonId: parseInt(e.target.value) })}
                        options={seasons.map(s => ({ value: s.seasonId, label: s.seasonName }))}
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
        </>
    )
}
