import React, { useCallback, useMemo, useRef, useState } from 'react'
import { X, FileIcon, Loader2 } from 'lucide-react'
import { useDeleteAttachment, useUpdateAttachment, useUploadAttachment } from '@/hooks/useFormAttachments'
import type { FormAttachmentKind, FormAttachmentRow } from '@/services/formAttachmentsApi'
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
    title: string
    helperText?: string
    formCode: string
    kind: FormAttachmentKind
    kvkId: number
    recordId?: number | null
    attachments: FormAttachmentRow[]
    accept?: string
    maxBytes?: number
    showCaption?: boolean
    disabled?: boolean
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

export const MultiAttachmentUploader: React.FC<MultiAttachmentUploaderProps> = ({
    title,
    helperText,
    formCode,
    kind,
    kvkId,
    recordId,
    attachments,
    accept,
    maxBytes = DEFAULT_MAX_BYTES,
    showCaption = kind === 'PHOTO',
    disabled = false,
    reportingYearDate = null,
    onChange,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const upload = useUploadAttachment()
    const updateMut = useUpdateAttachment()
    const removeMut = useDeleteAttachment(formCode)
    const [error, setError] = useState<string | null>(null)
    const [busyIds, setBusyIds] = useState<Set<number>>(new Set())

    const acceptAttr = accept ?? (kind === 'PHOTO' ? PHOTO_ACCEPT : DATASHEET_ACCEPT)
    const helper = helperText ?? `Max ${(maxBytes / (1024 * 1024)).toFixed(0)} MB per file. Multiple uploads allowed.`

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
                return
            }
            const startSort = sorted.length > 0 ? sorted[sorted.length - 1].sortOrder + 1 : 0
            try {
                const results: FormAttachmentRow[] = []
                for (let i = 0; i < list.length; i += 1) {
                    const file = list[i]
                    const row = await upload.mutateAsync({
                        file,
                        formCode,
                        kind,
                        kvkId,
                        recordId: recordId ?? null,
                        sortOrder: startSort + i,
                        reportingYearDate,
                    })
                    results.push(row)
                }
                if (onChange) onChange([...sorted, ...results])
            } catch (e) {
                const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Upload failed'
                setError(msg)
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        },
        [formCode, kind, kvkId, recordId, sorted, upload, onChange, maxBytes, reportingYearDate],
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
        <div className="space-y-3">
            <div>
                <div className="text-sm font-semibold text-[#487749] mb-1">{title}</div>
                <label
                    className={`flex flex-col gap-1 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        disabled || upload.isPending ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                >
                    <span className="text-sm text-gray-700">
                        {upload.isPending ? (
                            <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</span>
                        ) : (
                            'Browse… No files selected.'
                        )}
                    </span>
                    <span className="text-xs text-gray-500">{helper}</span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptAttr}
                        multiple
                        className="hidden"
                        disabled={disabled || upload.isPending}
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                </label>
                {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
            </div>

            {sorted.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
        <div className="relative rounded-lg overflow-hidden bg-white border shadow-sm flex flex-col">
            <div className="relative aspect-square bg-gray-100">
                {isImg ? (
                    <img
                        src={attachment.fileUrl}
                        alt={attachment.caption ?? attachment.fileName ?? 'attachment'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <a
                        href={attachment.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-600 hover:bg-gray-50"
                    >
                        <FileIcon className="w-10 h-10" />
                        <span className="text-xs px-2 text-center break-all line-clamp-2">{attachment.fileName}</span>
                    </a>
                )}
                <button
                    type="button"
                    aria-label="Remove"
                    disabled={disabled || isBusy}
                    onClick={onRemove}
                    className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white shadow hover:bg-red-600 disabled:opacity-60"
                >
                    {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                </button>
            </div>
            <div className="px-2 py-2 text-xs text-gray-700 space-y-1">
                {showCaption ? (
                    <input
                        type="text"
                        value={caption}
                        onChange={(e) => handleCaptionInput(e.target.value)}
                        placeholder="Caption…"
                        className="w-full bg-transparent outline-none text-sm border-b border-dotted border-gray-300 focus:border-[#487749]"
                    />
                ) : (
                    <div className="truncate font-medium" title={attachment.fileName ?? ''}>{attachment.fileName}</div>
                )}
                <div className="text-[10px] text-gray-500 flex justify-between gap-1">
                    <span className="truncate">{attachment.mimeType}</span>
                    <span>{bytesLabel(attachment.size)}</span>
                </div>
            </div>
        </div>
    )
}
