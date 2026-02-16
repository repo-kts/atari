import React, { useEffect } from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect, FormTextArea, FormSection } from './shared/FormComponents'
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

            {entityType === ENTITY_TYPES.ACHIEVEMENT_OFT && (
                <div className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                            options={[
                                { value: '2023-24', label: '2023-24' },
                                { value: '2024-25', label: '2024-25' }
                            ]}
                        />
                        <FormSelect
                            label="Name of SMS/KVK Head"
                            required
                            value={formData.staffName || ''}
                            onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                            options={[
                                { value: 'Dr. Reeta Singh', label: 'Dr. Reeta Singh' },
                                { value: 'Sri Rajeev Kumar', label: 'Sri Rajeev Kumar' },
                                { value: 'Dr. Pushpam Patel', label: 'Dr. Pushpam Patel' },
                                { value: 'Smt. Sangeeta Kumari', label: 'Smt. Sangeeta Kumari' },
                            ]}
                        />
                        <FormSelect
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(e) => setFormData({ ...formData, seasonId: e.target.value })}
                            options={[
                                { value: 'Kharif', label: 'Kharif' },
                                { value: 'Rabi', label: 'Rabi' },
                                { value: 'Zaid', label: 'Zaid' },
                            ]}
                        />
                        <FormSelect
                            label="OFT Subject"
                            required
                            value={formData.oftSubjectId || ''}
                            onChange={(e) => setFormData({ ...formData, oftSubjectId: e.target.value })}
                            options={[
                                { value: 'Technologies Assessed under Various Crops by KVKs (Crop Production)', label: 'Technologies Assessed under Various Crops by KVKs (Crop Production)' },
                                { value: 'Technologies Assessed under Livestock and Fisheries by KVKs', label: 'Technologies Assessed under Livestock and Fisheries by KVKs' },
                                { value: 'Technologies Assessed under various Enterprises by KVKs', label: 'Technologies Assessed under various Enterprises by KVKs' },
                                { value: 'Technologies Assessed under various Enterprises for Women Empowerment', label: 'Technologies Assessed under various Enterprises for Women Empowerment' },
                                { value: 'Technologies Assessed under various Crops (Horticulture crops.)', label: 'Technologies Assessed under various Crops (Horticulture crops.)' },
                            ]}
                        />
                        <FormInput
                            label="Thematic Area"
                            required
                            value={formData.thematicArea || ''}
                            onChange={(e) => setFormData({ ...formData, thematicArea: e.target.value })}
                            placeholder="Select/Enter Thematic Area"
                        />
                        <FormSelect
                            label="Discipline"
                            required
                            value={formData.discipline || ''}
                            onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                            options={[
                                { value: 'Agronomy', label: 'Agronomy' },
                                { value: 'Soil Science', label: 'Soil Science' },
                                { value: 'Horticulture', label: 'Horticulture' },
                                { value: 'Plant breeding', label: 'Plant breeding' },
                                { value: 'Plant Protection', label: 'Plant Protection' },
                                { value: 'Entomology', label: 'Entomology' },
                                { value: 'Plant Pathology', label: 'Plant Pathology' },
                                { value: 'Home Science', label: 'Home Science' },
                                { value: 'Agricultural Engineering', label: 'Agricultural Engineering' },
                                { value: 'Agricultural Extension', label: 'Agricultural Extension' },
                                { value: 'Animal Science', label: 'Animal Science' },
                                { value: 'Fisheries', label: 'Fisheries' },
                            ]}
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
                            label="OFT Duration"
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
                            <FormInput label="General_M" type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
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
                                    />
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.ACHIEVEMENT_FLD && (
                <div className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Name of SMS/KVK Head"
                            required
                            value={formData.staffName || ''}
                            onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                            options={[
                                { value: 'Dr. Reeta Singh', label: 'Dr. Reeta Singh' },
                                { value: 'Sri Rajeev Kumar', label: 'Sri Rajeev Kumar' },
                                { value: 'Dr. Pushpam Patel', label: 'Dr. Pushpam Patel' },
                                { value: 'Smt. Sangeeta Kumari', label: 'Smt. Sangeeta Kumari' },
                            ]}
                        />
                        <FormSelect
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(e) => setFormData({ ...formData, seasonId: e.target.value })}
                            options={[
                                { value: 'Kharif', label: 'Kharif' },
                                { value: 'Rabi', label: 'Rabi' },
                                { value: 'Zaid', label: 'Zaid' },
                            ]}
                        />
                        <FormSelect
                            label="Sector"
                            required
                            value={formData.sectorId || ''}
                            onChange={(e) => setFormData({ ...formData, sectorId: parseInt(e.target.value) })}
                            options={fldSectors.map(s => ({ value: s.sectorId, label: s.sectorName }))}
                        />
                        <FormSelect
                            label="Thematic Area"
                            required
                            value={formData.thematicArea || ''}
                            onChange={(e) => setFormData({ ...formData, thematicArea: e.target.value })}
                            options={[
                                { value: 'Integrated Crop Management', label: 'Integrated Crop Management' },
                                { value: 'Integrated Disease Management', label: 'Integrated Disease Management' },
                                { value: 'Integrated Nutrient Management', label: 'Integrated Nutrient Management' },
                                { value: 'Integrated Farming System', label: 'Integrated Farming System' },
                                { value: 'Varietal Evaluation', label: 'Varietal Evaluation' },
                                { value: 'Drudgery Reduction', label: 'Drudgery Reduction' },
                                { value: 'Value Addition', label: 'Value Addition' },
                            ]}
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
                        <FormSelect
                            label="Sub Category"
                            required
                            value={formData.subCategoryId || ''}
                            onChange={(e) => setFormData({ ...formData, subCategoryId: parseInt(e.target.value) })}
                            disabled={!formData.categoryId}
                            options={fldSubcategories
                                .filter((s: any) => s.categoryId === formData.categoryId)
                                .map(s => ({ value: s.subCategoryId, label: s.subCategoryName }))}
                        />
                        <FormSelect
                            label="Crop"
                            required
                            value={formData.cropId || ''}
                            onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                            options={[
                                { value: 'Paddy', label: 'Paddy' },
                                { value: 'Wheat', label: 'Wheat' },
                                { value: 'Maize', label: 'Maize' },
                                { value: 'Bengal Gram', label: 'Bengal Gram' },
                                { value: 'Lentil', label: 'Lentil' },
                                { value: 'Mustard', label: 'Mustard' },
                                { value: 'Sesame', label: 'Sesame' },
                            ]}
                        />
                        { /* Spacer to align grid if needed, or just let it flow */}
                        <div className="hidden md:block"></div>

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
        </>
    )
}
