import React from 'react'

interface CasteGenderTotalsProps {
    /** The form's data object holding the count fields. */
    values: Record<string, unknown>
    /** Field names summed into Total Male. */
    maleFields: string[]
    /** Field names summed into Total Female. */
    femaleFields: string[]
}

const sumFields = (values: Record<string, unknown>, keys: string[]): number =>
    keys.reduce((acc, key) => acc + (Number(values[key]) || 0), 0)

/**
 * Total Male / Total Female / Overall Total pills — the same summary used on the
 * Extension Activities form. Pass the form's `values` plus the male/female field
 * names; totals recompute live as the user types.
 */
export const CasteGenderTotals: React.FC<CasteGenderTotalsProps> = ({
    values,
    maleFields,
    femaleFields,
}) => {
    const totalMale = sumFields(values, maleFields)
    const totalFemale = sumFields(values, femaleFields)

    return (
        <div className="flex flex-wrap gap-3 pt-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9]">
                <span className="text-xs font-semibold text-[#2E7D32] uppercase">Total Male</span>
                <span className="text-sm font-bold text-[#1B5E20] tabular-nums">{totalMale}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCE4EC] border border-[#F8BBD0]">
                <span className="text-xs font-semibold text-[#AD1457] uppercase">Total Female</span>
                <span className="text-sm font-bold text-[#880E4F] tabular-nums">{totalFemale}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB]">
                <span className="text-xs font-semibold text-[#1565C0] uppercase">Overall Total</span>
                <span className="text-sm font-bold text-[#0D47A1] tabular-nums">{totalMale + totalFemale}</span>
            </div>
        </div>
    )
}
