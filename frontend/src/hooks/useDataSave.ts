/**
 * Custom hook for handling data save operations
 *
 * Provides a clean, reusable interface for create/update operations
 * with proper error handling and state management
 */

import { useState } from 'react';
import type { ExtendedEntityType } from '../utils/masterUtils';
import { getIdField } from '../utils/masterUtils';
import { transformDataForCreate, transformDataForUpdate, processFiles } from '../utils/dataTransformationUtils';

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

function parseDateOnly(value: any): Date | null {
    if (!value) return null;

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return null;
        return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
    }

    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    const datePrefix = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (datePrefix) {
        const [, y, m, d] = datePrefix;
        const dt = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
        return Number.isNaN(dt.getTime()) ? null : dt;
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

function validateDateOrdering(formData: any): void {
    const keys = Object.keys(formData || {});
    const normalize = (key: string) => String(key || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const isStartKey = (key: string) => {
        const k = normalize(key);
        return k === 'startdate' || k === 'startdt' || (k.includes('start') && k.includes('date'));
    };
    const isEndKey = (key: string) => {
        const k = normalize(key);
        return k === 'enddate' || k === 'enddt' || (k.includes('end') && k.includes('date'));
    };

    const startKey = keys.find((k) => isStartKey(k) && !!parseDateOnly(formData[k]));
    const endKey = keys.find((k) => isEndKey(k) && !!parseDateOnly(formData[k]));
    if (!startKey || !endKey) return;

    const startDate = parseDateOnly(formData[startKey]);
    const endDate = parseDateOnly(formData[endKey]);
    if (!startDate || !endDate) return;

    if (endDate.getTime() < startDate.getTime()) {
        throw new Error(`"${endKey}" cannot be before "${startKey}"`);
    }
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
            // Pre-process files (recursive Base64 conversion)
            const processedFormData = await processFiles(formData);
            validateDateOrdering(processedFormData);

            if (editingItem) {
                // Update operation
                const idField = getIdField(entityType);
                const updateData = transformDataForUpdate(entityType, idField, processedFormData);
                // Debug: log final update payload
                // Note: Remove or guard this in production if noisy
                console.log('[useDataSave] Update payload', {
                    entityType,
                    idField,
                    id: editingItem[idField],
                    payload: updateData,
                });

                if (isBasicMasterEntity) {
                    await activeHook.update(editingItem[idField], updateData);
                } else {
                    await activeHook.update({ id: editingItem[idField], data: updateData });
                }
            } else {
                // Create operation
                const createData = transformDataForCreate(entityType, processedFormData);
                // Debug: log final create payload
                console.log('[useDataSave] Create payload', {
                    entityType,
                    payload: createData,
                });
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
