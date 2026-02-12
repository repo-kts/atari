/**
 * Custom hook for handling data save operations
 *
 * Provides a clean, reusable interface for create/update operations
 * with proper error handling and state management
 */

import { useState } from 'react';
import type { ExtendedEntityType } from '../utils/masterUtils';
import { getIdField } from '../utils/masterUtils';
import { transformDataForCreate, transformDataForUpdate } from '../utils/dataTransformationUtils';

interface UseDataSaveOptions {
    entityType: ExtendedEntityType | null;
    activeHook: any;
    isBasicMasterEntity: boolean;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

interface UseDataSaveReturn {
    save: (formData: any, editingItem: any | null) => Promise<void>;
    isSaving: boolean;
    error: Error | null;
}

/**
 * Custom hook for handling save operations (create/update)
 *
 * @example
 * const { save, isSaving, error } = useDataSave({
 *   entityType,
 *   activeHook,
 *   isBasicMasterEntity,
 *   onSuccess: () => console.log('Saved!'),
 *   onError: (err) => console.error(err)
 * });
 *
 * await save(formData, editingItem);
 */
export function useDataSave({
    entityType,
    activeHook,
    isBasicMasterEntity,
    onSuccess,
    onError,
}: UseDataSaveOptions): UseDataSaveReturn {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const save = async (formData: any, editingItem: any | null): Promise<void> => {
        if (!entityType || !activeHook) {
            throw new Error('Entity type and active hook are required');
        }

        setIsSaving(true);
        setError(null);

        try {
            if (editingItem) {
                // Update operation
                const idField = getIdField(entityType);
                const updateData = transformDataForUpdate(entityType, idField, formData);

                if (isBasicMasterEntity) {
                    await activeHook.update(editingItem[idField], updateData);
                } else {
                    await activeHook.update({ id: editingItem[idField], data: updateData });
                }
            } else {
                // Create operation
                const createData = transformDataForCreate(entityType, formData);
                await activeHook.create(createData);
            }

            onSuccess?.();
        } catch (err: any) {
            const error = err instanceof Error ? err : new Error(err?.message || 'Failed to save');
            setError(error);
            onError?.(error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    return { save, isSaving, error };
}
