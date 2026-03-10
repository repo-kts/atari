import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect, FormTextArea } from '../shared/FormComponents'
import { useYears } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface DistrictLevelDataFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

// Dummy data for Account Type dropdown
const ACCOUNT_TYPE_OPTIONS = [
    { value: 'Agriculture', label: 'Agriculture' },
    { value: 'Livestock', label: 'Livestock' },
    { value: 'Farming Situation', label: 'Farming Situation' },
]

export const DistrictLevelDataForms: React.FC<DistrictLevelDataFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [], isLoading: isLoadingYears } = useYears()

    // Memoize year options
    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'yearId', 'yearName'),
        [years]
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
            setFormData({ ...formData, reportingYearId: value, yearId: value, reportingYear: value })
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
                            value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormSelect
                            label="Account Type"
                            required
                            value={formData.accountType || ''}
                            onChange={handleFieldChange('accountType')}
                            options={ACCOUNT_TYPE_OPTIONS}
                        />
                    </div>

                    <FormTextArea
                        label="Information"
                        required
                        value={formData.information || ''}
                        onChange={handleFieldChange('information')}
                        rows={4}
                        placeholder="Enter information about agriculture, livestock and farming situation"
                    />
                </div>
            )}

            {/* 2. Details of operational area / villages */}
            {entityType === ENTITY_TYPES.PERFORMANCE_OPERATIONAL_AREA && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormInput
                            label="Taluk"
                            required
                            value={formData.taluk || ''}
                            onChange={handleFieldChange('taluk')}
                            placeholder="Enter taluk"
                        />

                        <FormInput
                            label="Block"
                            required
                            value={formData.block || ''}
                            onChange={handleFieldChange('block')}
                            placeholder="Enter block"
                        />

                        <FormInput
                            label="Village"
                            required
                            value={formData.village || ''}
                            onChange={handleFieldChange('village')}
                            placeholder="Enter village"
                        />
                    </div>

                    <FormInput
                        label="Major Crops"
                        required
                        value={formData.majorCrops || ''}
                        onChange={handleFieldChange('majorCrops')}
                        placeholder="Enter major crops"
                    />

                    <FormTextArea
                        label="Major Problems Identified (Crop-wise)"
                        required
                        value={formData.majorProblems || ''}
                        onChange={handleFieldChange('majorProblems')}
                        rows={3}
                        placeholder="Enter major problems identified crop-wise"
                    />

                    <FormTextArea
                        label="Identified Thrust Areas"
                        required
                        value={formData.thrustAreas || ''}
                        onChange={handleFieldChange('thrustAreas')}
                        rows={3}
                        placeholder="Enter identified thrust areas"
                    />
                </div>
            )}

            {/* 3. Details of village adoption programme */}
            {entityType === ENTITY_TYPES.PERFORMANCE_VILLAGE_ADOPTION && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Village"
                            required
                            value={formData.village || ''}
                            onChange={handleFieldChange('village')}
                            placeholder="Enter village"
                        />

                        <FormInput
                            label="Block"
                            required
                            value={formData.block || ''}
                            onChange={handleFieldChange('block')}
                            placeholder="Enter block"
                        />
                    </div>

                    <FormTextArea
                        label="Action Taken for Development"
                        required
                        value={formData.actionTaken || ''}
                        onChange={handleFieldChange('actionTaken')}
                        rows={4}
                        placeholder="Enter action taken for development"
                    />
                </div>
            )}

            {/* 4. Priority thrust areas */}
            {entityType === ENTITY_TYPES.PERFORMANCE_PRIORITY_THRUST && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormInput
                            label="Thrust Area"
                            required
                            value={formData.thrustArea || ''}
                            onChange={handleFieldChange('thrustArea')}
                            placeholder="Enter thrust area"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
