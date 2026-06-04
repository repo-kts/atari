import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormTextArea, FormSection } from '../shared/FormComponents'
import { useYears, useImpactSpecificAreas, useEnterpriseTypes } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'
import { parseBoundedCountInput, parseEstablishmentYearInput } from '@/utils/formNumericGuards'
import { FormAttachmentSection } from '@/components/common/FormAttachmentSection'

interface ImpactFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const ImpactForms: React.FC<ImpactFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [], isLoading: isLoadingYears } = useYears()
    const { data: specificAreas = [], isLoading: isLoadingAreas } = useImpactSpecificAreas()
    const { data: enterpriseTypes = [], isLoading: isLoadingEnterpriseTypes } = useEnterpriseTypes()

    // Memoize options
    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'reportingYear', 'yearName'),
        [years]
    )

    const specificAreaOptions = useMemo(
        () => createMasterDataOptions(specificAreas, 'specificAreaName', 'specificAreaName'),
        [specificAreas]
    )

    const enterpriseTypeOptions = useMemo(
        () => createMasterDataOptions(enterpriseTypes, 'enterpriseTypeName', 'enterpriseTypeName'),
        [enterpriseTypes]
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

    const handleEstablishmentYearChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, yearOfEstablishment: parseEstablishmentYearInput(e.target.value) })
        },
        [formData, setFormData]
    )

    const handleMembersAssociatedChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, membersAssociated: parseBoundedCountInput(e.target.value) })
        },
        [formData, setFormData]
    )

    const handleYearChange = useCallback(
        (value: string | number) => {
            setFormData({ ...formData, reportingYear: value })
        },
        [formData, setFormData]
    )

    const handleAttachmentIds = useCallback(
        (ids: number[]) => setFormData((prev: any) => ({ ...prev, attachmentIds: ids })),
        [setFormData],
    )

    const handleDateChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            setFormData({ 
                ...formData, 
                [field]: value ? new Date(value).toISOString() : null 
            })
        },
        [formData, setFormData]
    )

    const renderSupportingImages = () => (
        <FormAttachmentSection
            title="Supporting Images"
            formCode="success_story"
            kind="PHOTO"
            kvkId={formData.kvkId ?? null}
            recordId={formData.successStoryId ?? formData.id ?? null}
            showCaption
            initialAttachments={formData?.photos}
            onAttachmentIdsChange={handleAttachmentIds}
        />
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
                            value={formData.reportingYear ?? ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <MasterDataDropdown
                            label="Name of Specific Area"
                            required
                            value={formData.specificArea ?? ''}
                            onChange={(value) => setFormData({ ...formData, specificArea: value })}
                            options={specificAreaOptions}
                            isLoading={isLoadingAreas}
                            emptyMessage="No specific areas available"
                        />
                    </div>

                    <FormTextArea
                        label="Brief Details of the Area"
                        required
                        value={formData.briefDetails ?? ''}
                        onChange={handleFieldChange('briefDetails')}
                        rows={2}
                        placeholder="Enter brief details"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormInput
                            label="No. of Farmers Benefitted"
                            required
                            type="number"
                            value={formData.farmersBenefitted ?? ''}
                            onChange={handleNumberChange('farmersBenefitted')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Horizontal Spread (in area/no.)"
                            required
                            type="text"
                            value={formData.horizontalSpread ?? ''}
                            onChange={handleFieldChange('horizontalSpread')}
                            placeholder="Enter horizontal spread"
                        />

                        <FormInput
                            label="% of Adoption"
                            required
                            type="number"
                            step="0.01"
                            value={formData.adoptionPercentage ?? ''}
                            onChange={handleNumberChange('adoptionPercentage')}
                            placeholder="Enter percentage"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormTextArea
                            label="Impact of the Technology in Subjective Terms (Qualitative)"
                            required
                            value={formData.qualitativeImpact ?? ''}
                            onChange={handleFieldChange('qualitativeImpact')}
                            rows={3}
                            placeholder="Enter qualitative impact"
                        />

                        <FormTextArea
                            label="Impact of the Technology in Objective Terms (Quantitative)"
                            required
                            value={formData.quantitativeImpact ?? ''}
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
                                value={formData.incomeBefore ?? ''}
                                onChange={handleNumberChange('incomeBefore')}
                                placeholder="Enter amount"
                            />

                            <FormInput
                                label="After (Rs./Unit)"
                                required
                                type="number"
                                step="0.01"
                                value={formData.incomeAfter ?? ''}
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
                            value={formData.reportingYear ?? ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No reporting years available"
                        />

                        <FormInput
                            label="Name of the Entrepreneur/Name of the Enterprise/Firm"
                            required
                            value={formData.entrepreneurName ?? ''}
                            onChange={handleFieldChange('entrepreneurName')}
                            placeholder="Enter name"
                        />
                    </div>

                    <FormTextArea
                        label="Registered address of the entrepreneur/firm"
                        required
                        value={formData.registeredAddress ?? ''}
                        onChange={handleFieldChange('registeredAddress')}
                        rows={2}
                        placeholder="Enter registered address"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormInput
                            label="Year of establishment"
                            required
                            inputMode="numeric"
                            autoComplete="off"
                            value={formData.yearOfEstablishment ?? ''}
                            onChange={handleEstablishmentYearChange}
                            placeholder="e.g. 2018 (4 digits)"
                        />

                        <MasterDataDropdown
                            label="Type of Enterprise"
                            required
                            value={formData.enterpriseType ?? ''}
                            onChange={(value) => setFormData({ ...formData, enterpriseType: value })}
                            options={enterpriseTypeOptions}
                            isLoading={isLoadingEnterpriseTypes}
                            emptyMessage="No enterprise types available"
                        />

                        <FormInput
                            label="No of Members Associated"
                            required
                            inputMode="numeric"
                            autoComplete="off"
                            value={formData.membersAssociated ?? ''}
                            onChange={handleMembersAssociatedChange}
                            placeholder="Number of members"
                        />
                    </div>

                    <FormInput
                        label="Registration details"
                        required
                        value={formData.registrationDetails ?? ''}
                        onChange={handleFieldChange('registrationDetails')}
                        placeholder="Enter registration details"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormTextArea
                            label="Technical Components of the Enterprise (with commodity)"
                            required
                            value={formData.technicalComponents ?? ''}
                            onChange={handleFieldChange('technicalComponents')}
                            rows={2}
                            placeholder="Enter technical components"
                        />

                        <FormTextArea
                            label="Role of KVK/Technology Backstopping (Quantitative Data Support)"
                            required
                            value={formData.kvkRole ?? ''}
                            onChange={handleFieldChange('kvkRole')}
                            rows={2}
                            placeholder="Enter role of KVK"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormInput
                            label="Annual Income/Revenue of the Enterprise"
                            required
                            type="number"
                            step="0.01"
                            value={formData.annualIncome ?? ''}
                            onChange={handleNumberChange('annualIncome')}
                            placeholder="Enter amount"
                        />

                        <FormInput
                            label="Period/Timeline of the Entrepreneurship Development"
                            required
                            value={formData.developmentTimeline ?? ''}
                            onChange={handleFieldChange('developmentTimeline')}
                            placeholder="Enter timeline"
                        />
                    </div>

                    <FormTextArea
                        label="Economic and Social Status of Entrepreneur Before and After the Enterprise"
                        required
                        value={formData.statusBeforeAfter ?? ''}
                        onChange={handleFieldChange('statusBeforeAfter')}
                        rows={3}
                        placeholder="Enter status details"
                    />

                    <FormInput
                        label="Present Working Condition of Enterprise"
                        required
                        value={formData.presentWorkingCondition ?? ''}
                        onChange={handleFieldChange('presentWorkingCondition')}
                        placeholder="Enter working condition"
                        helperText="In Terms of Raw Materials Availability, Labour Availability, Consumer Preference, Marketing the Product etc.(Economic Viability of the Enterprise)"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormTextArea
                            label="Major Achievements"
                            required
                            value={formData.majorAchievements ?? ''}
                            onChange={handleFieldChange('majorAchievements')}
                            rows={3}
                            placeholder="Enter major achievements"
                        />

                        <FormTextArea
                            label="Major constrains"
                            required
                            value={formData.majorConstraints ?? ''}
                            onChange={handleFieldChange('majorConstraints')}
                            rows={3}
                            placeholder="Enter major constraints"
                        />
                    </div>
                </div>
            )}

            {/* 3. Success Stories/Case Studies */}
            {entityType === ENTITY_TYPES.PERFORMANCE_IMPACT_SUCCESS_STORIES && (
                <div className="space-y-6">
                    <FormSection title="Personal Information" noGrid>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                label="Name of the Farmer/Entrepreneur"
                                required
                                value={formData.farmerName ?? ''}
                                onChange={handleFieldChange('farmerName')}
                                placeholder="Enter name"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                                value={formData.education ?? ''}
                                onChange={handleFieldChange('education')}
                                placeholder="Enter education"
                            />

                            <FormInput
                                label="Farming Experience"
                                required
                                value={formData.experience ?? ''}
                                onChange={handleFieldChange('experience')}
                                placeholder="Enter experience"
                            />

                            <FormInput
                                label="Cell no./E-mail"
                                required
                                value={formData.contact ?? ''}
                                onChange={handleFieldChange('contact')}
                                placeholder="Enter contact"
                            />
                        </div>

                        <FormTextArea
                            label="Full Address"
                            required
                            value={formData.fullAddress ?? ''}
                            onChange={handleFieldChange('fullAddress')}
                            rows={2}
                            placeholder="Enter full address"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Professional Membership"
                                value={formData.professionalMembership ?? ''}
                                onChange={handleFieldChange('professionalMembership')}
                                placeholder="Enter membership"
                                required
                            />

                            <FormInput
                                label="Awards Received"
                                value={formData.awardsReceived ?? ''}
                                onChange={handleFieldChange('awardsReceived')}
                                placeholder="Enter awards"
                                required
                            />
                        </div>

                        <FormTextArea
                            label="Major Achievement of the Farmers"
                            value={formData.majorAchievement ?? ''}
                            onChange={handleFieldChange('majorAchievement')}
                            rows={2}
                            placeholder="Enter achievements"
                            required
                        />
                    </FormSection>

                    <FormSection title="Professional Information" noGrid>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <FormInput
                                    label="Title of Success Story/Case Study"
                                    required
                                    value={formData.storyTitle ?? ''}
                                    onChange={handleFieldChange('storyTitle')}
                                    placeholder="Enter title"
                                />

                                <div className="space-y-4">
                                     {renderSupportingImages()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormTextArea
                                    label="Situation Analysis/Problem Statement"
                                    required
                                    value={formData.problemStatement ?? ''}
                                    onChange={handleFieldChange('problemStatement')}
                                    rows={4}
                                    placeholder="Enter problem statement"
                                />

                                <FormTextArea
                                    label="Plan, Implement and Support/KVK Intervention(s)"
                                    required
                                    value={formData.kvkIntervention ?? ''}
                                    onChange={handleFieldChange('kvkIntervention')}
                                    rows={4}
                                    placeholder="Enter KVK intervention"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormTextArea
                                    label="Details of Practices followed by the farmer"
                                    required
                                    value={formData.practicesFollowed ?? ''}
                                    onChange={handleFieldChange('practicesFollowed')}
                                    rows={4}
                                    placeholder="Enter practices"
                                />

                                <FormTextArea
                                    label="Results/Output (Economical/Social Data)"
                                    required
                                    value={formData.results ?? ''}
                                    onChange={handleFieldChange('results')}
                                    rows={4}
                                    placeholder="Enter results"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormTextArea
                                    label="Impact/Outcome"
                                    required
                                    value={formData.impact ?? ''}
                                    onChange={handleFieldChange('impact')}
                                    rows={4}
                                    placeholder="Enter impact"
                                />

                                <FormTextArea
                                    label="Future Plans"
                                    value={formData.futurePlans ?? ''}
                                    onChange={handleFieldChange('futurePlans')}
                                    rows={4}
                                    placeholder="Enter future plans"
                                    required
                                />
                            </div>
                        </div>
                    </FormSection>

                    <FormSection title="Economic Information" noGrid>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <FormInput
                                label="Enterprise"
                                required
                                value={formData.enterprise ?? ''}
                                onChange={handleFieldChange('enterprise')}
                                placeholder="Enter enterprise"
                            />

                            <FormInput
                                label="Gross Income"
                                required
                                type="number"
                                step="0.01"
                                value={formData.grossIncome ?? ''}
                                onChange={handleNumberChange('grossIncome')}
                                placeholder="Enter amount"
                            />

                            <FormInput
                                label="Net Income"
                                required
                                type="number"
                                step="0.01"
                                value={formData.netIncome ?? ''}
                                onChange={handleNumberChange('netIncome')}
                                placeholder="Enter amount"
                            />

                            <FormInput
                                label="C-B Ratio"
                                required
                                type="number"
                                step="0.01"
                                value={formData.costBenefitRatio ?? ''}
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
