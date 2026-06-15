import { useState } from 'react'
import { formatCell, isEmpty } from '../views/tableUtils'

/** Render one cell value compactly; long strings get an expand/collapse toggle. */
export function CollapsibleCell({ value }: { value: unknown }) {
    const [expanded, setExpanded] = useState(false)
    const formatted = formatCell(value)
    const isLongText = typeof value === 'string' && value.length > 40

    if (!isLongText) {
        return (
            <span className={isEmpty(value) ? 'text-gray-300' : 'text-gray-800'}>
                {formatted}
            </span>
        )
    }

    const text = String(value)

    return (
        <div className="flex flex-col gap-1 max-w-[320px]">
            <div
                className={`text-gray-800 transition-all text-xs font-mono break-words ${
                    expanded ? 'whitespace-normal' : 'truncate'
                }`}
                title={text}
            >
                {expanded ? text : text.slice(0, 40) + '...'}
            </div>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    setExpanded(!expanded)
                }}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 self-start mt-0.5 select-none"
            >
                {expanded ? 'Collapse' : 'Expand'}
            </button>
        </div>
    )
}

/** Coerce edited text back toward the original cell's type so the DB gets a sane value. */
function coerce(draft: string, original: unknown): unknown {
    if (draft === '') return null
    if (typeof original === 'number') {
        const n = Number(draft)
        return Number.isFinite(n) ? n : draft
    }
    if (typeof original === 'boolean') return draft === 'true' || draft === '1'
    return draft
}

/**
 * Editable cell: shows the value (via CollapsibleCell) with a hover pencil. Click
 * to edit inline; Enter/blur commits, Escape cancels. Object cells stay read-only
 * (editing JSON inline is error-prone). Commits flow up via onCommit into the
 * shared records state, so edits persist across view switches.
 */
export function EditableCell({
    value,
    onCommit,
}: {
    value: unknown
    onCommit: (v: unknown) => void
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState('')
    const isObject = value !== null && typeof value === 'object'

    const start = () => {
        setDraft(value == null ? '' : String(value))
        setEditing(true)
    }
    const commit = () => {
        onCommit(coerce(draft, value))
        setEditing(false)
    }

    if (editing) {
        return (
            <input
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        commit()
                    }
                    if (e.key === 'Escape') setEditing(false)
                }}
                className="w-full min-w-[120px] rounded border border-blue-400 px-1.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
        )
    }

    return (
        <div className="flex items-start gap-1">
            <div className="min-w-0 flex-1">
                <CollapsibleCell value={value} />
            </div>
            {!isObject && (
                <button
                    type="button"
                    onClick={start}
                    title="Edit cell"
                    className="shrink-0 rounded border border-gray-200 bg-white px-1 text-[11px] leading-tight text-gray-400 transition-colors hover:border-blue-300 hover:text-blue-600"
                >
                    ✎
                </button>
            )}
        </div>
    )
}
