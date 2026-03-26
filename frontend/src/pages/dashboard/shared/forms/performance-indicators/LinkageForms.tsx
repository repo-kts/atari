import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormTextArea } from '../shared/FormComponents'
import { useYears, useProgrammeTypes } from '@/hooks/useOtherMastersData'
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
    const { data: programmeTypes = [], isLoading: isLoadingProgrammeTypes } = useProgrammeTypes()

    // Memoize year options
    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'yearId', 'yearName'),
        [years]
    )

    const programmeTypeOptions = useMemo(
        () => createMasterDataOptions(programmeTypes, 'programmeType', 'programmeType'),
        [programmeTypes]
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
            {/* 1. Functional linkage with Different Organizations */}
            {entityType === ENTITY_TYPES.PERFORMANCE_FUNCTIONAL_LINKAGE && (
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
                            label="Name of Organization"
                            required
                            value={formData.organizationName || ''}
                            onChange={handleFieldChange('organizationName')}
                            placeholder="Enter organization name"
                        />

                        <FormInput
                            label="Nature of Linkage"
                            required
                            value={formData.natureOfLinkage || ''}
                            onChange={handleFieldChange('natureOfLinkage')}
                            placeholder="Enter nature of linkage"
                        />
                    </div>
                </div>
            )}

            {/* 2. List of Special Programmes Undertaken by the KVK */}
            {entityType === ENTITY_TYPES.PERFORMANCE_SPECIAL_PROGRAMMES && (
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
                        <MasterDataDropdown
                            label="Programme Type"
                            required
                            value={formData.programmeType || ''}
                            onChange={(value) => setFormData({ ...formData, programmeType: value })}
                            options={programmeTypeOptions}
                            isLoading={isLoadingProgrammeTypes}
                            emptyMessage="No programme types available"
                        />

                        <FormInput
                            label="Name of the Programme/Scheme"
                            required
                            value={formData.programmeName || ''}
                            onChange={handleFieldChange('programmeName')}
                            placeholder="Enter programme/scheme name"
                        />
                    </div>

                    <FormTextArea
                        label="Purpose of Programme"
                        required
                        value={formData.programmePurpose || ''}
                        onChange={handleFieldChange('programmePurpose')}
                        rows={3}
                        placeholder="Enter purpose of programme"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Date/Month of Initiation"
                            required
                            type="date"
                            value={formData.initiationDate ? new Date(formData.initiationDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val) {
                                    setFormData({
                                        ...formData,
                                        initiationDate: new Date(val).toISOString(),
                                    });
                                } else {
                                    setFormData({
                                        ...formData,
                                        initiationDate: null,
                                    });
                                }
                            }}
                        />

                        <FormInput
                            label="Funding Agency"
                            required
                            value={formData.fundingAgency || ''}
                            onChange={handleFieldChange('fundingAgency')}
                            placeholder="Enter funding agency"
                        />
                    </div>

                    <FormInput
                        label="Amount (Rs.)"
                        required
                        type="number"
                        step="0.01"
                        value={formData.amount || ''}
                        onChange={handleFieldChange('amount')}
                        placeholder="Enter amount"
                    />
                </div>
            )}
        </div>
    )
}

