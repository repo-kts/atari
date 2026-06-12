import { useCallback, useMemo } from 'react'
import type { MasterDataOption } from '@/utils/formHelpers'

/**
 * Drives the master-controlled "Other → specify" pattern for any dropdown whose
 * options carry an `isOther` flag (build them with
 * `createMasterDataOptions(items, idKey, nameKey, { flagKey: 'isOther' })`).
 *
 * Returns:
 *  - `isOtherSelected`: whether the currently selected option is flagged Other
 *    (render the <SpecifyOtherInput> behind this).
 *  - `otherResetPatch(nextValue, otherField)`: a patch to MERGE into the SAME
 *    setFormData call you already make in the dropdown's onChange — it clears the
 *    free-text field when the newly picked option is not Other. Merging into one
 *    update (instead of a second setFormData) avoids clobbering sibling resets.
 */
export function useOtherSpecify(
    options: MasterDataOption[],
    selectedValue: string | number | null | undefined,
) {
    const isOtherSelected = useMemo(() => {
        if (selectedValue === '' || selectedValue === null || selectedValue === undefined) {
            return false
        }
        return options.some(
            (o) => String(o.value) === String(selectedValue) && Boolean(o.isOther),
        )
    }, [options, selectedValue])

    const otherResetPatch = useCallback(
        (nextValue: string | number | null | undefined, otherField: string): Record<string, string> => {
            const picked = options.find((o) => String(o.value) === String(nextValue))
            return picked?.isOther ? {} : { [otherField]: '' }
        },
        [options],
    )

    return { isOtherSelected, otherResetPatch }
}
