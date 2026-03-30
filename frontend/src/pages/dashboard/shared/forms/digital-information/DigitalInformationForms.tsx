import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput } from '../shared/FormComponents'
import { useYears } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface DigitalInformationFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const DigitalInformationForms: React.FC<DigitalInformationFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [], isLoading: isLoadingYears } = useYears()

    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'yearId', 'yearName'),
        [years]
    )

    const handleFieldChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const value = e.target.value
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleNumberChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value === '' ? '' : parseInt(e.target.value)
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

    if (!entityType) return null

    return (
        <div className="space-y-6">
            {/* 1. Mobile App Form */}
            {entityType === ENTITY_TYPES.MISC_DIGITAL_MOBILE_APP && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        placeholder="Select"
                    />

                    <FormInput
                        label="Number of Mobile Apps developed by KVK"
                        required
                        type="number"
                        value={formData.numberOfAppsDeveloped || ''}
                        onChange={handleNumberChange('numberOfAppsDeveloped')}
                        placeholder="Enter number"
                    />

                    <FormInput
                        label="Name of the Apps"
                        required
                        value={formData.nameOfApp || ''}
                        onChange={handleFieldChange('nameOfApp')}
                        placeholder="Enter app name"
                    />

                    <FormInput
                        label="Language of the Apps"
                        required
                        value={formData.languageOfApp || ''}
                        onChange={handleFieldChange('languageOfApp')}
                        placeholder="Enter language"
                    />

                    <FormInput
                        label="Meant for crop/livestock/fishery/others"
                        required
                        value={formData.meantFor || ''}
                        onChange={handleFieldChange('meantFor')}
                        placeholder="Enter category"
                    />

                    <FormInput
                        label="No. of times downloaded"
                        required
                        type="number"
                        value={formData.numberOfTimesDownloaded || ''}
                        onChange={handleNumberChange('numberOfTimesDownloaded')}
                        placeholder="Enter number"
                    />
                </div>
            )}

            {/* 2. Web Portal Form */}
            {entityType === ENTITY_TYPES.MISC_DIGITAL_WEB_PORTAL && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        placeholder="Select"
                    />

                    <FormInput
                        label="No. of visitors visited the portal"
                        required
                        type="number"
                        value={formData.noOfVisitors || ''}
                        onChange={handleNumberChange('noOfVisitors')}
                        placeholder="Enter number"
                    />

                    <FormInput
                        label="No. of farmers registered on the portal"
                        required
                        type="number"
                        value={formData.noOfFarmersRegistered || ''}
                        onChange={handleNumberChange('noOfFarmersRegistered')}
                        placeholder="Enter number"
                    />
                </div>
            )}

            {/* 3. Kisan Sarathi Form */}
            {entityType === ENTITY_TYPES.MISC_DIGITAL_KISAN_SARATHI && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            placeholder="Select"
                        />

                        <FormInput
                            label="No. of farmers registered on KSP portal"
                            required
                            type="number"
                            value={formData.noOfFarmersRegisteredOnKspPortal || ''}
                            onChange={handleNumberChange('noOfFarmersRegisteredOnKspPortal')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Phone call addressed"
                            required
                            type="number"
                            value={formData.phoneCallAddressed || ''}
                            onChange={handleNumberChange('phoneCallAddressed')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Phone call Answered"
                            required
                            type="number"
                            value={formData.phoneCallAnswered || ''}
                            onChange={handleNumberChange('phoneCallAnswered')}
                            placeholder="Enter number"
                        />
                    </div>

                    <div className="border border-[#E0E0E0] rounded-xl p-4 space-y-4">
                        <h3 className="text-lg font-bold text-[#487749]">Type of Messages</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormInput
                                label="Crop"
                                required
                                value={formData.crop || ''}
                                onChange={handleFieldChange('crop')}
                                placeholder="Enter details"
                            />

                            <FormInput
                                label="Livestocks"
                                required
                                value={formData.livestock || ''}
                                onChange={handleFieldChange('livestock')}
                                placeholder="Enter details"
                            />

                            <FormInput
                                label="Weather"
                                required
                                value={formData.weather || ''}
                                onChange={handleFieldChange('weather')}
                                placeholder="Enter details"
                            />

                            <FormInput
                                label="Marketing"
                                required
                                value={formData.marketing || ''}
                                onChange={handleFieldChange('marketing')}
                                placeholder="Enter details"
                            />

                            <FormInput
                                label="Awareness"
                                required
                                value={formData.awareness || ''}
                                onChange={handleFieldChange('awareness')}
                                placeholder="Enter details"
                            />

                            <FormInput
                                label="Other Enterprises"
                                required
                                value={formData.otherEnterprises || ''}
                                onChange={handleFieldChange('otherEnterprises')}
                                placeholder="Enter details"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Kisan Mobile Advisory (KMAS) Form */}
            {entityType === ENTITY_TYPES.MISC_DIGITAL_KISAN_MOBILE_ADVISORY && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            placeholder="Select"
                        />

                        <FormInput
                            label="No. of farmers covered"
                            required
                            type="number"
                            value={formData.noOfFarmersCovered || ''}
                            onChange={handleNumberChange('noOfFarmersCovered')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="No of advisories sent"
                            required
                            type="number"
                            value={formData.noOfAdvisoriesSent || ''}
                            onChange={handleNumberChange('noOfAdvisoriesSent')}
                            placeholder="Enter number"
                        />
                    </div>

                    <div className="border border-[#E0E0E0] rounded-xl p-4 space-y-4">
                        <h3 className="text-lg font-bold text-[#487749]">Type of Messages</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormInput
                                label="Crop"
                                required
                                value={formData.crop || ''}
                                onChange={handleFieldChange('crop')}
                                placeholder="Enter details"
                            />

                            <FormInput
                                label="Livestock"
                                required
                                value={formData.livestock || ''}
                                onChange={handleFieldChange('livestock')}
                                placeholder="Enter details"
                            />

                            <FormInput
                                label="Weather"
                                required
                                value={formData.weather || ''}
                                onChange={handleFieldChange('weather')}
                                placeholder="Enter details"
                            />

                            <FormInput
                                label="Marketing"
                                required
                                value={formData.marketing || ''}
                                onChange={handleFieldChange('marketing')}
                                placeholder="Enter details"
                            />

                            <FormInput
                                label="Awareness"
                                required
                                value={formData.awareness || ''}
                                onChange={handleFieldChange('awareness')}
                                placeholder="Enter details"
                            />

                            <FormInput
                                label="Other Enterprises"
                                required
                                value={formData.otherEnterprises || ''}
                                onChange={handleFieldChange('otherEnterprises')}
                                placeholder="Enter details"
                            />

                            <FormInput
                                label="Any Other"
                                required
                                value={formData.anyOther || ''}
                                onChange={handleFieldChange('anyOther')}
                                placeholder="Enter details"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Other Channels Form */}
            {entityType === ENTITY_TYPES.MISC_DIGITAL_OTHER_CHANNELS && (
                <div className="space-y-6">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        placeholder="Select"
                    />

                    {[
                        { title: 'Advisories through Text messages', prefix: 'text' },
                        { title: 'Advisories through Whatsapp', prefix: 'whatsapp' },
                        { title: 'Advisories through weather advisory bulletin', prefix: 'weather' },
                        { title: 'Advisories through social media/FB/Twitter/Instagram/Other', prefix: 'social' }
                    ].map((section) => (
                        <div key={section.prefix} className="border border-[#E0E0E0] rounded-xl p-4 space-y-4">
                            <h3 className="text-lg font-bold text-[#487749]">{section.title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 border-b border-gray-100">
                                <FormInput
                                    label="No. of farmers covered"
                                    required
                                    type="number"
                                    value={formData[`${section.prefix}NoOfFarmersCovered`] || ''}
                                    onChange={handleNumberChange(`${section.prefix}NoOfFarmersCovered`)}
                                    placeholder="Enter number"
                                />
                                <FormInput
                                    label="No of advisories sent"
                                    required
                                    type="number"
                                    value={formData[`${section.prefix}NoOfAdvisoriesSent`] || ''}
                                    onChange={handleNumberChange(`${section.prefix}NoOfAdvisoriesSent`)}
                                    placeholder="Enter number"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormInput
                                    label="Crop"
                                    required
                                    value={formData[`${section.prefix}Crop`] || ''}
                                    onChange={handleFieldChange(`${section.prefix}Crop`)}
                                    placeholder="Enter details"
                                />
                                <FormInput
                                    label="Livestock"
                                    required
                                    value={formData[`${section.prefix}Livestock`] || ''}
                                    onChange={handleFieldChange(`${section.prefix}Livestock`)}
                                    placeholder="Enter details"
                                />
                                <FormInput
                                    label="Weather"
                                    required
                                    value={formData[`${section.prefix}Weather`] || ''}
                                    onChange={handleFieldChange(`${section.prefix}Weather`)}
                                    placeholder="Enter details"
                                />
                                <FormInput
                                    label="Marketing"
                                    required
                                    value={formData[`${section.prefix}Marketing`] || ''}
                                    onChange={handleFieldChange(`${section.prefix}Marketing`)}
                                    placeholder="Enter details"
                                />
                                <FormInput
                                    label="Awareness"
                                    required
                                    value={formData[`${section.prefix}Awareness`] || ''}
                                    onChange={handleFieldChange(`${section.prefix}Awareness`)}
                                    placeholder="Enter details"
                                />
                                <FormInput
                                    label="Other Enterprises"
                                    required
                                    value={formData[`${section.prefix}OtherEnterprises`] || ''}
                                    onChange={handleFieldChange(`${section.prefix}OtherEnterprises`)}
                                    placeholder="Enter details"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
