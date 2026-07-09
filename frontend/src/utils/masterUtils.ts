import { ENTITY_TYPES } from '../constants/entityConstants';

// Extended entity type for all masters
export type ExtendedEntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

// Re-export from entityTypeUtils for backward compatibility
import { getEntityTypeFromPathMap } from './entityTypeHelpers';
export const getEntityTypeFromPath = getEntityTypeFromPathMap;

// Re-export from idFieldMap for backward compatibility
import { getIdFieldFromMap } from './idFieldMap';
export const getIdField = getIdFieldFromMap;

// Re-export from fieldValueUtils for backward compatibility
import { getFieldValueConfig } from './fieldValueExtractorUtils';
export const getFieldValue = getFieldValueConfig;

// ============================================
// Field Resolution Utilities
// ============================================

/**
 * Resolve fields for data table display
 * Prioritizes routeConfig fields, then propFields, then default fallback
 * This ensures fields are always available even when there's no data
 *
 * @param routeConfig - Route configuration object with optional fields
 * @param propFields - Fields passed as props
 * @param defaultFields - Default fields to use if nothing else is available
 * @returns Array of field names to display in the table
 */
export function resolveTableFields(
    routeConfig?: { fields?: readonly string[] | string[] } | null,
    propFields?: readonly string[] | string[] | null,
    defaultFields: readonly string[] | string[] = ['name']
): string[] {
    // Priority 1: Route config fields (most authoritative)
    if (routeConfig?.fields && routeConfig.fields.length > 0) {
        const fields = routeConfig.fields
        return Array.isArray(fields) ? [...fields] : [String(fields)]
    }

    // Priority 2: Prop fields (passed from parent component)
    if (propFields && propFields.length > 0) {
        const fields = propFields
        return Array.isArray(fields) ? [...fields] : [String(fields)]
    }

    // Priority 3: Default fallback
    const fields = defaultFields
    return Array.isArray(fields) ? [...fields] : [String(fields)]
}

// ============================================
// Fuzzy de-duplication (table display only)
// ============================================

/**
 * Normalize a name to a comparison key: drop any trailing location suffix
 * (everything after the first comma, parenthesis, or slash — e.g.
 * "...University, Ranchi"), then lowercase + keep only alphanumerics. Collapses
 * the core institution name across its variants.
 *
 * NOTE: hyphens are intentionally NOT split on — they are part of many distinct
 * institution names (e.g. "ICAR-NISA" vs "ICAR-Research Complex ..."). Splitting
 * on "-" truncated both to "ICAR" and wrongly merged two different host orgs.
 * Branch suffixes that matter still collapse via the prefix/levenshtein match.
 */
const normalizeNameKey = (s: string): string => {
    const core = (s || '').split(/[,(/]/)[0]
    return core.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

/** Levenshtein edit distance (iterative, single-row buffer). */
const levenshtein = (a: string, b: string): number => {
    const m = a.length
    const n = b.length
    if (m === 0) return n
    if (n === 0) return m
    const dp = new Array(n + 1)
    for (let j = 0; j <= n; j++) dp[j] = j
    for (let i = 1; i <= m; i++) {
        let prev = dp[0]
        dp[0] = i
        for (let j = 1; j <= n; j++) {
            const tmp = dp[j]
            dp[j] = Math.min(
                dp[j] + 1, // deletion
                dp[j - 1] + 1, // insertion
                prev + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
            )
            prev = tmp
        }
    }
    return dp[n]
}

/**
 * Treat two normalized keys as the "same" name when they are identical, when one
 * is a prefix of the other (e.g. "...University" vs "...University, Ranchi"), or
 * when they are >=85% similar (catches typos / "Agricultural" vs "Agriculture").
 */
export const isFuzzyNameMatch = (a: string, b: string): boolean => {
    if (a === b) return true
    const min = Math.min(a.length, b.length)
    // Prefix match, guarded by a min length so short codes (SAU/CAU) don't merge.
    if (min >= 6 && (a.startsWith(b) || b.startsWith(a))) return true
    const dist = levenshtein(a, b)
    const ratio = 1 - dist / Math.max(a.length, b.length)
    return ratio >= 0.85
}

/**
 * Collapse near-duplicate rows to one per distinct name. Keeps the FIRST row of
 * each fuzzy group. Display-only; does not touch the underlying data.
 */
export function fuzzyDedupeByName<T>(
    items: T[],
    getName: (item: T) => string
): T[] {
    const reps: string[] = []
    const out: T[] = []
    for (const item of items) {
        const key = normalizeNameKey(getName(item))
        if (reps.some(rep => isFuzzyNameMatch(key, rep))) continue
        reps.push(key)
        out.push(item)
    }
    return out
}
