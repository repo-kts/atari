import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormTextArea, FormSection } from '../shared/FormComponents'
import { useYears } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface FinancialPerformanceFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

// Financial Year Note
const FINANCIAL_YEAR_NOTE = 'Please select Financial Year Wise Date Range i.e Date Range would be from 01st of April - 31st of March'

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

    // Optimized onChange handlers using useCallback
    const handleFieldChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const value = e.target.value
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleNumberChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value === '' ? '' : parseFloat(e.target.value)
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

    const handleDateChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [field]: new Date(e.target.value).toISOString() })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {/* 1. Budget Details */}
            {entityType === ENTITY_TYPES.PERFORMANCE_BUDGET_DETAILS && (
                <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium">{FINANCIAL_YEAR_NOTE}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Start Date"
                            type="date"
                            value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('startDate')}
                        />

                        <FormInput
                            label="End Date"
                            type="date"
                            value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('endDate')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Salary Allocation"
                            required
                            type="number"
                            step="0.01"
                            value={formData.salaryAllocation || ''}
                            onChange={handleNumberChange('salaryAllocation')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="Salary Expenditure"
                            required
                            type="number"
                            step="0.01"
                            value={formData.salaryExpenditure || ''}
                            onChange={handleNumberChange('salaryExpenditure')}
                            placeholder="Enter amount"
                        />
                    </div>

                    <FormSection title="General">
                        <FormInput
                            label="Main Grant Allocation"
                            required
                            type="number"
                            step="0.01"
                            value={formData.generalMainGrantAllocation || ''}
                            onChange={handleNumberChange('generalMainGrantAllocation')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="Main Grant Expenditure"
                            required
                            type="number"
                            step="0.01"
                            value={formData.generalMainGrantExpenditure || ''}
                            onChange={handleNumberChange('generalMainGrantExpenditure')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="TSP Grant Allocation"
                            required
                            type="number"
                            step="0.01"
                            value={formData.generalTspGrantAllocation || ''}
                            onChange={handleNumberChange('generalTspGrantAllocation')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="TSP Grant Expenditure"
                            required
                            type="number"
                            step="0.01"
                            value={formData.generalTspGrantExpenditure || ''}
                            onChange={handleNumberChange('generalTspGrantExpenditure')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="SCSP Grant Allocation"
                            required
                            type="number"
                            step="0.01"
                            value={formData.generalScspGrantAllocation || ''}
                            onChange={handleNumberChange('generalScspGrantAllocation')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="SCSP Grant Expenditure"
                            required
                            type="number"
                            step="0.01"
                            value={formData.generalScspGrantExpenditure || ''}
                            onChange={handleNumberChange('generalScspGrantExpenditure')}
                            placeholder="Enter amount"
                        />
                    </FormSection>

                    <FormSection title="Capital">
                        <FormInput
                            label="Main Grant Allocation"
                            required
                            type="number"
                            step="0.01"
                            value={formData.capitalMainGrantAllocation || ''}
                            onChange={handleNumberChange('capitalMainGrantAllocation')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="Main Grant Expenditure"
                            required
                            type="number"
                            step="0.01"
                            value={formData.capitalMainGrantExpenditure || ''}
                            onChange={handleNumberChange('capitalMainGrantExpenditure')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="TSP Grant Allocation"
                            required
                            type="number"
                            step="0.01"
                            value={formData.capitalTspGrantAllocation || ''}
                            onChange={handleNumberChange('capitalTspGrantAllocation')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="TSP Grant Expenditure"
                            required
                            type="number"
                            step="0.01"
                            value={formData.capitalTspGrantExpenditure || ''}
                            onChange={handleNumberChange('capitalTspGrantExpenditure')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="SCSP Grant Allocation"
                            required
                            type="number"
                            step="0.01"
                            value={formData.capitalScspGrantAllocation || ''}
                            onChange={handleNumberChange('capitalScspGrantAllocation')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="SCSP Grant Expenditure"
                            required
                            type="number"
                            step="0.01"
                            value={formData.capitalScspGrantExpenditure || ''}
                            onChange={handleNumberChange('capitalScspGrantExpenditure')}
                            placeholder="Enter amount"
                        />
                    </FormSection>
                </div>
            )}

            {/* 2. Project-wise Budget Details */}
            {entityType === ENTITY_TYPES.PERFORMANCE_PROJECT_BUDGET && (
                <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium">{FINANCIAL_YEAR_NOTE}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Start Date"
                            type="date"
                            value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('startDate')}
                        />

                        <FormInput
                            label="End Date"
                            type="date"
                            value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('endDate')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Name of Project"
                            required
                            value={formData.projectName || ''}
                            onChange={handleFieldChange('projectName')}
                            placeholder="Enter project name"
                        />

                        <FormInput
                            label="Account Number"
                            required
                            value={formData.accountNumber || ''}
                            onChange={handleFieldChange('accountNumber')}
                            placeholder="Enter account number"
                        />
                    </div>

                    <MasterDataDropdown
                        label="Name of Funding Agency"
                        required
                        options={[]} // TODO: Replace with funding agency master options if available
                        value={formData.fundingAgency || ''}
                        onChange={value => setFormData({ ...formData, fundingAgency: value })}
                        placeholder="Enter funding agency name"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <FormInput
                            label="Budget Estimate"
                            required
                            type="number"
                            step="0.01"
                            value={formData.budgetEstimate || ''}
                            onChange={handleNumberChange('budgetEstimate')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="Budget Allocated"
                            required
                            type="number"
                            step="0.01"
                            value={formData.budgetAllocated || ''}
                            onChange={handleNumberChange('budgetAllocated')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="Budget Released"
                            required
                            type="number"
                            step="0.01"
                            value={formData.budgetReleased || ''}
                            onChange={handleNumberChange('budgetReleased')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="Expenditure"
                            required
                            type="number"
                            step="0.01"
                            value={formData.expenditure || ''}
                            onChange={handleNumberChange('expenditure')}
                            placeholder="Enter amount"
                        />
                    </div>
                </div>
            )}

            {/* 3. Revolving Fund Status */}
            {entityType === ENTITY_TYPES.PERFORMANCE_REVOLVING_FUND && (
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormInput
                            label="Opening Balance as on 1st April"
                            required
                            type="number"
                            step="0.01"
                            value={formData.openingBalance || ''}
                            onChange={handleNumberChange('openingBalance')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="Income During the Year"
                            required
                            type="number"
                            step="0.01"
                            value={formData.incomeDuringYear || ''}
                            onChange={handleNumberChange('incomeDuringYear')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="Expenditure During the Year"
                            required
                            type="number"
                            step="0.01"
                            value={formData.expenditureDuringYear || ''}
                            onChange={handleNumberChange('expenditureDuringYear')}
                            placeholder="Enter amount"
                        />
                    </div>

                    <FormInput
                        label="Kind"
                        value={formData.kind || ''}
                        onChange={handleFieldChange('kind')}
                        placeholder="Enter kind"
                    />
                </div>
            )}

            {/* 4. Revenue Generation */}
            {entityType === ENTITY_TYPES.PERFORMANCE_REVENUE_GENERATION && (
                <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium">{FINANCIAL_YEAR_NOTE}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Start Date"
                            type="date"
                            value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('startDate')}
                        />

                        <FormInput
                            label="End Date"
                            type="date"
                            value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('endDate')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Name of Head"
                            required
                            value={formData.headName || ''}
                            onChange={handleFieldChange('headName')}
                            placeholder="Enter head name"
                        />

                        <FormInput
                            label="Income (Rs.)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.income || ''}
                            onChange={handleNumberChange('income')}
                            placeholder="Enter amount"
                        />
                    </div>

                    <FormInput
                        label="Sponsoring Agency"
                        required
                        value={formData.sponsoringAgency || ''}
                        onChange={handleFieldChange('sponsoringAgency')}
                        placeholder="Enter sponsoring agency"
                    />
                </div>
            )}

            {/* 5. Resource Generation */}
            {entityType === ENTITY_TYPES.PERFORMANCE_RESOURCE_GENERATION && (
                <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium">{FINANCIAL_YEAR_NOTE}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Start Date"
                            type="date"
                            value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('startDate')}
                        />

                        <FormInput
                            label="End Date"
                            type="date"
                            value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('endDate')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Name of the Programme"
                            required
                            value={formData.programmeName || ''}
                            onChange={handleFieldChange('programmeName')}
                            placeholder="Enter programme name"
                        />

                        <FormInput
                            label="Purpose of the Programme"
                            required
                            value={formData.programmePurpose || ''}
                            onChange={handleFieldChange('programmePurpose')}
                            placeholder="Enter purpose"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Sources of Fund"
                            required
                            value={formData.sourcesOfFund || ''}
                            onChange={handleFieldChange('sourcesOfFund')}
                            placeholder="Enter sources of fund"
                        />

                        <FormInput
                            label="Amount (Rs. lakhs)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.amount || ''}
                            onChange={handleNumberChange('amount')}
                            placeholder="Enter amount"
                        />
                    </div>

                    <FormTextArea
                        label="Infrastructure Created"
                        required
                        value={formData.infrastructureCreated || ''}
                        onChange={handleFieldChange('infrastructureCreated')}
                        rows={3}
                        placeholder="Enter infrastructure created"
                    />
                </div>
            )}
        </div>
    )
}
