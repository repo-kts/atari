import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect, FormTextArea, FormSection } from '../shared/FormComponents'
import { useYears, useSeasons } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface InfrastructurePerformanceFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

// Yes/No options for dropdowns
const YES_NO_OPTIONS = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
]

// Months for the table and dropdown
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

// Month options for dropdown
const MONTH_OPTIONS = MONTHS.map((month) => ({
    value: month,
    label: month,
}))

// Quarters for the table
const QUARTERS = ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4', 'Quarter 5', 'Quarter 6']

// Reusable component for Staff Quarters occupancy table
interface OccupancyTableProps {
    formData: any
    handleCellChange: (month: string, quarter: string, value: string) => void
}

const OccupancyTable: React.FC<OccupancyTableProps> = ({ formData, handleCellChange }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-[#E0E0E0] rounded-lg">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="border border-[#E0E0E0] px-3 py-2 text-left text-sm font-semibold text-gray-700">
                            Month
                        </th>
                        {QUARTERS.map((quarter) => (
                            <th
                                key={quarter}
                                className="border border-[#E0E0E0] px-3 py-2 text-center text-sm font-semibold text-gray-700"
                            >
                                {quarter}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {MONTHS.map((month) => (
                        <tr key={month} className="hover:bg-gray-50">
                            <td className="border border-[#E0E0E0] px-3 py-2 text-sm font-medium text-gray-700">
                                {month}
                            </td>
                            {QUARTERS.map((quarter) => {
                                const cellKey = `occupancy_${month.toLowerCase()}_${quarter.toLowerCase().replace(' ', '_')}`
                                return (
                                    <td key={`${month}-${quarter}`} className="border border-[#E0E0E0] px-2 py-1">
                                        <select
                                            value={formData[cellKey] || ''}
                                            onChange={(e) => handleCellChange(month, quarter, e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white"
                                        >
                                            <option value="">Select</option>
                                            {YES_NO_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export const InfrastructurePerformanceForms: React.FC<InfrastructurePerformanceFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [], isLoading: isLoadingYears } = useYears()
    const { data: seasons = [], isLoading: isLoadingSeasons } = useSeasons()

    // Memoize options
    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'reportingYear', 'yearName'),
        [years]
    )

    const seasonOptions = useMemo(
        () => createMasterDataOptions(seasons, 'seasonId', 'seasonName'),
        [seasons]
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
            setFormData({ ...formData, reportingYear: value })
        },
        [formData, setFormData]
    )

    const handleDateChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [field]: new Date(e.target.value).toISOString() })
        },
        [formData, setFormData]
    )

    const handleCellChange = useCallback(
        (month: string, quarter: string, value: string) => {
            const cellKey = `occupancy_${month.toLowerCase()}_${quarter.toLowerCase().replace(' ', '_')}`
            setFormData({ ...formData, [cellKey]: value })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {/* 1. Performance of Demonstration Units */}
            {entityType === ENTITY_TYPES.PERFORMANCE_DEMONSTRATION_UNITS && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormInput
                            label="Name of Demo Unit"
                            required
                            value={formData.demoUnitName || ''}
                            onChange={handleFieldChange('demoUnitName')}
                            placeholder="Enter demo unit name"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormInput
                            label="Year of Establishment"
                            required
                            type="number"
                            value={formData.yearOfEstablishment || ''}
                            onChange={handleNumberChange('yearOfEstablishment')}
                            placeholder="Enter year"
                        />

                        <FormInput
                            label="Area (Sq. mt)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.area || ''}
                            onChange={handleNumberChange('area')}
                            placeholder="Enter area"
                        />
                    </div>

                    <FormSection title="Details of Production" noGrid>
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput
                                label="Variety/Breed"
                                required
                                value={formData.varietyBreed || ''}
                                onChange={handleFieldChange('varietyBreed')}
                                placeholder="Enter variety/breed"
                            />

                            <FormInput
                                label="Produce"
                                required
                                value={formData.produce || ''}
                                onChange={handleFieldChange('produce')}
                                placeholder="Enter produce"
                            />

                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                step="0.01"
                                value={formData.quantity || ''}
                                onChange={handleNumberChange('quantity')}
                                placeholder="Enter quantity"
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Amount (Rs.)" noGrid>
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput
                                label="Cost of Inputs"
                                required
                                type="number"
                                step="0.01"
                                value={formData.costOfInputs || ''}
                                onChange={handleNumberChange('costOfInputs')}
                                placeholder="Enter cost"
                            />

                            <FormInput
                                label="Gross Income"
                                required
                                type="number"
                                step="0.01"
                                value={formData.grossIncome || ''}
                                onChange={handleNumberChange('grossIncome')}
                                placeholder="Enter gross income"
                            />

                            <FormInput
                                label="Remarks"
                                required
                                value={formData.remarks || ''}
                                onChange={handleFieldChange('remarks')}
                                placeholder="Enter remarks"
                            />
                        </div>
                    </FormSection>
                </div>
            )}

            {/* 2. Performance of Instructional Farm (Crops) */}
            {entityType === ENTITY_TYPES.PERFORMANCE_INSTRUCTIONAL_FARM_CROPS && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <MasterDataDropdown
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(value) => setFormData({ ...formData, seasonId: value })}
                            options={seasonOptions}
                            isLoading={isLoadingSeasons}
                            emptyMessage="No seasons available"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Name of the Crop"
                            required
                            value={formData.cropName || ''}
                            onChange={handleFieldChange('cropName')}
                            placeholder="Enter crop name"
                        />

                        <FormInput
                            label="Area (ha)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.area || ''}
                            onChange={handleNumberChange('area')}
                            placeholder="Enter area"
                        />
                    </div>

                    <FormSection title="Details of Production" noGrid>
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput
                                label="Variety"
                                required
                                value={formData.variety || ''}
                                onChange={handleFieldChange('variety')}
                                placeholder="Enter variety"
                            />

                            <FormInput
                                label="Type of Produce"
                                required
                                value={formData.typeOfProduce || ''}
                                onChange={handleFieldChange('typeOfProduce')}
                                placeholder="Enter type of produce"
                            />

                            <FormInput
                                label="Quantity (q)"
                                required
                                type="number"
                                step="0.01"
                                value={formData.quantity || ''}
                                onChange={handleNumberChange('quantity')}
                                placeholder="Enter quantity"
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Amount (Rs.)" noGrid>
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput
                                label="Cost of Inputs"
                                required
                                type="number"
                                step="0.01"
                                value={formData.costOfInputs || ''}
                                onChange={handleNumberChange('costOfInputs')}
                                placeholder="Enter cost"
                            />

                            <FormInput
                                label="Gross Income"
                                required
                                type="number"
                                step="0.01"
                                value={formData.grossIncome || ''}
                                onChange={handleNumberChange('grossIncome')}
                                placeholder="Enter gross income"
                            />

                            <FormInput
                                label="Remarks"
                                required
                                value={formData.remarks || ''}
                                onChange={handleFieldChange('remarks')}
                                placeholder="Enter remarks"
                            />
                        </div>
                    </FormSection>
                </div>
            )}

            {/* 3. Performance of Production Units */}
            {entityType === ENTITY_TYPES.PERFORMANCE_PRODUCTION_UNITS && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormInput
                            label="Name of the Product"
                            required
                            value={formData.productName || ''}
                            onChange={handleFieldChange('productName')}
                            placeholder="Enter product name"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <FormInput
                            label="Quantity (Kg)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.quantity || ''}
                            onChange={handleNumberChange('quantity')}
                            placeholder="Enter quantity"
                        />
                    </div>

                    <FormSection title="Amount (Rs.)" noGrid>
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput
                                label="Cost of Inputs"
                                required
                                type="number"
                                step="0.01"
                                value={formData.costOfInputs || ''}
                                onChange={handleNumberChange('costOfInputs')}
                                placeholder="Enter cost"
                            />

                            <FormInput
                                label="Gross Income"
                                required
                                type="number"
                                step="0.01"
                                value={formData.grossIncome || ''}
                                onChange={handleNumberChange('grossIncome')}
                                placeholder="Enter gross income"
                            />

                            <FormInput
                                label="Remarks"
                                required
                                value={formData.remarks || ''}
                                onChange={handleFieldChange('remarks')}
                                placeholder="Enter remarks"
                            />
                        </div>
                    </FormSection>
                </div>
            )}

            {/* 4. Performance of Instructional Farm (Livestock) */}
            {entityType === ENTITY_TYPES.PERFORMANCE_INSTRUCTIONAL_FARM_LIVESTOCK && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <FormInput
                        label="Name of the Animal/Bird/Aquatics"
                        required
                        value={formData.animalName || ''}
                        onChange={handleFieldChange('animalName')}
                        placeholder="Enter name"
                    />

                    <FormSection title="Details of Production" noGrid>
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput
                                label="Variety"
                                required
                                value={formData.speciesBreed || ''}
                                onChange={handleFieldChange('speciesBreed')}
                                placeholder="Enter variety"
                            />

                            <FormInput
                                label="Type of Produce"
                                required
                                value={formData.typeOfProduce || ''}
                                onChange={handleFieldChange('typeOfProduce')}
                                placeholder="Enter type of produce"
                            />

                            <FormInput
                                label="Qty. (q)"
                                required
                                type="number"
                                step="0.01"
                                value={formData.quantity || ''}
                                onChange={handleNumberChange('quantity')}
                                placeholder="Enter quantity"
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Amount (Rs.)" noGrid>
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput
                                label="Cost of Inputs"
                                required
                                type="number"
                                step="0.01"
                                value={formData.costOfInputs || ''}
                                onChange={handleNumberChange('costOfInputs')}
                                placeholder="Enter cost"
                            />

                            <FormInput
                                label="Gross Income"
                                required
                                type="number"
                                step="0.01"
                                value={formData.grossIncome || ''}
                                onChange={handleNumberChange('grossIncome')}
                                placeholder="Enter gross income"
                            />

                            <FormInput
                                label="Remarks"
                                required
                                value={formData.remarks || ''}
                                onChange={handleFieldChange('remarks')}
                                placeholder="Enter remarks"
                            />
                        </div>
                    </FormSection>
                </div>
            )}

            {/* 5. Utilization of Hostel Facilities */}
            {entityType === ENTITY_TYPES.PERFORMANCE_HOSTEL && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormSelect
                            label="Months"
                            required
                            value={formData.months || ''}
                            onChange={handleFieldChange('months')}
                            options={MONTH_OPTIONS}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormInput
                            label="No. of Trainees Stayed"
                            required
                            type="number"
                            value={formData.traineesStayed || ''}
                            onChange={handleNumberChange('traineesStayed')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Trainee Days (Days Stayed)"
                            required
                            type="number"
                            value={formData.traineeDays || ''}
                            onChange={handleNumberChange('traineeDays')}
                            placeholder="Enter days"
                        />
                    </div>

                    <FormTextArea
                        label="Reason for Short Fall (if any)"
                        required
                        value={formData.reasonForShortFall || ''}
                        onChange={handleFieldChange('reasonForShortFall')}
                        rows={3}
                        placeholder="Enter reason for short fall"
                    />
                </div>
            )}

            {/* 6. Utilization of Staff Quarters */}
            {entityType === ENTITY_TYPES.PERFORMANCE_STAFF_QUARTERS && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Date of Completion"
                            required
                            type="date"
                            value={formData.dateOfCompletion ? new Date(formData.dateOfCompletion).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('dateOfCompletion')}
                        />

                        <FormSelect
                            label="Whether Staff Quarters have been Completed"
                            required
                            value={formData.isCompleted || ''}
                            onChange={handleFieldChange('isCompleted')}
                            options={YES_NO_OPTIONS}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormInput
                            label="No. of Staff Quarters"
                            required
                            type="number"
                            value={formData.numberOfQuarters || ''}
                            onChange={handleNumberChange('numberOfQuarters')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Occupancy Details"
                            required
                            value={formData.occupancyDetails || ''}
                            onChange={handleFieldChange('occupancyDetails')}
                            placeholder="Enter occupancy details"
                        />
                    </div>


                    <div className="space-y-2">
                        <OccupancyTable
                            formData={formData}
                            handleCellChange={handleCellChange}
                        />
                    </div>

                    <FormTextArea
                        label="Remark"
                        required
                        value={formData.remark || ''}
                        onChange={handleFieldChange('remark')}
                        rows={3}
                        placeholder="Enter remark"
                    />
                </div>
            )}

            {/* 7. Rain Water Harvesting / Micro Irrigation System */}
            {entityType === ENTITY_TYPES.PERFORMANCE_RAINWATER_HARVESTING && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormInput
                            label="No. of Training Programme Conducted"
                            required
                            type="number"
                            value={formData.trainingProgrammes || ''}
                            onChange={handleNumberChange('trainingProgrammes')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="No. of Demonstrations"
                            required
                            type="number"
                            value={formData.demonstrations || ''}
                            onChange={handleNumberChange('demonstrations')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="No. of Plant Material Produced"
                            required
                            type="number"
                            value={formData.plantMaterial || ''}
                            onChange={handleNumberChange('plantMaterial')}
                            placeholder="Enter number"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Visit by the Farmers (No.)"
                            required
                            type="number"
                            value={formData.farmerVisits || ''}
                            onChange={handleNumberChange('farmerVisits')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Visit by the Officials (No.)"
                            required
                            type="number"
                            value={formData.officialVisits || ''}
                            onChange={handleNumberChange('officialVisits')}
                            placeholder="Enter number"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
