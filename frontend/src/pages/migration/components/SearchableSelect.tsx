import { useEffect, useMemo, useRef, useState } from 'react'

export interface Option {
    value: string | number
    label: string
}

interface SearchableSelectProps {
    options: Option[]
    value: string | number | ''
    onChange: (value: string | number | '') => void
    placeholder?: string
    className?: string
    allowClear?: boolean
}

/**
 * Type-to-filter combobox. Reused for the KVK and module selectors and the FK
 * master picker — plain React, no extra deps. Click outside or pick to close.
 */
export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Search…',
    className = '',
    allowClear = true,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const boxRef = useRef<HTMLDivElement>(null)

    const selected = options.find(o => o.value === value)

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
                setOpen(false)
                setQuery('')
            }
        }
        document.addEventListener('mousedown', onDoc)
        return () => document.removeEventListener('mousedown', onDoc)
    }, [])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return options.slice(0, 200)
        return options.filter(o => o.label.toLowerCase().includes(q)).slice(0, 200)
    }, [options, query])

    return (
        <div ref={boxRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left text-sm hover:border-gray-400"
            >
                <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
                    {selected ? selected.label : placeholder}
                </span>
                <span className="ml-2 flex items-center gap-1 text-gray-400">
                    {allowClear && selected && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={e => {
                                e.stopPropagation()
                                onChange('')
                            }}
                            className="rounded px-1 hover:bg-gray-100 hover:text-gray-600"
                        >
                            ×
                        </span>
                    )}
                    <span className="text-xs">▾</span>
                </span>
            </button>

            {open && (
                <div className="absolute z-30 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                    <input
                        autoFocus
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Type to filter…"
                        className="w-full border-b border-gray-100 px-3 py-2 text-sm outline-none"
                    />
                    <ul className="max-h-60 overflow-auto py-1">
                        {filtered.length === 0 && (
                            <li className="px-3 py-2 text-sm text-gray-400">No matches</li>
                        )}
                        {filtered.map(o => (
                            <li key={o.value}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(o.value)
                                        setOpen(false)
                                        setQuery('')
                                    }}
                                    className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-blue-50 ${
                                        o.value === value
                                            ? 'bg-blue-50 font-medium text-blue-700'
                                            : 'text-gray-700'
                                    }`}
                                >
                                    {o.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
