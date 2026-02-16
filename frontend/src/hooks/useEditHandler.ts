/**
 * Custom hook for handling edit operations
 * Provides reusable, optimized edit handling logic
 */

import { useCallback } from 'react';
import { extractFormData } from '@/utils/formDataExtractors';
import type { ExtendedEntityType } from '@/utils/masterUtils';

/**
 * Options for edit operation
 */
export interface EditOptions {
    item: any;
    entityType?: ExtendedEntityType | null;
    onOpenForm: (formData: any) => void;
}

/**
 * Hook return type
 */
export interface UseEditHandlerReturn {
    handleEdit: (options: EditOptions) => void;
}

/**
 * Custom hook for handling edit operations
 *
 * @returns Edit handler function
 */
export function useEditHandler(): UseEditHandlerReturn {
    /**
     * Handles editing an item by extracting form data and opening the form
     */
    const handleEdit = useCallback((options: EditOptions) => {
        const { item, entityType, onOpenForm } = options;

        // Extract and transform form data using utility function
        const formData = extractFormData(item, entityType);

        // Open form with extracted data
        onOpenForm(formData);
    }, []);

    return {
        handleEdit,
    };
}
