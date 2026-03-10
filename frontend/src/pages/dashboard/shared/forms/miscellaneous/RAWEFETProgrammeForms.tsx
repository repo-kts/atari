import React, { useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSection } from '../shared/FormComponents'

interface RAWEFETProgrammeFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const RAWEFETProgrammeForms: React.FC<RAWEFETProgrammeFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
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

    const handleFileChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [field]: e.target.files })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {entityType === ENTITY_TYPES.MISC_RAWE_FET && (
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

                    <FormInput
                        label="Attachment Type"
                        required
                        value={formData.attachmentType || ''}
                        onChange={handleFieldChange('attachmentType')}
                        placeholder="Enter attachment type"
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Attachment Upload
                        </label>
                        <input
                            type="file"
                            onChange={handleFileChange('attachment')}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#487749]/10 file:text-[#487749] hover:file:bg-[#487749]/20 transition-all border border-[#E0E0E0] rounded-xl p-2"
                        />
                    </div>

                    <FormSection title="Student">
                        <FormInput
                            label="No. of Male"
                            required
                            type="number"
                            value={formData.maleCount || ''}
                            onChange={handleNumberChange('maleCount')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="No. of Female"
                            required
                            type="number"
                            value={formData.femaleCount || ''}
                            onChange={handleNumberChange('femaleCount')}
                            placeholder="Enter number"
                        />
                    </FormSection>
                </div>
            )}
        </div>
    )
}
