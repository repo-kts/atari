import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormTextArea } from '../shared/FormComponents'
import { useYears } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface LinkageFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

// Dummy programme type options (can be wired to a master later)
const PROGRAMME_TYPE_OPTIONS = [
    { value: 'CENTRAL_GOVT', label: 'Central Government' },
    { value: 'STATE_GOVT', label: 'State Government' },
    { value: 'NGO', label: 'NGO' },
    { value: 'PRIVATE', label: 'Private' },
]

export const LinkageForms: React.FC<LinkageFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [], isLoading: isLoadingYears } = useYears()

    // Memoize year options
    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'yearId', 'yearName'),
        [years]
    )

    // Optimized onChange handlers using useCallback
    const handleFieldChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const value = e.target.value
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleYearChange = useCallback(
        (value: string | number) => {
            setFormData({ ...formData, reportingYearId: value, yearId: value, reportingYear: value })
        },
        [formData, setFormData]
    )

    const handleProgrammeTypeChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setFormData({ ...formData, programmeType: e.target.value })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {/* 1. Functional linkage with Different Organizations */}
            {entityType === ENTITY_TYPES.PERFORMANCE_FUNCTIONAL_LINKAGE && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Name of Organization"
                            required
                            value={formData.organizationName || ''}
                            onChange={handleFieldChange('organizationName')}
                            placeholder="Enter organization name"
                        />

                        <FormInput
                            label="Nature of Linkage"
                            required
                            value={formData.natureOfLinkage || ''}
                            onChange={handleFieldChange('natureOfLinkage')}
                            placeholder="Enter nature of linkage"
                        />
                    </div>
                </div>
            )}

            {/* 2. List of Special Programmes Undertaken by the KVK */}
            {entityType === ENTITY_TYPES.PERFORMANCE_SPECIAL_PROGRAMMES && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="relative pt-2">
                            <label className="absolute -top-1.5 left-4 px-1 bg-white text-sm font-semibold text-gray-700 z-10">
                                Programme Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.programmeType || ''}
                                onChange={handleProgrammeTypeChange}
                                className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all bg-white text-base h-[48px]"
                            >
                                <option value="">Select Programme Type</option>
                                {PROGRAMME_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <FormInput
                            label="Name of the Programme/Scheme"
                            required
                            value={formData.programmeName || ''}
                            onChange={handleFieldChange('programmeName')}
                            placeholder="Enter programme/scheme name"
                        />
                    </div>

                    <FormTextArea
                        label="Purpose of Programme"
                        required
                        value={formData.programmePurpose || ''}
                        onChange={handleFieldChange('programmePurpose')}
                        rows={3}
                        placeholder="Enter purpose of programme"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Date/Month of Initiation"
                            required
                            type="date"
                            value={formData.initiationDate ? new Date(formData.initiationDate).toISOString().split('T')[0] : ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    initiationDate: new Date(e.target.value).toISOString(),
                                })
                            }
                        />

                        <FormInput
                            label="Funding Agency"
                            required
                            value={formData.fundingAgency || ''}
                            onChange={handleFieldChange('fundingAgency')}
                            placeholder="Enter funding agency"
                        />
                    </div>

                    <FormInput
                        label="Amount (Rs.)"
                        required
                        type="number"
                        step="0.01"
                        value={formData.amount || ''}
                        onChange={handleFieldChange('amount')}
                        placeholder="Enter amount"
                    />
                </div>
            )}
        </div>
    )
}

