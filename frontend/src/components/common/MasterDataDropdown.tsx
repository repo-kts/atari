import React from 'react';
import { FormSelect } from '@/pages/dashboard/shared/forms/shared/FormComponents';
import { Info } from 'lucide-react';

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
            <FormSelect
                label={label}
                required={required}
                value={value}
                onChange={handleChange}
                options={isLoading ? [] : options}
                error={error}
                placeholder={placeholder || `Select ${label}`}
                disabled={disabled || isLoading}
            />

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl">
                    <Info className="w-4 h-4 text-[#757575] animate-pulse" />
                    <span className="text-sm text-[#757575]">{loadingMessage}</span>
                </div>
            )}

            {/* Empty State */}
            {showEmpty && (
                <div className="flex items-center gap-2 p-3 bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl">
                    <Info className="w-4 h-4 text-[#757575]" />
                    <span className="text-sm text-[#757575]">{emptyMessage}</span>
                </div>
            )}
        </div>
    );
};
