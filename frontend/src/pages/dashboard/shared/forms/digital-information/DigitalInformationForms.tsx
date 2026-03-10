import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSection } from '../shared/FormComponents'
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
                        value={formData.appsDeveloped || ''}
                        onChange={handleNumberChange('appsDeveloped')}
                        placeholder="Enter number"
                    />

                    <FormInput
                        label="Name of the Apps"
                        required
                        value={formData.appName || ''}
                        onChange={handleFieldChange('appName')}
                        placeholder="Enter app name"
                    />

                    <FormInput
                        label="Language of the Apps"
                        required
                        value={formData.appLanguage || ''}
                        onChange={handleFieldChange('appLanguage')}
                        placeholder="Enter language"
                    />

                    <FormInput
                        label="Meant for crop/livestock/fishery/others"
                        required
                        value={formData.appCategory || ''}
                        onChange={handleFieldChange('appCategory')}
                        placeholder="Enter category"
                    />

                    <FormInput
                        label="No. of times downloaded"
                        required
                        type="number"
                        value={formData.downloadCount || ''}
                        onChange={handleNumberChange('downloadCount')}
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
                        value={formData.visitorsCount || ''}
                        onChange={handleNumberChange('visitorsCount')}
                        placeholder="Enter number"
                    />

                    <FormInput
                        label="No. of farmers registered on the portal"
                        required
                        type="number"
                        value={formData.farmersRegistered || ''}
                        onChange={handleNumberChange('farmersRegistered')}
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
                            value={formData.farmersRegistered || ''}
                            onChange={handleNumberChange('farmersRegistered')}
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
                                type="number"
                                value={formData.messageCrop || ''}
                                onChange={handleNumberChange('messageCrop')}
                                placeholder="0"
                            />

                            <FormInput
                                label="Livestocks"
                                required
                                type="number"
                                value={formData.messageLivestock || ''}
                                onChange={handleNumberChange('messageLivestock')}
                                placeholder="0"
                            />

                            <FormInput
                                label="Weather"
                                required
                                type="number"
                                value={formData.messageWeather || ''}
                                onChange={handleNumberChange('messageWeather')}
                                placeholder="0"
                            />

                            <FormInput
                                label="Marketing"
                                required
                                type="number"
                                value={formData.messageMarketing || ''}
                                onChange={handleNumberChange('messageMarketing')}
                                placeholder="0"
                            />

                            <FormInput
                                label="Awareness"
                                required
                                type="number"
                                value={formData.messageAwareness || ''}
                                onChange={handleNumberChange('messageAwareness')}
                                placeholder="0"
                            />

                            <FormInput
                                label="Other Enterprises"
                                required
                                type="number"
                                value={formData.messageOtherEnterprises || ''}
                                onChange={handleNumberChange('messageOtherEnterprises')}
                                placeholder="0"
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
                            value={formData.farmersCovered || ''}
                            onChange={handleNumberChange('farmersCovered')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="No of advisories sent"
                            required
                            type="number"
                            value={formData.advisoriesSent || ''}
                            onChange={handleNumberChange('advisoriesSent')}
                            placeholder="Enter number"
                        />
                    </div>

                    <div className="border border-[#E0E0E0] rounded-xl p-4 space-y-4">
                        <h3 className="text-lg font-bold text-[#487749]">Type of Messages</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormInput
                                label="Crop"
                                required
                                type="number"
                                value={formData.messageCrop || ''}
                                onChange={handleNumberChange('messageCrop')}
                                placeholder="0"
                            />

                            <FormInput
                                label="Livestock"
                                required
                                type="number"
                                value={formData.messageLivestock || ''}
                                onChange={handleNumberChange('messageLivestock')}
                                placeholder="0"
                            />

                            <FormInput
                                label="Weather"
                                required
                                type="number"
                                value={formData.messageWeather || ''}
                                onChange={handleNumberChange('messageWeather')}
                                placeholder="0"
                            />

                            <FormInput
                                label="Marketing"
                                required
                                type="number"
                                value={formData.messageMarketing || ''}
                                onChange={handleNumberChange('messageMarketing')}
                                placeholder="0"
                            />

                            <FormInput
                                label="Awareness"
                                required
                                type="number"
                                value={formData.messageAwareness || ''}
                                onChange={handleNumberChange('messageAwareness')}
                                placeholder="0"
                            />

                            <FormInput
                                label="Other Enterprises"
                                required
                                type="number"
                                value={formData.messageOtherEnterprises || ''}
                                onChange={handleNumberChange('messageOtherEnterprises')}
                                placeholder="0"
                            />

                            <FormInput
                                label="Any Other"
                                required
                                type="number"
                                value={formData.messageAnyOther || ''}
                                onChange={handleNumberChange('messageAnyOther')}
                                placeholder="0"
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
                        { title: 'Advisories through weather advisory bulletin', prefix: 'bulletin' },
                        { title: 'Advisories through social media/FB/Twitter/Instagram/Other', prefix: 'social' }
                    ].map((section) => (
                        <div key={section.prefix} className="border border-[#E0E0E0] rounded-xl p-4 space-y-4">
                            <h3 className="text-lg font-bold text-[#487749]">{section.title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 border-b border-gray-100">
                                <FormInput
                                    label="No. of farmers covered"
                                    required
                                    type="number"
                                    value={formData[`${section.prefix}FarmersCovered`] || ''}
                                    onChange={handleNumberChange(`${section.prefix}FarmersCovered`)}
                                    placeholder="Enter number"
                                />
                                <FormInput
                                    label="No of advisories sent"
                                    required
                                    type="number"
                                    value={formData[`${section.prefix}AdvisoriesSent`] || ''}
                                    onChange={handleNumberChange(`${section.prefix}AdvisoriesSent`)}
                                    placeholder="Enter number"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormInput
                                    label="Crop"
                                    required
                                    type="number"
                                    value={formData[`${section.prefix}Crop`] || ''}
                                    onChange={handleNumberChange(`${section.prefix}Crop`)}
                                    placeholder="0"
                                />
                                <FormInput
                                    label="Livestock"
                                    required
                                    type="number"
                                    value={formData[`${section.prefix}Livestock`] || ''}
                                    onChange={handleNumberChange(`${section.prefix}Livestock`)}
                                    placeholder="0"
                                />
                                <FormInput
                                    label="Weather"
                                    required
                                    type="number"
                                    value={formData[`${section.prefix}Weather`] || ''}
                                    onChange={handleNumberChange(`${section.prefix}Weather`)}
                                    placeholder="0"
                                />
                                <FormInput
                                    label="Marketing"
                                    required
                                    type="number"
                                    value={formData[`${section.prefix}Marketing`] || ''}
                                    onChange={handleNumberChange(`${section.prefix}Marketing`)}
                                    placeholder="0"
                                />
                                <FormInput
                                    label="Awareness"
                                    required
                                    type="number"
                                    value={formData[`${section.prefix}Awareness`] || ''}
                                    onChange={handleNumberChange(`${section.prefix}Awareness`)}
                                    placeholder="0"
                                />
                                <FormInput
                                    label="Other Enterprises"
                                    required
                                    type="number"
                                    value={formData[`${section.prefix}OtherEnterprises`] || ''}
                                    onChange={handleNumberChange(`${section.prefix}OtherEnterprises`)}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
