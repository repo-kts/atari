/**
 * Custom hook for handling delete operations
 * Provides reusable, optimized delete handling logic
 */

import { useCallback } from 'react';
import { getIdField, type ExtendedEntityType } from '@/utils/masterUtils';
import {
    getCascadeDeleteConfig,
    createDeleteConfirmation,
    createDeleteSuccessAlert,
    createDeleteErrorAlert,
} from '@/utils/deleteHandlers';

/**
 * Options for delete handler
 */
export interface UseDeleteHandlerOptions {
    confirm: (opts: any, onConfirm: () => void | Promise<void>) => void;
    alert: (opts: any) => void;
}

/**
 * Hook return type
 */
export interface UseDeleteHandlerReturn {
    handleMasterDataDelete: (item: any, entityType: ExtendedEntityType | null, activeHook: any) => void;
    handleMockDelete: (item: any, items: any[], setItems: (items: any[]) => void) => void;
}

/**
 * Custom hook for handling delete operations
 *
 * @param options - Options containing confirm and alert functions
 * @returns Delete handler functions
 */
export function useDeleteHandler(options: UseDeleteHandlerOptions): UseDeleteHandlerReturn {
    const { confirm, alert } = options;

    /**
     * Handles deletion of master data entities
     */
    const handleMasterDataDelete = useCallback(
        (
            item: any,
            entityType: ExtendedEntityType | null,
            activeHook: any
        ) => {
            if (!activeHook || !entityType) {
                console.warn('Cannot delete: missing activeHook or entityType', { activeHook, entityType });
                return;
            }

            const idField = getIdField(entityType);
            const itemId = item[idField];

            if (!itemId) {
                console.warn('Cannot delete: missing itemId', { item, idField, itemId });
                alert({
                    title: 'Error',
                    message: 'Cannot delete item: missing ID field.',
                    variant: 'error',
                });
                return;
            }

            const config = getCascadeDeleteConfig(entityType);
            const entityName = config.title.replace('Delete ', '');

            confirm(
                createDeleteConfirmation(config),
                async () => {
                    try {
                        await activeHook.remove(itemId, true); // Pass cascade=true
                        alert(createDeleteSuccessAlert(entityName));
                    } catch (err: any) {
                        alert(createDeleteErrorAlert(err, entityName));
                    }
                }
            );
        },
        [confirm, alert]
    );

    /**
     * Handles deletion of mock/non-master data entities
     */
    const handleMockDelete = useCallback(
        (item: any, items: any[], setItems: (items: any[]) => void) => {
            confirm(
                {
                    title: 'Delete Item',
                    message: 'Are you sure you want to delete this item? This action cannot be undone.',
                    variant: 'danger',
                    confirmText: 'Delete',
                    cancelText: 'Cancel',
                },
                () => {
                    setItems(items.filter(i => i.id !== item.id));
                    alert(createDeleteSuccessAlert());
                }
            );
        },
        [confirm, alert]
    );

    return {
        handleMasterDataDelete,
        handleMockDelete,
    };
}
