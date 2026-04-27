import React from 'react'
import { FormSection } from '@/pages/dashboard/shared/forms/shared/FormComponents'
import { MultiAttachmentUploader } from './MultiAttachmentUploader'
import { useFormAttachmentsField } from '@/hooks/useFormAttachmentsField'
import type { FormAttachmentKind, FormAttachmentRow } from '@/services/formAttachmentsApi'

export interface FormAttachmentSectionProps {
    title: string
    formCode: string
    kind: FormAttachmentKind
    kvkId?: number | null
    recordId?: string | number | null
    showCaption?: boolean
    helperText?: string
    initialAttachments?: FormAttachmentRow[]
    /**
     * Called whenever the local orphan list (or linked query) changes so the
     * parent form can sync `attachmentIds` into its submit payload.
     */
    onAttachmentIdsChange?: (ids: number[]) => void
    disabled?: boolean
    accept?: string
    maxBytes?: number
    reportingYearDate?: string | null
}

/**
 * Drop-in form section that renders an attachment uploader (single kind) tied
 * to a form record. Centralises the "orphan -> linked" flow used across
 * every form (OFT, ARYA, RAWE FET, NICRA, CFLD, etc.).
 *
 * Usage:
 *   <FormAttachmentSection
 *     title="Photographs"
 *     formCode="arya_current_year"
 *     kind="PHOTO"
 *     kvkId={kvkId}
 *     recordId={existingRecordId}
 *     onAttachmentIdsChange={(ids) => setFormData(p => ({ ...p, attachmentIds: ids }))}
 *   />
 *
 * On submit, the parent posts the form payload with `attachmentIds: number[]`.
 * Backend services link those IDs to the saved record via
 * `formAttachmentService.attachToRecord`.
 */
export const FormAttachmentSection: React.FC<FormAttachmentSectionProps> = ({
    title,
    formCode,
    kind,
    kvkId,
    recordId,
    showCaption,
    helperText,
    initialAttachments,
    onAttachmentIdsChange,
    disabled,
    accept,
    maxBytes,
    reportingYearDate,
}) => {
    const { attachments, setAttachments, pendingAttachmentIds } = useFormAttachmentsField({
        formCode,
        kind,
        kvkId,
        recordId,
        initialAttachments,
    })

    const idsKey = pendingAttachmentIds.join(',')
    const onChangeRef = React.useRef(onAttachmentIdsChange)
    React.useEffect(() => {
        onChangeRef.current = onAttachmentIdsChange
    })
    React.useEffect(() => {
        onChangeRef.current?.(pendingAttachmentIds)
    }, [idsKey, pendingAttachmentIds])

    if (!kvkId) {
        return (
            <FormSection title={title}>
                <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    KVK context not available — uploads disabled. Save the record first.
                </div>
            </FormSection>
        )
    }

    return (
        <FormSection title={title}>
            <MultiAttachmentUploader
                formCode={formCode}
                kind={kind}
                kvkId={kvkId}
                recordId={recordId ?? null}
                attachments={attachments}
                showCaption={showCaption}
                helperText={helperText}
                disabled={disabled}
                accept={accept}
                maxBytes={maxBytes}
                reportingYearDate={reportingYearDate}
                onChange={recordId ? undefined : setAttachments}
            />
        </FormSection>
    )
}
