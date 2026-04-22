import React, { useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect } from './shared/FormComponents'
import { useNicraCategories, useFundingAgencies } from '@/hooks/useOtherMastersData'
import { createMasterDataOptions } from '@/utils/formHelpers'

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
    const { data: fundingAgencies = [] } = useFundingAgencies()

    const agencyOptions = React.useMemo(() =>
        createMasterDataOptions(fundingAgencies, 'fundingAgencyId', 'agencyName'),
        [fundingAgencies]
    )

    if (!entityType) return null

    return (
        <div className="w-full space-y-4">
            {/* Employee Masters */}
            {entityType === ENTITY_TYPES.STAFF_CATEGORY && (
                <FormInput
                    label="Category Name"
                    required
                    value={formData.categoryName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, categoryName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter staff category name"
                />
            )}

            {entityType === ENTITY_TYPES.PAY_LEVEL && (
                <FormInput
                    label="Level Name"
                    required
                    value={formData.levelName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, levelName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter pay level name"
                />
            )}

            {entityType === ENTITY_TYPES.PAY_SCALE && (
                <FormInput
                    label="Scale Name"
                    required
                    value={formData.scaleName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, scaleName: e.target.value }))
                    }, [setFormData])}
                    placeholder="e.g. 15600-39100"
                />
            )}

            {entityType === ENTITY_TYPES.SANCTIONED_POST && (
                <FormInput
                    label="Post Name"
                    required
                    value={formData.postName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, postName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter sanctioned post name"
                />
            )}

            {entityType === ENTITY_TYPES.DISCIPLINE && (
                <FormInput
                    label="Discipline Name"
                    required
                    value={formData.disciplineName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, disciplineName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter discipline name"
                />
            )}

            {/* Other Masters */}
            {entityType === ENTITY_TYPES.SEASON && (
                <FormInput
                    label="Season Name"
                    required
                    value={formData.seasonName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, seasonName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter season name"
                />
            )}

            {entityType === ENTITY_TYPES.CROP_TYPE && (
                <FormInput
                    label="Crop Type Name"
                    required
                    value={formData.typeName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, typeName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter crop type name"
                />
            )}

            {entityType === ENTITY_TYPES.INFRASTRUCTURE_MASTER && (
                <FormInput
                    label="Infrastructure Name"
                    required
                    value={formData.name ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter infrastructure name"
                />
            )}

            {entityType === ENTITY_TYPES.IMPORTANT_DAY && (
                <FormInput
                    label="Day Name"
                    required
                    value={formData.dayName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, dayName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter important day name"
                />
            )}

            {entityType === ENTITY_TYPES.SOIL_WATER_ANALYSIS && (
                <FormInput
                    label="Analysis Name"
                    required
                    value={formData.analysisName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, analysisName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter soil water analysis name"
                />
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
                </div>
            )}

            {entityType === ENTITY_TYPES.NARI_ACTIVITY && (
                <FormInput
                    label="Activity Name"
                    required
                    value={formData.activityName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, activityName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter NARI activity name"
                />
            )}

            {entityType === ENTITY_TYPES.NARI_CROP_CATEGORY && (
                <FormInput
                    label="Category Name"
                    required
                    value={formData.name ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter NARI crop category name"
                />
            )}

            {entityType === ENTITY_TYPES.NARI_NUTRITION_GARDEN_TYPE && (
                <FormInput
                    label="Nutrition Garden Type"
                    required
                    value={formData.name ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter nutrition garden type"
                />
            )}

            {entityType === ENTITY_TYPES.NICRA_CATEGORY && (
                <FormInput
                    label="Category Name"
                    required
                    value={formData.categoryName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, categoryName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter NICRA category name"
                />
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
                </>
            )}

            {entityType === ENTITY_TYPES.NICRA_SEED_BANK_FODDER_BANK && (
                <FormInput
                    label="Name"
                    required
                    value={formData.name ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter NICRA Seed/Fodder Bank name"
                />
            )}

            {entityType === ENTITY_TYPES.NICRA_DIGNITARY_TYPE && (
                <FormInput
                    label="Dignitary Type"
                    required
                    value={formData.name ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter NICRA dignitary type"
                />
            )}

            {entityType === ENTITY_TYPES.NICRA_PI_TYPE && (
                <FormInput
                    label="PI/CO-PI Type"
                    required
                    value={formData.name ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter NICRA PI/CO-PI type"
                />
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
                        label="Default Funding Agency"
                        value={formData.fundingAgencyId ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
                            setFormData((prev: any) => ({ ...prev, fundingAgencyId: parseInt(e.target.value) }))
                        }, [setFormData])}
                        options={agencyOptions}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FUNDING_AGENCY && (
                <FormInput
                    label="Agency Name"
                    required
                    value={formData.agencyName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, agencyName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter funding agency name"
                />
            )}
            {entityType === ENTITY_TYPES.IMPACT_SPECIFIC_AREA && (
                <FormInput
                    label="Specific Area Name"
                    required
                    value={formData.specificAreaName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, specificAreaName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter impact specific area name"
                />
            )}

            {entityType === ENTITY_TYPES.ENTERPRISE_TYPE && (
                <FormInput
                    label="Enterprise Type Name"
                    required
                    value={formData.enterpriseTypeName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, enterpriseTypeName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter enterprise type name"
                />
            )}

            {entityType === ENTITY_TYPES.ACCOUNT_TYPE && (
                <FormInput
                    label="Account Type"
                    required
                    value={formData.accountType ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, accountType: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter account type"
                />
            )}

            {entityType === ENTITY_TYPES.PROGRAMME_TYPE && (
                <FormInput
                    label="Programme Type"
                    required
                    value={formData.programmeType ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, programmeType: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter programme type"
                />
            )}

            {entityType === ENTITY_TYPES.PPV_FRA_TRAINING_TYPE && (
                <FormInput
                    label="Training/Awareness Type"
                    required
                    value={formData.typeName ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, typeName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter training/awareness type name"
                />
            )}

            {entityType === ENTITY_TYPES.DIGNITARY_TYPE && (
                <FormInput
                    label="Dignitary Type"
                    required
                    value={formData.name ?? ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter dignitary type name"
                />
            )}
        </div>
    )
}
