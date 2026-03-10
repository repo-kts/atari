import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSection } from '../shared/FormComponents'
import { useYears } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface SwachhtaBharatAbhiyaanFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const SwachhtaBharatAbhiyaanForms: React.FC<SwachhtaBharatAbhiyaanFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [], isLoading: isLoadingYears } = useYears()

    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'yearId', 'yearName'),
        [years]
    )

    const handleFieldChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const value = e.target.value
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleNumberChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value === '' ? '' : parseInt(e.target.value)
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
            {/* 1. Create Observation of Swachhta hi Sewa SBA */}
            {entityType === ENTITY_TYPES.MISC_SWACHHTA_SEWA && (
                <div className="space-y-3">
                    <FormInput
                        label="Date/Duration of Observation"
                        required
                        value={formData.observationDate || ''}
                        onChange={handleFieldChange('observationDate')}
                        placeholder="Enter date/duration"
                    />

                    <FormInput
                        label="Total No of Activities Undertaken"
                        required
                        type="number"
                        value={formData.totalActivities || ''}
                        onChange={handleNumberChange('totalActivities')}
                        placeholder="Enter number"
                    />

                    <FormSection title="No. of Participants">
                        <FormInput
                            label="Staffs"
                            required
                            type="number"
                            value={formData.participantsStaff || ''}
                            onChange={handleNumberChange('participantsStaff')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Farmers"
                            required
                            type="number"
                            value={formData.participantsFarmers || ''}
                            onChange={handleNumberChange('participantsFarmers')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Others"
                            required
                            type="number"
                            value={formData.participantsOthers || ''}
                            onChange={handleNumberChange('participantsOthers')}
                            placeholder="Enter number"
                        />
                    </FormSection>
                </div>
            )}

            {/* 2. Create Observation of Swachta Pakhwada */}
            {entityType === ENTITY_TYPES.MISC_SWACHHTA_PAKHWADA && (
                <div className="space-y-3">
                    <FormInput
                        label="Date/Duration of Observation"
                        required
                        value={formData.observationDate || ''}
                        onChange={handleFieldChange('observationDate')}
                        placeholder="Enter date/duration"
                    />

                    <FormInput
                        label="Total No of Activities Undertaken"
                        required
                        type="number"
                        value={formData.totalActivities || ''}
                        onChange={handleNumberChange('totalActivities')}
                        placeholder="Enter number"
                    />

                    <FormSection title="No. of Participants">
                        <FormInput
                            label="Staffs"
                            required
                            type="number"
                            value={formData.participantsStaff || ''}
                            onChange={handleNumberChange('participantsStaff')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Farmers"
                            required
                            type="number"
                            value={formData.participantsFarmers || ''}
                            onChange={handleNumberChange('participantsFarmers')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Others"
                            required
                            type="number"
                            value={formData.participantsOthers || ''}
                            onChange={handleNumberChange('participantsOthers')}
                            placeholder="Enter number"
                        />
                    </FormSection>
                </div>
            )}

            {/* 3. Create Details of Quarterly Budget Expenditure on Swachh Activities */}
            {entityType === ENTITY_TYPES.MISC_SWACHHTA_BUDGET && (
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

                    <FormSection title="Vermicomposting">
                        <FormInput
                            label="No of Village Covered"
                            required
                            type="number"
                            value={formData.vermicompostingVillages || ''}
                            onChange={handleNumberChange('vermicompostingVillages')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Total Expenditure (Rs.in Lakhs)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.vermicompostingExpenditure || ''}
                            onChange={(e) => setFormData({ ...formData, vermicompostingExpenditure: parseFloat(e.target.value) || 0 })}
                            placeholder="Enter amount"
                        />
                    </FormSection>

                    <FormSection title="Other than Vermicomposting Activities under Swachata">
                        <FormInput
                            label="No of Village Covered"
                            required
                            type="number"
                            value={formData.otherVillages || ''}
                            onChange={handleNumberChange('otherVillages')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Total Expenditure (Rs.in Lakhs)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.otherExpenditure || ''}
                            onChange={(e) => setFormData({ ...formData, otherExpenditure: parseFloat(e.target.value) || 0 })}
                            placeholder="Enter amount"
                        />
                    </FormSection>
                </div>
            )}
        </div>
    )
}
