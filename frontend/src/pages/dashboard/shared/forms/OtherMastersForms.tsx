import React, { useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect } from './shared/FormComponents'
import { useNicraCategories, useFundingSources, useEquipmentTypes } from '@/hooks/useOtherMastersData'
import { createMasterDataOptions } from '@/utils/formHelpers'
import { IsOtherCheckbox } from '@/components/common/IsOtherCheckbox'

interface OtherMastersFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const OtherMastersForms: React.FC<OtherMastersFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: nicraCategories = [] } = useNicraCategories()
    const { data: fundingSources = [] } = useFundingSources()
    const { data: equipmentTypes = [] } = useEquipmentTypes()

    const fundingSourceOptions = React.useMemo(() =>
        createMasterDataOptions(fundingSources, 'fundingSourceId', 'name'),
        [fundingSources]
    )

    if (!entityType) return null

    return (
        <div className="w-full space-y-4">
            {/* Employee Masters */}
            {entityType === ENTITY_TYPES.STAFF_CATEGORY && (
                <div className="space-y-4">
                    <FormInput
                        label="Category Name"
                        required
                        value={formData.categoryName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, categoryName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter staff category name"
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </div>
            )}

            {entityType === ENTITY_TYPES.PAY_LEVEL && (
                <div className="space-y-4">
                    <FormInput
                        label="Level Name"
                        required
                        value={formData.levelName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, levelName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter pay level name"
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </div>
            )}

            {entityType === ENTITY_TYPES.PAY_SCALE && (
                <div className="space-y-4">
                    <FormInput
                        label="Scale Name"
                        required
                        value={formData.scaleName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, scaleName: e.target.value }))
                        }, [setFormData])}
                        placeholder="e.g. 15600-39100"
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </div>
            )}

            {(entityType === ENTITY_TYPES.EQUIPMENT_TYPE || entityType === ENTITY_TYPES.VEHICLE_TYPE) && (
                <div className="space-y-4">
                    <FormInput
                        label={entityType === ENTITY_TYPES.VEHICLE_TYPE ? 'Vehicle Type Name' : 'Type Name'}
                        required
                        value={formData.name ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                        }, [setFormData])}
                        placeholder={entityType === ENTITY_TYPES.VEHICLE_TYPE ? 'e.g. Tractor' : 'e.g. Lab Equipment'}
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </div>
            )}

            {entityType === ENTITY_TYPES.EQUIPMENT_MASTER && (
                <>
                    <FormSelect
                        label="Equipment Type"
                        required
                        value={formData.equipmentTypeId != null ? String(formData.equipmentTypeId) : ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
                            const v = e.target.value
                            setFormData((prev: any) => ({ ...prev, equipmentTypeId: v ? parseInt(v) : null }))
                        }, [setFormData])}
                        options={equipmentTypes.map((t: any) => ({
                            value: String(t.equipmentTypeId),
                            label: t.name,
                        }))}
                    />
                    <FormInput
                        label="Equipment Name"
                        required
                        value={formData.name ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                        }, [setFormData])}
                        placeholder="e.g. John Deere 5050D"
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </>
            )}

            {entityType === ENTITY_TYPES.SANCTIONED_POST && (
                <div className="space-y-4">
                    <FormInput
                        label="Post Name"
                        required
                        value={formData.postName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, postName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter sanctioned post name"
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </div>
            )}

            {entityType === ENTITY_TYPES.DISCIPLINE && (
                <div className="space-y-4">
                    <FormInput
                        label="Discipline Name"
                        required
                        value={formData.disciplineName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, disciplineName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter discipline name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))}
                    />
                </div>
            )}

            {/* Other Masters */}
            {entityType === ENTITY_TYPES.SEASON && (
                <div className="space-y-4">
                    <FormInput
                        label="Season Name"
                        required
                        value={formData.seasonName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, seasonName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter season name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.UNIT && (
                <div className="space-y-4">
                    <FormInput
                        label="Unit Name"
                        required
                        value={formData.unitName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, unitName: e.target.value }))
                        }, [setFormData])}
                        placeholder="e.g. Kg, Number, Hectare"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.CROP_TYPE && (
                <div className="space-y-4">
                    <FormInput
                        label="Crop Type Name"
                        required
                        value={formData.typeName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, typeName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter crop type name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.INFRASTRUCTURE_MASTER && (
                <div className="space-y-4">
                    <FormInput
                        label="Infrastructure Name"
                        required
                        value={formData.name ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter infrastructure name"
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </div>
            )}

            {entityType === ENTITY_TYPES.LAND_ITEM_MASTER && (
                <div className="space-y-4">
                    <FormInput
                        label="Land Item Name"
                        required
                        value={formData.name ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter land item name"
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </div>
            )}

            {entityType === ENTITY_TYPES.BUDGET_ITEM_MASTER && (
                <div className="space-y-4">
                    <FormInput
                        label="Budget Item Name"
                        required
                        value={formData.itemName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, itemName: e.target.value }))
                        }, [setFormData])}
                        placeholder="e.g. Critical Input"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.IMPORTANT_DAY && (
                <div className="space-y-4">
                    <FormInput
                        label="Day Name"
                        required
                        value={formData.dayName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, dayName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter important day name"
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </div>
            )}

            {entityType === ENTITY_TYPES.SOIL_WATER_ANALYSIS && (
                <>
                    <FormInput
                        label="Analysis Name"
                        required
                        value={formData.analysisName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, analysisName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter soil water analysis name"
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </>
            )}

            {entityType === ENTITY_TYPES.VEHICLE_PRESENT_STATUS && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Status Code"
                        required
                        value={formData.statusCode ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, statusCode: e.target.value.toUpperCase() }))
                        }, [setFormData])}
                        placeholder="Enter status code (e.g. SOLD)"
                    />
                    <FormInput
                        label="Status Label"
                        required
                        value={formData.statusLabel ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, statusLabel: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter status label"
                    />
                    <FormSelect
                        label="Hide In Next Year"
                        value={String(formData.hideInNextYear ?? false)}
                        onChange={useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
                            setFormData((prev: any) => ({ ...prev, hideInNextYear: e.target.value === 'true' }))
                        }, [setFormData])}
                        options={[
                            { value: 'false', label: 'No' },
                            { value: 'true', label: 'Yes' },
                        ]}
                    />
                    <FormSelect
                        label="Is Active"
                        value={String(formData.isActive ?? true)}
                        onChange={useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
                            setFormData((prev: any) => ({ ...prev, isActive: e.target.value === 'true' }))
                        }, [setFormData])}
                        options={[
                            { value: 'true', label: 'Yes' },
                            { value: 'false', label: 'No' },
                        ]}
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </div>
            )}

            {entityType === ENTITY_TYPES.EQUIPMENT_PRESENT_STATUS && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Status Code"
                        required
                        value={formData.statusCode ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, statusCode: e.target.value.toUpperCase() }))
                        }, [setFormData])}
                        placeholder="Enter status code (e.g. AUCTION)"
                    />
                    <FormInput
                        label="Status Label"
                        required
                        value={formData.statusLabel ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, statusLabel: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter status label"
                    />
                    <FormSelect
                        label="Hide In Next Year"
                        value={String(formData.hideInNextYear ?? false)}
                        onChange={useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
                            setFormData((prev: any) => ({ ...prev, hideInNextYear: e.target.value === 'true' }))
                        }, [setFormData])}
                        options={[
                            { value: 'false', label: 'No' },
                            { value: 'true', label: 'Yes' },
                        ]}
                    />
                    <FormSelect
                        label="Is Active"
                        value={String(formData.isActive ?? true)}
                        onChange={useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
                            setFormData((prev: any) => ({ ...prev, isActive: e.target.value === 'true' }))
                        }, [setFormData])}
                        options={[
                            { value: 'true', label: 'Yes' },
                            { value: 'false', label: 'No' },
                        ]}
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </div>
            )}

            {entityType === ENTITY_TYPES.NARI_ACTIVITY && (
                <div className="space-y-4">
                    <FormInput
                        label="Activity Name"
                        required
                        value={formData.activityName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, activityName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter NARI activity name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.NARI_CROP_CATEGORY && (
                <>
                    <FormInput
                        label="Category Name"
                        required
                        value={formData.name ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter NARI crop category name"
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </>
            )}

            {entityType === ENTITY_TYPES.NARI_NUTRITION_GARDEN_TYPE && (
                <div className="space-y-4">
                    <FormInput
                        label="Nutrition Garden Type"
                        required
                        value={formData.name ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter nutrition garden type"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.NICRA_CATEGORY && (
                <div className="space-y-4">
                    <FormInput
                        label="Category Name"
                        required
                        value={formData.categoryName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, categoryName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter NICRA category name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.NICRA_SUB_CATEGORY && (
                <>
                    <FormSelect
                        label="Category"
                        required
                        value={formData.nicraCategoryId ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
                            setFormData((prev: any) => ({ ...prev, nicraCategoryId: parseInt(e.target.value, 10) }))
                        }, [setFormData])}
                        options={nicraCategories.map((c: any) => ({
                            value: c.nicraCategoryId,
                            label: c.categoryName,
                        }))}
                    />
                    <FormInput
                        label="Sub Category Name"
                        required
                        value={formData.subCategoryName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, subCategoryName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter NICRA sub-category name"
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </>
            )}

            {entityType === ENTITY_TYPES.NICRA_SEED_BANK_FODDER_BANK && (
                <>
                    <FormInput label="Name" required value={formData.name ?? ''} onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setFormData((prev: any) => ({ ...prev, name: e.target.value })) }, [setFormData])} placeholder="Enter NICRA Seed/Fodder Bank name" />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </>
            )}

            {entityType === ENTITY_TYPES.NICRA_DIGNITARY_TYPE && (
                <>
                    <FormInput label="Dignitary Type" required value={formData.name ?? ''} onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setFormData((prev: any) => ({ ...prev, name: e.target.value })) }, [setFormData])} placeholder="Enter NICRA dignitary type" />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </>
            )}

            {entityType === ENTITY_TYPES.NICRA_PI_TYPE && (
                <>
                    <FormInput label="PI/CO-PI Type" required value={formData.name ?? ''} onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setFormData((prev: any) => ({ ...prev, name: e.target.value })) }, [setFormData])} placeholder="Enter NICRA PI/CO-PI type" />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </>
            )}

            {entityType === ENTITY_TYPES.FINANCIAL_PROJECT && (
                <div className="space-y-4">
                    <FormInput
                        label="Project Name"
                        required
                        value={formData.projectName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, projectName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter financial project name"
                    />
                    <FormSelect
                        label="Default Funding Source"
                        value={formData.fundingSourceId ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
                            setFormData((prev: any) => ({ ...prev, fundingSourceId: parseInt(e.target.value) }))
                        }, [setFormData])}
                        options={fundingSourceOptions}
                    />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </div>
            )}
            {entityType === ENTITY_TYPES.IMPACT_SPECIFIC_AREA && (
                <>
                    <FormInput label="Specific Area Name" required value={formData.specificAreaName ?? ''} onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setFormData((prev: any) => ({ ...prev, specificAreaName: e.target.value })) }, [setFormData])} placeholder="Enter impact specific area name" />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </>
            )}

            {entityType === ENTITY_TYPES.ENTERPRISE_TYPE && (
                <>
                    <FormInput label="Enterprise Type Name" required value={formData.enterpriseTypeName ?? ''} onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setFormData((prev: any) => ({ ...prev, enterpriseTypeName: e.target.value })) }, [setFormData])} placeholder="Enter enterprise type name" />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </>
            )}

            {entityType === ENTITY_TYPES.ACCOUNT_TYPE && (
                <>
                    <FormInput
                        label="Account Type"
                        required
                        value={formData.accountType ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, accountType: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter account type"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))}
                    />
                </>
            )}

            {entityType === ENTITY_TYPES.JOB_TYPE && (
                <>
                    <FormInput
                        label="Job Type"
                        required
                        value={formData.name ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter job type"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))}
                    />
                </>
            )}

            {entityType === ENTITY_TYPES.BANK_ACCOUNT_TYPE && (
                <>
                    <FormInput
                        label="Bank Account Type"
                        required
                        value={formData.name ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter bank account type (e.g. Saving)"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))}
                    />
                </>
            )}

            {entityType === ENTITY_TYPES.PROGRAMME_TYPE && (
                <>
                    <FormInput label="Programme Type" required value={formData.programmeType ?? ''} onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setFormData((prev: any) => ({ ...prev, programmeType: e.target.value })) }, [setFormData])} placeholder="Enter programme type" />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </>
            )}

            {entityType === ENTITY_TYPES.PPV_FRA_TRAINING_TYPE && (
                <>
                    <FormInput label="Training/Awareness Type" required value={formData.typeName ?? ''} onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setFormData((prev: any) => ({ ...prev, typeName: e.target.value })) }, [setFormData])} placeholder="Enter training/awareness type name" />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </>
            )}

            {entityType === ENTITY_TYPES.DIGNITARY_TYPE && (
                <>
                    <FormInput label="Dignitary Type" required value={formData.name ?? ''} onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setFormData((prev: any) => ({ ...prev, name: e.target.value })) }, [setFormData])} placeholder="Enter dignitary type name" />
                    <IsOtherCheckbox checked={Boolean(formData.isOther)} onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))} />
                </>
            )}
        </div>
    )
}
