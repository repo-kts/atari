import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormTextArea, FormSelect } from '../shared/FormComponents'
import { useYears } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface MeetingFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

// Yes/No options
const YES_NO_OPTIONS = [
    { value: 'YES', label: 'Yes' },
    { value: 'NO', label: 'No' },
]

export const MeetingForms: React.FC<MeetingFormsProps> = ({
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
            const dateVal = e.target.value ? new Date(e.target.value).toISOString() : null
            setFormData({ ...formData, [field]: dateVal })
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

    const getDateValue = (d: any) => {
        if (!d) return ''
        try {
            return new Date(d).toISOString().split('T')[0]
        } catch {
            return ''
        }
    }

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
                            value={getDateValue(formData.startDate)}
                            onChange={handleDateChange('startDate')}
                        />

                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={getDateValue(formData.endDate)}
                            onChange={handleDateChange('endDate')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="No of Participants"
                            required
                            type="number"
                            value={formData.numberOfParticipants || ''}
                            onChange={handleNumberChange('numberOfParticipants')}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-3">
                            <FormTextArea
                                label="Salient Recommendations"
                                required
                                value={formData.salientRecommendations || ''}
                                onChange={handleFieldChange('salientRecommendations')}
                                rows={4}
                                placeholder="Enter recommendations"
                            />

                            <FormInput
                                label="Reason"
                                required
                                value={formData.reason || ''}
                                onChange={handleFieldChange('reason')}
                                placeholder="Enter reason"
                            />
                        </div>

                        <div className="space-y-3">
                            <FormSelect
                                label="Action Taken"
                                required
                                value={formData.actionTaken || ''}
                                onChange={handleFieldChange('actionTaken')}
                                options={YES_NO_OPTIONS}
                                placeholder="Select"
                            />

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Upload File <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange('uploadedFile')}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#487749]/10 file:text-[#487749] hover:file:bg-[#487749]/20 transition-all border border-[#E0E0E0] rounded-xl p-2"
                                />
                            </div>
                        </div>
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
                            value={getDateValue(formData.meetingDate)}
                            onChange={handleDateChange('meetingDate')}
                        />

                        <FormInput
                            label="Type of Meeting"
                            required
                            value={formData.typeOfMeeting || ''}
                            onChange={handleFieldChange('typeOfMeeting')}
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
                        value={formData.representativeFromAtari || ''}
                        onChange={handleFieldChange('representativeFromAtari')}
                        placeholder="Enter representative name"
                    />
                </div>
            )}
        </div>
    )
}
