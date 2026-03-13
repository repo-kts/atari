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
            const value = e.target.value;
            setFormData({ ...formData, [field]: value ? new Date(value).toISOString() : null })
        },
        [formData, setFormData]
    )

    const handleFileChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    // Set both the original file and the Base64 version
                    // backend expects attachmentPath for this entity
                    setFormData({
                        ...formData,
                        [field]: file,
                        attachmentPath: reader.result as string
                    })
                };
                reader.readAsDataURL(file);
            } else {
                setFormData({ ...formData, [field]: null, attachmentPath: null })
            }
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
                            Attachment Upload <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            required
                            accept="image/*"
                            onChange={handleFileChange('attachment')}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#487749]/10 file:text-[#487749] hover:file:bg-[#487749]/20 transition-all border border-[#E0E0E0] rounded-xl p-2"
                        />
                    </div>

                    <FormSection title="Student">
                        <FormInput
                            label="No. of Male"
                            required
                            type="number"
                            value={formData.maleStudents || ''}
                            onChange={handleNumberChange('maleStudents')}
                            placeholder="0"
                        />

                        <FormInput
                            label="No. of Female"
                            required
                            type="number"
                            value={formData.femaleStudents || ''}
                            onChange={handleNumberChange('femaleStudents')}
                            placeholder="0"
                        />
                    </FormSection>
                </div>
            )}
        </div>
    )
}
