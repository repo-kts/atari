import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput } from '../shared/FormComponents'
import { useYears } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface LinkageFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}



export const LinkageForms: React.FC<LinkageFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [], isLoading: isLoadingYears } = useYears()

    // Memoize year options
    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'reportingYear', 'yearName'),
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
            setFormData({ ...formData, reportingYear: value })
        },
        [formData, setFormData]
    )



    if (!entityType) return null

    return (
        <div className="space-y-4">
            {/* 1. Functional linkage with Different Organizations */}
            {entityType === ENTITY_TYPES.PERFORMANCE_FUNCTIONAL_LINKAGE && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYear ?? ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Name of Organization"
                            required
                            value={formData.organizationName ?? ''}
                            onChange={handleFieldChange('organizationName')}
                            placeholder="Enter organization name"
                        />

                        <FormInput
                            label="Nature of Linkage"
                            required
                            value={formData.natureOfLinkage ?? ''}
                            onChange={handleFieldChange('natureOfLinkage')}
                            placeholder="Enter nature of linkage"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

