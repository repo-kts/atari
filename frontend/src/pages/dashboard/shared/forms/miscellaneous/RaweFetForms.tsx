import React from 'react'
import { FormInput } from '../shared/FormComponents'
import { FormAttachmentSection } from '@/components/common/FormAttachmentSection'

const FORM_CODE = 'rawe_fet'

interface RaweFetFormsProps {
    formData: any
    setFormData: (data: any) => void
}

export const RaweFetForms: React.FC<RaweFetFormsProps> = ({ formData, setFormData }) => {
    const formDataRef = React.useRef(formData)
    React.useEffect(() => {
        formDataRef.current = formData
    })
    const handleAttachmentIds = React.useCallback(
        (ids: number[]) => setFormData({ ...formDataRef.current, attachmentIds: ids }),
        [setFormData],
    )

    const recordId = formData?.raweProgrammeId ?? formData?.id ?? null
    const kvkId = formData?.kvkId ?? null

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                    label="Start Date"
                    required
                    type="date"
                    value={formData.startDate ? (typeof formData.startDate === 'string' ? formData.startDate.split('T')[0] : new Date(formData.startDate).toISOString().split('T')[0]) : ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <FormInput
                    label="End date"
                    required
                    type="date"
                    value={formData.endDate ? (typeof formData.endDate === 'string' ? formData.endDate.split('T')[0] : new Date(formData.endDate).toISOString().split('T')[0]) : ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
                <FormInput
                    label="Attachment Type"
                    required
                    type="text"
                    value={formData.attachmentType ?? ''}
                    onChange={(e) => setFormData({ ...formData, attachmentType: e.target.value })}
                />
            </div>

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

            <div>
                <h3 className="text-base font-semibold text-gray-700 mb-4">Student</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        label="No. of Male"
                        required
                        type="number"
                        min="0"
                        value={formData.maleStudents ?? ''}
                        onChange={(e) => setFormData({ ...formData, maleStudents: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                    />
                    <FormInput
                        label="No. of Female"
                        required
                        type="number"
                        min="0"
                        value={formData.femaleStudents ?? ''}
                        onChange={(e) => setFormData({ ...formData, femaleStudents: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                    />
                </div>
            </div>
        </div>
    )
}
