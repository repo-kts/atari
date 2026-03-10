import React from 'react';
import { FormSelect } from '@/pages/dashboard/shared/forms/shared/FormComponents';
import { Loader2 } from 'lucide-react';

interface MasterDataDropdownProps {
    label: string;
    value: string | number | '';
    onChange: (value: string | number) => void;
    options: Array<{ value: string | number; label: string }>;
    isLoading?: boolean;
    required?: boolean;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    emptyMessage?: string;
    loadingMessage?: string;
    showEmptyState?: boolean;
}

/**
 * Reusable dropdown component for master data with empty state support
 * Use this for simple master data dropdowns that don't depend on other fields
 */
export const MasterDataDropdown: React.FC<MasterDataDropdownProps> = ({
    label,
    value,
    onChange,
    options,
    isLoading = false,
    required = false,
    error,
    placeholder,
    disabled = false,
    emptyMessage = 'No options available',
    loadingMessage = 'Loading...',
    showEmptyState = true,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        onChange(isNaN(Number(val)) ? val : Number(val));
    };

    const hasOptions = !isLoading && options.length > 0;
    const showEmpty = !isLoading && options.length === 0 && showEmptyState;

    return (
        <div className="space-y-2">
            <div className="relative">
                <FormSelect
                    label={label}
                    required={required}
                    value={value}
                    onChange={handleChange}
                    options={hasOptions ? options : []}
                    error={error}
                    placeholder={
                        showEmpty
                            ? emptyMessage
                            : placeholder || `Select ${label}`
                    }
                    disabled={disabled || isLoading || showEmpty}
                    className={isLoading ? 'pr-32' : ''}
                />

                {/* Loading State - Inside the select box */}
                {isLoading && (
                    <div className="absolute right-4 top-[calc(50%+8px)] -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <Loader2 className="w-4 h-4 text-[#487749] animate-spin" />
                        <span className="text-sm text-[#757575] whitespace-nowrap">{loadingMessage}</span>
                    </div>
                )}
            </div>

            {/* Empty State: now shown inside the select as placeholder and disabled */}
        </div>
    );
};
