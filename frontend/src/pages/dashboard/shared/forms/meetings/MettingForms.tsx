import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormTextArea, FormSelect } from '../shared/FormComponents'
import { useYears } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface MettingFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

// Yes/No options
const YES_NO_OPTIONS = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
]

export const MettingForms: React.FC<MettingFormsProps> = ({
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

    const handleDateChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [field]: new Date(e.target.value).toISOString() })
        },
        [formData, setFormData]
    )

    const handleYearChange = useCallback(
        (value: string | number) => {
            setFormData({ ...formData, reportingYearId: value, yearId: value, reportingYear: value })
        },
        [formData, setFormData]
    )

    const handleFileChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [field]: e.target.files })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {/* 1. Create Details of Scientific Advisory Committee(SAC) Meetings */}
            {entityType === ENTITY_TYPES.MISC_MEETINGS_SAC && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('startDate')}
                        />

                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('endDate')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="No of Participants"
                            required
                            type="number"
                            value={formData.participantsCount || ''}
                            onChange={handleNumberChange('participantsCount')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Total Statutory Members Present (State Line Department)"
                            required
                            type="number"
                            value={formData.statutoryMembersPresent || ''}
                            onChange={handleNumberChange('statutoryMembersPresent')}
                            placeholder="Enter number"
                        />
                    </div>

                    <FormTextArea
                        label="Salient Recommendations"
                        required
                        value={formData.recommendations || ''}
                        onChange={handleFieldChange('recommendations')}
                        rows={4}
                        placeholder="Enter recommendations"
                    />

                    <FormSelect
                        label="Action Taken"
                        required
                        value={formData.actionTaken || ''}
                        onChange={handleFieldChange('actionTaken')}
                        options={YES_NO_OPTIONS}
                        placeholder="Select action taken"
                    />

                    {formData.actionTaken === 'No' && (
                        <FormInput
                            label="Reason"
                            required
                            value={formData.reason || ''}
                            onChange={handleFieldChange('reason')}
                            placeholder="Enter reason"
                        />
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Upload File <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            onChange={handleFileChange('uploadFile')}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#487749]/10 file:text-[#487749] hover:file:bg-[#487749]/20 transition-all border border-[#E0E0E0] rounded-xl p-2"
                        />
                    </div>
                </div>
            )}

            {/* 2. Create Details of Other Meeting Related to ATARI */}
            {entityType === ENTITY_TYPES.MISC_MEETINGS_OTHER && (
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
                            label="Meeting Date"
                            required
                            type="date"
                            value={formData.meetingDate ? new Date(formData.meetingDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('meetingDate')}
                        />

                        <FormInput
                            label="Type of Meeting"
                            required
                            value={formData.meetingType || ''}
                            onChange={handleFieldChange('meetingType')}
                            placeholder="Enter meeting type"
                        />
                    </div>

                    <FormInput
                        label="Agenda"
                        required
                        value={formData.agenda || ''}
                        onChange={handleFieldChange('agenda')}
                        placeholder="Enter agenda"
                    />

                    <FormInput
                        label="Representative from ATARI"
                        required
                        value={formData.representative || ''}
                        onChange={handleFieldChange('representative')}
                        placeholder="Enter representative name"
                    />
                </div>
            )}
        </div>
    )
}
