import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput } from '../shared/FormComponents'
import { useYears } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface FinancialPerformanceFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const FinancialPerformanceForms: React.FC<FinancialPerformanceFormsProps> = ({
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

    // Optimized onChange handlers
    const handleFieldChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleYearChange = useCallback(
        (value: string | number) => {
            setFormData({ ...formData, reportingYearId: value })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    const financialYearNote = (
        <p className="text-xs text-olive-600 mb-2 italic">
            Note : Please select Financial Year Wise Date Range i.e Date Range would be from 01st of April - 31st of March
        </p>
    )

    return (
        <div className="space-y-6">
            {/* 1. Budget Details */}
            {entityType === ENTITY_TYPES.PERFORMANCE_BUDGET_DETAILS && (
                <div className="space-y-6">
                    {financialYearNote}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="date"
                            label="Start Date"
                            required
                            value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                            onChange={handleFieldChange('startDate')}
                        />
                        <FormInput
                            type="date"
                            label="End Date"
                            required
                            value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                            onChange={handleFieldChange('endDate')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                        <FormInput
                            type="number"
                            label="Salary Allocation"
                            required
                            value={formData.salaryAllocation || ''}
                            onChange={handleFieldChange('salaryAllocation')}
                            placeholder="0.00"
                        />
                        <FormInput
                            type="number"
                            label="Salary Expenditure"
                            required
                            value={formData.salaryExpenditure || ''}
                            onChange={handleFieldChange('salaryExpenditure')}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-olive-800">General</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                type="number"
                                label="Main Grant Allocation"
                                required
                                value={formData.generalMainGrantAllocation || ''}
                                onChange={handleFieldChange('generalMainGrantAllocation')}
                                placeholder="0.00"
                            />
                            <FormInput
                                type="number"
                                label="Main Grant Expenditure"
                                required
                                value={formData.generalMainGrantExpenditure || ''}
                                onChange={handleFieldChange('generalMainGrantExpenditure')}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                type="number"
                                label="TSP Grant Allocation"
                                required
                                value={formData.generalTspGrantAllocation || ''}
                                onChange={handleFieldChange('generalTspGrantAllocation')}
                                placeholder="0.00"
                            />
                            <FormInput
                                type="number"
                                label="TSP Grant Expenditure"
                                required
                                value={formData.generalTspGrantExpenditure || ''}
                                onChange={handleFieldChange('generalTspGrantExpenditure')}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                type="number"
                                label="SCSP Grant Allocation"
                                required
                                value={formData.generalScspGrantAllocation || ''}
                                onChange={handleFieldChange('generalScspGrantAllocation')}
                                placeholder="0.00"
                            />
                            <FormInput
                                type="number"
                                label="SCSP Grant Expenditure"
                                required
                                value={formData.generalScspGrantExpenditure || ''}
                                onChange={handleFieldChange('generalScspGrantExpenditure')}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h3 className="font-semibold text-lg text-olive-800">Capital</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                type="number"
                                label="Main Grant Allocation"
                                required
                                value={formData.capitalMainGrantAllocation || ''}
                                onChange={handleFieldChange('capitalMainGrantAllocation')}
                                placeholder="0.00"
                            />
                            <FormInput
                                type="number"
                                label="Main Grant Expenditure"
                                required
                                value={formData.capitalMainGrantExpenditure || ''}
                                onChange={handleFieldChange('capitalMainGrantExpenditure')}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                type="number"
                                label="TSP Grant Allocation"
                                required
                                value={formData.capitalTspGrantAllocation || ''}
                                onChange={handleFieldChange('capitalTspGrantAllocation')}
                                placeholder="0.00"
                            />
                            <FormInput
                                type="number"
                                label="TSP Grant Expenditure"
                                required
                                value={formData.capitalTspGrantExpenditure || ''}
                                onChange={handleFieldChange('capitalTspGrantExpenditure')}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                type="number"
                                label="SCSP Grant Allocation"
                                required
                                value={formData.capitalScspGrantAllocation || ''}
                                onChange={handleFieldChange('capitalScspGrantAllocation')}
                                placeholder="0.00"
                            />
                            <FormInput
                                type="number"
                                label="SCSP Grant Expenditure"
                                required
                                value={formData.capitalScspGrantExpenditure || ''}
                                onChange={handleFieldChange('capitalScspGrantExpenditure')}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Revolving Fund Status */}
            {entityType === ENTITY_TYPES.PERFORMANCE_REVOLVING_FUND && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />
                        <FormInput
                            type="number"
                            label="Opening balance as on 1st April"
                            required
                            value={formData.openingBalance || ''}
                            onChange={handleFieldChange('openingBalance')}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="number"
                            label="Income during the year"
                            required
                            value={formData.incomeDuringYear || ''}
                            onChange={handleFieldChange('incomeDuringYear')}
                            placeholder="0.00"
                        />
                        <FormInput
                            type="number"
                            label="Expenditure during the year"
                            required
                            value={formData.expenditureDuringYear || ''}
                            onChange={handleFieldChange('expenditureDuringYear')}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Kind"
                            value={formData.kind || ''}
                            onChange={handleFieldChange('kind')}
                            placeholder="Enter details..."
                        />
                    </div>
                </div>
            )}

            {/* 3. Revenue Generation */}
            {entityType === ENTITY_TYPES.PERFORMANCE_REVENUE_GENERATION && (
                <div className="space-y-4">
                    {financialYearNote}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="date"
                            label="Start Date"
                            required
                            value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                            onChange={handleFieldChange('startDate')}
                        />
                        <FormInput
                            type="date"
                            label="End Date"
                            required
                            value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                            onChange={handleFieldChange('endDate')}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Name of Head"
                            required
                            value={formData.headName || ''}
                            onChange={handleFieldChange('headName')}
                            placeholder="Enter head name..."
                        />
                        <FormInput
                            type="number"
                            label="Income (Rs.)"
                            required
                            value={formData.income || ''}
                            onChange={handleFieldChange('income')}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Sponsoring agency"
                            required
                            value={formData.sponsoringAgency || ''}
                            onChange={handleFieldChange('sponsoringAgency')}
                            placeholder="Enter sponsoring agency..."
                        />
                    </div>
                </div>
            )}

            {/* 4. Resource Generation */}
            {entityType === ENTITY_TYPES.PERFORMANCE_RESOURCE_GENERATION && (
                <div className="space-y-4">
                    {financialYearNote}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="date"
                            label="Start Date"
                            required
                            value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                            onChange={handleFieldChange('startDate')}
                        />
                        <FormInput
                            type="date"
                            label="End Date"
                            required
                            value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                            onChange={handleFieldChange('endDate')}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Name of the programme"
                            required
                            value={formData.programmeName || ''}
                            onChange={handleFieldChange('programmeName')}
                            placeholder="Enter programme name..."
                        />
                        <FormInput
                            label="Purpose of the programme"
                            required
                            value={formData.programmePurpose || ''}
                            onChange={handleFieldChange('programmePurpose')}
                            placeholder="Enter purpose..."
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Sources of fund"
                            required
                            value={formData.sourcesOfFund || ''}
                            onChange={handleFieldChange('sourcesOfFund')}
                            placeholder="Enter sources of fund..."
                        />
                        <FormInput
                            type="number"
                            label="Amount (Rs. lakhs)"
                            required
                            value={formData.amount || ''}
                            onChange={handleFieldChange('amount')}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Infrastructure created"
                            required
                            value={formData.infrastructureCreated || ''}
                            onChange={handleFieldChange('infrastructureCreated')}
                            placeholder="Enter infrastructure details..."
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
