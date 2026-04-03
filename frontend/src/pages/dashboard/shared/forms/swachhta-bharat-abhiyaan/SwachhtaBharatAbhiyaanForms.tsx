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
        () => createMasterDataOptions(years, 'reportingYear', 'yearName'),
        [years]
    )

    const handleDateChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [field]: e.target.value ? new Date(e.target.value).toISOString() : null })
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
            setFormData({ ...formData, reportingYear: value })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    // Helper functions for date extraction
    const getObservationDate = () => {
        const d = formData.observationDate || formData.dateDurationOfObservation
        if (!d) return ''
        try { return new Date(d).toISOString().split('T')[0] } catch { return '' }
    }

    return (
        <div className="space-y-4">
            {/* 1. Create Observation of Swachhta hi Sewa SBA */}
            {entityType === ENTITY_TYPES.MISC_SWACHHTA_SEWA && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Date/Duration of Observation"
                            required
                            type="date"
                            value={getObservationDate()}
                            onChange={handleDateChange('observationDate')}
                            placeholder="dd-mm-yyyy"
                        />

                        <FormInput
                            label="Total No of Activities undertaken"
                            required
                            type="number"
                            value={formData.totalActivities ?? formData.totalNoOfActivitiesUndertaken ?? ''}
                            onChange={handleNumberChange('totalActivities')}
                            placeholder=""
                        />
                    </div>

                    <FormSection title="No. of Participants">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormInput
                                label="Staffs"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.participantsStaff ?? formData.staffCount ?? formData.noOfStaffs ?? ''}
                                onChange={handleNumberChange('participantsStaff')}
                                placeholder=""
                            />

                            <FormInput
                                label="Farmers"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.participantsFarmers ?? formData.farmerCount ?? formData.noOfFarmers ?? ''}
                                onChange={handleNumberChange('participantsFarmers')}
                                placeholder=""
                            />

                            <FormInput
                                label="Others"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.participantsOthers ?? formData.othersCount ?? formData.noOfOthers ?? ''}
                                onChange={handleNumberChange('participantsOthers')}
                                placeholder=""
                            />

                            {/* <FormInput
                                label="No. of Total"
                                type="number"
                                disabled
                                value={(parseInt(formData.participantsStaff ?? formData.staffCount ?? formData.noOfStaffs) || 0) +
                                    (parseInt(formData.participantsFarmers ?? formData.farmerCount ?? formData.noOfFarmers) || 0) +
                                    (parseInt(formData.participantsOthers ?? formData.othersCount ?? formData.noOfOthers) || 0)}
                                onChange={() => { }}
                                placeholder=""
                            /> */}
                        </div>
                    </FormSection>
                </div>
            )}

            {/* 2. Create Observation of Swachta Pakhwada */}
            {entityType === ENTITY_TYPES.MISC_SWACHHTA_PAKHWADA && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Date/Duration of Observation"
                            required
                            type="date"
                            value={getObservationDate()}
                            onChange={handleDateChange('observationDate')}
                            placeholder="dd-mm-yyyy"
                        />

                        <FormInput
                            label="Total No of Activities undertaken"
                            required
                            type="number"
                            value={formData.totalActivities ?? formData.totalNoOfActivitiesUndertaken ?? ''}
                            onChange={handleNumberChange('totalActivities')}
                            placeholder=""
                        />
                    </div>

                    <FormSection title="No. of Participants">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormInput
                                label="Staffs"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.participantsStaff ?? formData.staffCount ?? formData.noOfStaffs ?? ''}
                                onChange={handleNumberChange('participantsStaff')}
                                placeholder=""
                            />

                            <FormInput
                                label="Farmers"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.participantsFarmers ?? formData.farmerCount ?? formData.noOfFarmers ?? ''}
                                onChange={handleNumberChange('participantsFarmers')}
                                placeholder=""
                            />

                            <FormInput
                                label="Others"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.participantsOthers ?? formData.othersCount ?? formData.noOfOthers ?? ''}
                                onChange={handleNumberChange('participantsOthers')}
                                placeholder=""
                            />

                            {/* <FormInput
                                label="No. of Total"
                                type="number"
                                disabled
                                value={(parseInt(formData.participantsStaff ?? formData.staffCount ?? formData.noOfStaffs) || 0) +
                                    (parseInt(formData.participantsFarmers ?? formData.farmerCount ?? formData.noOfFarmers) || 0) +
                                    (parseInt(formData.participantsOthers ?? formData.othersCount ?? formData.noOfOthers) || 0)}
                                onChange={() => { }}
                                placeholder=""
                            /> */}
                        </div>
                    </FormSection>
                </div>
            )}

            {/* 3. Create Details of quarterly budget expenditure on Swachh activities including SAP */}
            {entityType === ENTITY_TYPES.MISC_SWACHHTA_BUDGET && (
                <div className="space-y-3">
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
                    </div>

                    <FormSection title="Vermicomposting">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="No of village covered"
                                required
                                type="number"
                                value={formData.vermicompostingVillages ?? formData.vermicompostingNoOfVillageCovered ?? formData.vermiVillageCovered ?? ''}
                                onChange={handleNumberChange('vermicompostingVillages')}
                                placeholder=""
                            />

                            <FormInput
                                label="Total Expenditure(Rs.in Lakhs)"
                                required
                                type="number"
                                step="0.01"
                                value={formData.vermicompostingExpenditure ?? formData.vermicompostingTotalExpenditure ?? formData.vermiTotalExpenditure ?? ''}
                                onChange={(e) => setFormData({ ...formData, vermicompostingExpenditure: parseFloat(e.target.value) || 0 })}
                                placeholder=""
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Other than vermicomposting activities under Swachata">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="No of village covered"
                                required
                                type="number"
                                value={formData.otherVillages ?? formData.otherNoOfVillageCovered ?? formData.otherVillageCovered ?? ''}
                                onChange={handleNumberChange('otherVillages')}
                                placeholder=""
                            />

                            <FormInput
                                label="Total Expenditure(Rs.in Lakhs)"
                                required
                                type="number"
                                step="0.01"
                                value={formData.otherExpenditure ?? formData.otherTotalExpenditure ?? formData.otherTotalExpenditure ?? ''}
                                onChange={(e) => setFormData({ ...formData, otherExpenditure: parseFloat(e.target.value) || 0 })}
                                placeholder=""
                            />
                        </div>
                    </FormSection>
                </div>
            )}
        </div>
    )
}
