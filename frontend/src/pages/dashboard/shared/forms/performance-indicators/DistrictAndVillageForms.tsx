import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormTextArea } from '../shared/FormComponents'
import { useYears, useAccountTypes } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface DistrictLevelDataFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}



export const DistrictLevelDataForms: React.FC<DistrictLevelDataFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [], isLoading: isLoadingYears } = useYears()
    const { data: accountTypes = [], isLoading: isLoadingAccountTypes } = useAccountTypes()

    // Memoize year options
    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'reportingYear', 'yearName'),
        [years]
    )

    const accountTypeOptions = useMemo(
        () => createMasterDataOptions(accountTypes, 'accountType', 'accountType'),
        [accountTypes]
    )

    // Optimized onChange handlers using useCallback
    const handleFieldChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const value = e.target.value
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleYearChange = useCallback(
        (value: string | number) => {
            setFormData({ ...formData, reportingYear: value })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {/* 1. District level data on agriculture, livestock and farming situation */}
            {entityType === ENTITY_TYPES.PERFORMANCE_DISTRICT_LEVEL && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear ?? ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <MasterDataDropdown
                            label="Account Type"
                            required
                            value={formData.items ?? ''}
                            onChange={(value) => setFormData({ ...formData, items: value })}
                            options={accountTypeOptions}
                            isLoading={isLoadingAccountTypes}
                            emptyMessage="No account types available"
                        />
                    </div>

                    <FormTextArea
                        label="Information"
                        required
                        value={formData.information ?? ''}
                        onChange={handleFieldChange('information')}
                        rows={4}
                        placeholder="Enter information about agriculture, livestock and farming situation"
                    />
                </div>
            )}

            {/* 2. Details of operational area / villages */}
            {entityType === ENTITY_TYPES.PERFORMANCE_OPERATIONAL_AREA && (
                <div className="space-y-4 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear ?? ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormInput
                            label="Taluk"
                            required
                            value={formData.taluk ?? ''}
                            onChange={handleFieldChange('taluk')}
                            placeholder=""
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Block"
                            required
                            value={formData.block ?? ''}
                            onChange={handleFieldChange('block')}
                            placeholder=""
                        />

                        <FormInput
                            label="Village"
                            required
                            value={formData.village ?? ''}
                            onChange={handleFieldChange('village')}
                            placeholder=""
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Major crops"
                            required
                            value={formData.majorCrops ?? ''}
                            onChange={handleFieldChange('majorCrops')}
                            placeholder=""
                        />

                        <FormInput
                            label="Major problems identified (crop-wise)"
                            required
                            value={formData.majorProblems ?? ''}
                            onChange={handleFieldChange('majorProblems')}
                            placeholder=""
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Identified Thrust Areas"
                            required
                            value={formData.thrustAreas ?? ''}
                            onChange={handleFieldChange('thrustAreas')}
                            placeholder=""
                        />
                    </div>
                </div>
            )}

            {/* 3. Details of village adoption programme */}
            {entityType === ENTITY_TYPES.PERFORMANCE_VILLAGE_ADOPTION && (
                <div className="space-y-4 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear ?? ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormInput
                            label="Village"
                            required
                            value={formData.village ?? ''}
                            onChange={handleFieldChange('village')}
                            placeholder=""
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Block"
                            required
                            value={formData.block ?? ''}
                            onChange={handleFieldChange('block')}
                            placeholder=""
                        />

                        <FormInput
                            label="Action taken for development"
                            required
                            value={formData.actionTaken ?? ''}
                            onChange={handleFieldChange('actionTaken')}
                            placeholder=""
                        />
                    </div>
                </div>
            )}

            {/* 4. Priority thrust areas */}
            {entityType === ENTITY_TYPES.PERFORMANCE_PRIORITY_THRUST && (
                <div className="space-y-4 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear ?? ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormInput
                            label="Thrust area"
                            required
                            value={formData.thrustArea ?? ''}
                            onChange={handleFieldChange('thrustArea')}
                            placeholder=""
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
