import React, { useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSection } from '../shared/FormComponents'
import { FormAttachmentSection } from '@/components/common/FormAttachmentSection'

const FORM_CODE = 'rawe_fet'

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
            const value = e.target.value
            setFormData({ ...formData, [field]: value ? new Date(value).toISOString() : null })
        },
        [formData, setFormData]
    )

    const handleAttachmentIds = useCallback(
        (ids: number[]) => setFormData((prev: any) => ({ ...prev, attachmentIds: ids })),
        [setFormData],
    )

    if (!entityType) return null
    const todayYmd = new Date().toISOString().slice(0, 10)
    const recordId = formData?.raweProgrammeId ?? formData?.id ?? null
    const kvkId = formData?.kvkId ?? null

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

                    <FormAttachmentSection
                        title="Attachments"
                        formCode={FORM_CODE}
                        kind="DOCUMENT"
                        kvkId={kvkId}
                        recordId={recordId}
                        showCaption={false}
                        helperText="PDF, image, video, or document. Multiple uploads supported. Max 25 MB per file."
                        initialAttachments={formData?.documents}
                        onAttachmentIdsChange={handleAttachmentIds}
                    />

                    <FormSection title="Student">
                        <FormInput
                            label="No. of Male"
                            required
                            type="number"
                            value={formData.maleStudents ?? ''}
                            onChange={handleNumberChange('maleStudents')}
                            placeholder="0"
                        />

                        <FormInput
                            label="No. of Female"
                            required
                            type="number"
                            value={formData.femaleStudents ?? ''}
                            onChange={handleNumberChange('femaleStudents')}
                            placeholder="0"
                        />
                    </FormSection>
                </div>
            )}
        </div>
    )
}
