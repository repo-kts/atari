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
