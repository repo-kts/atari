import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormTextArea, FormSection } from '../shared/FormComponents'
import { useYears, useImpactSpecificAreas, useEnterpriseTypes } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'
import { X } from 'lucide-react'

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
    // Local helper for file to base64 conversion
    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
        })
    }

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

    const handleYearChange = useCallback(
        (value: string | number) => {
            setFormData({ ...formData, reportingYear: value })
        },
        [formData, setFormData]
    )

    const handleFileChange = useCallback(
        (field: string, multiple: boolean = false) => async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files
            if (!files || files.length === 0) return

            try {
                if (multiple) {
                    const base64Files = await Promise.all(Array.from(files).map(convertToBase64))
                    const newPhotos = base64Files.map(base64 => ({
                        preview: base64,
                        image: base64,
                        caption: ''
                    }))

                    setFormData((prev: any) => {
                        const existingPhotos = Array.isArray(prev[field]) ? [...prev[field]] : []
                        return { 
                            ...prev, 
                            [field]: [...existingPhotos, ...newPhotos] 
                        }
                    })
                } else {
                    const base64 = await convertToBase64(files[0])
                    setFormData((prev: any) => ({ ...prev, [field]: base64 }))
                }
            } catch (error) {
                console.error("Error converting files to base64:", error)
            }
        },
        [setFormData] // formData is no longer a dependency thanks to functional update
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

    const removePhoto = (field: string, index: number) => {
        const existingPhotos = Array.isArray(formData[field]) ? [...formData[field]] : [];
        existingPhotos.splice(index, 1);
        setFormData({
            ...formData,
            [field]: existingPhotos
        });
    };

    const updateCaption = (field: string, index: number, caption: string) => {
        const existingPhotos = Array.isArray(formData[field]) ? [...formData[field]] : [];
        if (existingPhotos[index]) {
            existingPhotos[index] = { ...existingPhotos[index], caption };
            setFormData({
                ...formData,
                [field]: existingPhotos
            });
        }
    };

    const renderPhotoFields = (field: string) => (
        <div className="space-y-4">
            <FormInput
                label="Supporting Images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange(field, true)}
                helperText="Only images allowed. Uploading new files will be added to the list."
            />

            {Array.isArray(formData[field]) && formData[field].length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                    {formData[field].map((item: any, idx: number) => {
                        const src = item.preview || (typeof item.image === 'string' ? (item.image.startsWith('data:') || item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL || ''}${item.image.startsWith('/') ? '' : '/'}${item.image}`) : '');
                        return (
                            <div key={idx} className="relative bg-white border border-gray-200 rounded-xl p-2 shadow-sm flex flex-col group">
                                <div className="relative aspect-square mb-2 overflow-hidden rounded-lg border border-gray-50">
                                    <img
                                        src={src}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        alt={`P ${idx + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(field, idx)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10 scale-90"
                                    >
                                        <X className="w-3 h-3 stroke-[2.5]" />
                                    </button>
                                </div>
                                <div className="space-y-1 mt-auto">
                                    <textarea
                                        placeholder="Caption..."
                                        className="w-full text-[12px] font-medium bg-gray-50/50 border border-gray-100 rounded-md focus:bg-white focus:ring-1 focus:ring-green-200 px-2 py-1.5 outline-none transition-all placeholder:text-gray-400 text-gray-700 min-h-[3.5rem] resize-none"
                                        value={item.caption || ''}
                                        onChange={(e) => updateCaption(field, idx, e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // Normalize incoming photographs data when editing
    React.useEffect(() => {
        // Only normalize if we are editing an existing record and have an ID
        // Success Stories uses successStoryId, others use generic id or specific mapping
        const hasId = formData.id || formData.successStoryId || formData.kvkActivityImpactId || formData.entrepreneurshipDevelopmentId;
        if (!hasId) return;

        const photoFields = ['supportingImages'];
        let hasChanges = false;
        const newData = { ...formData };

        photoFields.forEach(field => {
            const rawValue = formData[field];
            if (rawValue && typeof rawValue === 'string') {
                if (rawValue.startsWith('[') || rawValue.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(rawValue);
                        const arrayToMap = Array.isArray(parsed) ? parsed : [parsed];
                        newData[field] = arrayToMap
                            .filter((item: any) => item && (typeof item === 'string' || item.image || item.preview || item.url))
                            .map((item: any) => {
                                if (typeof item === 'string') return { preview: item, image: item, caption: '' };
                                const url = item.image || item.url || item.path || item.preview || '';
                                return { preview: url, image: url, caption: item.caption || '' };
                            });
                        hasChanges = true;
                    } catch (e) {
                        console.error('Photo parsing error:', e);
                    }
                } else if (rawValue.trim() !== '' && !rawValue.includes('object Object')) {
                    const values = rawValue.includes(',') ? rawValue.split(',') : [rawValue];
                    newData[field] = values
                        .filter((v: string) => v && v.trim() !== '')
                        .map((s: string) => ({
                            preview: s.trim(),
                            image: s.trim(),
                            caption: ''
                        }));
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            setFormData(newData);
        }
    }, [formData.id, formData.entityType, setFormData]);

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
                            type="number"
                            value={formData.yearOfEstablishment ?? ''}
                            onChange={handleNumberChange('yearOfEstablishment')}
                            placeholder="Enter year"
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
                            type="number"
                            value={formData.membersAssociated ?? ''}
                            onChange={handleNumberChange('membersAssociated')}
                            placeholder="Enter number"
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
                                     {renderPhotoFields('supportingImages')}
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
