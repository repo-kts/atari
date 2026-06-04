import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, ArrowDown, Filter, GripHorizontal, Search, X } from 'lucide-react'

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
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const dragStateRef = useRef<{
        pointerId: number
        startX: number
        startY: number
        originX: number
        originY: number
    } | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return
        try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* noop */ }
        dragStateRef.current = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            originX: dragOffset.x,
            originY: dragOffset.y,
        }
        setIsDragging(true)
    }

    const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragStateRef.current
        if (!drag || drag.pointerId !== e.pointerId) return
        const dx = e.clientX - drag.startX
        const dy = e.clientY - drag.startY
        let nextX = drag.originX + dx
        let nextY = drag.originY + dy
        if (popoverRef.current && popoverPos && typeof window !== 'undefined') {
            const rect = popoverRef.current.getBoundingClientRect()
            const baseLeft = rect.left - dragOffset.x
            const baseTop = rect.top - dragOffset.y
            const minX = -baseLeft
            const minY = -baseTop
            const maxX = window.innerWidth - baseLeft - rect.width
            const maxY = window.innerHeight - baseTop - rect.height
            if (maxX >= minX) nextX = Math.min(Math.max(nextX, minX), maxX)
            if (maxY >= minY) nextY = Math.min(Math.max(nextY, minY), maxY)
        }
        setDragOffset({ x: nextX, y: nextY })
    }

    const handleDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragStateRef.current
        if (!drag || drag.pointerId !== e.pointerId) return
        try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* noop */ }
        dragStateRef.current = null
        setIsDragging(false)
    }

    // Reset drag offset whenever the popover closes so re-opens always anchor
    // to the column-header button.
    useEffect(() => {
        if (!open) setDragOffset({ x: 0, y: 0 })
    }, [open])

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
                    style={{
                        top: popoverPos.top,
                        left: popoverPos.left,
                        width: 280,
                        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                        touchAction: isDragging ? 'none' : undefined,
                    }}
                    className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-[#E0E0E0] overflow-hidden text-[#212121]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        onPointerDown={handleDragStart}
                        onPointerMove={handleDragMove}
                        onPointerUp={handleDragEnd}
                        onPointerCancel={handleDragEnd}
                        style={{ touchAction: 'none' }}
                        className={`px-3 py-2 border-b border-[#E0E0E0] flex items-center justify-between gap-2 select-none ${
                            isDragging ? 'cursor-grabbing' : 'cursor-grab'
                        }`}
                        role="button"
                        aria-label={`Drag ${label} filter`}
                        title="Drag to move"
                    >
                        <span className="inline-flex items-center gap-1.5 min-w-0">
                            <GripHorizontal className="w-3.5 h-3.5 text-[#9E9E9E] shrink-0" />
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#487749] truncate">
                                {label}
                            </span>
                        </span>
                        <button
                            type="button"
                            onPointerDown={(e) => e.stopPropagation()}
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
