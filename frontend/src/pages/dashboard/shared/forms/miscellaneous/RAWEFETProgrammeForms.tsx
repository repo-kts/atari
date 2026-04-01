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
    const handleFileChange = useCallback(
        (field: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleFileChangeLocal = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            handleFileChange(field)(e)
        },
        [handleFileChange]
    )

    if (!entityType) return null
    const todayYmd = new Date().toISOString().slice(0, 10)

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
                            max={todayYmd}
                            onChange={handleDateChange('startDate')}
                        />

                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                            min={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : undefined}
                            max={todayYmd}
                            onChange={handleDateChange('endDate')}
                        />
                    </div>

                    <FormInput
                        label="Attachment Type"
                        required
                        value={typeof formData.attachmentType === 'object' ? (formData.attachmentType?.name || '') : (formData.attachmentType || '')}
                        onChange={handleFieldChange('attachmentType')}
                        placeholder="Enter attachment type (e.g., Video, PDF, Photo)"
                    />

                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">
                            Attachment Upload
                        </label>

                        {(formData.attachmentPath || formData.attachment) && (
                            <div className="mb-4 p-4 border border-dashed border-[#487749]/30 rounded-2xl bg-[#487749]/5">
                                <p className="text-xs font-medium text-[#487749] mb-3 flex items-center">
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Current Attachment Preview
                                </p>
                                <div className="relative inline-block group">
                                    <img
                                        src={typeof formData.attachmentPath === 'string' ? formData.attachmentPath : (formData.attachment ? URL.createObjectURL(formData.attachment) : '')}
                                        className="h-32 w-auto object-contain rounded-xl shadow-md border-2 border-white hover:scale-[1.02] transition-transform duration-300"
                                        alt="Current attachment"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, attachmentPath: null, attachment: null })}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        title="Remove attachment"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChangeLocal('attachment')}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#487749] file:text-white hover:file:bg-[#3d633e] file:cursor-pointer transition-all border-2 border-dashed border-[#E0E0E0] group-hover:border-[#487749]/50 rounded-2xl p-2 bg-gray-50/50"
                            />
                            <p className="mt-2 text-[10px] text-gray-500 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Max file size: 2MB. (Optional)
                            </p>
                        </div>
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
