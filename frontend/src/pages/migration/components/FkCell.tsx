import { useMemo } from 'react'
import { SearchableSelect, type Option } from './SearchableSelect'

interface FkCellProps {
    value: number | null
    options: Option[]
    otherText?: string | null
    onChange: (id: number | null) => void
    /** When provided, shows an "apply to all unmatched" button once a value is picked. */
    onFillUnmatched?: (value: number) => void
}

/**
 * Foreign-key cell: shows the resolved master label (the "actual value", not the
 * raw id) and on click opens a searchable list of that master. Picking writes
 * the id back into the record — reflected across every view via shared state.
 * Falls back to the *Other free-text when no master matched.
 */
export function FkCell({ value, options, otherText, onChange, onFillUnmatched }: FkCellProps) {
    // Always keep the current id visible: if it isn't in the loaded options
    // (master list still loading, or an id with no master row), inject a
    // synthetic "#<id>" entry so the cell shows the id instead of a blank.
    const opts = useMemo(() => {
        if (value != null && !options.some(o => o.value === value)) {
            return [{ value, label: `#${value}` }, ...options]
        }
        return options
    }, [options, value])

    return (
        <div className="min-w-[180px]">
            <SearchableSelect
                options={opts}
                value={value ?? ''}
                placeholder={otherText ? `other: ${otherText}` : 'unmatched — pick…'}
                onChange={v => onChange(v === '' ? null : Number(v))}
            />
            {value != null && onFillUnmatched && (
                <button
                    type="button"
                    onClick={() => onFillUnmatched(value)}
                    title="Set this value on every still-unmatched row in this column"
                    className="mt-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 select-none"
                >
                    ⇊ apply to all unmatched
                </button>
            )}
        </div>
    )
}

export type { Option }
