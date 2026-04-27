import React, { useCallback, useMemo, useRef, useState } from 'react'
import { X, FileIcon, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useDeleteAttachment, useUpdateAttachment } from '@/hooks/useFormAttachments'
import {
    formAttachmentsApi,
    uploadFileToS3,
    type FormAttachmentKind,
    type FormAttachmentRow,
} from '@/services/formAttachmentsApi'
import { ApiError } from '@/services/api'

const PHOTO_ACCEPT = 'image/*'
const DATASHEET_ACCEPT = [
    'application/pdf',
    'image/*',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.pdf,.xls,.xlsx,.doc,.docx',
].join(',')

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024

export interface MultiAttachmentUploaderProps {
    formCode: string
    kind: FormAttachmentKind
    kvkId: number
    recordId?: string | number | null
    attachments: FormAttachmentRow[]
    accept?: string
    maxBytes?: number
    showCaption?: boolean
    disabled?: boolean
    helperText?: string
    reportingYearDate?: string | null
    onChange?: (rows: FormAttachmentRow[]) => void
}

function isImage(att: FormAttachmentRow): boolean {
    return att.mimeType?.startsWith('image/') || false
}

function bytesLabel(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function uploadOne(input: {
    file: File
    formCode: string
    kind: FormAttachmentKind
    kvkId: number
    recordId: string | number | null
    sortOrder: number
    reportingYearDate: string | null
}): Promise<FormAttachmentRow> {
    const { file, formCode, kind, kvkId, recordId, sortOrder, reportingYearDate } = input
    const presign = await formAttachmentsApi.presign({
        formCode,
        kind,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        kvkId,
    })
    await uploadFileToS3(presign.uploadUrl, file, presign.headers)
    return formAttachmentsApi.confirm({
        s3Key: presign.s3Key,
        formCode,
        kind,
        recordId,
        kvkId,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        sortOrder,
        reportingYearDate,
    })
}

export const MultiAttachmentUploader: React.FC<MultiAttachmentUploaderProps> = ({
    formCode,
    kind,
    kvkId,
    recordId,
    attachments,
    accept,
    maxBytes = DEFAULT_MAX_BYTES,
    showCaption = kind === 'PHOTO',
    disabled = false,
    helperText,
    reportingYearDate = null,
    onChange,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const qc = useQueryClient()
    const updateMut = useUpdateAttachment()
    const removeMut = useDeleteAttachment(formCode)
    const [error, setError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
    const [busyIds, setBusyIds] = useState<Set<number>>(new Set())

    const acceptAttr = accept ?? (kind === 'PHOTO' ? PHOTO_ACCEPT : DATASHEET_ACCEPT)
    const helper =
        helperText ??
        (kind === 'PHOTO'
            ? `Only images allowed. Hold Ctrl/Cmd in the file picker to select multiple. (Max ${(maxBytes / (1024 * 1024)).toFixed(0)} MB per file)`
            : `PDF / Image / Excel / Word allowed. Hold Ctrl/Cmd to select multiple. (Max ${(maxBytes / (1024 * 1024)).toFixed(0)} MB per file)`)

    const sorted = useMemo(
        () => [...attachments].sort((a, b) => a.sortOrder - b.sortOrder || a.attachmentId - b.attachmentId),
        [attachments],
    )

    const handleFiles = useCallback(
        async (files: FileList | null) => {
            if (!files || files.length === 0) return
            setError(null)
            const list = Array.from(files)
            const oversized = list.find((f) => f.size > maxBytes)
            if (oversized) {
                setError(`"${oversized.name}" exceeds max size ${(maxBytes / (1024 * 1024)).toFixed(0)} MB`)
                if (fileInputRef.current) fileInputRef.current.value = ''
                return
            }
            const startSort = sorted.length > 0 ? sorted[sorted.length - 1].sortOrder + 1 : 0
            setUploading(true)
            setProgress({ done: 0, total: list.length })
            // Concurrent uploads via Promise.allSettled — each call is independent
            // (presign -> S3 PUT -> confirm). Tracks per-file completion for progress.
            let done = 0
            const settled = await Promise.allSettled(
                list.map((file, i) =>
                    uploadOne({
                        file,
                        formCode,
                        kind,
                        kvkId,
                        recordId: recordId ?? null,
                        sortOrder: startSort + i,
                        reportingYearDate,
                    }).then((row) => {
                        done += 1
                        setProgress({ done, total: list.length })
                        return row
                    }),
                ),
            )
            const results: FormAttachmentRow[] = []
            const errors: string[] = []
            settled.forEach((r, i) => {
                if (r.status === 'fulfilled') results.push(r.value)
                else {
                    const reason = r.reason
                    const msg = reason instanceof ApiError ? reason.message : reason instanceof Error ? reason.message : 'Upload failed'
                    errors.push(`${list[i].name}: ${msg}`)
                }
            })
            // Single state + cache update at the end so React renders once with all results.
            if (results.length && onChange) onChange([...sorted, ...results])
            qc.invalidateQueries({ queryKey: ['form-attachments', formCode] })
            qc.invalidateQueries({ queryKey: ['form-attachments-gallery'] })
            qc.invalidateQueries({ queryKey: ['form-attachments-gallery-forms'] })
            if (errors.length) setError(errors.join(' • '))
            setUploading(false)
            setProgress(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        },
        [formCode, kind, kvkId, recordId, sorted, onChange, maxBytes, reportingYearDate, qc],
    )

    const handleRemove = useCallback(
        async (att: FormAttachmentRow) => {
            setBusyIds((prev) => new Set(prev).add(att.attachmentId))
            try {
                await removeMut.mutateAsync(att.attachmentId)
                if (onChange) onChange(sorted.filter((s) => s.attachmentId !== att.attachmentId))
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Delete failed')
            } finally {
                setBusyIds((prev) => {
                    const next = new Set(prev)
                    next.delete(att.attachmentId)
                    return next
                })
            }
        },
        [removeMut, sorted, onChange],
    )

    const handleCaption = useCallback(
        async (att: FormAttachmentRow, caption: string) => {
            try {
                const updated = await updateMut.mutateAsync({ attachmentId: att.attachmentId, caption })
                if (onChange) onChange(sorted.map((s) => (s.attachmentId === att.attachmentId ? updated : s)))
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Caption save failed')
            }
        },
        [updateMut, sorted, onChange],
    )

    return (
        <div className="space-y-2">
            <div className="rounded-xl border border-[#E0E0E0] overflow-hidden">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptAttr}
                    multiple
                    disabled={disabled || uploading}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="block w-full text-sm bg-white px-3 py-2 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#487749] file:text-white hover:file:bg-[#3d6540] cursor-pointer disabled:opacity-60"
                />
                <div className="bg-gray-50 px-3 py-2 text-xs text-gray-600 border-t border-[#E0E0E0]">
                    {uploading && progress ? (
                        <span className="inline-flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" /> Uploading {progress.done}/{progress.total}…
                        </span>
                    ) : (
                        helper
                    )}
                </div>
            </div>
            {error && <div className="text-xs text-red-600 break-words">{error}</div>}

            {sorted.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                    {sorted.map((att) => (
                        <AttachmentTile
                            key={att.attachmentId}
                            attachment={att}
                            showCaption={showCaption}
                            isBusy={busyIds.has(att.attachmentId)}
                            disabled={disabled}
                            onRemove={() => handleRemove(att)}
                            onCaptionChange={(c) => handleCaption(att, c)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

interface TileProps {
    attachment: FormAttachmentRow
    showCaption: boolean
    isBusy: boolean
    disabled: boolean
    onRemove: () => void
    onCaptionChange: (caption: string) => void
}

const AttachmentTile: React.FC<TileProps> = ({ attachment, showCaption, isBusy, disabled, onRemove, onCaptionChange }) => {
    const [caption, setCaption] = useState(attachment.caption ?? '')
    const debounceRef = useRef<number | null>(null)

    const handleCaptionInput = (value: string) => {
        setCaption(value)
        if (debounceRef.current) window.clearTimeout(debounceRef.current)
        debounceRef.current = window.setTimeout(() => onCaptionChange(value), 600)
    }

    const isImg = isImage(attachment)

    return (
        <div className="relative bg-white border border-gray-200 rounded-xl p-2 shadow-sm flex flex-col group">
            <div className="relative aspect-square mb-2 overflow-hidden rounded-lg border border-gray-50">
                {isImg ? (
                    <img
                        src={attachment.fileUrl}
                        alt={attachment.caption ?? attachment.fileName ?? 'attachment'}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <a
                        href={attachment.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-600 hover:bg-gray-50"
                    >
                        <FileIcon className="w-8 h-8" />
                        <span className="text-[10px] px-2 text-center break-all line-clamp-2">{attachment.fileName}</span>
                    </a>
                )}
                <button
                    type="button"
                    aria-label="Remove"
                    disabled={disabled || isBusy}
                    onClick={onRemove}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10 scale-90 disabled:opacity-60"
                >
                    {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3 stroke-[2.5]" />}
                </button>
            </div>
            <div className="space-y-1 mt-auto">
                {showCaption ? (
                    <textarea
                        placeholder="Caption..."
                        rows={2}
                        value={caption}
                        onChange={(e) => handleCaptionInput(e.target.value)}
                        className="w-full text-[11px] font-bold bg-transparent border-none focus:ring-0 px-1 py-0 outline-none transition-all placeholder:text-gray-300 text-gray-700 min-h-[2.5rem] resize-none"
                    />
                ) : (
                    <div className="text-[11px] font-medium text-gray-700 px-1 truncate" title={attachment.fileName ?? ''}>
                        {attachment.fileName}
                    </div>
                )}
                <div className="text-[9px] text-gray-400 px-1 flex justify-between gap-1">
                    <span className="truncate">{attachment.mimeType.split('/')[1] || attachment.mimeType}</span>
                    <span>{bytesLabel(attachment.size)}</span>
                </div>
            </div>
        </div>
    )
}
