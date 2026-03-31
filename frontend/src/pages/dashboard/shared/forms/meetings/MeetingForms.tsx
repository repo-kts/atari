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
        () => createMasterDataOptions(years, 'reportingYear', 'yearName'),
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
            setFormData({ ...formData, reportingYear: value })
        },
        [formData, setFormData]
    )

    const handleFileChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData({
                        ...formData,
                        [field]: reader.result as string
                    })
                };
                reader.readAsDataURL(file);
            } else {
                setFormData({ ...formData, [field]: null })
            }
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

                                {(formData.uploadedFile || formData.file) && (
                                    <div className="mb-2 p-3 bg-[#487749]/5 border border-[#487749]/20 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {typeof (formData.uploadedFile || formData.file) === 'string' && (formData.uploadedFile || formData.file).startsWith('data:image') ? (
                                                <img
                                                    src={formData.uploadedFile || formData.file}
                                                    alt="Preview"
                                                    className="w-10 h-10 object-cover rounded-lg border border-[#E0E0E0]"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-[#487749]/10 rounded-lg flex items-center justify-center text-[#487749]">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-[#487749]">Existing File</span>
                                                <span className="text-[10px] text-gray-500 truncate max-w-[150px]">
                                                    {typeof (formData.uploadedFile || formData.file) === 'string' && (formData.uploadedFile || formData.file).length > 30
                                                        ? 'Current file attached'
                                                        : (formData.uploadedFile || formData.file)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, uploadedFile: null, file: null })}
                                            className="p-1 px-2 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx"
                                    onChange={handleFileChange('uploadedFile')}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#487749]/10 file:text-[#487749] hover:file:bg-[#487749]/20 transition-all border border-[#E0E0E0] rounded-xl p-2"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 italic">
                                    {formData.uploadedFile || formData.file ? 'Select a new file to replace the existing one.' : 'Upload meeting photos or reports (Max 5MB)'}
                                </p>
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
                        value={formData.reportingYear || ''}
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
