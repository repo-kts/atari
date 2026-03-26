import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, ChevronDown, Info } from 'lucide-react'
import { InlineLoader } from './InlineLoader'

interface DependentDropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label: string
    options: { value: string | number; label: string }[]
    isLoading?: boolean
    isDisabled?: boolean
    dependsOn?: {
        value: any
        field: string
    }
    emptyMessage?: string
    loadingMessage?: string
    error?: string
    required?: boolean
    onOptionsLoad?: (parentValue: any, signal?: AbortSignal) => Promise<{ value: string | number; label: string }[]>
    onChange?: (value: string | number) => void
    cacheKey?: string
    debounceMs?: number
}

// Simple in-memory cache for dropdown options
const optionsCache = new Map<string, { value: string | number; label: string }[]>()

export const DependentDropdown: React.FC<DependentDropdownProps> = ({
    label,
    options = [],
    isLoading = false,
    isDisabled = false,
    dependsOn,
    emptyMessage = 'No options available',
    loadingMessage = 'Loading options...',
    error,
    required = false,
    onOptionsLoad,
    onChange,
    cacheKey,
    debounceMs = 300,
    className = '',
    ...props
}) => {
    const [localLoading, setLocalLoading] = useState(false)
    const [localOptions, setLocalOptions] = useState<{ value: string | number; label: string }[]>(options)
    const [hasFetched, setHasFetched] = useState(false)
    const [lastParentValue, setLastParentValue] = useState<any>(null)

    // Generate stable IDs for accessibility
    const selectId = React.useMemo(() => `dependent-dropdown-${label.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`, [label])
    const errorId = React.useMemo(() => `error-${selectId}`, [selectId])

    // AbortController for canceling in-flight requests
    const abortControllerRef = useRef<AbortController | null>(null)
    const currentRequestIdRef = useRef<number>(0)

    // Store onOptionsLoad in a ref to prevent debouncedFetch from being recreated
    // when onOptionsLoad changes (which happens on every render if not memoized)
    const onOptionsLoadRef = useRef(onOptionsLoad)
    useEffect(() => {
        onOptionsLoadRef.current = onOptionsLoad
    }, [onOptionsLoad])

    // Check cache first
    const getCachedOptions = useCallback((key: string) => {
        return optionsCache.get(key)
    }, [])

    const setCachedOptions = useCallback((key: string, opts: { value: string | number; label: string }[]) => {
        optionsCache.set(key, opts)
    }, [])

    // Store timeout ID in a ref to clear it properly
    const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Debounced fetch function with AbortController support
    // Use refs for onOptionsLoad, cacheKey, and label to prevent recreation
    const debouncedFetch = useCallback((parentValue: any) => {
        // Clear previous timeout
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current)
        }

        // Cancel previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        timeoutIdRef.current = setTimeout(async () => {
            const currentOnOptionsLoad = onOptionsLoadRef.current
            if (!currentOnOptionsLoad || !parentValue) {
                setLocalOptions([])
                setLocalLoading(false)
                setHasFetched(false)
                return
            }

            // Always include parent value in cache key to ensure uniqueness
            const cacheKeyToUse = cacheKey
                ? `${cacheKey}-${parentValue}`
                : `${label}-${parentValue}`

            const cached = getCachedOptions(cacheKeyToUse)

            if (cached) {
                setLocalOptions(cached)
                setLocalLoading(false)
                setHasFetched(true)
                return
            }

            // Create new AbortController for this request
            const abortController = new AbortController()
            abortControllerRef.current = abortController
            const requestId = ++currentRequestIdRef.current

            setLocalLoading(true)
            try {
                // Call onOptionsLoad with abort signal
                const fetchedOptions = await currentOnOptionsLoad(parentValue, abortController.signal)

                // Check if this request was aborted
                if (abortController.signal.aborted || requestId !== currentRequestIdRef.current) {
                    return // Request was cancelled, don't update state
                }

                setLocalOptions(fetchedOptions)
                setCachedOptions(cacheKeyToUse, fetchedOptions)
                setHasFetched(true)
            } catch (err: any) {
                // Ignore abort errors
                if (err?.name === 'AbortError' || abortController.signal.aborted) {
                    return
                }

                // Only update state if this is still the current request
                if (requestId === currentRequestIdRef.current) {
                    console.error(`Error loading ${label} options:`, err)
                    setLocalOptions([])
                    setHasFetched(false)
                }
            } finally {
                // Only update loading state if this is still the current request
                if (requestId === currentRequestIdRef.current && !abortController.signal.aborted) {
                    setLocalLoading(false)
                }
            }
        }, debounceMs)
    }, [cacheKey, label, debounceMs, getCachedOptions, setCachedOptions])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current)
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    // Handle parent value changes
    useEffect(() => {
        const currentParentValue = dependsOn?.value

        // If parent value changed, clear local options immediately
        if (lastParentValue !== currentParentValue) {
            setLocalOptions([])
            setHasFetched(false)
            setLastParentValue(currentParentValue)
        }

        if (currentParentValue !== undefined && currentParentValue !== null && currentParentValue !== '') {
            debouncedFetch(currentParentValue)
        } else {
            setLocalOptions([])
            setHasFetched(false)
            setLastParentValue(null)
        }
    }, [dependsOn?.value, debouncedFetch, lastParentValue])

    // Use local options if available, otherwise use provided options
    const displayOptions = localOptions.length > 0 ? localOptions : options
    const isActuallyLoading = isLoading || localLoading
    // Don't disable the select during loading - allow user to interact
    // Only disable if explicitly disabled or (if dependsOn is defined, then check if parent value is missing)
    const isActuallyDisabled = isDisabled || (dependsOn !== undefined && (!dependsOn?.value || dependsOn.value === ''))

    const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        const processedValue = value === '' ? '' : (isNaN(Number(value)) ? value : Number(value))

        // Call custom onChange if provided
        if (onChange) {
            onChange(processedValue)
        }

        // Call native onChange if provided in props (for form libraries)
        const nativeOnChange = (props as React.SelectHTMLAttributes<HTMLSelectElement>).onChange
        if (nativeOnChange) {
            nativeOnChange(e)
        }
    }, [onChange, props])

    return (
        <div className="space-y-2">
            <div className="relative pt-2">
                <label
                    htmlFor={selectId}
                    className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                    <select
                        {...props}
                        id={selectId}
                        value={props.value || ''}
                        onChange={handleChange}
                        disabled={isActuallyDisabled}
                        required={required}
                        aria-invalid={!!error}
                        aria-describedby={error ? errorId : undefined}
                        aria-required={required}
                        className={`
                            w-full px-4 py-3 pr-10
                            border border-[#E0E0E0] rounded-xl
                            focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]
                            transition-all bg-white text-base
                            disabled:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:text-[#757575]
                            appearance-none
                            h-[48px]
                            ${className}
                        `}
                    >
                        <option value="">
                            {isActuallyLoading ? loadingMessage : `Select ${label}`}
                        </option>
                        {!isActuallyLoading && displayOptions.length > 0 && displayOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {isActuallyLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#487749]" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-[#757575]" />
                        )}
                    </div>
                </div>
                {/* Error State */}
                {error && (
                    <p id={errorId} className="text-xs text-red-500 mt-1" role="alert">
                        {error}
                    </p>
                )}
            </div>

            {/* Empty State */}
            {!isActuallyLoading && hasFetched && displayOptions.length === 0 && dependsOn?.value && (
                <div className="-mt-4 border border-t-0 border-[#E0E0E0] rounded-b-xl bg-gray-50 px-4 pt-3 pb-1 text-xs text-gray-600 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-[#757575]" />
                    <span>{emptyMessage}</span>
                </div>
            )}

            {/* Loading State (if parent not selected) */}
            {isActuallyLoading && !dependsOn?.value && (
                <div className="flex items-center gap-2 p-3 bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl">
                    <InlineLoader size="sm" text={loadingMessage} />
                </div>
            )}
        </div>
    )
}
