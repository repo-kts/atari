import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Loader2, ChevronDown, Search, X, Info } from 'lucide-react'

/** A single search result. `record` carries the raw entity so callers can
 * derive parent hierarchy IDs without a second fetch. */
export interface EntitySearchOption<T = unknown> {
    value: number
    label: string
    sublabel?: string
    record: T
}

interface EntitySearchSelectProps<T = unknown> {
    label: string
    required?: boolean
    value: number | ''
    onSelect: (option: EntitySearchOption<T> | null) => void
    search: (query: string, signal: AbortSignal) => Promise<EntitySearchOption<T>[]>
    placeholder?: string
    emptyMessage?: string
    error?: string
    disabled?: boolean
    debounceMs?: number
    /** Shows the current selection's label/context before any search has run (e.g. Edit mode). */
    initialLabel?: string
    initialSublabel?: string
}

/**
 * Async, debounced, type-to-search combobox. Unlike a plain dropdown, results
 * come from the `search` callback (server-side) rather than a preloaded list,
 * and each result can carry a `sublabel` to disambiguate same-named entities.
 */
export function EntitySearchSelect<T = unknown>({
    label,
    required = false,
    value,
    onSelect,
    search,
    placeholder = 'Type to search…',
    emptyMessage = 'No matches found',
    error,
    disabled = false,
    debounceMs = 300,
    initialLabel,
    initialSublabel,
}: EntitySearchSelectProps<T>) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [options, setOptions] = useState<EntitySearchOption<T>[]>([])
    const [loading, setLoading] = useState(false)
    const [hasFetched, setHasFetched] = useState(false)
    const [selected, setSelected] = useState<EntitySearchOption<T> | null>(null)

    const boxRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const abortRef = useRef<AbortController | null>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const searchRef = useRef(search)
    useEffect(() => {
        searchRef.current = search
    }, [search])
    const requestIdRef = useRef(0)

    // Seed a placeholder "selected" from initialLabel until the admin actually
    // searches — lets Edit mode show the current entity without a live pick.
    useEffect(() => {
        if (!value) {
            setSelected(null)
            return
        }
        setSelected(prev => {
            if (prev && prev.value === value) return prev
            if (initialLabel) {
                return { value: value as number, label: initialLabel, sublabel: initialSublabel, record: undefined as unknown as T }
            }
            return prev
        })
    }, [value, initialLabel, initialSublabel])

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', onDoc)
        return () => document.removeEventListener('mousedown', onDoc)
    }, [])

    const runSearch = useCallback((q: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (abortRef.current) abortRef.current.abort()

        timeoutRef.current = setTimeout(async () => {
            const controller = new AbortController()
            abortRef.current = controller
            const requestId = ++requestIdRef.current
            setLoading(true)
            try {
                const results = await searchRef.current(q, controller.signal)
                if (controller.signal.aborted || requestId !== requestIdRef.current) return
                setOptions(results)
                setHasFetched(true)
            } catch (err: any) {
                if (err?.name === 'AbortError' || controller.signal.aborted) return
                console.error(`Error searching ${label}:`, err)
                if (requestId === requestIdRef.current) {
                    setOptions([])
                    setHasFetched(true)
                }
            } finally {
                if (requestId === requestIdRef.current) setLoading(false)
            }
        }, debounceMs)
    }, [debounceMs, label])

    useEffect(() => {
        if (!open) return
        runSearch(query)
    }, [open, query, runSearch])

    useEffect(() => {
        return () => {
            if (abortRef.current) abortRef.current.abort()
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    const handlePick = (opt: EntitySearchOption<T>) => {
        setSelected(opt)
        onSelect(opt)
        setOpen(false)
        setQuery('')
    }

    const handleClear = () => {
        setSelected(null)
        onSelect(null)
        setQuery('')
    }

    const selectId = useMemo(
        () => `entity-search-${label.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 9)}`,
        [label],
    )

    return (
        <div className="space-y-2" ref={boxRef}>
            <div className="relative pt-2">
                <label
                    htmlFor={selectId}
                    className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <button
                    id={selectId}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        if (disabled) return
                        setOpen(o => !o)
                        setTimeout(() => inputRef.current?.focus(), 0)
                    }}
                    aria-invalid={!!error}
                    aria-required={required}
                    className={`
                        w-full flex items-center justify-between px-4 py-3 pr-10
                        border rounded-xl text-left transition-all bg-white text-base h-[48px]
                        focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]
                        disabled:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:text-[#757575]
                        ${error ? 'border-red-300' : 'border-[#E0E0E0]'}
                    `}
                >
                    <span className={`truncate ${selected ? 'text-[#212121]' : 'text-[#9E9E9E]'}`}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <span className="ml-2 flex items-center gap-1 shrink-0">
                        {selected && !disabled && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={e => {
                                    e.stopPropagation()
                                    handleClear()
                                }}
                                className="rounded p-0.5 text-[#757575] hover:bg-gray-100 hover:text-[#212121]"
                                aria-label={`Clear ${label}`}
                            >
                                <X className="w-3.5 h-3.5" />
                            </span>
                        )}
                        {loading && !open ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#487749]" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-[#757575]" />
                        )}
                    </span>
                </button>
                {selected?.sublabel && (
                    <p className="mt-1 text-xs text-[#757575] truncate">{selected.sublabel}</p>
                )}

                {open && (
                    <div className="absolute z-30 mt-1 w-full rounded-xl border border-[#E0E0E0] bg-white shadow-lg">
                        <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
                            <Search className="w-4 h-4 text-[#757575] shrink-0" />
                            <input
                                ref={inputRef}
                                autoFocus
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder={`Search ${label.toLowerCase()}…`}
                                className="w-full text-sm outline-none"
                            />
                            {loading && <Loader2 className="w-4 h-4 animate-spin text-[#487749] shrink-0" />}
                        </div>
                        <ul className="max-h-72 overflow-auto py-1">
                            {!loading && hasFetched && options.length === 0 && (
                                <li className="flex items-center gap-2 px-3 py-3 text-xs text-gray-500">
                                    <Info className="w-3.5 h-3.5 shrink-0" />
                                    {emptyMessage}
                                </li>
                            )}
                            {options.map(opt => (
                                <li key={opt.value}>
                                    <button
                                        type="button"
                                        onClick={() => handlePick(opt)}
                                        className={`block w-full px-3 py-2 text-left hover:bg-[#487749]/5 ${
                                            opt.value === value ? 'bg-[#487749]/10' : ''
                                        }`}
                                    >
                                        <div className={`text-sm ${opt.value === value ? 'font-semibold text-[#487749]' : 'text-[#212121]'}`}>
                                            {opt.label}
                                        </div>
                                        {opt.sublabel && (
                                            <div className="text-xs text-[#757575] mt-0.5">{opt.sublabel}</div>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {error && (
                <p className="text-xs text-red-500 mt-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}
