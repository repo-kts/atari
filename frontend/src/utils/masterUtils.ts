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

