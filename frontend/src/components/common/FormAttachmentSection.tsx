import React from 'react'
import { FormSection } from '@/pages/dashboard/shared/forms/shared/FormComponents'
import { MultiAttachmentUploader } from './MultiAttachmentUploader'
import { useFormAttachmentsField } from '@/hooks/useFormAttachmentsField'
import { useAuth } from '@/contexts/AuthContext'
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
    maxCount?: number
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
    maxCount,
    reportingYearDate,
}) => {
    // Fall back to the logged-in user's kvkId when the form hasn't pushed it
    // into formData yet (kvk-scoped users like kvk_admin / kvk_user / kvk_staff).
    const { user } = useAuth()
    const effectiveKvkId = kvkId ?? user?.kvkId ?? null

    const { attachments, setAttachments, pendingAttachmentIds } = useFormAttachmentsField({
        formCode,
        kind,
        kvkId: effectiveKvkId,
        recordId,
        initialAttachments,
    })

    // Keep the latest onChange handler in a ref so we don't refire the effect
    // when the parent re-renders with a new inline callback.
    const onChangeRef = React.useRef(onAttachmentIdsChange)
    React.useEffect(() => {
        onChangeRef.current = onAttachmentIdsChange
    })

    // Only notify the parent when the actual id list content changes. Skip the
    // initial mount to avoid clobbering parent state with attachmentIds:[]
    // before the user has done anything.
    const idsKey = pendingAttachmentIds.join(',')
    const lastNotifiedKeyRef = React.useRef<string | null>(null)
    React.useEffect(() => {
        if (lastNotifiedKeyRef.current === idsKey) return
        // Skip the very first render — initial empty list isn't worth pushing.
        if (lastNotifiedKeyRef.current === null && pendingAttachmentIds.length === 0) {
            lastNotifiedKeyRef.current = idsKey
            return
        }
        lastNotifiedKeyRef.current = idsKey
        onChangeRef.current?.(pendingAttachmentIds)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idsKey])

    if (!effectiveKvkId) {
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
                kvkId={effectiveKvkId}
                recordId={recordId ?? null}
                attachments={attachments}
                showCaption={showCaption}
                helperText={helperText}
                disabled={disabled}
                accept={accept}
                maxBytes={maxBytes}
                maxCount={maxCount}
                reportingYearDate={reportingYearDate}
                onChange={recordId ? undefined : setAttachments}
            />
        </FormSection>
    )
}
