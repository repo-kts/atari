import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

export interface KvkOption {
    // Distinct old-site KVK name from the raw pull. Empty string = rows that
    // carry no resolvable KVK name (shown as "(No KVK name)").
    name: string
    count: number
}

interface Props {
    options: KvkOption[]
    selected: Set<string>
    onChange: (next: Set<string>) => void
}

const BLANK_LABEL = '(No KVK name)'

/**
 * Pre-transform KVK picker. Lists every distinct KVK present in the raw pull
 * with its row count and lets the user restrict the transform to a subset, so a
 * 900+ row superadmin pull can be migrated KVK-by-KVK in effective time. Styled
 * to match the app's table column-filter panel (select-all + value search +
 * scrollable checkbox list + Clear/Done).
 */
export function KvkSelectDropdown({ options, selected, onChange }: Props) {
    const [open, setOpen] = useState(false)
    const [valueSearch, setValueSearch] = useState('')
    const wrapRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!open) return
        const onDocClick = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
        }
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', onDocClick)
        document.addEventListener('keydown', onEsc)
        return () => {
            document.removeEventListener('mousedown', onDocClick)
            document.removeEventListener('keydown', onEsc)
        }
    }, [open])

    const filtered = useMemo(() => {
        const q = valueSearch.trim().toLowerCase()
        if (!q) return options
        return options.filter(o => (o.name || BLANK_LABEL).toLowerCase().includes(q))
    }, [options, valueSearch])

    const allVisibleSelected = filtered.length > 0 && filtered.every(o => selected.has(o.name))
    const someVisibleSelected = filtered.some(o => selected.has(o.name))

    const toggle = (name: string) => {
        const next = new Set(selected)
        if (next.has(name)) next.delete(name)
        else next.add(name)
        onChange(next)
    }

    const toggleAllVisible = () => {
        const next = new Set(selected)
        if (allVisibleSelected) filtered.forEach(o => next.delete(o.name))
        else filtered.forEach(o => next.add(o.name))
        onChange(next)
    }

    const totalRows = options.reduce((n, o) => n + o.count, 0)
    const selectedRows = options
        .filter(o => selected.has(o.name))
        .reduce((n, o) => n + o.count, 0)

    return (
        <div ref={wrapRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="inline-flex items-center gap-2 rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-[#212121] hover:bg-gray-50"
            >
                <span className="font-medium">KVKs to transform:</span>
                <span className="font-semibold text-[#487749]">
                    {selected.size}/{options.length}
                </span>
                <span className="text-xs text-[#9E9E9E]">
                    ({selectedRows}/{totalRows} rows)
                </span>
                <ChevronDown className="h-4 w-4 text-[#9E9E9E]" />
            </button>

            {open && (
                <div className="absolute z-[100] mt-1 w-[280px] overflow-hidden rounded-xl border border-[#E0E0E0] bg-white text-[#212121] shadow-2xl">
                    <div className="flex items-center justify-between gap-2 border-b border-[#E0E0E0] px-3 py-2">
                        <span className="truncate text-xs font-semibold uppercase tracking-wide text-[#487749]">
                            KVKs
                        </span>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded p-0.5 text-gray-500 hover:bg-gray-100"
                            aria-label="Close"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="px-3 py-2">
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#9E9E9E]">
                            Values
                        </div>
                        <div className="relative mb-2">
                            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9E9E9E]" />
                            <input
                                type="text"
                                value={valueSearch}
                                onChange={e => setValueSearch(e.target.value)}
                                placeholder="Search KVKs..."
                                className="w-full rounded-md border border-[#E0E0E0] py-1 pl-7 pr-2 text-xs focus:border-[#487749] focus:outline-none focus:ring-1 focus:ring-[#487749]"
                            />
                        </div>
                        <label className="mb-1 flex cursor-pointer items-center gap-2 border-b border-gray-100 px-1 py-1 text-xs hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={allVisibleSelected}
                                ref={el => {
                                    if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected
                                }}
                                onChange={toggleAllVisible}
                                className="accent-[#487749]"
                            />
                            <span className="font-medium">(Select all)</span>
                        </label>
                        <div className="max-h-56 overflow-y-auto pr-1">
                            {filtered.length === 0 ? (
                                <div className="py-2 text-center text-xs text-[#9E9E9E]">No KVKs</div>
                            ) : (
                                filtered.map(o => (
                                    <label
                                        key={o.name || BLANK_LABEL}
                                        className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-xs hover:bg-gray-50"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected.has(o.name)}
                                            onChange={() => toggle(o.name)}
                                            className="accent-[#487749]"
                                        />
                                        <span
                                            className="flex-1 truncate"
                                            title={o.name || BLANK_LABEL}
                                        >
                                            {o.name || <em className="text-[#9E9E9E]">{BLANK_LABEL}</em>}
                                        </span>
                                        <span className="shrink-0 rounded-full bg-gray-100 px-1.5 text-[10px] font-medium text-[#616161]">
                                            {o.count}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E0E0E0] bg-[#FAF9F6] px-3 py-2">
                        <button
                            type="button"
                            onClick={() => onChange(new Set())}
                            disabled={selected.size === 0}
                            className="text-xs text-[#487749] hover:underline disabled:cursor-not-allowed disabled:text-[#9E9E9E] disabled:no-underline"
                        >
                            Clear all
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-md bg-[#487749] px-3 py-1 text-xs text-white hover:bg-[#3d6540]"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
