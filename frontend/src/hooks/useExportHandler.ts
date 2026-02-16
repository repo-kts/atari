/**
 * Custom hook for handling data export operations
 * Provides reusable, optimized export handling logic
 */

import { useState, useCallback } from 'react';
import { useAlert } from './useAlert';
import {
    formatHeaderLabel,
    generateCSV,
    downloadFile,
    generateFilename,
    getExportExtension,
} from '@/utils/exportUtils';
import { exportApi } from '@/services/exportApi';
import { getFieldValue } from '@/utils/masterUtils';

/**
 * Export format types
 */
export type ExportFormat = 'pdf' | 'excel' | 'word' | 'csv';

/**
 * Options for export operation
 */
export interface ExportOptions {
    title: string;
    fields: string[];
    data: any[];
    pathname: string;
}

/**
 * Hook return type
 */
export interface UseExportHandlerReturn {
    handleExport: (format: ExportFormat, options: ExportOptions) => Promise<void>;
    exportLoading: ExportFormat | null;
}

/**
 * Custom hook for handling export operations
 *
 * @returns Export handler function and loading state
 */
export function useExportHandler(): UseExportHandlerReturn {
    const { alert } = useAlert();
    const [exportLoading, setExportLoading] = useState<ExportFormat | null>(null);

    /**
     * Handles CSV export (client-side)
     */
    const handleCSVExport = useCallback((options: ExportOptions) => {
        const { title, fields, data } = options;
        const headerLabels = fields.map(formatHeaderLabel);
        const rows = data.map(item => fields.map(field => getFieldValue(item, field)));

        const csv = generateCSV(headerLabels, rows);
        const blob = new Blob([csv], { type: 'text/csv' });
        const filename = generateFilename(title, 'csv');
        downloadFile(blob, filename, 'text/csv');
    }, []);

    /**
     * Handles server-side export (PDF, Excel, Word)
     */
    const handleServerExport = useCallback(
        async (format: ExportFormat, options: ExportOptions) => {
            const { title, fields, data, pathname } = options;
            const headerLabels = fields.map(formatHeaderLabel);
            const rows = data.map(item => fields.map(field => getFieldValue(item, field)));

            try {
                const blob = await exportApi.exportData(
                    {
                        title,
                        headers: headerLabels,
                        rows,
                        format: format as 'pdf' | 'excel' | 'word',
                    },
                    pathname
                );

                const extension = getExportExtension(format);
                const filename = generateFilename(title, extension);
                downloadFile(blob, filename);

                alert({
                    title: 'Success',
                    message: 'Export completed successfully.',
                    variant: 'success',
                    autoClose: true,
                    autoCloseDelay: 2000,
                });
            } catch (error: any) {
                console.error('Export failed:', error);
                alert({
                    title: 'Error',
                    message: error.message || 'Failed to export. Please try again.',
                    variant: 'error',
                });
                throw error; // Re-throw to allow caller to handle if needed
            }
        },
        [alert]
    );

    /**
     * Main export handler that routes to appropriate export function
     */
    const handleExport = useCallback(
        async (format: ExportFormat, options: ExportOptions) => {
            // CSV is handled client-side, no loading state needed
            if (format === 'csv') {
                handleCSVExport(options);
                return;
            }

            // Server-side exports need loading state
            setExportLoading(format);
            try {
                await handleServerExport(format, options);
            } finally {
                setExportLoading(null);
            }
        },
        [handleCSVExport, handleServerExport]
    );

    return {
        handleExport,
        exportLoading,
    };
}
