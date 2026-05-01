import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, ArrowDown, Filter, Search, X } from 'lucide-react'

export type SortDir = 'asc' | 'desc' | null

export interface ColumnFilterState {
    sort: SortDir
    text: string
    excluded: Set<string>
}

export const EMPTY_FILTER: ColumnFilterState = {
    sort: null,
    text: '',
    excluded: new Set<string>(),
}

export function isFilterActive(state: ColumnFilterState | undefined): boolean {
    if (!state) return false
    return Boolean(state.sort) || state.text.trim() !== '' || state.excluded.size > 0
}

interface Props {
    field: string
    label: string
    uniqueValues: string[]
    state: ColumnFilterState
    onChange: (next: ColumnFilterState) => void
    onClear: () => void
}

const BLANK_TOKEN = '__blank__'
const BLANK_LABEL = '(Blanks)'

export const ColumnFilter: React.FC<Props> = ({
    field: _field,
    label,
    uniqueValues,
    state,
    onChange,
    onClear,
}) => {
    const [open, setOpen] = useState(false)
    const [valueSearch, setValueSearch] = useState('')
    const buttonRef = useRef<HTMLButtonElement | null>(null)
    const popoverRef = useRef<HTMLDivElement | null>(null)
    const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null)

    const active = isFilterActive(state)

    useEffect(() => {
        if (!open) return
        const handleClickOutside = (e: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setOpen(false)
            }
        }
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEsc)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEsc)
        }
    }, [open])

    useEffect(() => {
        if (!open || !buttonRef.current) return
        const rect = buttonRef.current.getBoundingClientRect()
        const POPOVER_WIDTH = 280
        const padding = 8
        let left = rect.left
        if (left + POPOVER_WIDTH + padding > window.innerWidth) {
            left = window.innerWidth - POPOVER_WIDTH - padding
        }
        if (left < padding) left = padding
        setPopoverPos({ top: rect.bottom + 4, left })
    }, [open])

    const filteredUniques = useMemo(() => {
        const q = valueSearch.trim().toLowerCase()
        if (!q) return uniqueValues
        return uniqueValues.filter((v) => v.toLowerCase().includes(q))
    }, [uniqueValues, valueSearch])

    const allVisibleSelected = filteredUniques.every((v) => !state.excluded.has(v || BLANK_TOKEN))
    const someVisibleSelected = filteredUniques.some((v) => !state.excluded.has(v || BLANK_TOKEN))

    const toggleValue = (raw: string) => {
        const key = raw || BLANK_TOKEN
        const next = new Set(state.excluded)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        onChange({ ...state, excluded: next })
    }

    const toggleAllVisible = () => {
        const next = new Set(state.excluded)
        if (allVisibleSelected) {
            for (const v of filteredUniques) next.add(v || BLANK_TOKEN)
        } else {
            for (const v of filteredUniques) next.delete(v || BLANK_TOKEN)
        }
        onChange({ ...state, excluded: next })
    }

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    setOpen((o) => !o)
                }}
                className={`ml-1 inline-flex items-center justify-center w-6 h-6 rounded transition-colors ${
                    active
                        ? 'bg-[#487749] text-white'
                        : 'text-[#9E9E9E] hover:text-[#487749] hover:bg-white'
                }`}
                title={`Filter ${label}`}
                aria-label={`Filter ${label}`}
            >
                <Filter className="w-3.5 h-3.5" />
            </button>

            {open && popoverPos && (
                <div
                    ref={popoverRef}
                    style={{ top: popoverPos.top, left: popoverPos.left, width: 280 }}
                    className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-[#E0E0E0] overflow-hidden text-[#212121]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-2 border-b border-[#E0E0E0] flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#487749] truncate">
                            {label}
                        </span>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="p-0.5 rounded hover:bg-gray-100 text-gray-500"
                            aria-label="Close"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="px-3 py-2 border-b border-[#E0E0E0] space-y-1">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9E9E9E]">
                            Sort
                        </div>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() =>
                                    onChange({
                                        ...state,
                                        sort: state.sort === 'asc' ? null : 'asc',
                                    })
                                }
                                className={`flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md border ${
                                    state.sort === 'asc'
                                        ? 'bg-[#487749] text-white border-[#487749]'
                                        : 'border-[#E0E0E0] hover:bg-gray-50'
                                }`}
                            >
                                <ArrowUp className="w-3 h-3" /> Asc
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    onChange({
                                        ...state,
                                        sort: state.sort === 'desc' ? null : 'desc',
                                    })
                                }
                                className={`flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md border ${
                                    state.sort === 'desc'
                                        ? 'bg-[#487749] text-white border-[#487749]'
                                        : 'border-[#E0E0E0] hover:bg-gray-50'
                                }`}
                            >
                                <ArrowDown className="w-3 h-3" /> Desc
                            </button>
                        </div>
                    </div>

                    <div className="px-3 py-2 border-b border-[#E0E0E0]">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9E9E9E] mb-1">
                            Contains
                        </div>
                        <input
                            type="text"
                            value={state.text}
                            onChange={(e) => onChange({ ...state, text: e.target.value })}
                            placeholder="Filter text..."
                            className="w-full text-sm border border-[#E0E0E0] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        />
                    </div>

                    <div className="px-3 py-2">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9E9E9E] mb-1">
                            Values
                        </div>
                        <div className="relative mb-2">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9E9E9E]" />
                            <input
                                type="text"
                                value={valueSearch}
                                onChange={(e) => setValueSearch(e.target.value)}
                                placeholder="Search values..."
                                className="w-full text-xs border border-[#E0E0E0] rounded-md pl-7 pr-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                            />
                        </div>
                        <label className="flex items-center gap-2 px-1 py-1 text-xs hover:bg-gray-50 rounded cursor-pointer border-b border-gray-100 mb-1">
                            <input
                                type="checkbox"
                                checked={allVisibleSelected}
                                ref={(el) => {
                                    if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected
                                }}
                                onChange={toggleAllVisible}
                                className="accent-[#487749]"
                            />
                            <span className="font-medium">(Select all)</span>
                        </label>
                        <div className="max-h-44 overflow-y-auto pr-1">
                            {filteredUniques.length === 0 ? (
                                <div className="text-xs text-[#9E9E9E] py-2 text-center">No values</div>
                            ) : (
                                filteredUniques.map((v) => {
                                    const key = v || BLANK_TOKEN
                                    const checked = !state.excluded.has(key)
                                    return (
                                        <label
                                            key={key}
                                            className="flex items-center gap-2 px-1 py-1 text-xs hover:bg-gray-50 rounded cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleValue(v)}
                                                className="accent-[#487749]"
                                            />
                                            <span className="truncate" title={v || BLANK_LABEL}>
                                                {v || (
                                                    <em className="text-[#9E9E9E]">{BLANK_LABEL}</em>
                                                )}
                                            </span>
                                        </label>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    <div className="px-3 py-2 border-t border-[#E0E0E0] flex justify-between items-center bg-[#FAF9F6]">
                        <button
                            type="button"
                            onClick={() => {
                                onClear()
                                setValueSearch('')
                            }}
                            disabled={!active}
                            className="text-xs text-[#487749] hover:underline disabled:text-[#9E9E9E] disabled:no-underline disabled:cursor-not-allowed"
                        >
                            Clear filter
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-xs px-3 py-1 rounded-md bg-[#487749] text-white hover:bg-[#3d6540]"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
