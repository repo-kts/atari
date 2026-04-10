import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormTextArea } from '../shared/FormComponents'
import { useYears, useAccountTypes } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

/** `items` holds account type; API or legacy payloads may send non-strings. */
function normalizeAccountTypeItems(value: unknown): string {
    if (value == null || value === '') return ''
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (Array.isArray(value)) {
        const first = value[0]
        return first == null ? '' : typeof first === 'string' ? first : String(first)
    }
    return String(value)
}

interface DistrictLevelDataFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}



export const DistrictLevelDataForms: React.FC<DistrictLevelDataFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [], isLoading: isLoadingYears } = useYears()
    const { data: accountTypes = [], isLoading: isLoadingAccountTypes } = useAccountTypes()

    // Memoize year options
    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'reportingYear', 'yearName'),
        [years]
    )

    const accountTypeOptions = useMemo(
        () => createMasterDataOptions(accountTypes, 'accountType', 'accountType'),
        [accountTypes]
    )

    const accountTypeValue = normalizeAccountTypeItems(formData.items)

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
            setFormData({ ...formData, reportingYear: value })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {/* 1. District level data on agriculture, livestock and farming situation */}
            {entityType === ENTITY_TYPES.PERFORMANCE_DISTRICT_LEVEL && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear ?? ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <MasterDataDropdown
                            label="Account Type"
                            required
                            value={accountTypeValue}
                            onChange={(value) =>
                                setFormData({ ...formData, items: String(value) })
                            }
                            options={accountTypeOptions}
                            isLoading={isLoadingAccountTypes}
                            emptyMessage="No account types available"
                        />
                    </div>

                    {/* Conditional Section: Crops */}
                    {accountTypeValue.toLowerCase().includes('productivity of major') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <MasterDataDropdown
                                label="Season"
                                required
                                value={formData.season ?? ''}
                                onChange={(value) => setFormData({ ...formData, season: value })}
                                options={[
                                    { value: 'Kharif', label: 'Kharif' },
                                    { value: 'Rabi', label: 'Rabi' },
                                    { value: 'Summer', label: 'Summer' },
                                    { value: 'Annual', label: 'Annual' },
                                ]}
                            />
                            <MasterDataDropdown
                                label="Type"
                                required
                                value={formData.type ?? ''}
                                onChange={(value) => setFormData({ ...formData, type: value })}
                                options={[
                                    { value: 'Field Crop', label: 'Field Crop' },
                                    { value: 'Horticulture Crop', label: 'Horticulture Crop' },
                                ]}
                            />
                            <FormInput
                                label="Name of Crop"
                                required
                                value={formData.cropName ?? ''}
                                onChange={handleFieldChange('cropName')}
                            />
                            <FormInput
                                label="Area (ha)"
                                required
                                type="number"
                                value={formData.area ?? ''}
                                onChange={handleFieldChange('area')}
                            />
                            <FormInput
                                label="Production (MT)"
                                required
                                type="number"
                                value={formData.production ?? ''}
                                onChange={handleFieldChange('production')}
                            />
                            <FormInput
                                label="Productivity (q/ha)"
                                required
                                type="number"
                                value={formData.productivity ?? ''}
                                onChange={handleFieldChange('productivity')}
                            />
                        </div>
                    )}

                    {/* Conditional Section: Climate */}
                    {accountTypeValue.toLowerCase().includes('mean yearly temperature') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <MasterDataDropdown
                                label="Month"
                                required
                                value={formData.month ?? ''}
                                onChange={(value) => setFormData({ ...formData, month: value })}
                                options={[
                                    { value: 'January', label: 'January' },
                                    { value: 'February', label: 'February' },
                                    { value: 'March', label: 'March' },
                                    { value: 'April', label: 'April' },
                                    { value: 'May', label: 'May' },
                                    { value: 'June', label: 'June' },
                                    { value: 'July', label: 'July' },
                                    { value: 'August', label: 'August' },
                                    { value: 'September', label: 'September' },
                                    { value: 'October', label: 'October' },
                                    { value: 'November', label: 'November' },
                                    { value: 'December', label: 'December' },
                                ]}
                            />
                            <FormInput
                                label="Rainfall(mm)"
                                required
                                type="number"
                                value={formData.rainfall ?? ''}
                                onChange={handleFieldChange('rainfall')}
                            />
                            <FormInput
                                label="Max. Tem.(0C)"
                                required
                                type="number"
                                value={formData.maxTemp ?? ''}
                                onChange={handleFieldChange('maxTemp')}
                            />
                            <FormInput
                                label="Min. Tem.(0C)"
                                required
                                type="number"
                                value={formData.minTemp ?? ''}
                                onChange={handleFieldChange('minTemp')}
                            />
                            <FormInput
                                label="Max. R.H.(%)"
                                required
                                type="number"
                                value={formData.maxRH ?? ''}
                                onChange={handleFieldChange('maxRH')}
                            />
                            <FormInput
                                label="Min. R.H.(%)"
                                required
                                type="number"
                                value={formData.minRH ?? ''}
                                onChange={handleFieldChange('minRH')}
                            />
                        </div>
                    )}

                    {/* Conditional Section: Livestock */}
                    {accountTypeValue.toLowerCase().includes('production of major livestock') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormInput
                                label="Name of Livestock"
                                required
                                value={formData.livestockName ?? ''}
                                onChange={handleFieldChange('livestockName')}
                            />
                            <FormInput
                                label="Number"
                                required
                                type="number"
                                value={formData.number ?? ''}
                                onChange={handleFieldChange('number')}
                            />
                        </div>
                    )}

                    <FormTextArea
                        label="Information"
                        required
                        value={formData.information ?? ''}
                        onChange={handleFieldChange('information')}
                        rows={4}
                        placeholder="Enter information about agriculture, livestock and farming situation"
                    />
                </div>
            )}

            {/* 2. Details of operational area / villages */}
            {entityType === ENTITY_TYPES.PERFORMANCE_OPERATIONAL_AREA && (
                <div className="space-y-4 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear ?? ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormInput
                            label="Taluk"
                            required
                            value={formData.taluk ?? ''}
                            onChange={handleFieldChange('taluk')}
                            placeholder=""
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Block"
                            required
                            value={formData.block ?? ''}
                            onChange={handleFieldChange('block')}
                            placeholder=""
                        />

                        <FormInput
                            label="Village"
                            required
                            value={formData.village ?? ''}
                            onChange={handleFieldChange('village')}
                            placeholder=""
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Major crops"
                            required
                            value={formData.majorCrops ?? ''}
                            onChange={handleFieldChange('majorCrops')}
                            placeholder=""
                        />

                        <FormInput
                            label="Major problems identified (crop-wise)"
                            required
                            value={formData.majorProblems ?? ''}
                            onChange={handleFieldChange('majorProblems')}
                            placeholder=""
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Identified Thrust Areas"
                            required
                            value={formData.thrustAreas ?? ''}
                            onChange={handleFieldChange('thrustAreas')}
                            placeholder=""
                        />
                    </div>
                </div>
            )}

            {/* 3. Details of village adoption programme */}
            {entityType === ENTITY_TYPES.PERFORMANCE_VILLAGE_ADOPTION && (
                <div className="space-y-4 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear ?? ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormInput
                            label="Village"
                            required
                            value={formData.village ?? ''}
                            onChange={handleFieldChange('village')}
                            placeholder=""
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Block"
                            required
                            value={formData.block ?? ''}
                            onChange={handleFieldChange('block')}
                            placeholder=""
                        />

                        <FormInput
                            label="Action taken for development"
                            required
                            value={formData.actionTaken ?? ''}
                            onChange={handleFieldChange('actionTaken')}
                            placeholder=""
                        />
                    </div>
                </div>
            )}

            {/* 4. Priority thrust areas */}
            {entityType === ENTITY_TYPES.PERFORMANCE_PRIORITY_THRUST && (
                <div className="space-y-4 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear ?? ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormInput
                            label="Thrust area"
                            required
                            value={formData.thrustArea ?? ''}
                            onChange={handleFieldChange('thrustArea')}
                            placeholder=""
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
