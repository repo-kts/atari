import type * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useFormAttachments } from './useFormAttachments'
import type { FormAttachmentKind, FormAttachmentRow } from '@/services/formAttachmentsApi'

interface Params {
    formCode: string
    kind: FormAttachmentKind
    kvkId?: number | null
    recordId?: number | null
    initialAttachments?: FormAttachmentRow[]
}

interface Result {
    attachments: FormAttachmentRow[]
    setAttachments: React.Dispatch<React.SetStateAction<FormAttachmentRow[]>>
    pendingAttachmentIds: number[]
    isReady: boolean
}

/**
 * Manages attachment state for a form field across two phases:
 *  - "orphan" phase: form record doesn't exist yet (recordId is null).
 *    Uploads land with recordId=null; component tracks them locally so
 *    they can be sent as `attachmentIds[]` on form submit.
 *  - "linked" phase: record exists. Uploads attach directly via recordId.
 *    The TanStack Query hook owns the list; orphan state is unused.
 */
export function useFormAttachmentsField({
    formCode,
    kind,
    kvkId,
    recordId,
    initialAttachments,
}: Params): Result {
    const linkedQuery = useFormAttachments({
        formCode,
        recordId,
        kvkId: kvkId ?? undefined,
        kind,
        enabled: Boolean(kvkId && recordId),
    })

    const [orphans, setOrphans] = useState<FormAttachmentRow[]>(
        recordId ? [] : (initialAttachments ?? []).filter((a) => a.recordId == null),
    )

    // When recordId becomes set after a save, drop orphans (they're now linked).
    useEffect(() => {
        if (recordId) setOrphans([])
    }, [recordId])

    const attachments = useMemo<FormAttachmentRow[]>(() => {
        if (recordId) return linkedQuery.data ?? initialAttachments ?? []
        return orphans
    }, [recordId, linkedQuery.data, initialAttachments, orphans])

    const pendingAttachmentIds = useMemo(
        () => attachments.filter((a) => !a.recordId).map((a) => a.attachmentId),
        [attachments],
    )

    return {
        attachments,
        setAttachments: setOrphans,
        pendingAttachmentIds,
        isReady: !linkedQuery.isLoading,
    }
}
