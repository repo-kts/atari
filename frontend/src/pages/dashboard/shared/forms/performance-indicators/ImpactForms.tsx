import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect, FormTextArea, FormSection } from '../shared/FormComponents'
import { useYears } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface ImpactFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

// Hard-coded options for dropdowns
const SPECIFIC_AREA_OPTIONS = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Training', label: 'Training' },
    { value: 'Entrepreneurship Generated', label: 'Entrepreneurship Generated' },
]

const ENTERPRISE_TYPE_OPTIONS = [
    { value: 'Individual', label: 'Individual' },
    { value: 'SHG', label: 'SHG' },
    { value: 'FIG', label: 'FIG' },
    { value: 'FPO', label: 'FPO' },
    { value: 'Private', label: 'Private' },
]

export const ImpactForms: React.FC<ImpactFormsProps> = ({
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
            const value = e.target.type === 'number'
                ? parseFloat(e.target.value) || 0
                : e.target.value
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

    const handleFileChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [field]: e.target.files })
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
            {/* 1. Impact of KVK activities/large-scale adoption of technology */}
            {entityType === ENTITY_TYPES.PERFORMANCE_IMPACT_KVK_ACTIVITIES && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormSelect
                            label="Name of Specific Area"
                            required
                            value={formData.specificArea || ''}
                            onChange={handleFieldChange('specificArea')}
                            options={SPECIFIC_AREA_OPTIONS}
                        />
                    </div>

                    <FormTextArea
                        label="Brief Details of the Area"
                        required
                        value={formData.briefDetails || ''}
                        onChange={handleFieldChange('briefDetails')}
                        rows={2}
                        placeholder="Enter brief details"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormInput
                            label="No. of Farmers Benefitted"
                            required
                            type="number"
                            value={formData.farmersBenefitted || ''}
                            onChange={handleNumberChange('farmersBenefitted')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Horizontal Spread (in area/no.)"
                            required
                            type="text"
                            value={formData.horizontalSpread || ''}
                            onChange={handleFieldChange('horizontalSpread')}
                            placeholder="Enter horizontal spread"
                        />

                        <FormInput
                            label="% of Adoption"
                            required
                            type="number"
                            step="0.01"
                            value={formData.adoptionPercentage || ''}
                            onChange={handleNumberChange('adoptionPercentage')}
                            placeholder="Enter percentage"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormTextArea
                            label="Impact in Subjective Terms (Qualitative)"
                            required
                            value={formData.qualitativeImpact || ''}
                            onChange={handleFieldChange('qualitativeImpact')}
                            rows={3}
                            placeholder="Enter qualitative impact"
                        />

                        <FormTextArea
                            label="Impact in Objective Terms (Quantitative)"
                            required
                            value={formData.quantitativeImpact || ''}
                            onChange={handleFieldChange('quantitativeImpact')}
                            rows={3}
                            placeholder="Enter quantitative impact"
                        />
                    </div>

                    <FormSection title="Change in Income (Rs.)">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormInput
                                label="Before (Rs./Unit)"
                                required
                                type="number"
                                step="0.01"
                                value={formData.incomeBefore || ''}
                                onChange={handleNumberChange('incomeBefore')}
                                placeholder="Enter amount"
                            />

                            <FormInput
                                label="After (Rs./Unit)"
                                required
                                type="number"
                                step="0.01"
                                value={formData.incomeAfter || ''}
                                onChange={handleNumberChange('incomeAfter')}
                                placeholder="Enter amount"
                            />
                        </div>
                    </FormSection>
                </div>
            )}

            {/* 2. Details of Entrepreneurship/Startup Developed by KVK */}
            {entityType === ENTITY_TYPES.PERFORMANCE_IMPACT_ENTREPRENEURSHIP && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormInput
                            label="Name of Entrepreneur/Enterprise/Firm"
                            required
                            value={formData.entrepreneurName || ''}
                            onChange={handleFieldChange('entrepreneurName')}
                            placeholder="Enter name"
                        />
                    </div>

                    <FormTextArea
                        label="Registered Address"
                        required
                        value={formData.registeredAddress || ''}
                        onChange={handleFieldChange('registeredAddress')}
                        rows={2}
                        placeholder="Enter registered address"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormInput
                            label="Year of Establishment"
                            required
                            type="number"
                            value={formData.yearOfEstablishment || ''}
                            onChange={handleNumberChange('yearOfEstablishment')}
                            placeholder="Enter year"
                        />

                        <FormSelect
                            label="Type of Enterprise"
                            required
                            value={formData.enterpriseType || ''}
                            onChange={handleFieldChange('enterpriseType')}
                            options={ENTERPRISE_TYPE_OPTIONS}
                        />

                        <FormInput
                            label="No of Members Associated"
                            required
                            type="number"
                            value={formData.membersAssociated || ''}
                            onChange={handleNumberChange('membersAssociated')}
                            placeholder="Enter number"
                        />
                    </div>

                    <FormInput
                        label="Registration Details"
                        required
                        value={formData.registrationDetails || ''}
                        onChange={handleFieldChange('registrationDetails')}
                        placeholder="Enter registration details"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormTextArea
                            label="Technical Components (with commodity)"
                            required
                            value={formData.technicalComponents || ''}
                            onChange={handleFieldChange('technicalComponents')}
                            rows={2}
                            placeholder="Enter technical components"
                        />

                        <FormTextArea
                            label="Role of KVK/Technology Backstopping"
                            required
                            value={formData.kvkRole || ''}
                            onChange={handleFieldChange('kvkRole')}
                            rows={2}
                            placeholder="Enter role of KVK"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormInput
                            label="Annual Income/Revenue (Rs.)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.annualIncome || ''}
                            onChange={handleNumberChange('annualIncome')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="Development Timeline"
                            required
                            value={formData.developmentTimeline || ''}
                            onChange={handleFieldChange('developmentTimeline')}
                            placeholder="Enter timeline"
                        />
                    </div>

                    <FormTextArea
                        label="Economic & Social Status (Before & After)"
                        required
                        value={formData.statusBeforeAfter || ''}
                        onChange={handleFieldChange('statusBeforeAfter')}
                        rows={3}
                        placeholder="Enter status details"
                    />

                    <FormInput
                        label="Present Working Condition"
                        required
                        value={formData.presentWorkingCondition || ''}
                        onChange={handleFieldChange('presentWorkingCondition')}
                        placeholder="Enter working condition"
                        helperText="In Terms of Raw Materials Availability, Labour Availability, Consumer Preference, Marketing the Product etc. (Economic Viability of the Enterprise)"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormTextArea
                            label="Major Achievements"
                            required
                            value={formData.majorAchievements || ''}
                            onChange={handleFieldChange('majorAchievements')}
                            rows={3}
                            placeholder="Enter major achievements"
                        />

                        <FormTextArea
                            label="Major Constraints"
                            required
                            value={formData.majorConstraints || ''}
                            onChange={handleFieldChange('majorConstraints')}
                            rows={3}
                            placeholder="Enter major constraints"
                        />
                    </div>
                </div>
            )}

            {/* 3. Success Stories/Case Studies */}
            {entityType === ENTITY_TYPES.PERFORMANCE_IMPACT_SUCCESS_STORIES && (
                <div className="space-y-4">
                    <FormSection title="Personal Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <MasterDataDropdown
                                label="Reporting Year"
                                required
                                value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                                onChange={handleYearChange}
                                options={yearOptions}
                                isLoading={isLoadingYears}
                                emptyMessage="No reporting years available"
                            />

                            <FormInput
                                label="Name of Farmer/Entrepreneur"
                                required
                                value={formData.farmerName || ''}
                                onChange={handleFieldChange('farmerName')}
                                placeholder="Enter name"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <FormInput
                                label="Date of Birth"
                                required
                                type="date"
                                value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                                onChange={handleDateChange('dateOfBirth')}
                            />

                            <FormInput
                                label="Education"
                                required
                                value={formData.education || ''}
                                onChange={handleFieldChange('education')}
                                placeholder="Enter education"
                            />

                            <FormInput
                                label="Experience"
                                required
                                value={formData.experience || ''}
                                onChange={handleFieldChange('experience')}
                                placeholder="Enter experience"
                            />

                            <FormInput
                                label="Cell no./E-mail"
                                required
                                type="email"
                                value={formData.contact || ''}
                                onChange={handleFieldChange('contact')}
                                placeholder="Enter contact"
                            />
                        </div>

                        <FormTextArea
                            label="Full Address"
                            required
                            value={formData.fullAddress || ''}
                            onChange={handleFieldChange('fullAddress')}
                            rows={2}
                            placeholder="Enter full address"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormInput
                                label="Professional Membership"
                                value={formData.professionalMembership || ''}
                                onChange={handleFieldChange('professionalMembership')}
                                placeholder="Enter membership"
                                required
                            />

                            <FormInput
                                label="Awards Received"
                                value={formData.awardsReceived || ''}
                                onChange={handleFieldChange('awardsReceived')}
                                placeholder="Enter awards"
                                required
                            />
                        </div>

                        <FormTextArea
                            label="Major Achievement of the Farmers"
                            value={formData.majorAchievement || ''}
                            onChange={handleFieldChange('majorAchievement')}
                            rows={2}
                            placeholder="Enter achievements"
                            required
                        />
                    </FormSection>

                    <FormSection title="Professional Information">

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                        <FormInput
                            label="Title of Success Story/Case Study"
                            required
                            value={formData.storyTitle || ''}
                            onChange={handleFieldChange('storyTitle')}
                            placeholder="Enter title"
                        />
                            <FormTextArea
                                label="Situation Analysis/Problem Statement"
                                required
                                value={formData.problemStatement || ''}
                                onChange={handleFieldChange('problemStatement')}
                                rows={3}
                                placeholder="Enter problem statement"
                            />

                            <FormTextArea
                                label="Plan, Implement and Support/KVK Intervention(s)"
                                required
                                value={formData.kvkIntervention || ''}
                                onChange={handleFieldChange('kvkIntervention')}
                                rows={3}
                                placeholder="Enter KVK intervention"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormTextArea
                                label="Practices Followed by Farmer"
                                required
                                value={formData.practicesFollowed || ''}
                                onChange={handleFieldChange('practicesFollowed')}
                                rows={3}
                                placeholder="Enter practices"
                            />

                            <FormTextArea
                                label="Results/Output (Economical/Social)"
                                required
                                value={formData.results || ''}
                                onChange={handleFieldChange('results')}
                                rows={3}
                                placeholder="Enter results"
                            />
                            <FormTextArea
                                label="Impact/Outcome"
                                required
                                value={formData.impact || ''}
                                onChange={handleFieldChange('impact')}
                                rows={3}
                                placeholder="Enter impact"
                            />

                            <FormTextArea
                                label="Future Plans"
                                value={formData.futurePlans || ''}
                                onChange={handleFieldChange('futurePlans')}
                                rows={3}
                                placeholder="Enter future plans"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Supporting Images
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                File size must be less than 2MB
                            </p>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange('supportingImages')}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#487749]/10 file:text-[#487749] hover:file:bg-[#487749]/20 transition-all border border-[#E0E0E0] rounded-xl p-2"
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Economic Information">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <FormInput
                                label="Enterprise"
                                required
                                value={formData.enterprise || ''}
                                onChange={handleFieldChange('enterprise')}
                                placeholder="Enter enterprise"
                            />

                            <FormInput
                                label="Gross Income (annual)"
                                required
                                type="number"
                                step="0.01"
                                value={formData.grossIncome || ''}
                                onChange={handleNumberChange('grossIncome')}
                                placeholder="Enter amount"
                            />

                            <FormInput
                                label="Net Income"
                                required
                                type="number"
                                step="0.01"
                                value={formData.netIncome || ''}
                                onChange={handleNumberChange('netIncome')}
                                placeholder="Enter amount"
                            />

                            <FormInput
                                label="Cost-Benefit Ratio"
                                required
                                type="number"
                                step="0.01"
                                value={formData.costBenefitRatio || ''}
                                onChange={handleNumberChange('costBenefitRatio')}
                                placeholder="Enter ratio"
                            />
                        </div>
                    </FormSection>
                </div>
            )}
        </div>
    )
}
