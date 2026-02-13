/**
 * Utility functions for handling delete operations
 * Provides reusable, maintainable, and optimized delete handlers
 */

import { ENTITY_TYPES } from '@/constants/entityTypes';
import type { ExtendedEntityType } from './masterUtils';

/**
 * Configuration for cascade delete warnings
 */
export interface CascadeDeleteConfig {
    title: string;
    affectedRecords: string[];
    additionalWarnings?: string[];
}

/**
 * Entity-specific cascade delete configurations
 */
const CASCADE_DELETE_CONFIGS: Record<string, CascadeDeleteConfig> = {
    [ENTITY_TYPES.ZONES]: {
        title: 'Delete Zone',
        affectedRecords: [
            'All states in this zone',
            'All districts in those states',
            'All organizations in those districts',
            'All KVKs in this zone',
            'User zone assignments will be cleared',
        ],
    },
    [ENTITY_TYPES.ORGANIZATIONS]: {
        title: 'Delete Organization',
        affectedRecords: [
            'All universities in this organization',
            'All KVKs in this organization',
            'User organization assignments will be cleared',
        ],
    },
    [ENTITY_TYPES.STATES]: {
        title: 'Delete State',
        affectedRecords: [
            'All districts in this state',
            'All organizations in those districts',
            'All universities in those organizations',
            'All KVKs in this state',
            'User state assignments will be cleared',
        ],
    },
    [ENTITY_TYPES.DISTRICTS]: {
        title: 'Delete District',
        affectedRecords: [
            'All organizations in this district',
            'All universities in those organizations',
            'All KVKs in this district',
            'User district assignments will be cleared',
        ],
    },
    [ENTITY_TYPES.UNIVERSITIES]: {
        title: 'Delete University',
        affectedRecords: [
            'All KVKs in this university',
            'User university assignments will be cleared',
        ],
    },
};

/**
 * Default cascade delete configuration for entities without specific config
 */
const DEFAULT_CASCADE_CONFIG: CascadeDeleteConfig = {
    title: 'Delete Item',
    affectedRecords: ['All related records (cascade delete)'],
};

/**
 * Builds a cascade delete confirmation message from configuration
 *
 * @param config - Cascade delete configuration
 * @returns Formatted confirmation message
 */
export function buildCascadeDeleteMessage(config: CascadeDeleteConfig): string {
    const recordsList = config.affectedRecords.map(record => `• ${record}`).join('\n');
    const warnings = config.additionalWarnings?.map(warning => `• ${warning}`).join('\n') || '';

    return `⚠️ WARNING: ${config.title} has related records.\n\n` +
        `Deleting ${config.title.toLowerCase()} will permanently delete ALL related data:\n` +
        `${recordsList}${warnings ? `\n${warnings}` : ''}\n\n` +
        `This action CANNOT be undone!\n\n` +
        `Are you sure you want to proceed with cascade delete?`;
}

/**
 * Gets cascade delete configuration for an entity type
 *
 * @param entityType - Entity type
 * @returns Cascade delete configuration
 */
export function getCascadeDeleteConfig(entityType: ExtendedEntityType | null): CascadeDeleteConfig {
    if (!entityType) return DEFAULT_CASCADE_CONFIG;
    return CASCADE_DELETE_CONFIGS[entityType] || DEFAULT_CASCADE_CONFIG;
}

/**
 * Options for executing a delete operation
 */
export interface DeleteOperationOptions {
    itemId: number | string;
    entityType: ExtendedEntityType | null;
    entityName?: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Creates a standardized success alert configuration
 *
 * @param entityName - Name of the entity being deleted
 * @returns Alert configuration
 */
export function createDeleteSuccessAlert(entityName: string = 'Item'): {
    title: string;
    message: string;
    variant: 'success';
    autoClose: boolean;
    autoCloseDelay: number;
} {
    return {
        title: 'Success',
        message: `${entityName} deleted successfully.`,
        variant: 'success' as const,
        autoClose: true,
        autoCloseDelay: 2000,
    };
}

/**
 * Creates a standardized error alert configuration
 *
 * @param error - Error object
 * @param entityName - Name of the entity being deleted
 * @returns Alert configuration
 */
export function createDeleteErrorAlert(
    error: Error | { message?: string },
    entityName: string = 'Item'
): {
    title: string;
    message: string;
    variant: 'error';
} {
    const errorMessage = error.message || `Failed to delete ${entityName.toLowerCase()}.`;
    const isDependentError = errorMessage.toLowerCase().includes('dependent');

    return {
        title: 'Error',
        message: isDependentError
            ? `${errorMessage}\n\nPlease try again or contact support.`
            : errorMessage,
        variant: 'error' as const,
    };
}

/**
 * Creates a standardized confirmation dialog configuration
 *
 * @param config - Cascade delete configuration
 * @returns Confirmation dialog configuration
 */
export function createDeleteConfirmation(config: CascadeDeleteConfig): {
    title: string;
    message: string;
    variant: 'danger';
    confirmText: string;
    cancelText: string;
} {
    return {
        title: config.title,
        message: buildCascadeDeleteMessage(config),
        variant: 'danger' as const,
        confirmText: 'Delete',
        cancelText: 'Cancel',
    };
}
